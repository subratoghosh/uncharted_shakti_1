# ShaktIQ AI Agent Skill & Plugin Guide

This document explains what the **ShaktIQ Agent Skill & Plugin** is, how it was constructed, how AI coding assistants (like Google Antigravity, Claude Code, Cursor, Windsurf) discover and use it during pair-programming, and how anyone can install and run it.

---

## 1. What Exactly Is This Called?

In modern AI agent ecosystems, this capability is known as:
1. **Agent Skill** (`SKILL.md`): A specialized knowledge and execution runbook that an AI agent loads dynamically via *Progressive Disclosure* when a matching task or intent is triggered.
2. **Customization Plugin** (`plugin.json` / `plugin.yaml`): A packaged bundle containing skills, CLI commands, and hooks that can be installed globally or across workspaces.
3. **Model Context Protocol (MCP) Tool Provider**: A standardized JSON-RPC server running over `stdio` that exposes native tool functions (`shaktiq_analyze` and `shaktiq_git_diff`) directly into the agent's tool-calling loop without needing raw terminal commands.

---

## 2. Why AI Agents Need This Between Code Execution

When human developers or AI agents refactor backend routes, rename controller methods, or modify OpenAPI / Swagger definitions, subtle backward-incompatible changes can slip through:
- Making an optional query parameter required.
- Deleting an endpoint or HTTP method.
- Changing a response field type from `string` to `number`.
- Removing a response property that mobile clients depend on.

Without a tool like ShaktIQ, an AI agent only finds out about breaking changes after deploying to production or after consumer apps fail.

With the **ShaktIQ Skill**, the agent can run `shaktiq git-diff` or `shaktiq analyze` **in-flight** (between code generation steps). If the verdict is `BLOCKED`, the agent pauses, alerts the developer, and applies the recommended non-breaking fix (e.g., keeping the property optional or adding a deprecation header) *before* committing.

---

## 3. How We Built This (Architecture & Mechanics)

The ShaktIQ Agent Skill is built from four cohesive layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Coding Agent                        │
│         (Google Antigravity, Claude Code, Cursor)          │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       (Skill Runbook)                   (Tool Call)
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     skills/shaktiq/SKILL.md   │ │     shaktiq-mcp (stdio)   │
│  - Triggers & Rules           │ │  - shaktiq_analyze        │
│  - Command Syntax             │ │  - shaktiq_git_diff       │
│  - Remediation Recipes        │ └─────────────┬─────────────┘
└──────────────┬────────────────┘               │
               │                                │
               └───────────────┬────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │    shaktiq CLI (bin/cli.js)   │
               │  - compareSpecs()             │
               │  - oasdiff wrapper            │
               │  - SHA-256 Fingerprinting     │
               │  - Release Verdict Generator  │
               └───────────────┬───────────────┘
                               ▼
               ┌───────────────────────────────┐
               │  Verdict: SAFE/REVIEW/BLOCKED  │
               │  JSON / Markdown / Terminal   │
               └───────────────────────────────┘
```

1. **Deterministic Core (`@shaktiq/analyzer`)**:
   - Uses `oasdiff` in an isolated temp environment with a 10-second watchdog.
   - Rejects specs with remote `$ref` to avoid SSRF or credential leakage.
   - Normalizes rule IDs into standardized change types (`ENDPOINT_REMOVED`, `REQUIRED_REQUEST_FIELD_ADDED`, etc.).
   - Computes SHA-256 fingerprints: `sha256(projectId|METHOD|path|changeType|ruleId|location)`.

2. **Standalone Agent CLI (`packages/analyzer/src/cli.ts`)**:
   - Compiles to `dist/cli.js`.
   - Supports `--json` for zero-overhead parsing by AI agents.
   - Supports `--markdown` for formatted output directly into chat responses or PR review comments.
   - Supports `--fail-on-breaking` to act as an automated CI / git pre-commit hook.

3. **MCP Stdio Server (`packages/analyzer/src/mcp.ts`)**:
   - Implements Model Context Protocol specification (`2024-11-05`).
   - Responds to `tools/list` and `tools/call` over standard I/O.
   - Compatible with Claude Desktop, Antigravity MCP, and Cursor.

4. **Skill Declaration (`SKILL.md`)**:
   - Placed in `.agents/skills/shaktiq/SKILL.md` (for workspace discovery) and `skills/shaktiq/SKILL.md` (for packaging).
   - Injected into agent context via Progressive Disclosure when API changes occur.

---

## 4. How to Install and Set It Up

### Option A: 1-Command Automated Installer (Recommended)

From the project root, run:
```bash
./scripts/install-agent-skill.sh
```

This automatically:
- Builds `@shaktiq/analyzer` and compiles the CLI binaries.
- Symlinks `shaktiq` and `shaktiq-mcp` into `~/.local/bin/`.
- Installs the skill into Antigravity global configuration (`~/.gemini/config/skills/shaktiq/SKILL.md`).
- Installs the workspace skill into `.agents/skills/shaktiq/SKILL.md`.

### Option B: Manual Setup for Antigravity & Claude Code

1. Build the analyzer package:
   ```bash
   npm run build -w packages/analyzer
   ```

2. Symlink the binaries:
   ```bash
   mkdir -p ~/.local/bin
   ln -sf "$(pwd)/packages/analyzer/dist/cli.js" ~/.local/bin/shaktiq
   ln -sf "$(pwd)/packages/analyzer/dist/mcp.js" ~/.local/bin/shaktiq-mcp
   ```

3. Copy the skill into your agent's config directory:
   ```bash
   # For Antigravity global:
   mkdir -p ~/.gemini/config/skills/shaktiq
   cp skills/shaktiq/SKILL.md ~/.gemini/config/skills/shaktiq/SKILL.md

   # For workspace projects (any repo):
   mkdir -p .agents/skills/shaktiq
   cp skills/shaktiq/SKILL.md .agents/skills/shaktiq/SKILL.md
   ```

### Option C: MCP Server Configuration

Add to your `mcp_config.json` (or Antigravity / Claude Desktop settings):

```json
{
  "mcpServers": {
    "shaktiq": {
      "command": "shaktiq-mcp"
    }
  }
}
```

---

## 5. Usage Examples

### 1. In-Flight Git Diff (Between Code Edits)

When modifying an API in a local git branch:
```bash
shaktiq git-diff --spec openapi.yaml --base-ref main --markdown
```

### 2. Machine-Readable JSON for AI Agents

```bash
shaktiq analyze --base ./base.yaml --head ./head.yaml --json
```

Output:
```json
{
  "releaseVerdict": "blocked",
  "summary": {
    "total": 1,
    "breaking": 1,
    "warning": 0,
    "info": 0
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

## 6. Release Verdict Reference

| Verdict | Condition | Action Required |
| :--- | :--- | :--- |
| 🟢 **SAFE** | 0 breaking, 0 warnings | No breaking changes. Safe to merge or deploy. |
| 🟡 **REVIEW** | 0 breaking, >0 warnings | Changes require manual engineering verification (e.g. status code changes). |
| 🔴 **BLOCKED** | >0 breaking changes | **Do NOT merge or release.** Agent must remediate or deprecate first. |
