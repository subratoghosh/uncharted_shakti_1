# @shaktiq/web — Next.js Frontend

User + Admin web dashboard for ShaktIQ.

## Stack
- Next.js 15 App Router + TypeScript (strict)
- Tailwind CSS (CSS variables from `src/styles/tokens.css`)
- shadcn/ui components
- Recharts (charts only)
- TanStack Query v5
- MSW v2 (dev mocks)
- Playwright (E2E)
- Vitest (unit)

## Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
Copy `.env.local.example` → `.env.local`.

## Scripts
```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run typecheck
npm run lint
npm test         # vitest unit tests
npm run e2e      # playwright E2E (requires dev server running)
```

## Route Structure
```
(auth)/login, register
(user)/dashboard, projects, projects/[projectId], projects/[projectId]/runs/new
       projects/[projectId]/compare, runs/[runId], runs/[runId]/report, tokens
(admin)/admin/overview, admin/projects, admin/runs, admin/events, admin/workflows, admin/users
```

## Design System
All tokens in `src/styles/tokens.css`. Never use raw hex colors — always Tailwind
utilities backed by CSS variables (`text-[var(--text)]`, `bg-[var(--surface)]`, etc.).

## MSW Mocks
In `src/mocks/handlers.ts` — active in `NODE_ENV=development` only.
Start the dev server and the service worker intercepts all API calls.

## E2E Tests
11 scenarios matching `testing.md §9`. Run against the full Docker Compose stack for
real-backend tests; MSW handles mocked scenarios.
```bash
npm run e2e -w apps/web
```

## Ownership
Owner: Lavanya (frontend agent). Do not edit `packages/shared`, `apps/api`, or `n8n/`.

