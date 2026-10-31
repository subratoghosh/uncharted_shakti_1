---
name: shaktiq
description: "Detect breaking API changes, audit backend code (.py, .ts, .js) for contract flaws and bugs, suggest backward-compatible fixes, and generate release verdicts (SAFE/REVIEW/BLOCKED). Use whenever modifying routes, refactoring controllers, or validating backward compatibility."
---

# /shaktiq - Coding Agent Gateway: API Breaking Change Detection & Automated Remediation

shaktIQ is the automated API contract guardian and code flaw auditor for AI coding agents (Antigravity, Cursor, Claude Code, Windsurf, Roo) and CI/CD pipelines.

Just like `graphify` provides structural codebase intelligence, **shaktIQ** provides contract integrity intelligence: it detects API bugs, flags breaking changes in real time, and generates backward-compatible code patches before changes hit production.

---

## Capabilities for AI Coding Agents

1. **Active Code & Controller Review:**
   Audit backend code files (Python FastAPI/Flask, Node.js Fastify/Express/Next.js, Go, Java) for contract drift, removed parameters without fallbacks, and unhandled runtime exceptions:
   ```bash
   shaktiq review <file-path> [--json] [--markdown]
   ```
2. **Automated Code Fix & Remediation:**
   Generate backward-compatible code patches and unified diffs. With `--apply`, the agent can automatically rewrite the file with the fix:
   ```bash
   shaktiq fix <file-path> --apply
   ```
3. **Route Discovery & Inventory:**
   Scan any file or project directory to inventory all active API routes and HTTP methods:
   ```bash
   shaktiq routes <path>
   ```
4. **Deterministic OpenAPI Breaking Change Detection:**
   Compare specifications in-flight or against git history:
   ```bash
   shaktiq analyze --base ./base.yaml --head ./head.yaml [--json]
   shaktiq git-diff --spec ./openapi.yaml --base-ref main [--markdown]
   ```
5. **Deterministic Release Safety Verdicts:**
   - 🔴 **BLOCKED:** Contains 1+ breaking changes that will crash downstream consumers or mobile clients.
   - 🟡 **REVIEW:** Contains contract warnings requiring review.
   - 🟢 **SAFE:** Purely additive or fully backward-compatible modifications.

---

## When to Trigger shaktIQ

Activate this skill whenever:
- The user asks to "check API changes", "find contract bugs", "audit code flaws", "run shaktiq", or "/shaktiq".
- Modifying backend route handlers, controllers, or database schema adapters in `.py`, `.ts`, `.js`.
- Adding or modifying request parameters, body schemas, or response payloads.
- Editing an OpenAPI / Swagger specification (`openapi.yaml`, `swagger.json`).
- Before finalizing a git commit or submitting a pull request.

---

## Command Reference

### 1. Audit Code for Contract Bugs & Flaws
```bash
# Review a Python FastAPI controller
shaktiq review backend/database.py

# Review a TypeScript route handler with structured JSON for agent parsing
shaktiq review apps/api/src/server.ts --json

# Markdown format for PR reviews
shaktiq review src/routes/orders.ts --markdown
```

### 2. Auto-Remediate Code Flaws (Generate & Apply Fix)
```bash
# View suggested backward-compatible fix and diff:
shaktiq fix backend/database.py

# Automatically apply the fix to the file on disk:
shaktiq fix backend/database.py --apply
```

### 3. Extract API Routes
```bash
shaktiq routes backend/routers/
```

### 4. Deterministic OpenAPI Specification Comparison
```bash
# In-flight git diff against main:
shaktiq git-diff --spec openapi.yaml --base-ref main --markdown

# Compare two spec files directly:
shaktiq analyze --base fixtures/openapi/orders-v1.yaml --head fixtures/openapi/orders-v2-required-field.yaml --fail-on-breaking
```

---

## MCP Server Integration (Model Context Protocol)

ShaktIQ provides a native MCP server for AI coding agents.

### Add to your Agent's MCP Configuration:
Add to your `mcp_config.json` (or Antigravity / Claude Desktop / Cursor MCP settings):

```json
{
  "mcpServers": {
    "shaktiq": {
      "command": "shaktiq-mcp"
    }
  }
}
```

### Available MCP Tools:
- `shaktiq_review_code({ file_path: string, code?: string })`: Audits code or OpenAPI specs for contract flaws, breaking risks, and compatibility bugs.
- `shaktiq_fix_code({ file_path: string, code?: string, issues?: string[], apply?: boolean })`: Generates a backward-compatible code remediation and unified diff.
- `shaktiq_scan_routes({ path: string })`: Extracts all API endpoints from a code file or folder.
- `shaktiq_analyze({ base_spec: string, head_spec: string })`: Deterministic OpenAPI diffing with release verdict.
- `shaktiq_git_diff({ spec_path: string, base_ref?: string })`: Compare working-tree spec against git revision.

---

## Agent Remediation Playbook

| Detected Change Type | Severity | Common Cause | Recommended Agent Remediation |
| :--- | :--- | :--- | :--- |
| `REQUIRED_REQUEST_FIELD_ADDED` | 🔴 Breaking | Added required field to request body | Make property optional with a sane default fallback. |
| `REQUIRED_PARAMETER_ADDED` | 🔴 Breaking | Added required query/header/path param | Supply default value (`param: Optional[str] = None`). |
| `ENDPOINT_REMOVED` | 🔴 Breaking | Controller or path deleted | Restore endpoint with `deprecated: true` and sunset header. |
| `FIELD_TYPE_CHANGED` | 🔴 Breaking | Changed string to integer or object | Introduce versioned property name or support union types. |
| `RESPONSE_FIELD_REMOVED` | 🔴 Breaking | Removed response payload property | Keep property in response schema marked deprecated. |
