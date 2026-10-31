import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

try {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config();
} catch {
  // Ignore dotenv errors
}

export const dynamic = 'force-dynamic';

// Dedicated DNS resolver and HTTPS agent for resilient cloud API connectivity (especially Windows dev)
const dnsResolver = new dns.Resolver();
try {
  dnsResolver.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}

// In-memory DNS cache to avoid repeated network roundtrips for Google API endpoints
let cachedGoogleIps: string[] | null = null;
let lastGoogleDnsLookup = 0;
const DNS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function customDnsLookup(hostname: string, options: any, callback: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const now = Date.now();
  if (cachedGoogleIps && cachedGoogleIps.length > 0 && now - lastGoogleDnsLookup < DNS_CACHE_TTL_MS) {
    if (options && options.all) {
      return callback(null, cachedGoogleIps.map((ip) => ({ address: ip, family: 4 })));
    }
    return callback(null, cachedGoogleIps[0], 4);
  }

  dnsResolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, options, callback);
    }
    cachedGoogleIps = addresses;
    lastGoogleDnsLookup = Date.now();
    if (options && options.all) {
      return callback(null, addresses.map((a: string) => ({ address: a, family: 4 })));
    }
    return callback(null, addresses[0], 4);
  });
}

const geminiHttpsAgent = new https.Agent({
  lookup: customDnsLookup,
  keepAlive: true,
  keepAliveMsecs: 60000,
  maxSockets: 32,
  timeout: 8000,
});

function getGeminiApiKey(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env'),
    path.resolve(process.cwd(), '../../.env.local'),
    path.resolve(process.cwd(), '../../.env'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const m = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
        if (m && m[1]) {
          const k = m[1].trim().replace(/['"]/g, '');
          if (k && k !== 'your_gemini_api_key_here' && k.length > 10) {
            return k;
          }
        }
      }
    } catch {}
  }
  return process.env.GEMINI_API_KEY;
}

interface AiQueryPayload {
  question: string;
  projectId?: string;
  codeContext?: string;
}

interface AiQueryAnswer {
  answer: string;
  suggestedFix?: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  relatedEndpoints: string[];
  generatedBy: string;
}

interface GeminiCallSuccess {
  model: string;
  text: string;
  data: any;
}

function callGeminiHttps(
  model: string,
  apiKey: string,
  prompt: string,
  timeoutMs = 5000
): Promise<GeminiCallSuccess> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25,
        maxOutputTokens: 600,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      agent: geminiHttpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(body);
            const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              resolve({ model, text: rawText, data: json });
              return;
            }
          } catch (e) {
            reject(e);
            return;
          }
        }
        reject(new Error(`Model ${model} returned status ${res.statusCode}`));
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Model ${model} timed out after ${timeoutMs}ms`));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function generateDeterministicAnswer(question: string, projectName?: string): AiQueryAnswer {
  const q = question.toLowerCase();

  if (q.includes('mobile') || q.includes('consumer') || q.includes('client') || q.includes('break')) {
    return {
      answer: `### Downstream Consumer & Mobile App Impact Analysis\n\nWhen service contracts undergo modifications, downstream clients (iOS, Android, web applications, and partner services) may fail unexpectedly because older client versions cannot update in real-time.\n\n**Key Vulnerabilities:**\n- **Field Deletion or Renaming:** Older mobile apps reading deleted fields will experience JSON parsing crashes or null-pointer exceptions.\n- **New Required Request Fields:** Legacy client payloads missing the new required field will receive \`400 Bad Request\` rejection errors.\n- **Enum Value Shrinking:** Removing allowed enum options causes client serialization errors.\n\n**Remediation Recommendation:** Always introduce non-breaking shims with backwards-compatible default values and deprecation headers before executing breaking migrations.`,
      suggestedFix: `// Backward-Compatible Parameter Handling:
export function parseClientRequest(body: Record<string, unknown>) {
  // Supply safe default fallback for newly required properties
  const status = body.status ?? 'active';
  const limit = typeof body.limit === 'number' ? body.limit : 50;

  return { ...body, status, limit };
}`,
      riskLevel: 'HIGH',
      relatedEndpoints: ['/api/v1/orders', '/api/v1/checkout', '/api/v1/users'],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  if (q.includes('fix') || q.includes('remediat') || q.includes('code') || q.includes('patch')) {
    return {
      answer: `### Backward-Compatible Patch Remediation\n\nTo remediate breaking changes without stalling your release deployment:\n\n1. **Preserve Legacy Endpoints:** Maintain the existing handler as deprecated with \`Sunset\` or \`Deprecation\` HTTP response headers.\n2. **Provide Schema Defaults:** If a new parameter is required on HEAD, configure server-side defaults so legacy clients without the parameter succeed.\n3. **Dual-Read Migration Pattern:** Read from both old and new schema fields during transitional phases.`,
      suggestedFix: `// Example Dual-Read & Deprecation Middleware:
export function legacyCompatibilityMiddleware(req: any, res: any, next: any) {
  // Alert consumers of pending deprecation without breaking live flows
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Wed, 31 Dec 2026 23:59:59 GMT');
  
  // Normalize legacy payload key 'user_id' to modern 'userId'
  if (req.body && req.body.user_id && !req.body.userId) {
    req.body.userId = req.body.user_id;
  }
  next();
}`,
      riskLevel: 'SAFE',
      relatedEndpoints: ['/api/v1/checkout/payment', '/api/v1/orders'],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  if (q.includes('required') || q.includes('field') || q.includes('param')) {
    return {
      answer: `### Backward-Compatible Required Field Pattern\n\nAdding a required request property to an existing route without default values is a **BREAKING CHANGE** because legacy clients, mobile apps, and automated callers will omit the field and fail with \`400 Bad Request\`.\n\n**Best Practices:**\n1. Make the new parameter **optional** on the route interface.\n2. Apply a server-side default value or fallback in your controller.\n3. Send deprecation guidance to client teams before enforcing the field in subsequent versions.`,
      suggestedFix: `// Safe parameter ingestion with backward-compatible default:
export function handleOrderRequest(req: { body: { currency?: string; items: any[] } }) {
  // Backward-compatible fallback ensures legacy callers succeed
  const currency = req.body.currency ?? 'USD';
  return processOrder({ items: req.body.items, currency });
}`,
      riskLevel: 'MEDIUM',
      relatedEndpoints: ['/api/v1/orders', '/api/v1/checkout'],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  if (q.includes('gate') || q.includes('ci') || q.includes('pipeline') || q.includes('github') || q.includes('action')) {
    return {
      answer: `### Non-Bypassable CI/CD Release Gates\n\nshaktIQ integrates directly into your continuous integration pipelines (GitHub Actions, GitLab CI, Bitbucket, Jenkins):\n\n1. **Pull Request Trigger:** Whenever a PR modifies service specifications or route controllers, shaktIQ runs an automated compatibility audit.\n2. **Verdict Enforcement:** If a release verdict is marked **BLOCKED**, the GitHub Check Run fails with an annotated commit status preventing the PR from merging.\n3. **Automated Dossier Comment:** Generates an executive release dossier directly on the PR with copy-paste remediation shims.`,
      suggestedFix: `# Example GitHub Actions Workflow Step:
- name: Run shaktIQ Compatibility Gate
  run: npx @shaktiq/cli verify --base origin/main --head HEAD --fail-on-breaking`,
      riskLevel: 'SAFE',
      relatedEndpoints: [],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  if (q.includes('score') || q.includes('verdict') || q.includes('blocked') || q.includes('safe') || q.includes('review')) {
    return {
      answer: `### Release Verdict & Readiness Score Calibration\n\nshaktIQ calculates an objective **0 to 100 Compatibility Score**:\n\n- **SAFE (Score 85–100):** Only non-breaking changes detected (additive fields, relaxed validations, optional parameters). Release can deploy immediately.\n- **REVIEW (Score 60–84):** Deprecations or structural warnings detected. Requires team sign-off before merge.\n- **BLOCKED (Score 0–59):** Critical breaking modifications detected (e.g., removed endpoints, altered response schemas, new mandatory fields) with active consumer blast radius. Deployment is blocked until patch shims are applied.`,
      suggestedFix: undefined,
      riskLevel: 'MEDIUM',
      relatedEndpoints: [],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  return {
    answer: `### shaktIQ Natural Language Release Intelligence\n\nRegarding your question: *"${question}"*\n\nshaktIQ delivers deterministic release verification and automated compatibility governance for ${projectName || 'modern software teams'}:\n\n- **Continuous Ingestion:** Automatically diffs base and head service contracts and route handlers on pull requests.\n- **Consumer Blast Radius:** Evaluates real-time impact on mobile apps, partner integrations, and downstream microservices.\n- **Automated Fix Synthesis:** Generates non-breaking code patches and backward-compatible deprecation shims.\n- **CI/CD Quality Gates:** Issues non-bypassable release verdicts to keep production stable.\n\nAsk me specific questions about endpoint fixes, mobile client protection, or release readiness scores!`,
    suggestedFix: undefined,
    riskLevel: 'SAFE',
    relatedEndpoints: [],
    generatedBy: 'shaktIQ Natural Language Release Engine',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiQueryPayload;
    const { question, projectId } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Question text is required.' } },
        { status: 400 }
      );
    }

    const queryText = question.trim();
    let projectName = 'Platform Services';
    let recentFindingsContext: any[] = [];
    let recentRunsContext: any[] = [];

    // If projectId is provided, look up project & recent findings from DB in parallel
    if (projectId) {
      try {
        const db = await getDb();
        const pObjId = ObjectId.isValid(projectId) ? new ObjectId(projectId) : null;
        if (pObjId) {
          const [project, runs] = await Promise.all([
            db.collection('projects').findOne({ _id: pObjId }, { projection: { name: 1, fullName: 1 } }),
            db
              .collection('runs')
              .find({ projectId: pObjId }, { projection: { status: 1, summary: 1 } })
              .sort({ createdAt: -1 })
              .limit(3)
              .toArray(),
          ]);

          if (project) {
            projectName = project.fullName || project.name || projectName;
          }

          recentRunsContext = runs;
          const runIds = runs.map((r) => r._id);
          if (runIds.length > 0) {
            recentFindingsContext = await db
              .collection('findings')
              .find(
                { runId: { $in: runIds } },
                { projection: { endpoint: 1, method: 1, severity: 1, changeType: 1 } }
              )
              .limit(10)
              .toArray();
          }
        }
      } catch (dbErr) {
        console.warn('[AI Query Route] MongoDB lookup skipped:', dbErr);
      }
    }

    // Check if GEMINI_API_KEY is available
    const apiKey = getGeminiApiKey();
    const isKeyValid = !!apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

    if (isKeyValid) {
      // Tier 1: Ultra-fast models raced simultaneously for minimum latency (sub-1.5s)
      const tier1Models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
      // Tier 2: Resilient fallbacks if Tier 1 is throttled
      const tier2Models = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];

      const prompt = `You are shaktIQ Natural Language Assistant — an elite Principal Software Architect and Release Governance Specialist for "${projectName}".
Help developers, QA engineers, and release managers assess release compatibility, prevent breaking changes, protect downstream mobile apps and consumers, and formulate backward-compatible code patches.

Context:
${recentRunsContext.length > 0 ? `- Recent Runs Summary:\n${JSON.stringify(recentRunsContext.map(r => ({ status: r.status, breaking: r.summary?.breaking || 0, warnings: r.summary?.warning || 0 })), null, 2)}` : ''}
${recentFindingsContext.length > 0 ? `- Recent Findings:\n${JSON.stringify(recentFindingsContext.map(f => ({ endpoint: f.endpoint, method: f.method, severity: f.severity, changeType: f.changeType })), null, 2)}` : ''}

User Message / Question:
"${queryText}"

Instructions:
1. Provide a direct, natural, and helpful response. If the user is greeting you or asking a general question, respond conversationally and explain how shaktIQ protects their software releases.
2. If the user asks about breaking changes or mobile apps, explain the exact downstream client impact.
3. If the user asks how to remediate or fix an issue, provide a concrete code fix snippet. If no code fix is requested or needed, leave "suggestedFix" undefined or empty string.
4. Assess the overall risk level: CRITICAL, HIGH, MEDIUM, LOW, or SAFE.
5. List any related endpoints referenced in the answer (or empty array if none).

Respond ONLY with valid JSON matching this schema:
{
  "answer": "string (formatted with clear markdown headings, bold text, and bullet points where helpful)",
  "suggestedFix": "string (concrete code fix or migration snippet, optional)",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "relatedEndpoints": ["/api/v1/example"]
}`;

      let successfulResult: GeminiCallSuccess | null = null;

      try {
        // Speculatively race ultra-fast models in parallel to return the fastest AI response
        successfulResult = await Promise.any(
          tier1Models.map((m) => callGeminiHttps(m, apiKey!, prompt, 4500))
        );
      } catch {
        // Fall back to Tier 2 models if Tier 1 experiences demand spikes
        for (const model of tier2Models) {
          try {
            successfulResult = await callGeminiHttps(model, apiKey!, prompt, 5000);
            if (successfulResult) break;
          } catch (modelErr) {
            console.warn(`[AI Query Route] Fallback model ${model} failed:`, modelErr);
          }
        }
      }

      if (successfulResult && successfulResult.text) {
        const rawText = successfulResult.text;
        let cleanJson = rawText.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }
        let parsed: any;
        try {
          parsed = JSON.parse(cleanJson);
        } catch {
          parsed = { answer: rawText };
        }
        return NextResponse.json({
          ok: true,
          data: {
            answer: parsed.answer || rawText || 'Analysis complete.',
            suggestedFix: parsed.suggestedFix || undefined,
            riskLevel: parsed.riskLevel || 'SAFE',
            relatedEndpoints: Array.isArray(parsed.relatedEndpoints) ? parsed.relatedEndpoints : [],
            generatedBy: `shaktIQ Real-Time Intelligence Engine (${successfulResult.model})`,
          },
        });
      }
    }

    // Deterministic NLP fallback
    const fallbackAnswer = generateDeterministicAnswer(queryText, projectName);
    return NextResponse.json({
      ok: true,
      data: fallbackAnswer,
    });
  } catch (err: any) {
    console.error('[AI Query Route] Error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to process AI query.' },
      },
      { status: 500 }
    );
  }
}
