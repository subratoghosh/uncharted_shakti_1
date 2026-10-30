# Changelog

All notable changes to the ShaktIQ API Compatibility & Release Intelligence platform are documented in this file.

## [1.1.0] - 2026-10-31

### Added
- **Multi-Layer AI Release Intelligence Dossier**:
  - 4-layer intelligence architecture synthesizing raw diffs into actionable business directives.
  - **Layer 1 (Executive Summary)**: Calculated 0-100 Release Score with traffic-light deployment verdicts (`BLOCKED`, `APPROVED WITH STAKEHOLDER SIGN-OFF`, `SAFE FOR DEPLOYMENT`).
  - **Layer 2 (4-Pillar Blast Radius Matrix)**: Evaluates vulnerability across Mobile Applications, Web Frontend, Backend Microservices, and Third-Party API Partners.
  - **Layer 3 (AI Code Remediation)**: Contextual, copy-paste ready backward-compatible code snippets and mitigation strategies for every breaking finding.
  - **Layer 4 (Multi-Stakeholder Directives)**: Role-specific action items tailored for Tech Leads, QA Engineering, and Product Owners.
- **AI Endpoints & Services**:
  - `GET /api/v1/projects/:id/runs/:runId/ai-dossier` Fastify route with cached response in MongoDB.
  - Native Google Gemini SDK integration (`gemini-2.5-flash` / `gemini-3.8-flash`) with automatic, graceful fallback to deterministic offline scoring.
  - Unit and integration test suites in Vitest (`tests/gemini-service.test.ts` and `tests/api.test.ts`).
- **Frontend Modular Components**:
  - `<AiReleaseDossier />`: Dedicated tab view on the dashboard.
  - `<BlastRadiusMatrix />`: 4-pillar risk assessment card grid.
  - `<CodeRemediationCard />`: Interactive code patch viewer with one-click clipboard copy.
  - `<ReleaseScoreGauge />`: Executive score gauge with breakdown by severity.
- **CLI & Developer Utilities**:
  - `scripts/test-ai-dossier.ts`: Fast terminal runner to test AI release dossiers against mock findings.
  - `npm run test:ai` shortcut command for testing AI services.

### Changed
- Refactored `apps/web/src/app/page.tsx` into modular components to decouple AI release intelligence from standard diff tables.
- Enhanced API health check endpoint to report AI model version and fallback status.

---

## [1.0.0] - 2026-10-30

### Initial Release
- OASDiff-powered deterministic breaking change detection.
- Fastify backend API with JWT authentication and RBAC.
- Next.js modern dark-mode frontend dashboard.
- GitHub App webhook ingestion and pull request review comment generation.
- Real-time Server-Sent Events (SSE) stream for run status updates.
