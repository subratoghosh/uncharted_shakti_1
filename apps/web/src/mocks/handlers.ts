// mocks/handlers.ts — MSW request handlers for local development
import { http, HttpResponse } from 'msw';
import {
  MOCK_USER,
  MOCK_ADMIN,
  MOCK_PROJECT,
  MOCK_RUN_COMPLETED,
  MOCK_FINDINGS,
  MOCK_EVENTS,
  MOCK_TOKENS,
  MOCK_HOTSPOTS,
  MOCK_OVERVIEW,
  MOCK_WORKFLOW_HEALTH,
} from './mock-data';

const API = '*/api/v1';

export const handlers = [
  // Auth
  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({ ok: true, data: MOCK_USER }),
  ),
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ ok: true, data: { user: MOCK_USER } }),
  ),
  http.post(`${API}/auth/register`, () =>
    HttpResponse.json({ ok: true, data: { user: MOCK_USER } }),
  ),
  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ ok: true, data: {} }),
  ),

  // Projects
  http.get(`${API}/projects`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_PROJECT] }),
  ),
  http.post(`${API}/projects`, () =>
    HttpResponse.json({ ok: true, data: MOCK_PROJECT }),
  ),
  http.get(`${API}/projects/:projectId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_PROJECT }),
  ),

  // Runs
  http.get(`${API}/projects/:projectId/runs`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_RUN_COMPLETED], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.post(`${API}/projects/:projectId/runs`, () =>
    HttpResponse.json({ ok: true, data: { ...MOCK_RUN_COMPLETED, status: 'queued', id: 'run-2' } }),
  ),
  http.get(`${API}/runs/:runId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_RUN_COMPLETED }),
  ),
  http.get(`${API}/runs/:runId/findings`, () =>
    HttpResponse.json({ ok: true, data: MOCK_FINDINGS }),
  ),
  http.get(`${API}/runs/:runId/report`, () =>
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
  http.get(`${API}/projects/:projectId/compare`, () =>
    HttpResponse.json({
      ok: true,
      data: MOCK_FINDINGS.map((f, i) => ({
        ...f,
        diffStatus: i === 0 ? 'new' : 'unresolved',
      })),
    }),
  ),

  // Memory
  http.get(`${API}/projects/:projectId/memory/hotspots`, () =>
    HttpResponse.json({ ok: true, data: MOCK_HOTSPOTS }),
  ),
  http.get(`${API}/projects/:projectId/memory/endpoint`, () =>
    HttpResponse.json({
      ok: true,
      data: [
        {
          id: 'mem-1',
          runId: 'run-0',
          severity: 'breaking',
          changeType: 'ENDPOINT_REMOVED',
          description: 'DELETE /users/{id} was removed in v0.9',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
    }),
  ),

  // Tokens
  http.get(`${API}/tokens`, () =>
    HttpResponse.json({ ok: true, data: MOCK_TOKENS }),
  ),
  http.post(`${API}/tokens`, () =>
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
        rawToken: 'sq_cd34_4f8b91c2e7a05d6e3f1b4c8a9e0d2f4b',
      },
    }),
  ),
  http.delete(`${API}/tokens/:tokenId`, () =>
    HttpResponse.json({ ok: true, data: {} }),
  ),

  // Admin
  http.get(`${API}/admin/overview`, () =>
    HttpResponse.json({ ok: true, data: MOCK_OVERVIEW }),
  ),
  http.get(`${API}/admin/projects`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_PROJECT], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.get(`${API}/admin/runs`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_RUN_COMPLETED], meta: { page: 1, limit: 20, total: 1 } }),
  ),
  http.get(`${API}/admin/events`, () =>
    HttpResponse.json({ ok: true, data: MOCK_EVENTS, meta: { page: 1, limit: 20, total: 2 } }),
  ),
  http.get(`${API}/admin/workflows/health`, () =>
    HttpResponse.json({ ok: true, data: MOCK_WORKFLOW_HEALTH }),
  ),
  http.get(`${API}/admin/users`, () =>
    HttpResponse.json({ ok: true, data: [MOCK_USER, MOCK_ADMIN] }),
  ),
  http.patch(`${API}/admin/users/:userId`, () =>
    HttpResponse.json({ ok: true, data: MOCK_USER }),
  ),
  http.post(`${API}/admin/runs/:runId/retry`, () =>
    HttpResponse.json({ ok: true, data: { ...MOCK_RUN_COMPLETED, status: 'queued' } }),
  ),

  // Health
  http.get(`${API}/health`, () =>
    HttpResponse.json({ ok: true, data: { status: 'ok' } }),
  ),
];
