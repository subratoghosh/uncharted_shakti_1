export const API_PREFIX = '/api/v1' as const;

export const ROUTES = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  TOKENS: {
    LIST: '/tokens',
    CREATE: '/tokens',
    REVOKE: '/tokens/:tokenId',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: '/projects/:projectId',
    UPDATE: '/projects/:projectId',
    DELETE: '/projects/:projectId',
    AI_QUERY: '/projects/:projectId/ai/query',
  },
  RUNS: {
    CREATE_MANUAL: '/projects/:projectId/runs',
    LIST_BY_PROJECT: '/projects/:projectId/runs',
    GET: '/runs/:runId',
    FINDINGS: '/runs/:runId/findings',
    REPORT: '/runs/:runId/report',
    COMPARE: '/projects/:projectId/compare',
    AI_QUERY: '/runs/:runId/ai/query',
  },
  MEMORY: {
    HOTSPOTS: '/projects/:projectId/memory/hotspots',
    ENDPOINT: '/projects/:projectId/memory/endpoint',
  },
  WEBHOOKS: {
    GITHUB: '/webhooks/github',
  },
  CLI: {
    ANALYZE: '/cli/analyze',
  },
  STREAM: {
    SUBSCRIBE: '/stream',
  },
  ADMIN: {
    OVERVIEW: '/admin/overview',
    PROJECTS: '/admin/projects',
    RUNS: '/admin/runs',
    EVENTS: '/admin/events',
    WORKFLOWS_HEALTH: '/admin/workflows/health',
    RUN_RETRY: '/admin/runs/:runId/retry',
    USERS: '/admin/users',
    USER_UPDATE: '/admin/users/:userId',
  },
  INTERNAL: {
    RUN_START: '/internal/runs/:runId/start',
    RUN_ANALYZE: '/internal/runs/:runId/analyze',
    RUN_EXPLANATIONS: '/internal/runs/:runId/explanations',
    RUN_NOTIFICATIONS: '/internal/runs/:runId/notifications',
    RUN_FAIL: '/internal/runs/:runId/fail',
  },
} as const;
