import { z } from 'zod';

// ============================================================================
// Enums & Constants (docs/database.md §2)
// ============================================================================

export const SEVERITIES = ['breaking', 'warning', 'info'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CHANGE_TYPES = [
  'ENDPOINT_REMOVED',
  'METHOD_REMOVED',
  'REQUIRED_REQUEST_FIELD_ADDED',
  'REQUIRED_PARAMETER_ADDED',
  'RESPONSE_FIELD_REMOVED',
  'FIELD_TYPE_CHANGED',
  'FIELD_MADE_REQUIRED',
  'RESPONSE_SCHEMA_CHANGED',
  'PARAMETER_CHANGED',
  'ENDPOINT_ADDED',
  'OPTIONAL_FIELD_ADDED',
  'OTHER',
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
  '*',
] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export const RUN_STATUSES = ['queued', 'running', 'completed', 'failed'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const RELEASE_STATUSES = ['safe', 'review', 'blocked'] as const;
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export const SOURCES = ['github', 'manual', 'vscode'] as const;
export type Source = (typeof SOURCES)[number];

export const EVENT_TYPES = [
  'github.push',
  'github.pull_request',
  'manual.analyze',
  'vscode.analyze',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const PROCESSING_STATUSES = [
  'received',
  'dispatched',
  'processed',
  'failed',
  'rejected',
] as const;
export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

// ============================================================================
// Error Codes (docs/code_style.md §5)
// ============================================================================

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

// ============================================================================
// Finding & Draft Schemas (docs/database.md §3.6, docs/agents.md §1)
// ============================================================================

export const findingDraftSchema = z.object({
  fingerprint: z.string().length(64),
  endpoint: z.string(),
  method: z.enum(HTTP_METHODS),
  changeType: z.enum(CHANGE_TYPES),
  severity: z.enum(SEVERITIES),
  ruleId: z.string(),
  description: z.string(),
  impact: z.string(),
  recommendation: z.string(),
  locationText: z.string().optional(),
});
export type FindingDraft = z.infer<typeof findingDraftSchema>;

export const runSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  breaking: z.number().int().nonnegative(),
  warning: z.number().int().nonnegative(),
  info: z.number().int().nonnegative(),
  releaseStatus: z.enum(RELEASE_STATUSES),
  newCount: z.number().int().nonnegative(),
  resolvedCount: z.number().int().nonnegative(),
  unresolvedCount: z.number().int().nonnegative(),
});
export type RunSummary = z.infer<typeof runSummarySchema>;

/**
 * Computes release status according to docs/database.md §6:
 * blocked if breaking > 0; else review if warning > 0; else safe.
 */
export function computeReleaseStatus(counts: {
  breaking: number;
  warning: number;
  info?: number;
}): ReleaseStatus {
  if (counts.breaking > 0) return 'blocked';
  if (counts.warning > 0) return 'review';
  return 'safe';
}

// ============================================================================
// API Envelope (docs/code_style.md §5)
// ============================================================================

export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
      meta?: {
        page?: number;
        limit?: number;
        total?: number;
      };
    }
  | {
      ok: false;
      error: {
        code: ErrorCode;
        message: string;
        details?: Array<{
          path: string;
          message: string;
        }>;
      };
    };
