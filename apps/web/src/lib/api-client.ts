// lib/api-client.ts
// Typed fetch wrapper — uses ROUTES and API_PREFIX from @shaktiq/shared.
// No secrets here. Cookies sent automatically (credentials: 'include').
// Never call MongoDB, n8n or GitHub from here.

import { ROUTES, API_PREFIX } from '@shaktiq/shared';
import type {
  ApiResponse,
  ApiToken,
  Event,
  Finding,
  Project,
  Run,
  User,
} from '@shaktiq/shared';
import type {
  ApiTokenCreated,
  AdminOverview,
  FindingWithDiff,
  HotspotEndpoint,
  EndpointMemoryEntry,
  RunReport,
  WorkflowHealth,
} from './types';
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// In-memory response cache for superfast responses and instant page loads
const memoryCache = new Map<string, { res: ApiResponse<unknown>; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: { path?: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function endpoint(path: string): string {
  return `${BASE_URL}${API_PREFIX}${path}`;
}

async function request<T>(
  url: string,
  init: RequestInit = {},
  devFallback?: () => T,
): Promise<ApiResponse<T>> {
  const isGet = !init.method || init.method.toUpperCase() === 'GET';

  // Return instantly from memory cache if available and fresh
  if (isGet) {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.res as ApiResponse<T>;
    }
  }

  // Fast abort in dev mode if local backend is not responding so devFallback activates instantly
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600);

  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      signal: init.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    clearTimeout(timeoutId);
    const json = (await res.json()) as ApiResponse<T>;

    if (!json.ok) {
      throw new ApiError(json.error.code, json.error.message, json.error.details);
    }

    if (isGet) {
      memoryCache.set(url, { res: json, timestamp: Date.now() });
    }

    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;

    // In dev mode: if backend is unreachable, use mock data fallback instantly
    if (process.env.NODE_ENV === 'development' && devFallback) {
      const mockResult: ApiResponse<T> = { ok: true, data: devFallback() };
      if (isGet) {
        memoryCache.set(url, { res: mockResult, timestamp: Date.now() });
      }
      return mockResult;
    }

    throw new ApiError(
      'NETWORK_ERROR',
      err instanceof Error ? err.message : 'Network request failed',
    );
  }
}

function get<T>(path: string, devFallback?: () => T) {
  return request<T>(endpoint(path), { method: 'GET' }, devFallback);
}

function post<T>(path: string, body?: unknown, devFallback?: () => T) {
  return request<T>(
    endpoint(path),
    {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    devFallback,
  );
}

function patch<T>(path: string, body?: unknown, devFallback?: () => T) {
  return request<T>(
    endpoint(path),
    {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    devFallback,
  );
}

function del<T>(path: string, devFallback?: () => T) {
  return request<T>(endpoint(path), { method: 'DELETE' }, devFallback);
}

async function postForm<T>(
  path: string,
  formData: FormData,
  devFallback?: () => T,
): Promise<ApiResponse<T>> {
  const url = endpoint(path);
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
      post<AuthData>(ROUTES.AUTH.REGISTER, body, () => ({ user: MOCK_USER })),
    login: (body: LoginBody) =>
      post<AuthData>(ROUTES.AUTH.LOGIN, body, () => ({
        user: body.email.includes('admin') ? MOCK_ADMIN : MOCK_USER,
      })),
    logout: () => post<Record<string, never>>(ROUTES.AUTH.LOGOUT, undefined, () => ({})),
    me: () => get<User>(ROUTES.AUTH.ME, () => MOCK_USER),
  },

  // ---- Tokens ----
  tokens: {
    list: () => get<ApiToken[]>(ROUTES.TOKENS.LIST, () => MOCK_TOKENS),
    create: (name: string) =>
      post<ApiTokenCreated>(ROUTES.TOKENS.CREATE, { name }, () => ({
        id: `tok-${Date.now()}`,
        userId: 'user-1',
        name,
        prefix: 'sq_cd34',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
        rawToken: `sq_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      })),
    revoke: (tokenId: string) =>
      del<Record<string, never>>(ROUTES.TOKENS.REVOKE.replace(':tokenId', tokenId), () => ({})),
  },

  // ---- Projects ----
  projects: {
    list: () => get<Project[]>(ROUTES.PROJECTS.LIST, () => [MOCK_PROJECT]),
    create: (body: {
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
      specPath: string;
    }) =>
      post<Project>(ROUTES.PROJECTS.CREATE, body, () => ({
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
      get<Project>(ROUTES.PROJECTS.GET.replace(':projectId', projectId), () => ({
        ...MOCK_PROJECT,
        id: projectId,
      })),
    update: (
      projectId: string,
      body: Partial<{ name: string; defaultBranch: string; specPath: string }>,
    ) =>
      patch<Project>(ROUTES.PROJECTS.UPDATE.replace(':projectId', projectId), body, () => ({
        ...MOCK_PROJECT,
        ...body,
        id: projectId,
      })),
    delete: (projectId: string) =>
      del<Record<string, never>>(ROUTES.PROJECTS.DELETE.replace(':projectId', projectId), () => ({})),
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
      const base = ROUTES.RUNS.LIST_BY_PROJECT.replace(':projectId', projectId);
      return get<Run[]>(`${base}${q ? `?${q}` : ''}`, () => [MOCK_RUN_COMPLETED]);
    },
    manualRun: (projectId: string, formData: FormData) =>
      postForm<Run>(
        ROUTES.RUNS.CREATE_MANUAL.replace(':projectId', projectId),
        formData,
        () => ({
          ...MOCK_RUN_COMPLETED,
          id: `run-${Date.now()}`,
          projectId,
          status: 'queued',
        }),
      ),
    get: (runId: string) =>
      get<Run>(ROUTES.RUNS.GET.replace(':runId', runId), () => ({
        ...MOCK_RUN_COMPLETED,
        id: runId,
      })),
    findings: (
      runId: string,
      params?: { severity?: string; method?: string; q?: string },
    ) => {
      const qs = new URLSearchParams();
      if (params?.severity) qs.set('severity', params.severity);
      if (params?.method) qs.set('method', params.method);
      if (params?.q) qs.set('q', params.q);
      const q = qs.toString();
      const base = ROUTES.RUNS.FINDINGS.replace(':runId', runId);
      return get<Finding[]>(`${base}${q ? `?${q}` : ''}`, () => {
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
      });
    },
    report: (runId: string) =>
      get<RunReport>(ROUTES.RUNS.REPORT.replace(':runId', runId), () => ({
        run: { ...MOCK_RUN_COMPLETED, id: runId },
        project: MOCK_PROJECT,
        summary: MOCK_RUN_COMPLETED.summary!,
        findings: MOCK_FINDINGS,
        releaseStatus: MOCK_RUN_COMPLETED.summary!.releaseStatus,
      })),
    compare: (projectId: string, base: string, head: string) => {
      const path = ROUTES.RUNS.COMPARE.replace(':projectId', projectId);
      return get<FindingWithDiff[]>(
        `${path}?base=${base}&head=${head}`,
        () =>
          MOCK_FINDINGS.map((f, i) => ({
            ...f,
            diffStatus: i === 0 ? ('new' as const) : ('unresolved' as const),
          })),
      );
    },
  },

  // ---- Memory ----
  memory: {
    hotspots: (projectId: string) =>
      get<HotspotEndpoint[]>(
        ROUTES.MEMORY.HOTSPOTS.replace(':projectId', projectId),
        () => MOCK_HOTSPOTS,
      ),
    endpoint: (projectId: string, method: string, pathParam: string) => {
      const path = ROUTES.MEMORY.ENDPOINT.replace(':projectId', projectId);
      return get<EndpointMemoryEntry[]>(
        `${path}?method=${method}&path=${encodeURIComponent(pathParam)}`,
        () => [
          {
            id: 'mem-1',
            runId: 'run-0',
            severity: 'breaking',
            changeType: 'ENDPOINT_REMOVED',
            description: `${method} ${pathParam} was removed in v0.9`,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      );
    },
  },

  // ---- Admin ----
  admin: {
    overview: () => get<AdminOverview>(ROUTES.ADMIN.OVERVIEW, () => MOCK_OVERVIEW),
    projects: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Project[]>(`${ROUTES.ADMIN.PROJECTS}${q ? `?${q}` : ''}`, () => [
        MOCK_PROJECT,
      ]);
    },
    runs: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return get<Run[]>(`${ROUTES.ADMIN.RUNS}${q ? `?${q}` : ''}`, () => [
        MOCK_RUN_COMPLETED,
      ]);
    },
    events: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Event[]>(`${ROUTES.ADMIN.EVENTS}${q ? `?${q}` : ''}`, () => MOCK_EVENTS);
    },
    workflowsHealth: () =>
      get<WorkflowHealth>(ROUTES.ADMIN.WORKFLOWS_HEALTH, () => MOCK_WORKFLOW_HEALTH),
    users: () => get<User[]>(ROUTES.ADMIN.USERS, () => [MOCK_USER, MOCK_ADMIN]),
    updateUser: (userId: string, body: { disabled: boolean }) =>
      patch<User>(ROUTES.ADMIN.USER_UPDATE.replace(':userId', userId), body, () => ({
        ...MOCK_USER,
        id: userId,
        ...body,
      })),
    retryRun: (runId: string) =>
      post<Run>(ROUTES.ADMIN.RUN_RETRY.replace(':runId', runId), undefined, () => ({
        ...MOCK_RUN_COMPLETED,
        id: runId,
        status: 'queued',
      })),
  },
};
