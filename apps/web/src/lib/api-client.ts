import type { ApiResponse } from '@shaktiq/shared';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Array<{ path?: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function resolveEndpoint(endpoint: string): string {
  if (endpoint.startsWith('http')) return endpoint;
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // When running in browser and calling admin or api routes, route via same-origin Next.js /api
  if (typeof window !== 'undefined') {
    if (clean.startsWith('/admin')) {
      return `/api${clean}`;
    }
    if (clean.startsWith('/api/')) {
      return clean;
    }
  }

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return `${base}${clean}`;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = resolveEndpoint(endpoint);

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Support HTTP-only session cookies
  });

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'PARSE_ERROR',
      `Server returned ${res.status} ${res.statusText || 'Error'}`,
      res.status,
    );
  }

  if (!res.ok || !json.ok) {
    const error =
      !json.ok && json.error
        ? json.error
        : { code: 'INTERNAL', message: `Request failed with status ${res.status}` };
    throw new ApiError(
      error.code,
      error.message,
      res.status,
      'details' in error ? error.details : undefined,
    );
  }

  return json.data;
}
