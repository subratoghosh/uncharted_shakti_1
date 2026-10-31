# shaktIQ ⚡

<p align="center">
  <img src="apps/web/public/logo.png" alt="shaktIQ Logo" width="220" />
</p>

<p align="center">
  <strong>Deterministic OpenAPI Breaking Change Detection, Release Compatibility Gating & Historical Hotspot Intelligence</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=shaktIQ.shaktiq-vscode"><img src="https://img.shields.io/badge/VS_Code_Marketplace-shaktIQ-007ACC.svg?logo=visualstudiocode&logoColor=white" alt="VS Code Marketplace"></a>
  <a href="https://shaktiq.vercel.app"><img src="https://img.shields.io/badge/Web_Dashboard-shaktiq.vercel.app-10b981.svg" alt="Web Dashboard"></a>
  <a href="https://uncharted-shakti-1.onrender.com/api/v1/health"><img src="https://img.shields.io/badge/API_Backend-Render_Live-46E3B7.svg" alt="API Backend"></a>
  <a href="https://www.mongodb.com/atlas"><img src="https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg?logo=mongodb&logoColor=white" alt="MongoDB Atlas"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20.x%20LTS-brightgreen.svg" alt="Node.js"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"></a>
</p>

---

## 📑 Table of Contents

- [⚡ Quick Start: 5 Ways to Use shaktIQ](#-quick-start-5-ways-to-use-shaktiq)
  - [1. Web Dashboard (Zero Install)](#1-web-dashboard-zero-install)
  - [2. Visual Studio Code Extension](#2-visual-studio-code-extension)
  - [3. Google Antigravity (AI Coding Agent Skill)](#3-google-antigravity-ai-coding-agent-skill)
  - [4. Cursor / Windsurf / Claude Code (MCP)](#4-cursor--windsurf--claude-code-mcp)
  - [5. CLI (Command Line & Terminal)](#5-cli-command-line--terminal)
  - [6. CI/CD & GitHub Actions (Automated PR Gate)](#6-cicd--github-actions-automated-pr-gate)
- [📌 The Problem shaktIQ Solves](#-the-problem-shaktiq-solves)
- [🚦 Understanding Release Safety Verdicts](#-understanding-release-safety-verdicts)
- [🌟 Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🍃 Production MongoDB Atlas Deep Dive](#-production-mongodb-atlas-deep-dive)
- [🚀 Step-by-Step Local Development & Self-Hosting](#-step-by-step-local-development--self-hosting)
- [📁 Monorepo Workspace Structure](#-monorepo-workspace-structure)
- [🔒 Security & Threat Modeling](#-security--threat-modeling)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [👥 Team & Hackathon Ownership](#-team--hackathon-ownership)
- [📖 System Documentation](#-system-documentation)
- [⚖️ License](#️-license)

---

## ⚡ Quick Start: 5 Ways to Use shaktIQ

Choose the environment where you work. You can be up and running in **under 2 minutes**:

```
                       ┌──────────────────────────────────────┐
                       │             shaktIQ Hub              │
                       └──────────────────┬───────────────────┘
                                          │
         ┌───────────────┬────────────────┼───────────────┬───────────────┐
         ▼               ▼                ▼               ▼               ▼
   🌐 Web Console   💻 VS Code Ext   🤖 Antigravity  🖥️ Terminal/CLI  🚀 GitHub Actions
  (Instant Trial)  (In-Editor Lint) (AI Agent Skill) (DevOps/Scripts)  (PR Block Gate)
```

---

### 1. Web Dashboard (Zero Install)

The fastest way to experience shaktIQ without installing any software or extensions:

1. Open the live console at **[https://shaktiq.vercel.app](https://shaktiq.vercel.app)**.
2. Sign in or register a new user in 10 seconds.
3. Select an existing project or run an interactive spec comparison.
4. Inspect the **Blast Radius Matrix** across Mobile (iOS/Android), Web SPAs, and Backend Microservices.
5. Click **AI Release Dossier** to interact with the **shaktIQ Gemini 3.8 AI Assistant** for instant non-breaking patch code!

---

### 2. Visual Studio Code Extension (v0.2.0)

Catch breaking API changes, contract flaws, and runtime bugs in real-time as you write code, right inside your editor:

1. **Install in 1 Click:**
   - From the repository root, install the packaged extension:
     ```bash
     code --install-extension shaktiq.vsix --force
     ```
   - Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=shaktIQ.shaktiq-vscode).
2. **Multi-Language Code & API Auto-Routing:**
   - Open any backend code file (`database.py`, `routers/*.py`, `server.ts`, `routes.js`, etc.) or OpenAPI spec (`openapi.yaml`).
   - Click the **shaktIQ icon $(zap)$** in the editor top title bar, or press `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows) ➔ run **`shaktIQ: AI Review Active Code & Contract`** or **`shaktIQ: Analyze API changes & Review Code`**.
3. **Editor Diagnostics & Error Detection:**
   - ShaktIQ performs an AST and contract sweep across your file.
   - Contract breaking risks, unhandled exceptions, and missing default parameter fallbacks are flagged with red and yellow squiggly lines on the exact line.
4. **1-Click AI Quick Fix (Lightbulb 💡):**
   - Click the lightbulb or press `Cmd + .` (or `Ctrl + .`) on any flagged code line.
   - Select **⚡ "shaktIQ: Apply backward-compatible code fix"** to automatically apply the fix!
   - Or select **📖 "shaktIQ: Explain client compatibility impact"** for a full impact breakdown.
5. **Sidebar Intelligence:**
   - Open the **shaktIQ** activity bar icon on the left to see:
     * **Breaking Changes & Issues**: Detailed tree of findings with severity levels.
     * **Detected API Endpoints**: Auto-parsed Python FastAPI/Flask, Node.js, and OpenAPI routes with 1-click jump to code line.
     * **AI Remediation & Fixes**: Contract risk verdict, suggestions, and 1-click **⚡ Apply AI Suggested Fix** button.
6. **Zero-Crash Local Fallback Engine:**
   - Even without an `openapi.yaml` file, and even if offline or on network disconnect, the extension seamlessly falls back to its local heuristic engine and never crashes.

---

### 3. Coding Agent Gateway & AI Skill (`/shaktiq`)

Equip your AI coding agent (Google Antigravity, Cursor, Windsurf, Claude Code) with the `shaktIQ` skill so it automatically audits code contracts, detects breaking changes, and generates safe fixes **in-between code writing steps (similar to `graphify` for knowledge graphs, `shaktiq` provides the contract safety gateway)**:

#### 1-Step Fast Install:
Run the provided installer script from your project root:
```bash
./scripts/install-agent-skill.sh
```
This script automatically:
1. Compiles `@shaktiq/analyzer`.
2. Symlinks the global CLI binary `shaktiq` and MCP server `shaktiq-mcp` to `~/.local/bin/`.
3. Installs the workspace agent skill at `.agents/skills/shaktiq/SKILL.md`.
4. Installs the global Antigravity skill at `~/.gemini/config/skills/shaktiq/SKILL.md`.

#### Manual Skill Installation:
- **macOS / Linux:**
  ```bash
  mkdir -p ~/.gemini/config/skills/shaktiq .agents/skills/shaktiq
  cp skills/shaktiq/SKILL.md ~/.gemini/config/skills/shaktiq/SKILL.md
  cp skills/shaktiq/SKILL.md .agents/skills/shaktiq/SKILL.md
  ```
- **Windows PowerShell:**
  ```powershell
  New-Item -ItemType Directory -Force "$env:USERPROFILE\.gemini\config\skills\shaktiq"
  Copy-Item "skills\shaktiq\SKILL.md" "$env:USERPROFILE\.gemini\config\skills\shaktiq\SKILL.md"
  ```

#### How Coding Agents Use `shaktiq`:
Prompt your agent in chat:
> *"Audit `apps/api/src/server.ts` or `backend/database.py` with shaktIQ before committing."*
> *"Run `shaktiq fix <file> --apply` to automatically remediate any contract breaking changes."*

---

### 4. Cursor / Windsurf / Claude Code (MCP)

Connect `shaktIQ` as a standard **Model Context Protocol (MCP)** tool server:

Add the following to your agent configuration (`mcp_config.json` or Cursor Settings ➔ Features ➔ MCP):

```json
{
  "mcpServers": {
    "shaktiq": {
      "command": "node",
      "args": ["packages/analyzer/dist/mcp.js"]
    }
  }
}
```

Exposed native tools:
- `shaktiq_review_code({ file_path, language, project_name })`: Audits code files (`.py`, `.ts`, `.js`, etc.) for breaking contract flaws and returns risk ratings and remediation steps.
- `shaktiq_fix_code({ file_path, code, issues, apply })`: Generates unified diffs and backward-compatible remediations, with optional direct file rewriting.
- `shaktiq_scan_routes({ target_path })`: Automatically extracts all API endpoints across Python FastAPI/Flask, Node.js Express/Fastify/Next.js, and OpenAPI files.
- `shaktiq_analyze({ base_spec, head_spec })`: Analyzes two OpenAPI files directly.
- `shaktiq_git_diff({ spec_path, base_ref })`: Compares your working spec against git `HEAD` or any branch.

---

### 5. CLI (Command Line & Terminal)

Run deterministic OpenAPI checks and intelligent code audits directly from your terminal:

```bash
# 1. Review any backend code file (.py, .ts, .js) for breaking API flaws:
shaktiq review apps/api/src/server.ts
shaktiq review backend/database.py --markdown

# 2. Automatically generate and apply AI backward-compatible code remediation:
shaktiq fix apps/api/src/server.ts --apply

# 3. Scan and list all API routes in a file or directory:
shaktiq routes apps/api/src/modules/studio/routes.ts
shaktiq routes backend/routers/

# 4. Compare your current working spec against git main branch:
shaktiq git-diff --spec ./openapi.yaml --base-ref main --markdown

# 5. Compare two OpenAPI specification files directly:
shaktiq analyze --base fixtures/openapi/v1-base.yaml --head fixtures/openapi/v2-breaking.yaml --markdown

# 3. Output machine-readable JSON (ideal for custom scripts and agents):
npm run shaktiq -- analyze --base ./base.yaml --head ./head.yaml --json

# 4. Strict CI gate (exits with code 1 if any breaking change is detected):
npm run shaktiq -- analyze --base ./base.yaml --head ./head.yaml --fail-on-breaking
```

---

### 6. CI/CD & GitHub Actions (Automated PR Gate)

Prevent breaking API changes from ever merging into your production branch by adding an automated compatibility gate.

Create `.github/workflows/shaktiq.yml` in your repository:

```yaml
name: shaktIQ API Release Gate

on:
  pull_request:
    paths:
      - '**/openapi.yaml'
      - '**/openapi.json'
      - '**/swagger.json'

jobs:
  verify-api-compatibility:
    name: Verify Backward Compatibility
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full git history required for branch diffing

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run shaktIQ Compatibility Check
        run: |
          node packages/analyzer/dist/cli.js git-diff \
            --spec ./openapi.yaml \
            --base-ref origin/main \
            --fail-on-breaking \
            --markdown >> $GITHUB_STEP_SUMMARY
```

If a pull request deletes an endpoint or changes a parameter type, the CI workflow will exit with code `1`, blocking the merge and printing a clear markdown table directly into the GitHub Actions Step Summary!

---

## 📌 The Problem shaktIQ Solves

API teams update OpenAPI specifications constantly. Removing an endpoint, adding a required request parameter, or changing a field type silently breaks mobile applications, partner integrations, and internal microservices.

- **Human Code Review Fails:** Engineers cannot reliably diff 3,000-line YAML files during busy pull request reviews.
- **LLM Diffing Is Unreliable:** LLM-based diffing is non-deterministic, hallucinates breaking rules, and cannot be trusted as a hard CI gate.
- **Teams Suffer from Amnesia:** Nobody remembers that an endpoint like `/orders/{id}` has broken downstream consumers three times across the last four sprints.

### The Question shaktIQ Answers:
> *"Will our latest API changes break existing consumers, which clients will be affected, and how do we fix it before deploying?"*

shaktIQ answers this deterministically before changes hit production, tracks project memory across releases, and delivers verdicts where developers already work: **GitHub PRs**, **VS Code**, **AI Coding Agents**, and a **Web Dashboard**.

---

## 🚦 Understanding Release Safety Verdicts

Every shaktIQ run evaluates ~300 OpenAPI 3.0/3.1 rules and computes an unambiguous release verdict:

| Verdict | Indicator | Meaning | CI Exit Code | Recommended Action |
|:---|:---:|:---|:---:|:---|
| **`SAFE`** | 🟢 | Only additive or backward-compatible changes detected (e.g. new optional parameters, new endpoints, new non-breaking response fields). | `0` | Safe to merge and deploy immediately. |
| **`REVIEW`** | 🟡 | Contract warnings detected that do not immediately crash consumers but require engineering attention (e.g. endpoint deprecation, altered descriptions). | `0` | Review with team before release. |
| **`BLOCKED`** | 🔴 | One or more breaking changes detected (e.g. removed paths, changed data types, new required fields, removed enum values). | `1` | **Block merge/release.** Apply non-breaking remediation recipes. |

---

## 🌟 Key Features

- 🎯 **Deterministic Breaking Change Detection:** Powered by `oasdiff` via `@shaktiq/analyzer` with an in-process pure-JS fallback for 100% zero-dependency uptime. Evaluates rules against OpenAPI 3.0 and 3.1 specs with zero hallucination.
- 🤖 **Google Gemini 3.8 Flash AI Intelligence:** Synthesizes AST code fix snippets, blast radius risk assessments for mobile/web/microservice clients, and comprehensive Release Dossiers.
- 💬 **Natural Language Project Assistant:** Ask shaktIQ questions in plain English (*"Will this release break our mobile app?"*, *"How do I fix the parameter mismatch on POST /orders?"*) with instant answers grounded in MongoDB release memory.
- 🛡️ **Three Developer Gateways:**
  - **Gateway 1: GitHub Pre-Release Gate:** Webhook triggers on `push` / `pull_request`, classifies risk, and posts automated compatibility comments.
  - **Gateway 2: VS Code Extension:** Developers compare their local working spec against `git HEAD` in real-time with diagnostics in the Problems panel.
  - **Gateway 3: Coding Agent Skill & Web Console:** Interactive Next.js console with run comparisons, endpoint hotspot tracking, and an AI chat assistant.
- 📊 **Historical Hotspot Intelligence:** Uses MongoDB aggregation pipelines to track endpoints that break repeatedly across releases, alerting teams to fragile API surfaces.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
  GH[GitHub Repo] -- webhook push / PR --> API[Fastify API Backend]
  VSC[VS Code Extension] -- PAT + Two Specs --> API
  WEB[Next.js Web: User & Admin] -- Cookie JWT --> API
  AGENT[Antigravity / Coding Agent] -- shaktIQ Skill --> ANALYZER[packages/analyzer CLI]
  
  API -- Verify HMAC, Validate Zod, Idempotent Insert --> DB[(MongoDB Atlas)]
  API -- POST Run Event + Secret Key --> N8N[n8n Orchestrator]
  
  N8N -- Fetch Specs --> GHAPI[GitHub REST API]
  N8N -- Internal Lifecycle API --> API
  API -- AST Diff / oasdiff --> ANALYZER
  
  API -. AI Release Dossier .-> GEMINI[Google Gemini 3.8 Flash]
  N8N -- PR Compatibility Comment --> GHAPI
  
  DB -- Change Streams --> API
  API -- Server-Sent Events SSE --> WEB
```

---

## ⚡ n8n Orchestration Workflows

ShaktIQ uses **n8n** as an asynchronous event-driven orchestrator between the Fastify API, GitHub repositories, and downstream consumer notifications. All workflows are defined as version-controlled JSON files in [`n8n/workflows/`](n8n/workflows/).

### Complete Workflow Pipeline Diagram

```mermaid
flowchart TD
    subgraph Trigger ["1. Trigger & Authentication"]
        A["Incoming Webhook Event<br/>POST /webhook/shaktiq-analyze-run"] --> B{"Verify Header Auth<br/>x-shaktiq-webhook-token"}
        B -- "Invalid Token" --> C["Respond 403 Forbidden"]
        B -- "Valid Token" --> D["Respond 202 Accepted<br/>(Immediate Non-Blocking)"]
    end

    subgraph Ingestion ["2. Run Initialization & Spec Fetching"]
        D --> E["HTTP Start Run<br/>POST /internal/runs/:runId/start"]
        E --> F{"Check Spec Source"}
        F -- "GitHub PR / Push" --> G["Fetch Base Spec<br/>GitHub REST API"]
        G --> H["Fetch Head Spec<br/>GitHub REST API"]
        H --> I["Decode GitHub Specs<br/>(Base64 to UTF-8)"]
        F -- "Direct Snapshots" --> J["HTTP Analyze Snapshots<br/>POST /internal/runs/:runId/analyze"]
    end

    subgraph Analysis ["3. AST Diffing & Deterministic Analysis"]
        I --> K["HTTP Analyze GitHub Specs<br/>POST /internal/runs/:runId/analyze"]
        J --> L{"Check AI Condition"}
        K --> L
    end

    subgraph Intelligence ["4. Intelligence & Verdict"]
        L -- "AI Enabled & Anthropic Key Present" --> M["Claude Messages API<br/>Generate Plain Explanations"]
        M --> N["Parse Claude Output"]
        N --> O["HTTP Submit Explanations<br/>POST /internal/runs/:runId/explanations"]
        L -- "Claude Skipped / Disabled" --> P{"Check PR Notification Condition"}
        O --> P
    end

    subgraph Notifications ["5. Notification & Audit"]
        P -- "PR Number Present" --> Q["Post GitHub PR Comment<br/>Markdown Compatibility Report"]
        Q --> R["HTTP Record Notification<br/>POST /internal/runs/:runId/notifications"]
        P -- "No PR (Direct Push / CLI)" --> R
    end

    subgraph ErrorRecovery ["6. Global Error Handler"]
        ERR["Any Node Failure"] -.-> EH["shaktiq-error-handler<br/>(Error Trigger)"]
        EH --> ECTX["Extract Error Context<br/>(Node, Message, runId)"]
        ECTX --> EFAIL["HTTP Report Failure<br/>POST /internal/runs/:runId/fail<br/>errorCode: WORKFLOW_FAILED"]
    end

    classDef success fill:#0C382E,stroke:#428E75,stroke-width:2px,color:#FFF0B3;
    classDef warning fill:#FEE790,stroke:#D97706,stroke-width:2px,color:#0C382E;
    classDef error fill:#DC2626,stroke:#991B1B,stroke-width:2px,color:#FFFFFF;
    class A,D,E,G,H,I,J,K,Q,R success;
    class B,F,L,P warning;
    class C,ERR,EH,ECTX,EFAIL error;
```

### Detailed Node Specifications

1. **`Webhook Trigger` & `Verify Header Auth`:**
   - Listens on `POST /webhook/shaktiq-analyze-run`.
   - Validates `x-shaktiq-webhook-token` against environment configuration. Rejects unauthorized traffic immediately with `403 Forbidden`.
   - Returns an immediate `202 Accepted` envelope so calling services are never blocked waiting for analysis.
2. **`HTTP Start Run`:**
   - Calls `POST /api/v1/internal/runs/:runId/start` authenticated by `x-shaktiq-internal-key`.
   - Transitions run state in MongoDB from `queued` to `running`, triggering real-time UI status updates via Change Streams and SSE.
3. **Spec Fetching (`Fetch Base Spec GitHub` & `Fetch Head Spec GitHub`):**
   - Automatically retrieves specification content from GitHub's Contents API using the repository path and commit refs with `Bearer {{ $env.GITHUB_TOKEN }}`.
   - Built-in 3x retry with 2000ms exponential backoff for network resilience.
4. **`HTTP Analyze Specs`:**
   - Dispatches specs to the core AST analyzer engine at `POST /api/v1/internal/runs/:runId/analyze`.
   - Executes deterministic AST diffing (`oasdiff`), generates SHA-256 finding fingerprints, and calculates the release verdict (`safe`, `review`, or `blocked`).
5. **`Check AI Condition` & Explanations:**
   - Evaluates whether AI explanations are requested and an Anthropic key is present. If skipped, continues automatically without blocking.
6. **`Post GitHub PR Comment`:**
   - Posts a rich markdown compatibility report directly to the pull request conversation on GitHub.
7. **`shaktiq-error-handler` (Error Recovery):**
   - Attached as the designated `errorWorkflow`. On any failure, captures the failing node and message, reporting the failure to `POST /internal/runs/:runId/fail` with `errorCode: WORKFLOW_FAILED` to guarantee clean state reconciliation.

---

## 🍃 Production MongoDB Atlas Deep Dive

shaktIQ is built with production-grade MongoDB Atlas architecture:

### 1. Strict Schema Validation (`$jsonSchema`)
All collections (`users`, `apiTokens`, `projects`, `events`, `runs`, `findings`, `specSnapshots`, `notifications`) are strictly validated at the database level with `validationLevel: "strict"` and `validationAction: "error"`:
- Rejects unexpected field structures or invalid enum values.
- Applied automatically via idempotent migration scripts (`apps/api/src/db/migrate.ts`).

### 2. High-Performance Aggregation Pipelines
- **Run-to-Run Diff (Compare Pipeline):** Categorizes findings between any base and head run into `new`, `resolved`, and `unresolved` using stable SHA-256 finding fingerprints.
- **Project Memory (Endpoint Hotspots):** Aggregates findings by `(method, endpoint)` across completed runs to highlight endpoints with recurring breaks (`distinctRuns >= 2`).
- **Release Verdict Summary:** Evaluates release readiness into honest status states (`safe`, `review`, `blocked`).
- **Admin System Telemetry:** Single `$facet` aggregation summarizing run statuses, duplicate delivery counts, and rejected signatures over 24-hour windows.

### 3. Change Streams + Server-Sent Events (SSE)
- Listens to native Change Streams on `runs` and `events`.
- Emits real-time SSE events (`run.updated`, `event.received`, `event.duplicate`) to connected dashboard clients.
- Scoped strictly to user authorization and project boundaries.

### 4. Zero-Duplicate Idempotent Ingestion
- `events` collection enforces a unique index on `eventId` (`github:<delivery_uuid>`).
- On duplicate delivery (MongoDB error code `11000`), atomically increments `duplicateCount` and returns the existing `runId` without dispatching duplicate workloads.
- Secondary unique index on `runs.eventId` prevents race conditions.
- Findings enforce `{ runId: 1, fingerprint: 1 }` unique constraint, making analysis retries idempotent.

### 5. Automated Data Lifecycle (TTL Indexes)
- `events.receivedAt`: 30-day TTL index automatically purges raw event logs.
- `notifications.createdAt`: 90-day TTL index cleans delivery history.
- `specSnapshots`: De-duplicated by `(projectId, sha256)` hash to store identical spec files only once.

---

## 🚀 Step-by-Step Local Development & Self-Hosting

Follow these simple steps to run the complete shaktIQ stack locally on your machine:

### Prerequisites
- **Node.js:** `^20.0.0` (LTS recommended)
- **npm:** `^10.0.0`
- **Git**
- **MongoDB Atlas** Free Tier M0 (or local MongoDB replica set with change streams enabled)

### Step 1: Clone the Repository
```bash
git clone https://github.com/subratoghosh/uncharted_shakti_1.git shaktiq
cd shaktiq
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the root and in `apps/api`:
```bash
# In project root:
cp .env.example .env

# In API directory:
cp infra/.env.example apps/api/.env
```

Ensure the following variables are filled in your `.env`:
```ini
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shaktiq?retryWrites=true&w=majority
MONGODB_DB=shaktiq
JWT_SECRET=super_secret_jwt_key_at_least_32_chars_long
INTERNAL_API_KEY=super_secret_internal_key_at_least_32_chars_long
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
WEB_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run Database Migrations
Initialize all strict `$jsonSchema` validators and production indexes in MongoDB:
```bash
npm run db:migrate -w apps/api
```

### Step 5: Start Backend & Frontend
Run both services in separate terminals (or concurrently):

```bash
# Terminal 1: Backend Fastify API (Runs on port 4000)
npm run dev -w apps/api

# Terminal 2: Web Dashboard (Runs on port 3000)
npm run dev -w apps/web
```

Visit **`http://localhost:3000`** in your browser!

### Step 6: (Optional) Test the VS Code Extension Locally
1. Open the `apps/vscode-ext` folder in VS Code.
2. Press `F5` to launch an Extension Development Host window.
3. Open any folder with an OpenAPI spec and run `Ctrl+Shift+P` ➔ **`shaktIQ: Analyze API changes`**.

---

## 📁 Monorepo Workspace Structure

```
shaktiq/
├── apps/
│   ├── api/            # Fastify backend (Auth, Ingestion, MongoDB, SSE, Gemini)
│   ├── web/            # Next.js App Router (Dashboard, AI Dossier, shadcn/ui)
│   └── vscode-ext/     # VS Code Extension (Publisher: shaktIQ)
├── packages/
│   ├── shared/         # Zod schemas, types, DTOs, ROUTES, error codes
│   └── analyzer/       # Deterministic AST diff engine, rule mappings & CLI/MCP
├── .agents/
│   └── skills/         # AI coding agent skills (Antigravity skill: shaktiq)
├── scripts/
│   ├── install-agent-skill.sh   # Bash installer for Linux/macOS
│   └── install-agent-skill.ps1  # PowerShell installer for Windows
├── fixtures/openapi/   # Versioned OpenAPI 3.0/3.1 test fixtures
├── infra/              # Docker Compose, Dockerfiles, .env.example
└── docs/               # Full system documentation & specifications
```

---

## 🔒 Security & Threat Modeling

- **Zero Untrusted Execution:** shaktIQ parses OpenAPI specs purely as structured text; user repository code is never executed.
- **HMAC-SHA256 Signature Verification:** GitHub webhooks are verified with raw byte buffering and `crypto.timingSafeEqual`. Invalid signatures are rejected immediately (HTTP 401) and logged.
- **Authentication:**
  - **Web Dashboard:** Argon2id password hashing + HTTP-only, `SameSite=Lax`, secure JWT cookies.
  - **VS Code Extension:** Personal Access Tokens (`sq_...`) stored strictly as SHA-256 hashes.
- **Network Isolation:** Internal lifecycle routes (`/api/v1/internal/*`) require a 32+ character `INTERNAL_API_KEY`.
- **AI Safety & Privacy:** Gemini receives strictly structured finding metadata (method, endpoint, changeType). Raw user proprietary code is never forwarded to external LLMs.

---

## 🧪 Testing & Quality Assurance

shaktIQ maintains high code quality with automated test suites:

```bash
# Typecheck all workspaces
npm run typecheck

# Lint codebase
npm run lint

# Run unit & integration test suite (Vitest)
npm test

# Run End-to-End browser tests (Playwright)
npm run e2e
```

---

## 👥 Team & Hackathon Ownership

Built with ❤️ for the **MongoDB Student Hackathon**:

| Member | Focus Area | Owned Codebases |
|---|---|---|
| **Subrato Ghosh** | Backend, Database, Security & Agent Skills | `apps/api`, `packages/shared`, `.agents/skills`, `docs/database.md`, `docs/security.md` |
| **Lavanya** | Frontend, AI Release Dossier & UI/UX | `apps/web`, `docs/design_system.md` |
| **Vicky** | Analyzer Engine, VS Code Extension & QA | `packages/analyzer`, `apps/vscode-ext`, `n8n/`, `fixtures/`, `docs/testing.md` |

---

## 📖 System Documentation

Detailed technical guides are available in the [`docs/`](docs/) directory:
- 📄 [Product Requirements Document (`docs/prd.md`)](docs/prd.md)
- 🏛️ [System Architecture & Lifecycle (`docs/architecture.md`)](docs/architecture.md)
- 💾 [MongoDB Schema, Indexes & Aggregations (`docs/database.md`)](docs/database.md)
- 🛡️ [Security, Threat Models & Redaction (`docs/security.md`)](docs/security.md)
- 🧪 [Testing Strategy & Acceptance Criteria (`docs/testing.md`)](docs/testing.md)
- 🎨 [Design System & UI Tokens (`docs/design_system.md`)](docs/design_system.md)
- 📐 [Code Style & Response Envelopes (`docs/code_style.md`)](docs/code_style.md)
- 🤝 [Team Responsibilities & Workspaces (`docs/agents.md`)](docs/agents.md)

---

## ⚖️ License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.