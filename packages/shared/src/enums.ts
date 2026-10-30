// packages/shared/src/enums.ts
// Stub enums matching database.md §2 exactly. Suibrato replaces with Zod-derived types.

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

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

export const RUN_STATUSES = ['queued', 'running', 'completed', 'failed'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const SEVERITIES = ['breaking', 'warning', 'info'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const RELEASE_STATUSES = ['safe', 'review', 'blocked'] as const;
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

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

export const DIFF_STATUSES = ['new', 'resolved', 'unresolved'] as const;
export type DiffStatus = (typeof DIFF_STATUSES)[number];

export const AI_STATUSES = ['disabled', 'pending', 'completed', 'failed'] as const;
export type AiStatus = (typeof AI_STATUSES)[number];

