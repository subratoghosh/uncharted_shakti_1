---
name: shaktiq
description: "Detect OpenAPI breaking changes, compare API specifications, and generate release verdicts (SAFE/REVIEW/BLOCKED) with remediation steps between code execution. Use whenever editing API schemas, modifying endpoints, refactoring controllers, or validating backward compatibility."
---

# /shaktiq - API Breaking Change & Release Intelligence

shaktIQ provides deterministic, rule-based OpenAPI contract diffing, breaking change detection, and release safety verdicts (`SAFE`, `REVIEW`, `BLOCKED`) for AI coding agents (Antigravity, Claude Code, Cursor, Windsurf) and developer CI/CD workflows.

---

## What shaktIQ Does for AI Agents

During active coding, an AI agent modifying backend controllers, route schemas, or OpenAPI specifications can inadvertently introduce breaking changes that crash downstream consumers, mobile apps, or partner integrations.

Activating **shaktIQ** allows agents to:
1. **Compare Specs In-Flight:** Compare the working-tree OpenAPI spec against `main` (or previous snapshots) before committing or pushing.
2. **Deterministic Classification:** Categorize changes as `breaking` (level 3), `warning` (level 2), or `info` (level 1) using deterministic AST rule mapping.
3. **Generate Release Verdicts:**
   - 🔴 **BLOCKED:** Contains 1+ breaking changes. The release or PR should NOT proceed without remediation.
   - 🟡 **REVIEW:** Contains contract warnings requiring manual engineering verification.
   - 🟢 **SAFE:** Purely additive or non-breaking modifications.
4. **Actionable Remediation Guidance:** Surface exact rules, locations, impacts, and remediation recipes directly into the agent's context.

---

## When You (the AI Agent) Must Trigger shaktIQ

Activate this skill whenever:
- The user requests to "check API changes", "verify release safety", "run shaktiq", or "/shaktiq".
- You have edited an OpenAPI / Swagger file (`openapi.yaml`, `swagger.json`, `docs/openapi.yaml`).
- You have modified backend API routes, request parameters, or response payloads in Fastify, Express, Next.js, Flask, FastAPI, Go, etc.
- Before generating a pull request or committing changes on an API service branch.

---

## Command Reference

### 1. In-Between Code Writing Verification (Git Diff)

Run between code edits or controller refactoring to verify whether recent changes broke backward compatibility against `main`:

```bash
# Markdown summary for human/agent review:
node packages/analyzer/dist/cli.js git-diff --spec path/to/openapi.yaml --base-ref main --markdown

# Or via npm script:
npm run shaktiq -- git-diff --spec path/to/openapi.yaml --base-ref main --markdown

# For agent-parsable structured JSON:
node packages/analyzer/dist/cli.js git-diff --spec path/to/openapi.yaml --base-ref main --json
```

### 2. Compare Two Specification Files Directly

```bash
node packages/analyzer/dist/cli.js analyze --base fixtures/v1.yaml --head fixtures/v2.yaml --markdown
```

Or with failure exit code for automated pre-commit / agent verification loops:
```bash
node packages/analyzer/dist/cli.js analyze --base ./openapi-base.yaml --head ./openapi-head.yaml --fail-on-breaking
```

---

## Output Schema & How to Interpret Results

When invoked with `--json`, ShaktIQ outputs:

```json
{
  "releaseVerdict": "blocked" | "review" | "safe",
  "summary": {
    "total": 3,
    "breaking": 1,
    "warning": 1,
    "info": 1
  },
  "base": "orders-v1.yaml",
  "head": "orders-v2.yaml",
  "findings": [
    {
      "fingerprint": "d73cc284d318b6ebcb0b0fef998aceea00eb9f5ccce7ef61c0329d5b0ca3b058",
      "endpoint": "/users/{id}",
      "method": "GET",
      "changeType": "ENDPOINT_REMOVED",
      "severity": "breaking",
      "ruleId": "api-path-removed-without-deprecation",
      "description": "api path removed without deprecation",
      "impact": "Clients calling this endpoint will receive 404 Not Found or 405 Method Not Allowed.",
      "recommendation": "Restore the endpoint or deprecate first and communicate a sunset date to consumers.",
      "locationText": "85:5"
    }
  ]
}
```

---

## Agent Remediation Playbook

When `releaseVerdict` is **`blocked`**, inspect `findings` and apply these standard remediation patterns:

| Detected Change Type | Severity | Common Cause | Recommended Agent Remediation |
| :--- | :--- | :--- | :--- |
| `ENDPOINT_REMOVED` | 🔴 Breaking | Controller or path deleted | Re-add endpoint with `deprecated: true` and sunset header/notice. |
| `METHOD_REMOVED` | 🔴 Breaking | HTTP method handler deleted | Restore handler or route to alias method. |
| `REQUIRED_REQUEST_FIELD_ADDED` | 🔴 Breaking | Added required field to request body | Make property optional with a sane default value. |
| `REQUIRED_PARAMETER_ADDED` | 🔴 Breaking | Added required query/header/path param | Change to optional parameter with fallback logic. |
| `RESPONSE_FIELD_REMOVED` | 🔴 Breaking | Removed response payload property | Keep property in response schema marked deprecated. |
| `FIELD_TYPE_CHANGED` | 🔴 Breaking | Changed string to integer or object | Introduce a new versioned property name or support union types. |
| `FIELD_MADE_REQUIRED` | 🔴 Breaking | Changed optional property to required | Keep property optional in schema validation. |

---

## MCP Server Integration

ShaktIQ includes a built-in Model Context Protocol (MCP) server. To connect it directly to your agent's MCP tool suite:

Add to your `mcp_config.json` (or Antigravity / Claude Desktop / Cursor MCP settings):

```json
{
  "mcpServers": {
    "shaktiq": {
      "command": "node",
      "args": ["/path/to/ShaktIQ/packages/analyzer/dist/mcp.js"]
    }
  }
}
```

Exposed MCP Tools:
- `shaktiq_analyze({ base_spec: string, head_spec: string })`
- `shaktiq_git_diff({ spec_path: string, base_ref?: string })`

---

## 5. Natural Language AI Assistant (Powered by Gemini 3.8 Flash)

ShaktIQ provides interactive, conversational API architecture intelligence via Google Gemini 3.8 Flash:

- **Web Dashboard:** Interactive **Ask ShaktIQ AI** slide-over drawer on project and run detail pages (`/projects/:id` and `/runs/:id`).
- **REST API Endpoint:** `POST /api/v1/projects/:projectId/ai/query`
  - **Body:** `{ "question": "Are there breaking changes affecting our iOS or Android clients?" }`
  - **Response:**
    ```json
    {
      "answer": "string (formatted markdown analysis)",
      "suggestedFix": "string (backward-compatible code snippet)",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
      "relatedEndpoints": ["/v1/orders"],
      "generatedBy": "Google Gemini 3.8 Flash (Project Architecture Intelligence)"
    }
    ```
- **Fallback Guarantee:** Deterministic analysis engine executes automatically if `GEMINI_API_KEY` is unavailable, ensuring 100% operational uptime.

