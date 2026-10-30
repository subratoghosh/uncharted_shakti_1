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
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
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
}

function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

function post<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function patch<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}

async function postForm<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }
  return json;
}

// ---- Auth ----

type LoginBody = { email: string; password: string };
type RegisterBody = { email: string; password: string; name: string };
type AuthData = { user: User };

export const apiClient = {
  auth: {
    register: (body: RegisterBody) => post<AuthData>(ROUTES.AUTH_REGISTER, body),
    login: (body: LoginBody) => post<AuthData>(ROUTES.AUTH_LOGIN, body),
    logout: () => post<Record<string, never>>(ROUTES.AUTH_LOGOUT),
    me: () => get<User>(ROUTES.AUTH_ME),
  },

  // ---- Tokens ----
  tokens: {
    list: () => get<ApiToken[]>(ROUTES.TOKENS),
    create: (name: string) => post<ApiTokenCreated>(ROUTES.TOKENS, { name }),
    revoke: (tokenId: string) => del<Record<string, never>>(ROUTES.TOKEN(tokenId)),
  },

  // ---- Projects ----
  projects: {
    list: () => get<Project[]>(ROUTES.PROJECTS),
    create: (body: {
      name: string;
      repositoryUrl: string;
      defaultBranch: string;
      specPath: string;
    }) => post<Project>(ROUTES.PROJECTS, body),
    get: (projectId: string) => get<Project>(ROUTES.PROJECT(projectId)),
    update: (
      projectId: string,
      body: Partial<{ name: string; defaultBranch: string; specPath: string }>,
    ) => patch<Project>(ROUTES.PROJECT(projectId), body),
    delete: (projectId: string) => del<Record<string, never>>(ROUTES.PROJECT(projectId)),
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
      return get<Run[]>(`${ROUTES.PROJECT_RUNS(projectId)}${q ? `?${q}` : ''}`);
    },
    manualRun: (projectId: string, formData: FormData) =>
      postForm<Run>(ROUTES.PROJECT_RUNS(projectId), formData),
    get: (runId: string) => get<Run>(ROUTES.RUN(runId)),
    findings: (
      runId: string,
      params?: { severity?: string; method?: string; q?: string },
    ) => {
      const qs = new URLSearchParams();
      if (params?.severity) qs.set('severity', params.severity);
      if (params?.method) qs.set('method', params.method);
      if (params?.q) qs.set('q', params.q);
      const q = qs.toString();
      return get<Finding[]>(`${ROUTES.RUN_FINDINGS(runId)}${q ? `?${q}` : ''}`);
    },
    report: (runId: string) => get<RunReport>(ROUTES.RUN_REPORT(runId)),
    compare: (
      projectId: string,
      base: string,
      head: string,
    ) =>
      get<FindingWithDiff[]>(
        `${ROUTES.PROJECT_COMPARE(projectId)}?base=${base}&head=${head}`,
      ),
  },

  // ---- Memory ----
  memory: {
    hotspots: (projectId: string) =>
      get<HotspotEndpoint[]>(ROUTES.PROJECT_HOTSPOTS(projectId)),
    endpoint: (projectId: string, method: string, path: string) =>
      get<EndpointMemoryEntry[]>(
        `${ROUTES.PROJECT_ENDPOINT_MEMORY(projectId)}?method=${method}&path=${encodeURIComponent(path)}`,
      ),
  },

  // ---- Admin ----
  admin: {
    overview: () => get<AdminOverview>(ROUTES.ADMIN_OVERVIEW),
    projects: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Project[]>(`${ROUTES.ADMIN_PROJECTS}${q ? `?${q}` : ''}`);
    },
    runs: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return get<Run[]>(`${ROUTES.ADMIN_RUNS}${q ? `?${q}` : ''}`);
    },
    events: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      return get<Event[]>(`${ROUTES.ADMIN_EVENTS}${q ? `?${q}` : ''}`);
    },
    workflowsHealth: () => get<WorkflowHealth>(ROUTES.ADMIN_WORKFLOWS_HEALTH),
    users: () => get<User[]>(ROUTES.ADMIN_USERS),
    updateUser: (userId: string, body: { disabled: boolean }) =>
      patch<User>(ROUTES.ADMIN_USER(userId), body),
    retryRun: (runId: string) => post<Run>(ROUTES.ADMIN_RUN_RETRY(runId)),
  },
};

export { ApiError };

