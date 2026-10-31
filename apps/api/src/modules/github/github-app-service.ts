import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

interface CachedToken {
  token: string;
  expiresAt: number;
}

// In-memory token cache to prevent hitting GitHub rate limits
const tokenCache = new Map<string, CachedToken>();

/**
 * Normalizes private key formatting whether provided as:
 * 1. Base64 encoded string
 * 2. Raw PEM with \n escaped characters
 * 3. Raw multiline PEM
 */
function getNormalizedPrivateKey(): string | null {
  if (!env.GITHUB_APP_PRIVATE_KEY) return null;
  let key = env.GITHUB_APP_PRIVATE_KEY.trim();

  // If base64 encoded
  if (!key.startsWith('-----BEGIN') && !key.includes('\n')) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        return decoded;
      }
    } catch {
      // not base64, proceed
    }
  }

  // Replace literal '\n' string representations with actual newlines
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  return key;
}

/**
 * Generates an RS256 JWT for GitHub App authentication
 */
export function generateAppJwt(): string | null {
  if (!env.GITHUB_APP_ID) return null;
  const privateKey = getNormalizedPrivateKey();
  if (!privateKey) return null;

  try {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // 60s in the past to compensate for clock drift
      exp: now + 600, // 10 minutes max expiration
      iss: env.GITHUB_APP_ID,
    };

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  } catch (err) {
    logger.error({ err }, 'Failed to sign GitHub App JWT. Check GITHUB_APP_PRIVATE_KEY format.');
    return null;
  }
}

/**
 * Mints or retrieves a cached GitHub App Installation Access Token.
 * Ephemeral token valid for 1 hour.
 */
export async function getInstallationAccessToken(installationId: number | string): Promise<string | null> {
  const cacheKey = String(installationId);
  const cached = tokenCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now + 60_000) {
    return cached.token;
  }

  const appJwt = generateAppJwt();
  if (!appJwt) {
    // If no GitHub App is configured, fall back to global GITHUB_TOKEN if available
    return env.GITHUB_TOKEN || null;
  }

  try {
    const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error({ status: res.status, errText, installationId }, 'Failed to fetch GitHub installation access token');
      return env.GITHUB_TOKEN || null;
    }

    const data = (await res.json()) as { token: string; expires_at: string };
    const expiresAt = new Date(data.expires_at).getTime();

    tokenCache.set(cacheKey, {
      token: data.token,
      expiresAt,
    });

    return data.token;
  } catch (err) {
    logger.error({ err, installationId }, 'Exception requesting GitHub installation token');
    return env.GITHUB_TOKEN || null;
  }
}

/**
 * Fetches OpenAPI specification from a GitHub repository at a specific git ref (branch/commit/tag)
 */
export async function fetchRepositorySpec(
  repoFullName: string,
  preferredPath: string,
  ref: string,
  installationId?: number | null,
): Promise<{ content: string; path: string } | null> {
  const token = installationId ? await getInstallationAccessToken(installationId) : (env.GITHUB_TOKEN || null);

  const candidatePaths = [
    preferredPath || 'openapi.yaml',
    'openapi.yaml',
    'openapi.yml',
    'openapi.json',
    'swagger.yaml',
    'swagger.yml',
    'swagger.json',
    '.github/openapi.yaml',
    'docs/openapi.yaml',
    'api/openapi.yaml',
  ];

  // Unique list of paths to try
  const pathsToTry = Array.from(new Set(candidatePaths));

  for (const filePath of pathsToTry) {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'ShaktIQ-Bot/1.0',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${encodeURIComponent(ref)}`;
      const res = await fetch(url, { headers });

      if (res.status === 200) {
        const fileData = (await res.json()) as { content?: string; encoding?: string };
        if (fileData.content) {
          const rawContent = Buffer.from(fileData.content, 'base64').toString('utf8');
          return { content: rawContent, path: filePath };
        }
      }
    } catch (err) {
      // Continue checking other candidates
    }
  }

  logger.warn({ repoFullName, ref, tried: pathsToTry }, 'Could not locate OpenAPI spec in repository at git ref');
  return null;
}

/**
 * Posts or updates a GitHub Commit Status check (Green ✅ / Red ❌)
 */
export async function postCommitStatus(
  repoFullName: string,
  sha: string,
  status: {
    state: 'pending' | 'success' | 'failure' | 'error';
    description: string;
    targetUrl?: string;
  },
  installationId?: number | null,
): Promise<boolean> {
  const token = installationId ? await getInstallationAccessToken(installationId) : (env.GITHUB_TOKEN || null);
  if (!token) {
    logger.debug({ repoFullName, sha }, 'Skipping GitHub status check: No GitHub App installation token or PAT configured');
    return false;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/statuses/${sha}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'ShaktIQ-Bot/1.0',
      },
      body: JSON.stringify({
        state: status.state,
        target_url: status.targetUrl || `${env.WEB_ORIGIN}/runs`,
        description: status.description.substring(0, 140),
        context: 'shaktiq/api-release-intelligence',
      }),
    });

    return res.ok;
  } catch (err) {
    logger.warn({ err, repoFullName, sha }, 'Failed to post GitHub commit status');
    return false;
  }
}

/**
 * Posts a Pull Request review comment with Gemini AI fixes and Blast Radius
 */
export async function postPullRequestComment(
  repoFullName: string,
  pullRequestNumber: number,
  markdownBody: string,
  installationId?: number | null,
): Promise<boolean> {
  const token = installationId ? await getInstallationAccessToken(installationId) : (env.GITHUB_TOKEN || null);
  if (!token) {
    logger.debug({ repoFullName, pullRequestNumber }, 'Skipping PR comment: No GitHub App token or PAT configured');
    return false;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/issues/${pullRequestNumber}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'ShaktIQ-Bot/1.0',
      },
      body: JSON.stringify({ body: markdownBody }),
    });

    return res.ok;
  } catch (err) {
    logger.warn({ err, repoFullName, pullRequestNumber }, 'Failed to post GitHub PR comment');
    return false;
  }
}

/**
 * Formats a clean, modern Snyk/Codecov-style GitHub PR Comment markdown
 */
export function buildPrCommentMarkdown(params: {
  repoFullName: string;
  runId: string;
  verdict: 'safe' | 'review' | 'blocked';
  releaseScore: number;
  breakingCount: number;
  warningCount: number;
  infoCount: number;
  dossier?: any;
  findings: any[];
}): string {
  const { runId, verdict, releaseScore, breakingCount, warningCount, infoCount, dossier, findings } = params;

  const verdictBadge =
    verdict === 'blocked'
      ? '🛑 **RELEASE BLOCKED**'
      : verdict === 'review'
        ? '⚠️ **RELEASE REQUIRES REVIEW**'
        : '✅ **RELEASE SAFE**';

  const dashboardUrl = `${env.WEB_ORIGIN}/runs/${runId}`;

  let markdown = `## 🛡️ shaktIQ — API Release Intelligence

### Verdict: ${verdictBadge} (Compatibility Score: **${releaseScore}/100**)

| Metric | Status |
| :--- | :--- |
| **Breaking Changes** | \`${breakingCount}\` |
| **Warnings** | \`${warningCount}\` |
| **Additive / Info** | \`${infoCount}\` |
| **Full Dossier** | [View in shaktIQ Dashboard](${dashboardUrl}) |

`;

  if (dossier?.blastRadius) {
    markdown += `### 💥 Consumer Blast Radius
- 📱 **Mobile Apps:** \`${dossier.blastRadius.mobileAppsRisk}\`
- 🌐 **Web Frontend:** \`${dossier.blastRadius.webFrontendRisk}\`
- ⚙️ **Microservices:** \`${dossier.blastRadius.microservicesRisk}\`
- 🔌 **3rd Party Integrations:** \`${dossier.blastRadius.thirdPartyRisk}\`

> ${dossier.blastRadius.summary}

`;
  }

  if (findings.length > 0) {
    markdown += `### 🔍 Breaking Findings & Gemini 3.8 Fixes\n\n`;
    const topFindings = findings.slice(0, 5);

    topFindings.forEach((f, idx) => {
      const icon = f.severity === 'breaking' ? '🛑' : f.severity === 'warning' ? '⚠️' : 'ℹ️';
      markdown += `#### ${idx + 1}. ${icon} \`${f.method} ${f.endpoint}\` — ${f.changeType}\n`;
      markdown += `- **Impact:** ${f.impact || f.description}\n`;
      markdown += `- **Recommendation:** ${f.recommendation}\n`;

      if (f.aiExplanation?.codeFixSnippet) {
        markdown += `\n\`\`\`yaml\n${f.aiExplanation.codeFixSnippet}\n\`\`\`\n`;
      }
      markdown += `\n`;
    });

    if (findings.length > 5) {
      markdown += `_...and ${findings.length - 5} more finding(s). [See all on shaktIQ](${dashboardUrl})_\n\n`;
    }
  } else {
    markdown += `🎉 **Zero breaking changes detected!** All API contract modifications remain backward-compatible with existing consumers.\n\n`;
  }

  markdown += `---\n*Powered by [shaktIQ](https://shaktiq.dev) • Autonomous API Release Governance & Gemini AI Engine*`;

  return markdown;
}
