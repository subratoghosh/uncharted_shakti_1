# ShaktIQ – Agents and Team Roles

Three people, each working with an AI coding agent (Antigravity). Roles map to people and **directories**, so branches never overlap. All agents must follow the other seven docs; if a doc is wrong, open a PR to the doc, do not diverge in code.

| Person | Agent roles | Owns |
|---|---|---|
| **Suibrato** | Backend + Database + Security | `apps/api`, `packages/shared`, `docs/database.md`, `docs/security.md` |
| **Lavanya** | Frontend (user + admin panels) | `apps/web`, `docs/design_system.md` |
| **Vicky** | n8n Automation + Analyzer + VS Code extension + QA/Infra | `n8n/`, `packages/analyzer`, `apps/vscode-ext`, `fixtures/`, `infra/`, `scripts/`, root configs, `docs/testing.md` |
| Shared | Product/Architecture | `docs/prd.md`, `docs/architecture.md`, `docs/code_style.md`, `docs/agents.md` (changes by PR approved by all three) |

## 1. Shared Contracts (single source of truth)
1. `packages/shared` (Suibrato) exports: Zod schemas and inferred types for `Project, Event, Run, Finding, FindingDraft, RunSummary, SpecSnapshot, User, ApiToken, Notification`; enum constants (`SEVERITIES`, `CHANGE_TYPES`, `RUN_STATUSES`, `SOURCES`, `EVENT_TYPES`, `PROCESSING_STATUSES`, `RELEASE_STATUSES`, `ROLES`); error codes; `ROUTES` constants for every path in `architecture.md §8`; SSE event types; request/response DTO schemas.
2. **Contract freeze:** Suibrato publishes the first version of `packages/shared` within the first 90 minutes (Day 1). After that, additive changes only; breaking changes need an announcement in the team chat + PR.
3. Collection names, field names, enums = `database.md`. Endpoints = `architecture.md §8`. Envelope = `code_style.md §5`. Naming = `code_style.md §2`.
4. Internal n8n contract (owned by Suibrato in shared, consumed by Vicky):
   - `POST /internal/runs/:runId/start` → `{ runId, projectId, specSource: "github"|"snapshots", repo: {fullName, specPath}, baseRef, headRef, source, pullRequestNumber|null, aiEnabled: boolean }`
   - `POST /internal/runs/:runId/analyze` body `{ base?: {content}, head?: {content} }` (empty when `snapshots`) → `{ summary: RunSummary, findingCount, topFindings: [...] }`
   - `POST /internal/runs/:runId/explanations` body `{ runSummaryText?, findings: [{ fingerprint, explanation }] }`
   - `POST /internal/runs/:runId/notifications` body `{ channel, status, target, responseCode?, error? }`
   - `POST /internal/runs/:runId/fail` body `{ errorCode, errorMessage }`
   - Webhook payload api→n8n: `{ runId, projectId }` with header `x-shaktiq-webhook-token`.
5. `packages/analyzer` contract: `compareSpecs(baseSpec: string, headSpec: string, ctx: {projectId, previousVersion, currentVersion}): Promise<FindingDraft[]>` (Vicky implements; Suibrato calls it). Until it exists Suibrato uses a stub returning fixtures.
6. Mock policy: Lavanya may use MSW mocks in `apps/web/src/mocks` and Vicky `n8n/stub-api` **only during development**; the demo runs on the real stack.

## 2. Suibrato – Backend, Database, Security Agent
**Responsibilities:** Fastify app, env/config, auth (users, cookie JWT, PAT), projects/runs/findings/memory/admin/internal/cli routes, webhook intake + idempotency, n8n trigger client, Mongo client, migrations (validators, indexes, seed admin), aggregations, change streams + SSE hub, rate limit/CORS/logging, shared contracts, release status + report assembly.
**Files owned:** `apps/api/**`, `packages/shared/**`, `docs/database.md`, `docs/security.md`.
**Tasks (in order):** (1) `packages/shared` v1 + repo bootstrap of `apps/api` · (2) env, Mongo client, migrate script · (3) auth + projects · (4) webhook intake + events + runs + duplicate handling · (5) n8n trigger + internal routes · (6) analyze service using analyzer · (7) compare/report/memory aggregations · (8) change stream hub + SSE · (9) admin routes · (10) `/cli/analyze` + tokens · (11) tests: Mongo, API, race, change streams.
**Depends on:** analyzer (Vicky) for step 6; n8n workflow (Vicky) for step 5 integration; Lavanya consumes routes.
**Deliverables:** running API on :4000, `GET /health`, OpenAPI-less but typed routes, `apps/api/README.md`, passing tests listed in `testing.md §3–§7`.
**Restrictions:** never edit `apps/web`, `n8n`, `packages/analyzer`, `infra`; do not change enums without updating `database.md` and announcing; no Mongoose.
**Integration points:** shared package → everyone; internal routes → n8n; SSE + REST → web; `/cli/analyze` → extension.

## 3. Lavanya – Frontend Agent
**Responsibilities:** Next.js App Router + TS + Tailwind + shadcn/ui; **user panel** (dashboard, projects, project overview, runs list, run detail with findings drawer, compare, memory/hotspots, report, tokens page, manual-run form with spec upload) and **admin panel** (overview, all projects, all runs, events with duplicate/rejected indicators, workflows health, users, retry failed run); SSE client hook with reconnect; design system implementation; Playwright E2E.
**Files owned:** `apps/web/**`, `docs/design_system.md`.
**Tasks:** (1) scaffold, tokens, layout shells (user + admin) · (2) auth pages + API client typed from `packages/shared` · (3) projects + manual run flow · (4) run list/detail/findings drawer · (5) `useRunStream` + live status · (6) compare + memory · (7) report page (verdict banner + disclaimer, print CSS) · (8) admin pages · (9) empty/loading/error states, responsive, a11y · (10) Playwright tests.
**Depends on:** `packages/shared` (types/ROUTES), API routes (Suibrato). Develops against MSW until the API is up.
**Deliverables:** web on :3000, all pages in PRD FR-8, E2E suite from `testing.md §9`.
**Restrictions:** no secrets, no direct Mongo/n8n/GitHub calls from the browser, do not edit shared types (request changes), no inline styles with raw colors, no new UI libraries beyond Tailwind, shadcn/ui, Recharts, TanStack Query.
**Integration points:** REST + cookie auth, SSE `/stream`, route constants from shared.

## 4. Vicky – n8n, Analyzer, VS Code Extension, QA/Infra Agent
**Responsibilities:** Docker Compose (api, web, n8n, optional tunnel), Dockerfiles (api image includes oasdiff), `.env.example`; `packages/analyzer` (oasdiff wrapper, rule map, templates, fingerprints); OpenAPI fixtures; n8n workflows `shaktiq-analyze-run` and `shaktiq-error-handler` + stub API; VS Code extension (token auth, git-ref spec read, diagnostics, tree view, open dashboard); replay scripts; root tooling (workspaces, ESLint, Prettier, tsconfig base, CODEOWNERS, CI).
**Files owned:** `infra/**`, `scripts/**`, `n8n/**`, `packages/analyzer/**`, `apps/vscode-ext/**`, `fixtures/**`, root `package.json`/configs, `docs/testing.md`.
**Tasks:** (1) **first 60 minutes:** monorepo bootstrap (workspaces, configs, CODEOWNERS, compose skeleton) and push so others branch from it · (2) fixtures + analyzer (unit tests per `testing.md §3`) · (3) n8n container + stub API + main workflow · (4) error workflow + retries + GitHub PR comment branch · (5) integrate with real internal routes · (6) optional Claude branch (JSON-only prompt, per security §12) · (7) VS Code extension · (8) replay scripts for duplicate/invalid-signature · (9) workflow tests · (10) demo rehearsal.
**Depends on:** shared types (Suibrato) for FindingDraft and internal DTOs; real API for integration.
**Deliverables:** `docker compose up` starts everything; exported workflow JSON (no secrets); `.vsix`; fixtures + test table matching `testing.md §2`.
**Restrictions:** n8n must not talk to MongoDB or contain business rules; no secrets in committed workflows; do not edit `apps/api` or `apps/web` (open issues/PRs to owners); root dependency additions only via small PRs announced in chat.
**Integration points:** n8n ↔ `/internal/*` with `x-shaktiq-internal-key`; analyzer ↔ API; extension ↔ `/cli/analyze` and `/auth/me`.

## 5. Merge Conflict Rules
- Own your directories; never edit another owner's files (CODEOWNERS blocks it).
- Shared files (`docs/*` shared, root configs) change only via PR announced in chat.
- Root `package.json` dependencies: each app declares its own deps in its own `package.json`.
- `packages/shared` additions: Suibrato only; others request in chat and keep going with a local type alias until merged.
- Rebase on `main` daily; small PRs (< 400 lines) merged within a few hours.
- Lockfile conflicts: always regenerate (`npm install`) rather than manual merge.

## 6. Definition of Done (per task)
Typecheck + lint + tests pass; follows code_style; docs updated if a contract changed; manually exercised against the real stack; PR reviewed by one teammate.
