# ShaktIQ – Code Style and Conventions

## 1. TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`, ESM, Node 20, TS 5.x. No `any` (use `unknown` + Zod). No default exports except Next.js pages/layouts.
- Types for data crossing a boundary are **derived from Zod schemas** in `packages/shared` (`z.infer`). Never redefine them locally.
- Prefer `type` over `interface`; no enums, use `as const` arrays + union types.
- Async/await only; no floating promises (ESLint `@typescript-eslint/no-floating-promises`).
- Tooling: ESLint (typescript-eslint), Prettier (single quotes, semi, 100 cols, trailing comma all). Root scripts: `npm run lint`, `npm run typecheck`, `npm test`.

## 2. Naming
| Thing | Convention | Example |
|---|---|---|
| Files (TS) | kebab-case | `run-service.ts` |
| React components | PascalCase file + export | `FindingsTable.tsx` |
| Variables/functions | camelCase | `createRun` |
| Types/schemas | PascalCase / `xxxSchema` | `Finding`, `findingSchema` |
| Constants | UPPER_SNAKE | `MAX_SPEC_BYTES` |
| Mongo collections | camelCase plural | `findings`, `specSnapshots` |
| Mongo fields | camelCase | `previousVersion` |
| Enums values | as in database.md (`breaking`, `ENDPOINT_REMOVED`) | |
| Routes | kebab-case, plural resources | `/projects/:projectId/runs` |
| Env vars | UPPER_SNAKE | `INTERNAL_API_KEY` |
| n8n workflows | `shaktiq-<verb>-<noun>` | `shaktiq-analyze-run` |
| Branches | `<owner>/<area>-<short>` | `lavanya/web-run-detail` |

## 3. Folder Structure
See `architecture.md §1` and §5 for the exact tree. Frontend (`apps/web/src`):
```
app/
  (auth)/login, register
  (user)/dashboard, projects, projects/[projectId], runs/[runId], tokens
  (admin)/admin/overview, projects, runs, events, workflows, users
  api/              (none; browser calls the Fastify API directly)
components/
  ui/               shadcn primitives (generated)
  shared/           SeverityBadge, StatusBadge, EndpointTag, VerdictBanner
  user/ admin/      feature components
lib/                api-client.ts, sse.ts, format.ts, auth.ts
hooks/              useRunStream, useProject...
styles/tokens.css
mocks/              MSW handlers (dev only)
```
Admin routes are guarded in `(admin)/layout.tsx` (role check via `/auth/me`); the API enforces roles anyway.

## 4. Component Conventions
Server components by default; `"use client"` only for interactivity (SSE, filters). Data fetching with a typed `apiClient` + TanStack Query (client) — keys: `["projects"]`, `["runs", projectId]`, `["run", runId]`. Props typed explicitly; no prop drilling beyond 2 levels. Tailwind classes use design tokens (`bg-surface`, `text-muted`), no raw hex. Every list component implements loading, empty and error states from `design_system.md §9`.

## 5. API Response Format
Success:
```json
{ "ok": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 134 } }
```
Failure:
```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details": [ { "path": "body.specPath", "message": "..." } ] } }
```
Error codes (single source `packages/shared/src/errors.ts`): `VALIDATION_ERROR` 400, `UNAUTHENTICATED` 401, `INVALID_SIGNATURE` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT` 409, `SPEC_TOO_LARGE` 413, `SPEC_INVALID` 422, `RATE_LIMITED` 429, `WORKFLOW_UNAVAILABLE` 502, `INTERNAL` 500.
Duplicate event is **not an error**: `200 { ok:true, data:{ duplicate:true, eventId, runId } }`. New event: `202 { ok:true, data:{ duplicate:false, eventId, runId } }`.
Dates: ISO 8601 UTC strings. IDs: strings named `id`, `projectId`, `runId`. Pagination: `?page=1&limit=20` (max 100), sort fixed per endpoint.
SSE message: `event: run.updated` / `event.received` / `event.duplicate`, `data: <JSON DTO>`.

## 6. Error Handling
Throw `AppError(code, message, details?)` from services; central handler formats it. Never `catch` just to log and swallow. Mongo duplicate key handled explicitly (`isDuplicateKeyError(err)`), everything else bubbles. Frontend shows `error.message` and `error.code`; never raw stack.

## 7. MongoDB Coding
- Single `MongoClient`, collections exported typed from `db/collections.ts`.
- Repositories only; services call repositories. No `find({})` without a projectId/limit.
- Always project fields for lists; always `limit`; sort fields must match an index.
- Use `ObjectId` internally, convert to string in DTO mappers (`toRunDto`).
- Time: `new Date()` created in the service and passed down (testable).
- Aggregations live in `repositories/*-pipelines.ts` as named functions with comments.
- Indexes/validators are changed only in `db/indexes.ts` and `db/validators/` (Suibrato).

## 8. Validation
Zod at every boundary: HTTP bodies/queries/params, env, n8n internal payloads, Claude output. Fastify schema compiler uses Zod (`fastify-type-provider-zod`). Shared schemas in `packages/shared/src/schemas/*.ts`.

## 9. Environment Configuration
`config/env.ts` parses `process.env` once, exports a frozen typed object; no `process.env` access elsewhere. Web reads only `NEXT_PUBLIC_*`.

## 10. Logging
`pino` JSON logs; child logger per request with `reqId`; levels: `info` lifecycle, `warn` duplicates/rejections, `error` unexpected. Message first, structured fields second: `log.warn({ eventId, runId }, 'duplicate event rejected')`. No `console.log` in committed code.

## 11. Git Conventions
- Conventional Commits: `feat(api): add webhook intake`, `fix(web): ...`, `docs: ...`, `test(api): ...`, `chore: ...`.
- Scopes: `api`, `web`, `shared`, `analyzer`, `n8n`, `vscode`, `infra`, `docs`.
- Branch from `main`, short-lived branches, PR with 1 reviewer, squash merge. Never push to `main` directly after Phase 2.
- Only touch files you own (see `agents.md`). Cross-owner change = PR to the owner or an issue.
- `CODEOWNERS` enforces ownership.

## 12. Documentation
Each app/package has a README (run, env, scripts). Public functions in `packages/*` have TSDoc. Changes to contracts require updating `docs/` in the same PR. Mermaid for diagrams.
