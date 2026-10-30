# ShaktIQ – Testing Strategy

## 1. Strategy
Test pyramid: many unit tests (Vitest), integration tests against a real MongoDB (Atlas test database `shaktiq_test` or `mongodb-memory-server` replica set, **change streams need a replica set**), API tests through `fastify.inject`, a few Playwright end-to-end tests, and a scripted n8n workflow check. Detection correctness is proven by **fixtures**, never by AI output. CI command: `npm run typecheck && npm run lint && npm test`; E2E: `npm run e2e`.

## 2. Fixtures (`fixtures/openapi/`, owner Vicky)
Base: `orders-v1.yaml` (endpoints: `GET /orders`, `POST /orders`, `GET /orders/{id}`, `DELETE /orders/{id}`, `GET /users/{id}`).
| File | Change vs v1 | Expected findings |
|---|---|---|
| `orders-v2-remove-endpoint.yaml` | removes `GET /users/{id}` path | `ENDPOINT_REMOVED`, breaking |
| `orders-v2-remove-method.yaml` | removes `DELETE /orders/{id}` | `METHOD_REMOVED`, breaking |
| `orders-v2-required-field.yaml` | `POST /orders` body adds required `currency` | `REQUIRED_REQUEST_FIELD_ADDED`, breaking |
| `orders-v2-required-param.yaml` | `GET /orders` adds required query `tenant` | `REQUIRED_PARAMETER_ADDED`, breaking |
| `orders-v2-response-field-removed.yaml` | `GET /orders/{id}` response drops `status` | `RESPONSE_FIELD_REMOVED`, breaking |
| `orders-v2-type-change.yaml` | `total` integer → string | `FIELD_TYPE_CHANGED`, breaking |
| `orders-v2-optional-to-required.yaml` | optional `note` becomes required | `FIELD_MADE_REQUIRED`, breaking |
| `orders-v2-additive.yaml` | new endpoint + new optional field | `ENDPOINT_ADDED`/`OPTIONAL_FIELD_ADDED`, info only → `safe` |
| `orders-v3-combo.yaml` | v2 remove-endpoint reverted + new break on `POST /orders` | for history tests |
| `broken.yaml` | invalid YAML / not OpenAPI | analyze → `SPEC_INVALID` |
Any fixture whose oasdiff output differs from this table: fix the table via PR after confirming with oasdiff output (rule ids in `packages/analyzer/src/rules.ts`).

## 3. Unit Tests (Vitest)
| Area | Cases | Expected |
|---|---|---|
| analyzer rules | each fixture above | exact changeType + severity |
| analyzer fingerprint | same change twice | identical fingerprint; different method → different |
| analyzer templates | every changeType | non-empty impact + recommendation |
| analyzer failure | `broken.yaml`, oasdiff timeout | throws `SPEC_INVALID` / `ANALYSIS_FAILED` |
| release status | counts (0/0/n), (0/1/n), (1/x/x) | `safe`, `review`, `blocked` |
| signature util | valid, tampered body, wrong length header | true / false / false (no throw) |
| env parsing | missing secret, short JWT secret | process fails with clear message |
| Zod schemas | unknown keys, bad `specPath` (`../x`) | rejected |

## 4. MongoDB Tests (integration)
- Migration creates all 8 collections, validators and indexes (`listIndexes` includes unique `events.eventId`, `runs.eventId`, `findings {runId,fingerprint}`, `projects.fullName`, `users.email`).
- Validator rejects: event with unknown `source`; finding with `severity: "high"`; run missing `projectId`.
- Unique index: inserting the same `eventId` twice → code 11000.
- Race test: 20 parallel `intakeEvent()` calls with the same eventId → exactly 1 event, 1 run, `duplicateCount = 19`.
- Aggregation tests: compare pipeline using seeded runs (see §8); hotspot pipeline; summary pipeline.
- Explain plan test: history query uses `projectId_1_createdAt_-1` (assert `IXSCAN`, no `COLLSCAN`).
- TTL index definitions exist on `events.receivedAt`, `notifications.createdAt`.

## 5. API Tests (`fastify.inject`)
| Test | Expected |
|---|---|
| `POST /webhooks/github` valid signature, new delivery | 202, `duplicate:false`, run `queued` created |
| same delivery again | 200, `duplicate:true`, same `runId`, run count unchanged |
| invalid signature | 401 `INVALID_SIGNATURE`, no run, rejected event stored |
| missing `X-GitHub-Delivery` | 400 `VALIDATION_ERROR` |
| malformed JSON / missing `repository` | 400 `VALIDATION_ERROR` |
| unknown repository | 404 `NOT_FOUND`, no run |
| `ping` event | 200 |
| `push` to non-default branch | 202 ignored (no run) |
| `POST /projects/:id/runs` without auth | 401 |
| other user's project | 404 |
| non-admin on `/admin/*` | 403 |
| `/internal/*` without key / wrong key | 401 |
| `analyze` with `broken.yaml` | run `failed`, `errorCode: SPEC_INVALID` |
| `analyze` called twice (retry) | findings not duplicated |
| spec > 5 MB | 413 `SPEC_TOO_LARGE` |
| rate limit on login (11th request) | 429 |
| n8n unreachable | run `failed`, `WORKFLOW_UNAVAILABLE` |
| `POST /cli/analyze` with PAT | 202, run `source: vscode` |
| revoked PAT | 401 |

## 6. Historical Comparison and Memory Tests
Seed three runs on one project:
- Run A: findings F1 (DELETE /orders/{id}), F2 (POST /orders required field).
- Run B: F2, F3 (GET /orders param).
- Run C: F3, F4 (DELETE /orders/{id} again, different change).
Expected:
- compare A→B: new `[F3]`, resolved `[F1]`, unresolved `[F2]`.
- compare B→C: new `[F4]`, resolved `[F2]`, unresolved `[F3]`.
- hotspots: `DELETE /orders/{id}` appears with `distinctRuns: 2`; `POST /orders` with 2 (A,B).
- endpoint memory for run C finding F4 returns the F1 history entry.
- summary counts persisted in `runs.summary` match.

## 7. Change Stream Tests
- Subscribe to the hub; insert a run → receives `run.updated` within 2 s.
- Update run status → another message with new status.
- Increment `duplicateCount` → `event.duplicate` message.
- User A subscriber does not receive events of user B's project; admin receives all.
- Kill and reopen the stream → hub reconnects and keeps emitting.
- SSE endpoint: unauthenticated → 401; heartbeat comment within 30 s.

## 8. n8n Workflow Tests
Run against `n8n/stub-api` first, then the real API.
1. Trigger the webhook with valid token and `runId`; expect `start` → `analyze` called in order (stub records calls) and final status `completed`.
2. Wrong webhook token → 403, no backend calls.
3. `specSource: snapshots` skips GitHub fetch nodes.
4. GitHub fetch 404 → error workflow calls `/fail` with `SPEC_NOT_FOUND`/`WORKFLOW_FAILED`.
5. Backend 500 on `analyze` → node retries 3×, then error workflow.
6. `AI_EXPLANATIONS_ENABLED=false` → Claude node never executed.
7. Claude returns garbage → backend rejects explanation, run stays `completed`, `aiStatus: failed`.
8. PR source → comment posted and `notifications` record created.
Provide `n8n/tests/run-workflow-tests.sh` (curl-based) documented in `n8n/README.md`.

## 9. Playwright E2E (`apps/web/e2e/`)
| Scenario | Steps | Expected |
|---|---|---|
| Login and projects | register, login, create project | project appears |
| Manual analysis | upload v1 and v2-remove-endpoint | run goes queued→running→completed live; 1 breaking finding; verdict "Not ready: blocking changes detected" |
| History and compare | run third analysis, open compare | New/Resolved/Unresolved tabs show correct counts |
| Memory | open finding of repeated endpoint | memory timeline lists earlier run |
| Report | open report | disclaimer visible, statuses correct |
| Duplicate webhook | script posts signed webhook twice | admin Events shows `duplicateCount 1`, only one run |
| Invalid signature | script posts bad signature | admin Events shows rejected entry |
| Failed analysis | upload `broken.yaml` | run `failed` with `SPEC_INVALID` shown |
| Authorization | user visits `/admin/overview` | redirected/forbidden |
| Responsive | viewport 390px | sidebar becomes drawer, table scrolls |
| Accessibility | axe scan on dashboard & run detail | no serious violations |

## 10. Acceptance Test Scenarios (mirror PRD AC-1…AC-10)
Each acceptance criterion in `prd.md §11` maps to at least one test above (AC-1 §3/§5, AC-2 §4/§5/§9, AC-3 §5, AC-4 §5, AC-5 §7/§9, AC-6 §6, AC-7 §9, AC-8 §5/§9, AC-9 manual checklist below, AC-10 §8 item 6).

**VS Code manual checklist:** install VSIX → sign in with token → edit fixture spec (remove endpoint) → run Analyze → Problems panel shows the breaking finding → "Open in dashboard" opens the run → invalid token shows a clear error → non-OpenAPI file shows `SPEC_INVALID`.

## 11. Demo Rehearsal Checklist
Run scenarios from `prd.md §12` twice; keep the signed-webhook replay script `scripts/replay-webhook.sh` (owner Vicky) for the duplicate and invalid-signature demos.
