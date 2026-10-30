# ShaktIQ n8n Automation Workflows

This directory contains the n8n orchestration workflows, the test suite, and the local stub API for ShaktIQ.

## 1. Workflows

- **`workflows/shaktiq-analyze-run.json`**: Primary analysis orchestration workflow.
  - Triggered by `POST /webhook/shaktiq-analyze-run` with header `x-shaktiq-webhook-token`.
  - Responds immediately with `202 Accepted`.
  - Dispatches `POST /internal/runs/:runId/start`.
  - Evaluates `specSource` (`github` vs `snapshots`).
  - Fetches base/head spec via GitHub API (if `github`).
  - Dispatches `POST /internal/runs/:runId/analyze` with 3x retry and 2s backoff.
  - Conditionally invokes Claude Messages API if AI explanations are enabled and findings exist.
  - Submits explanations to `POST /internal/runs/:runId/explanations`.
  - Posts PR comments on GitHub and records notifications via `POST /internal/runs/:runId/notifications`.

- **`workflows/shaktiq-error-handler.json`**: Workflow error handler.
  - Configured as `errorWorkflow` on the main workflow.
  - Captures failed node, error message, and `runId`.
  - Reports failure to `POST /internal/runs/:runId/fail` with `errorCode: WORKFLOW_FAILED`.

## 2. Security & Credentials

n8n never touches MongoDB directly and contains zero business rules. All credentials are encrypted in n8n and never committed in plaintext:
- `githubApi`: GitHub fine-grained PAT (Contents: read, Pull requests: write).
- `anthropicApi`: Optional Anthropic API key for Claude explanations.
- `INTERNAL_API_KEY`: Provided via container environment variable to authenticate with `/internal/*` routes.

## 3. Local Stub API (`n8n/stub-api`)

Run the stub API locally for development and workflow testing before integrating with the real API:

```bash
npm run dev -w n8n/stub-api
```

Stub endpoints:
- `POST /internal/runs/:runId/start`
- `POST /internal/runs/:runId/analyze`
- `POST /internal/runs/:runId/explanations`
- `POST /internal/runs/:runId/notifications`
- `POST /internal/runs/:runId/fail`
- `GET /stub/calls` (inspect recorded calls)
- `POST /stub/reset` (clear recorded calls)
- `POST /stub/config` (configure mock behavior)

## 4. Running Workflow Tests

Execute the automated test script:

```bash
./n8n/tests/run-workflow-tests.sh
```
