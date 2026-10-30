import type { ApiResponse } from '@shaktiq/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Support HTTP-only session cookies
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.ok) {
    const error = !json.ok ? json.error : { code: 'INTERNAL', message: 'Unknown error occurred' };
    throw new ApiError(
      error.code,
      error.message,
      res.status,
      'details' in error ? error.details : undefined,
    );
  }

  return json.data;
}
