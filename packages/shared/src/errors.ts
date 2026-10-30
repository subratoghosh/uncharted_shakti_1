export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'INVALID_SIGNATURE',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'SPEC_TOO_LARGE',
  'SPEC_INVALID',
  'RATE_LIMITED',
  'WORKFLOW_UNAVAILABLE',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  INVALID_SIGNATURE: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SPEC_TOO_LARGE: 413,
  SPEC_INVALID: 422,
  RATE_LIMITED: 429,
  WORKFLOW_UNAVAILABLE: 502,
  INTERNAL: 500,
};

export type ErrorDetail = {
  path?: string;
  message: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = ERROR_HTTP_STATUS_MAP[code] || 500;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
