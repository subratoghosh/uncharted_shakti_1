// lib/api-client.ts
// Typed fetch wrapper — uses ROUTES from @shaktiq/shared.
// No secrets here. Cookies sent automatically (credentials: 'include').
// Never call MongoDB, n8n or GitHub from here.

import { ROUTES } from '@shaktiq/shared';
import type {
  ApiResponse,
  ApiToken,
  ApiTokenCreated,
  AdminOverview,
  Event,
  Finding,
  FindingWithDiff,
  HotspotEndpoint,
  EndpointMemoryEntry,
  Project,
  Run,
  RunReport,
  User,
  WorkflowHealth,
} from '@shaktiq/shared';
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
} from '../mocks/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  devFallback?: () => T,
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    const json = (await res.json()) as ApiResponse<T>;

    if (!json.ok) {
      throw new ApiError(json.error.code, json.error.message, json.error.details);
    }

    return json;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    // In dev mode: if backend is unreachable, use mock data fallback
    if (process.env.NODE_ENV === 'development' && devFallback) {
      return { ok: true, data: devFallback() };
    }

    throw new ApiError(
      'NETWORK_ERROR',
      err instanceof Error ? err.message : 'Network request failed',
    );
  }
}

function get<T>(path: string, devFallback?: () => T) {
  return request<T>(path, { method: 'GET' }, devFallback);
}

function post<T>(path: string, body?: unknown, devFallback?: () => T) {
  return request<T>(
    path,
    {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    devFallback,
  );
}

function patch<T>(path: string, body?: unknown, devFallback?: () => T) {
  return request<T>(
    path,
    {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    devFallback,
  );
}

function del<T>(path: string, devFallback?: () => T) {
  return request<T>(path, { method: 'DELETE' }, devFallback);
}

async function postForm<T>(
  path: string,
  formData: FormData,
  devFallback?: () => T,
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.ok) {
      throw new ApiError(json.error.code, json.error.message, json.error.details);
    }
    return json;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (process.env.NODE_ENV === 'development' && devFallback) {
      return { ok: true, data: devFallback() };
    }
    throw new ApiError('NETWORK_ERROR', 'Network request failed');
  }
}

// ---- Auth ----

type LoginBody = { email: string; password: string };
type RegisterBody = { email: string; password: string; name: string };
type AuthData = { user: User };

export const apiClient = {
  auth: {
    register: (body: RegisterBody) =>
      post<AuthData>(ROUTES.AUTH_REGISTER, body, () => ({ user: MOCK_USER })),
    login: (body: LoginBody) =>
      post<AuthData>(ROUTES.AUTH_LOGIN, body, () => ({
        user: body.email.includes('admin') ? MOCK_ADMIN : MOCK_USER,
      })),
    logout: () => post<Record<string, never>>(ROUTES.AUTH_LOGOUT, undefined, () => ({})),
    me: () => get<User>(ROUTES.AUTH_ME, () => MOCK_USER),
  },

  // ---- Tokens ----
  tokens: {
    list: () => get<ApiToken[]>(ROUTES.TOKENS, () => MOCK_TOKENS),
    create: (name: string) =>
      post<ApiTokenCreated>(ROUTES.TOKENS, { name }, () => ({
        id: `tok-${Date.now()}`,
        userId: 'user-1',
        name,
        prefix: 'sq_cd34',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
        rawToken: `sq_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      })),
    revoke: (tokenId: string) => del<Record<string, never>>(ROUTES.TOKEN(tokenId), () => ({})),
  },

  // ---- Projects ----
  projects: {
    list: () => get<Project[]>(ROUTES.PROJECTS, () => [MOCK_PROJECT]),
    create: (body: {
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
      specPath: string;
    }) =>
      post<Project>(ROUTES.PROJECTS, body, () => ({
        id: `proj-${Date.now()}`,
        ownerUserId: 'user-1',
        name: body.name,
        repositoryUrl: body.repositoryUrl,
        owner: body.repositoryUrl.split('/')[3] ?? 'owner',
        repo: body.repositoryUrl.split('/')[4] ?? 'repo',
        fullName: body.repositoryUrl.replace('https://github.com/', ''),
        defaultBranch: body.defaultBranch,
        specPath: body.specPath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    get: (projectId: string) =>
      get<Project>(ROUTES.PROJECT(projectId), () => ({ ...MOCK_PROJECT, id: projectId })),
    update: (
      projectId: string,
      body: Partial<{ name: string; defaultBranch: string; specPath: string }>,
    ) =>
      patch<Project>(ROUTES.PROJECT(projectId), body, () => ({
        ...MOCK_PROJECT,
        ...body,
        id: projectId,
      })),
    delete: (projectId: string) => del<Record<string, never>>(ROUTES.PROJECT(projectId), () => ({})),
  },

  // ---- Runs ----
  runs: {
    listForProject: (
      projectId: string,
      params?: { page?: number; limit?: number },
    ) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Run[]>(
        `${ROUTES.PROJECT_RUNS(projectId)}${q ? `?${q}` : ''}`,
        () => [MOCK_RUN_COMPLETED],
      );
    },
    manualRun: (projectId: string, formData: FormData) =>
      postForm<Run>(ROUTES.PROJECT_RUNS(projectId), formData, () => ({
        ...MOCK_RUN_COMPLETED,
        id: `run-${Date.now()}`,
        projectId,
        status: 'queued',
      })),
    get: (runId: string) =>
      get<Run>(ROUTES.RUN(runId), () => ({ ...MOCK_RUN_COMPLETED, id: runId })),
    findings: (
      runId: string,
      params?: { severity?: string; method?: string; q?: string },
    ) => {
      const qs = new URLSearchParams();
      if (params?.severity) qs.set('severity', params.severity);
      if (params?.method) qs.set('method', params.method);
      if (params?.q) qs.set('q', params.q);
      const q = qs.toString();
      return get<Finding[]>(
        `${ROUTES.RUN_FINDINGS(runId)}${q ? `?${q}` : ''}`,
        () => {
          let list = [...MOCK_FINDINGS];
          if (params?.severity) list = list.filter((f) => f.severity === params.severity);
          if (params?.method) list = list.filter((f) => f.method === params.method);
          if (params?.q) {
            const lower = params.q.toLowerCase();
            list = list.filter(
              (f) =>
                f.endpoint.toLowerCase().includes(lower) ||
                f.description.toLowerCase().includes(lower),
            );
          }
          return list;
        },
      );
    },
    report: (runId: string) =>
      get<RunReport>(ROUTES.RUN_REPORT(runId), () => ({
        run: { ...MOCK_RUN_COMPLETED, id: runId },
        project: MOCK_PROJECT,
        summary: MOCK_RUN_COMPLETED.summary!,
        findings: MOCK_FINDINGS,
        releaseStatus: MOCK_RUN_COMPLETED.summary!.releaseStatus,
      })),
    compare: (projectId: string, base: string, head: string) =>
      get<FindingWithDiff[]>(
        `${ROUTES.PROJECT_COMPARE(projectId)}?base=${base}&head=${head}`,
        () =>
          MOCK_FINDINGS.map((f, i) => ({
            ...f,
            diffStatus: i === 0 ? ('new' as const) : ('unresolved' as const),
          })),
      ),
  },

  // ---- Memory ----
  memory: {
    hotspots: (projectId: string) =>
      get<HotspotEndpoint[]>(ROUTES.PROJECT_HOTSPOTS(projectId), () => MOCK_HOTSPOTS),
    endpoint: (projectId: string, method: string, path: string) =>
      get<EndpointMemoryEntry[]>(
        `${ROUTES.PROJECT_ENDPOINT_MEMORY(projectId)}?method=${method}&path=${encodeURIComponent(path)}`,
        () => [
          {
            id: 'mem-1',
            runId: 'run-0',
            severity: 'breaking',
            changeType: 'ENDPOINT_REMOVED',
            description: `${method} ${path} was removed in v0.9`,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      ),
  },

  // ---- Admin ----
  admin: {
    overview: () => get<AdminOverview>(ROUTES.ADMIN_OVERVIEW, () => MOCK_OVERVIEW),
    projects: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Project[]>(`${ROUTES.ADMIN_PROJECTS}${q ? `?${q}` : ''}`, () => [MOCK_PROJECT]);
    },
    runs: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return get<Run[]>(`${ROUTES.ADMIN_RUNS}${q ? `?${q}` : ''}`, () => [MOCK_RUN_COMPLETED]);
    },
    events: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Event[]>(`${ROUTES.ADMIN_EVENTS}${q ? `?${q}` : ''}`, () => MOCK_EVENTS);
    },
    workflowsHealth: () =>
      get<WorkflowHealth>(ROUTES.ADMIN_WORKFLOWS_HEALTH, () => MOCK_WORKFLOW_HEALTH),
    users: () => get<User[]>(ROUTES.ADMIN_USERS, () => [MOCK_USER, MOCK_ADMIN]),
    updateUser: (userId: string, body: { disabled: boolean }) =>
      patch<User>(ROUTES.ADMIN_USER(userId), body, () => ({ ...MOCK_USER, id: userId, ...body })),
    retryRun: (runId: string) =>
      post<Run>(ROUTES.ADMIN_RUN_RETRY(runId), undefined, () => ({
        ...MOCK_RUN_COMPLETED,
        id: runId,
        status: 'queued',
      })),
  },
};

export { ApiError };
