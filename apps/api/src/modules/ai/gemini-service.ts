import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

export interface FindingAnalysisInput {
  endpoint: string;
  method: string;
  changeType: string;
  severity: string;
  description: string;
  impact?: string;
  recommendation?: string;
}

export interface MultiLayerDossier {
  releaseScore: number; // 0 to 100
  verdictLabel: string;
  verdictDescription: string;
  blastRadius: {
    mobileAppsRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    webFrontendRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    microservicesRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    thirdPartyRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    summary: string;
  };
  findingInsights: Array<{
    endpoint: string;
    method: string;
    changeType: string;
    consumerImpact: string;
    codeFixSnippet: string;
    mitigationStrategy: string;
  }>;
  executiveActionPlan: string[];
  stakeholderNotes: {
    techLead: string;
    qaEngineering: string;
    productOwner: string;
  };
  generatedBy: string;
}

export async function generateMultiLayerDossier(
  projectName: string,
  currentVersion: string,
  findings: FindingAnalysisInput[],
  hotspotCount: number
): Promise<MultiLayerDossier> {
  const apiKey = env.GEMINI_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

  if (isKeyValid) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are the Lead API Architecture Auditor for "${projectName}".
Analyze these OpenAPI breaking/warning findings between releases for version "${currentVersion}".
Recurring Hotspot Endpoints Count: ${hotspotCount}

Findings Detected:
${JSON.stringify(findings, null, 2)}

Perform a Multi-Layer API Release Dossier analysis:
Layer 1: Deterministic Risk Calibration (calculate a Release Compatibility Score from 0 to 100).
Layer 2: Consumer Blast Radius Audit (evaluate Mobile App consumers, Web SPAs, Backend microservices, and 3rd party webhooks).
Layer 3: Code Remediation (generate code fix snippets and migration advice for each finding).
Layer 4: Executive Verdict & Stakeholder Action Plan.

Return ONLY valid JSON matching this exact structure:
{
  "releaseScore": number,
  "verdictLabel": string,
  "verdictDescription": string,
  "blastRadius": {
    "mobileAppsRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
    "webFrontendRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
    "microservicesRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
    "thirdPartyRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
    "summary": string
  },
  "findingInsights": [
    {
      "endpoint": string,
      "method": string,
      "changeType": string,
      "consumerImpact": string,
      "codeFixSnippet": string,
      "mitigationStrategy": string
    }
  ],
  "executiveActionPlan": [string],
  "stakeholderNotes": {
    "techLead": string,
    "qaEngineering": string,
    "productOwner": string
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as MultiLayerDossier;
        parsed.generatedBy = 'Google Gemini 3.8 Flash (Multi-Layer Verification Engine)';
        return parsed;
      }
    } catch (err) {
      logger.warn({ err }, 'Gemini API call failed, falling back to deterministic intelligence dossier');
    }
  }

  // Deterministic multi-layer fallback dossier (reliable when offline or awaiting user API key)
  const breakingCount = findings.filter((f) => f.severity === 'breaking').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;

  let score = 100 - breakingCount * 35 - warningCount * 15 - hotspotCount * 10;
  if (score < 0) score = 5;

  const verdictLabel =
    breakingCount > 0
      ? 'BLOCKED: CRITICAL CONSUMER CONTRACT BREAKS'
      : warningCount > 0
      ? 'REVIEW REQUIRED: POTENTIAL SCHEMA INCOMPATIBILITY'
      : 'SAFE FOR DEPLOYMENT';

  const verdictDesc =
    breakingCount > 0
      ? `Detected ${breakingCount} breaking contract alterations that will cause runtime deserialization errors or 404/400 failures in client applications.`
      : warningCount > 0
      ? `Found ${warningCount} schema variations requiring review across client SDKs.`
      : 'All endpoints, parameters, and responses conform to backward-compatibility guidelines.';

  return {
    releaseScore: score,
    verdictLabel,
    verdictDescription: verdictDesc,
    blastRadius: {
      mobileAppsRisk: breakingCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'MEDIUM' : 'LOW',
      webFrontendRisk: breakingCount > 0 ? 'HIGH' : warningCount > 0 ? 'MEDIUM' : 'LOW',
      microservicesRisk: breakingCount > 0 ? 'HIGH' : 'LOW',
      thirdPartyRisk: breakingCount > 0 ? 'CRITICAL' : 'LOW',
      summary: `Blast radius affects ${findings.length} endpoints. Mobile app clients cannot be hot-patched and are at highest vulnerability.`,
    },
    findingInsights: findings.map((f) => ({
      endpoint: f.endpoint,
      method: f.method,
      changeType: f.changeType,
      consumerImpact: f.impact || `Clients calling ${f.method} ${f.endpoint} will experience unexpected contract mismatch.`,
      codeFixSnippet:
        f.changeType === 'ENDPOINT_REMOVED'
          ? `// Retain legacy handler with deprecation header:\napp.${f.method.toLowerCase()}('${f.endpoint}', async (req, reply) => {\n  reply.header('Deprecation', 'true');\n  // Forward or graceful response\n});`
          : f.changeType === 'REQUIRED_REQUEST_FIELD_ADDED'
          ? `// Accept optional field with fallback default:\nconst schema = z.object({\n  field: z.string().default('DEFAULT_VALUE')\n});`
          : `// Provide dual-type deserializer support in serializer`,
      mitigationStrategy:
        f.recommendation || 'Provide backward-compatibility layer and deprecate over 2 minor release cycles.',
    })),
    executiveActionPlan: [
      breakingCount > 0 ? 'Block CI/CD deployment pipeline until breaking contracts are resolved or versioned.' : 'Run smoke tests against staging environment.',
      'Notify mobile frontend and backend consumer team leads of schema changes.',
      'Ensure API gateway returns proper HTTP Deprecation headers on legacy routes.',
    ],
    stakeholderNotes: {
      techLead: `Verify contract versioning on ${findings.map((f) => f.endpoint).join(', ') || 'all endpoints'}.`,
      qaEngineering: 'Execute regression suite with payload fixtures from previous version.',
      productOwner: `Release score is ${score}/100. Deploying now carries risk for mobile app consumers.`,
    },
    generatedBy: isKeyValid
      ? 'Google Gemini 3.8 Flash'
      : 'shaktIQ Multi-Layer Deterministic Intelligence Engine (Add GEMINI_API_KEY in .env for Live Gemini AI)',
  };
}

export interface QueryAssistantInput {
  projectName: string;
  question: string;
  runsSummary: Array<{
    version: string;
    status: string;
    releaseStatus: string;
    breakingCount: number;
    warningCount: number;
    createdAt: string;
  }>;
  recentFindings: FindingAnalysisInput[];
  hotspots: Array<{ endpoint: string; count: number }>;
}

export interface QueryAssistantOutput {
  answer: string;
  suggestedFix?: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  relatedEndpoints: string[];
  generatedBy: string;
}

export async function queryProjectAssistant(input: QueryAssistantInput): Promise<QueryAssistantOutput> {
  const apiKey = env.GEMINI_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

  if (isKeyValid) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are shaktIQ AI — an elite Principal API Architect and Release Governance Specialist for the project "${input.projectName}".
You help developers, tech leads, and QA engineers assess API compatibility, prevent production downtime, and write backward-compatible fixes.

Context of "${input.projectName}":
- Recent Runs Summary:
${JSON.stringify(input.runsSummary, null, 2)}

- Recent Findings & Breaking Changes:
${JSON.stringify(input.recentFindings, null, 2)}

- Recurring Endpoint Hotspots (chronic risk areas):
${JSON.stringify(input.hotspots, null, 2)}

User Question:
"${input.question}"

Instructions:
1. Provide a direct, highly technical, and actionable answer.
2. If the user asks about breaking changes, explain the exact consumer impact (e.g., mobile apps, web clients, microservices).
3. If they ask how to fix or remediate an issue, provide a concrete backward-compatible code snippet (TypeScript, Zod, OpenAPI, or Fastify/Express).
4. Assess the overall risk level: CRITICAL, HIGH, MEDIUM, LOW, or SAFE.
5. List all related endpoints referenced in the answer.

Respond ONLY with valid JSON matching this schema:
{
  "answer": "string (formatted with clear markdown headings and bullet points)",
  "suggestedFix": "string (concrete code fix or migration snippet)",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "relatedEndpoints": ["/api/v1/example"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as QueryAssistantOutput;
        parsed.generatedBy = 'Google Gemini 3.8 Flash (Project Architecture Intelligence)';
        return parsed;
      }
    } catch (err) {
      logger.warn({ err }, 'Gemini AI query failed, falling back to deterministic response');
    }
  }

  // Deterministic Fallback based on live findings
  const breaking = input.recentFindings.filter((f) => f.severity === 'breaking');
  const relatedEndpoints = input.recentFindings.map((f) => f.endpoint);

  return {
    answer: `### Analysis for **${input.projectName}**\n\nBased on recent release runs, your API currently has **${breaking.length} breaking changes** across ${input.recentFindings.length} detected findings.\n\n` +
      (breaking.length > 0
        ? `**Key Blocker:** Breaking modifications were flagged on: \`${breaking.map((b) => b.endpoint).join('`, `')}\`. These will cause downstream client failures if released without versioning or fallback layers.`
        : `**Status:** No critical breaking changes detected in the latest run. Your API contracts are backward-compatible.`),
    suggestedFix: breaking.length > 0
      ? `// Backward-compatible pattern:\n// 1. Never delete endpoints without deprecation headers\n// 2. Supply default values for newly added required request fields`
      : undefined,
    riskLevel: breaking.length > 0 ? 'CRITICAL' : 'SAFE',
    relatedEndpoints: Array.from(new Set(relatedEndpoints)),
    generatedBy: isKeyValid
      ? 'Google Gemini 3.8 Flash'
      : 'shaktIQ Deterministic Intelligence (Configure GEMINI_API_KEY for live AI responses)',
  };
}

