// mocks/handlers.ts — MSW request handlers for local development
// Dev only — never imported in production build.

import { http, HttpResponse } from 'msw';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const MOCK_USER = {
  id: 'user-1',
  email: 'dev@shaktiq.dev',
  name: 'Dev User',
  role: 'user' as const,
  disabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_ADMIN = {
  ...MOCK_USER,
  id: 'admin-1',
  email: 'admin@shaktiq.dev',
  name: 'Admin',
  role: 'admin' as const,
};

const MOCK_PROJECT = {
  id: 'proj-1',
  ownerUserId: 'user-1',
  name: 'Orders API',
  repositoryUrl: 'https://github.com/acme/orders',
  owner: 'acme',
  repo: 'orders',
  fullName: 'acme/orders',
  defaultBranch: 'main',
  specPath: 'openapi.yaml',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_RUN_COMPLETED = {
  id: 'run-1',
  projectId: 'proj-1',
  eventId: 'manual:uuid-1',
  source: 'manual' as const,
  previousVersion: 'abc1234',
  currentVersion: 'def5678',
  commitId: null,
  branch: 'main',
  pullRequestNumber: null,
  baseSnapshotId: null,
  headSnapshotId: null,
  baseSpecHash: null,
  headSpecHash: null,
  status: 'completed' as const,
  startedAt: new Date(Date.now() - 10000).toISOString(),
  completedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  summary: {
    total: 3,
    breaking: 1,
    warning: 1,
    info: 1,
    releaseStatus: 'blocked' as const,
    newCount: 2,
    resolvedCount: 0,
    unresolvedCount: 1,
  },
  errorCode: null,
  errorMessage: null,
  aiStatus: 'disabled' as const,
  aiSummary: null,
};

const MOCK_FINDINGS = [
  {
    id: 'f-1',
    projectId: 'proj-1',
    runId: 'run-1',
    fingerprint: 'a'.repeat(64),
    previousVersion: 'abc1234',
    currentVersion: 'def5678',
    endpoint: '/users/{id}',
    method: 'DELETE' as const,
    changeType: 'ENDPOINT_REMOVED' as const,
    severity: 'breaking' as const,
    ruleId: 'api-path-removed-without-deprecation',
    description: 'Endpoint DELETE /users/{id} was removed',
    impact: 'Clients calling this endpoint will receive 404/405.',
    recommendation:
      'Restore the endpoint or deprecate first and communicate a sunset date.',
    aiExplanation: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f-2',
    projectId: 'proj-1',
    runId: 'run-1',
    fingerprint: 'b'.repeat(64),
    previousVersion: 'abc1234',
    currentVersion: 'def5678',
    endpoint: '/orders',
    method: 'POST' as const,
    changeType: 'REQUIRED_REQUEST_FIELD_ADDED' as const,
    severity: 'warning' as const,
    ruleId: null,
    description: 'Required field "currency" added to POST /orders request body',
    impact: 'Clients not sending "currency" will receive a 422 error.',
    recommendation: 'Add "currency" to your request body or make it optional with a default.',
    aiExplanation: null,
    createdAt: new Date().toISOString(),
  },
];

export const handlers = [
  // Auth
  http.get(`${API}/api/v1/auth/me`, () =>
    HttpResponse.json({ ok: true, data: MOCK_USER }),
  ),
  http.post(`${API}/api/v1/auth/login`, () =>
    HttpResponse.json({ ok: true, data: { user: MOCK_USER } }),
  ),
  http.post(`${API}/api/v1/auth/register`, () =>
    HttpResponse.json({ ok: true, data: { user: MOCK_USER } }),
  ),
  http.post(`${API}/api/v1/auth/logout`, () =>
    HttpResponse.json({ ok: true, data: {} }),
  ),

  // Projects
  http.get(`${API}/api/v1/projects`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_PROJECT] }),
  ),
  http.post(`${API}/api/v1/projects`, () =>
    HttpResponse.json({ ok: true, data: MOCK_PROJECT }),
  ),
  http.get(`${API}/api/v1/projects/:projectId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_PROJECT }),
  ),

  // Runs
  http.get(`${API}/api/v1/projects/:projectId/runs`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_RUN_COMPLETED], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.post(`${API}/api/v1/projects/:projectId/runs`, () =>
    HttpResponse.json({ ok: true, data: { ...MOCK_RUN_COMPLETED, status: 'queued', id: 'run-2' } }),
  ),
  http.get(`${API}/api/v1/runs/:runId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_RUN_COMPLETED }),
  ),
  http.get(`${API}/api/v1/runs/:runId/findings`, () =>
    HttpResponse.json({ ok: true, data: MOCK_FINDINGS }),
  ),
  http.get(`${API}/api/v1/runs/:runId/report`, () =>
    HttpResponse.json({
      ok: true,
      data: {
        run: MOCK_RUN_COMPLETED,
        project: MOCK_PROJECT,
        summary: MOCK_RUN_COMPLETED.summary,
        findings: MOCK_FINDINGS,
        releaseStatus: 'blocked',
      },
    }),
  ),
  http.get(`${API}/api/v1/projects/:projectId/compare`, () =>
    HttpResponse.json({
      ok: true,
      data: MOCK_FINDINGS.map((f, i) => ({
        ...f,
        diffStatus: i === 0 ? 'new' : 'unresolved',
      })),
    }),
  ),

  // Memory
  http.get(`${API}/api/v1/projects/:projectId/memory/hotspots`, () =>
    HttpResponse.json({
      ok: true,
      data: [
        {
          method: 'DELETE',
          endpoint: '/users/{id}',
          occurrences: 3,
          distinctRuns: 2,
          lastSeen: new Date().toISOString(),
          changeTypes: ['ENDPOINT_REMOVED'],
        },
      ],
    }),
  ),
  http.get(`${API}/api/v1/projects/:projectId/memory/endpoint`, () =>
    HttpResponse.json({ ok: true, data: [] }),
  ),

  // Tokens
  http.get(`${API}/api/v1/tokens`, () =>
    HttpResponse.json({
      ok: true,
      data: [
        {
          id: 'tok-1',
          userId: 'user-1',
          name: 'laptop',
          prefix: 'sq_ab12',
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  ),
  http.post(`${API}/api/v1/tokens`, () =>
    HttpResponse.json({
      ok: true,
      data: {
        id: 'tok-2',
        userId: 'user-1',
        name: 'new-token',
        prefix: 'sq_cd34',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
        rawToken: 'sq_cd34_FAKE_RAW_TOKEN_SHOWN_ONCE',
      },
    }),
  ),
  http.delete(`${API}/api/v1/tokens/:tokenId`, () =>
    HttpResponse.json({ ok: true, data: {} }),
  ),

  // Admin
  http.get(`${API}/api/v1/admin/overview`, () =>
    HttpResponse.json({
      ok: true,
      data: {
        runs: { total: 42, queued: 1, running: 2, completed: 38, failed: 1, last24h: 12 },
        events: { total: 55, duplicateCount: 3, rejectedCount: 2 },
        projects: { total: 8 },
        users: { total: 15 },
      },
    }),
  ),
  http.get(`${API}/api/v1/admin/projects`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_PROJECT], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.get(`${API}/api/v1/admin/runs`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_RUN_COMPLETED], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.get(`${API}/api/v1/admin/events`, () =>
    HttpResponse.json({
      ok: true,
      data: [
        {
          id: 'evt-1',
          eventId: 'github:delivery-uuid-1',
          projectId: 'proj-1',
          eventType: 'github.push',
          source: 'github',
          receivedAt: new Date().toISOString(),
          processingStatus: 'processed',
          runId: 'run-1',
          duplicateCount: 1,
          lastDuplicateAt: new Date().toISOString(),
          error: null,
        },
        {
          id: 'evt-2',
          eventId: 'rejected:bad-signature-uuid',
          projectId: null,
          eventType: 'github.push',
          source: 'github',
          receivedAt: new Date().toISOString(),
          processingStatus: 'rejected',
          runId: null,
          duplicateCount: 0,
          lastDuplicateAt: null,
          error: 'INVALID_SIGNATURE',
        },
      ],
      meta: { page: 1, limit: 20, total: 2 },
    }),
  ),
  http.get(`${API}/api/v1/admin/workflows/health`, () =>
    HttpResponse.json({
      ok: true,
      data: { status: 'ok', lastCheck: new Date().toISOString(), details: 'n8n reachable' },
    }),
  ),
  http.get(`${API}/api/v1/admin/users`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_USER, MOCK_ADMIN] }),
  ),
  http.patch(`${API}/api/v1/admin/users/:userId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_USER }),
  ),
  http.post(`${API}/api/v1/admin/runs/:runId/retry`, () =>
    HttpResponse.json({ ok: true, data: { ...MOCK_RUN_COMPLETED, status: 'queued' } }),
  ),

  // Health
  http.get(`${API}/api/v1/health`, () =>
    HttpResponse.json({ ok: true, data: { status: 'ok' } }),
  ),
];

