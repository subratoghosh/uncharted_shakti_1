import type {
  Project,
  Run,
  Finding,
  Hotspot,
  ApiToken,
  WebhookEvent,
  AdminOverview,
  CompareResult,
  AnalyzerResult,
  AuthUser,
} from '../types/index.js';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Dual auth: Attach Bearer token if stored in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('shaktiq_jwt');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    let errCode = 'HTTP_ERROR';
    let errMsg = res.statusText;
    let details: unknown;

    try {
      const data = await res.json();
      if (data.error) {
        errCode = data.error.code || errCode;
        errMsg = data.error.message || errMsg;
        details = data.error.details;
      }
    } catch {
      // JSON parse failed
    }

    throw new ApiError(errCode, errMsg, res.status, details);
  }

  const json = await res.json();
  return (json.data !== undefined ? json.data : json) as T;
}

export const api = {
  // Auth
  login: async (data: { email: string; password: string }) => {
    const res = await request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('shaktiq_jwt', res.token);
    }
    return res;
  },
  getMe: () => request<AuthUser>('/auth/me'),
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shaktiq_jwt');
    }
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: { name: string; repositoryUrl: string; defaultBranch?: string; specPath?: string }) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) => request<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Runs
  getRuns: (projectId: string, query: { limit?: number; page?: number; status?: string } = {}) => {
    const params = new URLSearchParams();
    if (query.limit) params.set('limit', String(query.limit));
    if (query.page) params.set('page', String(query.page));
    if (query.status) params.set('status', query.status);
    return request<Run[]>(`/projects/${projectId}/runs?${params.toString()}`);
  },
  getRun: (projectId: string, runId: string) => request<Run>(`/projects/${projectId}/runs/${runId}`),
  createRun: (projectId: string, data: { baseRef?: string; headRef?: string; baseSpec?: string; headSpec?: string }) =>
    request<Run>(`/projects/${projectId}/runs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRunFindings: (projectId: string, runId: string, query: { severity?: string; method?: string } = {}) => {
    const params = new URLSearchParams();
    if (query.severity) params.set('severity', query.severity);
    if (query.method) params.set('method', query.method);
    return request<Finding[]>(`/projects/${projectId}/runs/${runId}/findings?${params.toString()}`);
  },
  getAiDossier: (projectId: string, runId: string) =>
    request<import('../types/index.js').MultiLayerDossier>(`/projects/${projectId}/runs/${runId}/ai-dossier`),
  compareRuns: (projectId: string, baseRunId: string, headRunId: string) =>
    request<CompareResult>(`/projects/${projectId}/runs/compare?baseRunId=${baseRunId}&headRunId=${headRunId}`),

  // Memory
  getHotspots: (projectId: string, limit = 10) =>
    request<Hotspot[]>(`/projects/${projectId}/memory/hotspots?limit=${limit}`),
  getEndpointMemory: (projectId: string, endpoint: string, method: string) =>
    request<Hotspot>(`/projects/${projectId}/memory/endpoints?endpoint=${encodeURIComponent(endpoint)}&method=${method}`),

  // Direct Spec Analysis
  analyzeSpecs: (data: { baseSpec: string; headSpec: string }) =>
    request<AnalyzerResult>('/cli/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tokens
  getTokens: () => request<ApiToken[]>('/auth/tokens'),
  createToken: (data: { name: string; expiresAt?: string }) =>
    request<{ token: string; apiToken: ApiToken }>('/auth/tokens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteToken: (id: string) => request<{ success: boolean }>(`/auth/tokens/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminOverview: () => request<AdminOverview>('/admin/overview'),
  getAdminProjects: () => request<Project[]>('/admin/projects'),
  getAdminRuns: () => request<Run[]>('/admin/runs'),
  getAdminEvents: () => request<WebhookEvent[]>('/admin/events'),
  getAdminUsers: () => request<AuthUser[]>('/admin/users'),

  // SSE Stream
  getStreamUrl: () => `${API_BASE}/stream`,
};
