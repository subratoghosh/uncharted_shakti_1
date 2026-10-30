# ShaktIQ – Product Requirements Document

## 1. Overview
ShaktIQ is a developer tool that compares OpenAPI specifications between two versions of a project, detects breaking API changes deterministically (using `oasdiff`), stores every analysis in MongoDB, tracks history, and reports release compatibility status.

**Core question:** *"Will the latest API changes break existing consumers, and what could be affected?"*

Hackathon: MongoDB Student Hackathon, Track 3 – Developer Tools for Production Use Cases.

## 2. Problem Statement
API providers change specs constantly. Removing an endpoint, adding a required field or changing a type silently breaks mobile apps, partner integrations and internal services. Reviewers rarely diff YAML line by line, and nobody remembers that `/orders` has broken consumers three times already. ShaktIQ automates the diff, classifies risk, remembers history, and surfaces the result where developers already work (GitHub PRs and VS Code).

## 3. Target Users
| User | Need |
|---|---|
| API developer | Know before pushing whether a change breaks consumers |
| Reviewer / tech lead | Fast compatibility verdict on a PR plus history |
| Platform admin (admin panel) | Monitor all projects, runs, duplicate events, workflow health, users |

## 4. Entry Points (same pipeline, two surfaces)
1. **GitHub integration (pre-release gate):** webhook on `push` / `pull_request` → analysis → optional PR comment.
2. **VS Code extension (development phase):** developer analyzes working-copy spec vs `git HEAD` (or a chosen ref) → findings appear as VS Code diagnostics and a tree view, linked to the dashboard run.
3. **Manual run from the dashboard** (spec upload or ref pair).

All three create an `events` record and a `runs` record and execute the same n8n workflow `shaktiq-analyze-run`.

## 5. Product Goals
- G1: Deterministic breaking-change detection from OpenAPI 3.x specs.
- G2: Full history of runs/findings with run-to-run comparison (new / resolved / unresolved).
- G3: Project memory: highlight endpoints with recurring breaking changes.
- G4: Release impact report with honest, scoped verdict.
- G5: Idempotent event intake; duplicate webhooks never create duplicate runs.
- G6: Live run status through MongoDB Change Streams → SSE.
- G7: Meaningful use of MongoDB (indexes, validation, aggregations, change streams) and n8n (orchestration).

## 6. Functional Requirements
### FR-1 Detection (P0)
- Fetch/accept base and head spec (YAML or JSON, OpenAPI 3.0/3.1; Swagger 2.0 best effort).
- Run `oasdiff changelog --format json` through `packages/analyzer`.
- Detect at minimum: endpoint removed, method removed, required request field/parameter added, response field removed, type changed, optional→required, response schema incompatible change, parameter changed incompatibly.
- Each finding stores: id, projectId, runId, previous/current version, endpoint, method, changeType, severity, description, impact, recommendation, fingerprint, createdAt.
- Severity: `breaking`, `warning` (potentially breaking), `info` (non-breaking).
- Impact and recommendation text come from deterministic templates per `changeType`.

### FR-2 Projects and History (P0)
- Register project (name, repo URL, default branch, spec path).
- List runs; view analyzed commit; compare any two runs → `new`, `resolved`, `unresolved` findings (MongoDB aggregation).

### FR-3 Project Memory (P1)
- For every finding show prior occurrences for the same `(method, endpoint)`: count, last seen run, prior change types.
- Endpoint "hotspots" list on the project overview.

### FR-4 AI Explanations (P2, optional)
- Claude API called **from n8n** to produce explanation, affected consumers, migration steps, report summary.
- Stored in `findings.aiExplanation` and `runs.aiSummary`. Everything works with it disabled (`AI_EXPLANATIONS_ENABLED=false`).

### FR-5 Release Impact Report (P0)
- Totals by severity, new, resolved, historical context, recommended actions.
- Release status: `safe` ("Safe based on configured checks"), `review` ("Warning: review required"), `blocked` ("Not ready: blocking changes detected").
- Mandatory disclaimer: *"This report assesses API compatibility based on the OpenAPI specifications provided. It does not guarantee the release is safe."*

### FR-6 Live Updates (P0)
- Change streams on `runs` and `events` → SSE endpoint → dashboard status badges update without refresh.

### FR-7 Notifications (P1)
- GitHub PR comment when a PR run finds `breaking` or `warning` findings. Slack postponed.

### FR-8 User side and Admin side (P0 user / P1 admin)
- User panel: dashboard, projects, runs, run detail, compare, memory, report, tokens (for VS Code).
- Admin panel: platform overview, all projects, all runs, events log (with duplicate counts and rejected signatures), workflow health, users, retry failed run.

### FR-9 VS Code Extension (P1)
- Commands: `ShaktIQ: Sign in with token`, `ShaktIQ: Analyze API changes`, `ShaktIQ: Open last run in dashboard`.
- Compares working-copy spec with `git HEAD:<specPath>` (or a chosen branch). Shows findings in Problems panel and a ShaktIQ tree view.

## 7. Non-Functional Requirements
- Analysis of a typical spec (≤ 2 MB) completes < 15 s end-to-end.
- Spec size limit 5 MB; reject larger with `SPEC_TOO_LARGE`.
- No repository code executed; only spec text parsed.
- Secrets never in frontend bundles or logs.
- Every document has `createdAt`; runs/events have stable IDs.
- Works locally via Docker Compose + Atlas free tier.

## 8. MVP Scope
**In:** OpenAPI comparison via oasdiff, GitHub webhook (`push`, `pull_request`), manual runs, VS Code extension (thin client), history + compare, memory via queries, release report, SSE live status, duplicate/invalid-signature/invalid-input demos, user + admin panels, n8n workflow + error workflow, PR comment.
**Optional if time:** Claude explanations, TTL cleanup UI.

## 9. Excluded from MVP (postponed)
Other API types (GraphQL, gRPC, AsyncAPI), code-level consumer analysis, vector search/RAG, Slack, GitHub OAuth app/multi-tenant installs, per-project webhook secrets, billing, auto-merge/deploy, Swagger 2.0 guarantees.

## 10. User Journeys
1. **GitHub PR:** Dev opens PR removing `DELETE /users/{id}` → webhook → run → PR comment "Not ready: 1 breaking change" → dashboard shows finding with memory ("this endpoint broke in 2 earlier runs").
2. **VS Code:** Dev edits `openapi.yaml`, runs *Analyze API changes* → Problems panel shows 2 breaking findings before commit.
3. **Review history:** Lead opens project → run list → compares run 4 vs run 5 → sees 1 new, 2 resolved, 3 unresolved.
4. **Admin:** Admin opens Events log → sees a duplicate delivery with `duplicateCount: 1` and a rejected signature entry.

## 11. Acceptance Criteria
- AC-1: Pushing a commit that removes an endpoint produces a run with ≥1 `breaking` finding of type `ENDPOINT_REMOVED`.
- AC-2: Same webhook delivery sent twice → exactly one run; second response `duplicate: true`; event `duplicateCount = 1`.
- AC-3: Bad signature → 401 `INVALID_SIGNATURE`, nothing stored in `runs`.
- AC-4: Malformed payload → 400 `VALIDATION_ERROR`.
- AC-5: Run status changes `queued → running → completed` visible live in dashboard without reload.
- AC-6: Compare endpoint classifies findings correctly using fingerprints.
- AC-7: Report shows status and disclaimer.
- AC-8: Corrupt spec → run ends `failed` with `errorCode: SPEC_INVALID`, visible in UI and admin.
- AC-9: VS Code extension produces diagnostics for a changed spec.
- AC-10: Everything works with Claude disabled.

## 12. Hackathon Demo Scenario
1. Register project (repo with `openapi.yaml`).
2. Push v1 → baseline run (all `info`/none) → status Safe.
3. Push v2 (removes endpoint, adds required field) → live run → 2 breaking findings, PR comment.
4. Show run history and compare (new findings).
5. Push v3 (reverts one change, new break on same endpoint) → memory highlights recurrence.
6. **Failure case:** replay webhook with same delivery ID → duplicate rejected; show unique index error in logs and admin Events page. Then invalid signature and corrupt spec.
7. Show MongoDB: indexes, validator, aggregation, change stream.
8. Show VS Code extension on a local edit.

## 13. Success Metrics
Detection accuracy on fixture suite 100%; duplicate rejection 100% under 20 concurrent identical deliveries; demo end-to-end under 20 s; all acceptance criteria green.

## 14. Future Improvements
Per-project secrets, GitHub App, AsyncAPI/GraphQL, consumer registry (which service uses which endpoint), Slack, SARIF output, CI GitHub Action, vector memory.
