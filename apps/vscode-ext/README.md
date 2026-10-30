# ShaktIQ – OpenAPI Breaking Change Detection for VS Code

Deterministic OpenAPI breaking-change detection and release impact intelligence directly inside your editor.

## Features

- **Local Git Comparison**: Compare your working OpenAPI specification against any git reference (`HEAD`, `main`, etc.) or the ShaktIQ remote snapshot.
- **Inline Diagnostics**: Automatically flags breaking changes with red/yellow squiggly lines on affected schema fields and paths.
- **Dedicated Findings Tree View**: Browse detected API changes grouped by severity (`breaking`, `warning`, `info`) with quick jump-to-definition.
- **Dashboard Deep-Linking**: One-click opening of full run history, impact analysis, and changelog on the ShaktIQ web dashboard.

## Commands

- `ShaktIQ: Sign in with token`: Authenticate using a Personal Access Token (PAT).
- `ShaktIQ: Analyze API changes`: Run instant local analysis against the base spec.
- `ShaktIQ: Open last run in dashboard`: Launch the full web dashboard for the current run.

## Configuration

- `shaktiq.apiUrl`: Base API URL (default: `http://localhost:4000/api/v1`).
- `shaktiq.webUrl`: Web dashboard URL (default: `http://localhost:3000`).
- `shaktiq.specPath`: Relative path to OpenAPI spec file (default: `openapi.yaml`).
- `shaktiq.baseRef`: Default Git reference to compare against (default: `HEAD`).
