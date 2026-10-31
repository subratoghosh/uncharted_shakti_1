import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

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

// Deterministic Natural Language Processor fallback for common queries
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

  if (q.includes('hotspot') || q.includes('recurring') || q.includes('frequent')) {
    return {
      answer: `### Recurring Endpoint Hotspots\n\nHotspot analysis evaluates historical commit frequency and consecutive breaking modifications across releases.\n\nEndpoints in **${projectName || 'your services'}** that undergo frequent interface modifications should be prioritized for:\n- Semantic route versioning (e.g. \`/v2/\` branch paths)\n- Comprehensive client contract tests\n- Decoupled intermediate adapter layers`,
      suggestedFix: `// Adapter pattern to isolate hotspot route changes:
class RouteAdapter {
  static adaptPayload(payload: any) {
    return {
      id: payload.id ?? payload.orderId,
      amount: payload.amount ?? payload.total,
      currency: payload.currency || 'USD'
    };
  }
}`,
      riskLevel: 'LOW',
      relatedEndpoints: ['/api/v1/orders', '/api/v1/users'],
      generatedBy: 'shaktIQ Natural Language Release Engine',
    };
  }

  // Default general intelligence response
  return {
    answer: `### shaktIQ Natural Language Release Intelligence\n\nRegarding: *"${question}"*\n\nshaktIQ delivers deterministic release verification and automated compatibility governance:\n\n- **Continuous Ingestion:** Automatically diffs base and head service contracts and route handlers on pull requests.\n- **Consumer Blast Radius:** Evaluates real-time impact on mobile apps, partner integrations, and downstream microservices.\n- **Automated Fix Synthesis:** Generates non-breaking code patches and backward-compatible deprecation shims.\n- **CI/CD Quality Gates:** Issues non-bypassable release verdicts to keep production stable.\n\nAsk me specific questions about endpoint fixes, mobile client protection, or release readiness scores!`,
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

    // If projectId is provided, look up project & recent findings from DB
    if (projectId) {
      try {
        const db = await getDb();
        const pObjId = ObjectId.isValid(projectId) ? new ObjectId(projectId) : null;
        if (pObjId) {
          const project = await db.collection('projects').findOne({ _id: pObjId });
          if (project) {
            projectName = project.fullName || project.name || projectName;
          }

          const runs = await db
            .collection('runs')
            .find({ projectId: pObjId })
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();

          recentRunsContext = runs;
          const runIds = runs.map((r) => r._id);
          if (runIds.length > 0) {
            recentFindingsContext = await db
              .collection('findings')
              .find({ runId: { $in: runIds } })
              .limit(20)
              .toArray();
          }
        }
      } catch (dbErr) {
        console.warn('[AI Query Route] MongoDB lookup skipped:', dbErr);
      }
    }

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    const isKeyValid = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

    if (isKeyValid) {
      try {
        const prompt = `You are shaktIQ Natural Language Assistant — a Principal Software Architecture & Release Governance Specialist for "${projectName}".
Help developers, QA engineers, and release managers assess release compatibility, prevent breaking changes, protect downstream mobile apps and consumers, and formulate backward-compatible code patches.

Context of "${projectName}":
- Recent Runs Summary:
${JSON.stringify(recentRunsContext.map(r => ({ status: r.status, breaking: r.summary?.breaking || 0, warnings: r.summary?.warning || 0 })), null, 2)}

- Recent Findings:
${JSON.stringify(recentFindingsContext.map(f => ({ endpoint: f.endpoint, method: f.method, severity: f.severity, changeType: f.changeType })), null, 2)}

User Question:
"${queryText}"

Instructions:
1. Provide a direct, actionable answer formatted with markdown headings and bullet points.
2. If the user asks about breaking changes or mobile apps, explain the exact downstream client risk.
3. If they ask how to fix or remediate an issue, provide a concrete backward-compatible code snippet (TypeScript or schema shim).
4. Assess the overall risk level: CRITICAL, HIGH, MEDIUM, LOW, or SAFE.
5. List all related endpoints referenced in the answer.

Respond ONLY with valid JSON matching this schema:
{
  "answer": "string (formatted with clear markdown headings and bullet points)",
  "suggestedFix": "string (concrete code fix or migration snippet, optional)",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "relatedEndpoints": ["/api/v1/example"]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              ok: true,
              data: {
                answer: parsed.answer || 'Analysis complete.',
                suggestedFix: parsed.suggestedFix,
                riskLevel: parsed.riskLevel || 'SAFE',
                relatedEndpoints: parsed.relatedEndpoints || [],
                generatedBy: 'shaktIQ Natural Language Release Engine',
              },
            });
          }
        }
      } catch (geminiError) {
        console.warn('[AI Query Route] Gemini API call error, falling back to deterministic answer:', geminiError);
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
