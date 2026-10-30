// packages/shared/src/routes.ts
// Route constants matching architecture.md §8. Suibrato owns this file.

const BASE = '/api/v1';

export const ROUTES = {
  // Auth
  AUTH_REGISTER: `${BASE}/auth/register`,
  AUTH_LOGIN: `${BASE}/auth/login`,
  AUTH_LOGOUT: `${BASE}/auth/logout`,
  AUTH_ME: `${BASE}/auth/me`,
  TOKENS: `${BASE}/tokens`,
  TOKEN: (tokenId: string) => `${BASE}/tokens/${tokenId}`,

  // Projects
  PROJECTS: `${BASE}/projects`,
  PROJECT: (projectId: string) => `${BASE}/projects/${projectId}`,

  // Runs
  PROJECT_RUNS: (projectId: string) => `${BASE}/projects/${projectId}/runs`,
  RUN: (runId: string) => `${BASE}/runs/${runId}`,
  RUN_FINDINGS: (runId: string) => `${BASE}/runs/${runId}/findings`,
  RUN_REPORT: (runId: string) => `${BASE}/runs/${runId}/report`,
  PROJECT_COMPARE: (projectId: string) => `${BASE}/projects/${projectId}/compare`,

  // Memory
  PROJECT_HOTSPOTS: (projectId: string) => `${BASE}/projects/${projectId}/memory/hotspots`,
  PROJECT_ENDPOINT_MEMORY: (projectId: string) =>
    `${BASE}/projects/${projectId}/memory/endpoint`,

  // Webhook
  WEBHOOKS_GITHUB: `${BASE}/webhooks/github`,

  // Stream
  STREAM: `${BASE}/stream`,

  // Admin
  ADMIN_OVERVIEW: `${BASE}/admin/overview`,
  ADMIN_PROJECTS: `${BASE}/admin/projects`,
  ADMIN_RUNS: `${BASE}/admin/runs`,
  ADMIN_EVENTS: `${BASE}/admin/events`,
  ADMIN_WORKFLOWS_HEALTH: `${BASE}/admin/workflows/health`,
  ADMIN_USERS: `${BASE}/admin/users`,
  ADMIN_USER: (userId: string) => `${BASE}/admin/users/${userId}`,
  ADMIN_RUN_RETRY: (runId: string) => `${BASE}/admin/runs/${runId}/retry`,

  // Health
  HEALTH: `${BASE}/health`,
} as const;

