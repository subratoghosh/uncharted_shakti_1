// packages/shared/src/types.ts
// Stub DTOs matching database.md field names exactly. Suibrato replaces with Zod-inferred types.

import type {
  AiStatus,
  ChangeType,
  DiffStatus,
  EventType,
  HttpMethod,
  ProcessingStatus,
  ReleaseStatus,
  Role,
  RunStatus,
  Severity,
  Source,
} from './enums';

// ---- API Envelope ----

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: { page: number; limit: number; total: number };
};

export type ApiError = {
  ok: false;
  error: { code: string; message: string; details?: { path: string; message: string }[] };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---- Users ----

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---- API Tokens ----

export type ApiToken = {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type ApiTokenCreated = ApiToken & { rawToken: string };

// ---- Projects ----

export type Project = {
  id: string;
  ownerUserId: string;
  name: string;
  repositoryUrl: string;
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  specPath: string;
  createdAt: string;
  updatedAt: string;
};

// ---- Events ----

export type Event = {
  id: string;
  eventId: string;
  projectId: string | null;
  eventType: EventType;
  source: Source;
  receivedAt: string;
  processingStatus: ProcessingStatus;
  runId: string | null;
  duplicateCount: number;
  lastDuplicateAt: string | null;
  error: string | null;
};

// ---- Run Summary ----

export type RunSummary = {
  total: number;
  breaking: number;
  warning: number;
  info: number;
  releaseStatus: ReleaseStatus;
  newCount: number;
  resolvedCount: number;
  unresolvedCount: number;
};

// ---- Runs ----

export type Run = {
  id: string;
  projectId: string;
  eventId: string;
  source: Source;
  previousVersion: string | null;
  currentVersion: string;
  commitId: string | null;
  branch: string | null;
  pullRequestNumber: number | null;
  baseSnapshotId: string | null;
  headSnapshotId: string | null;
  baseSpecHash: string | null;
  headSpecHash: string | null;
  status: RunStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  summary: RunSummary | null;
  errorCode: string | null;
  errorMessage: string | null;
  aiStatus: AiStatus;
  aiSummary: string | null;
};

// ---- Findings ----

export type Finding = {
  id: string;
  projectId: string;
  runId: string;
  fingerprint: string;
  previousVersion: string | null;
  currentVersion: string;
  endpoint: string;
  method: HttpMethod;
  changeType: ChangeType;
  severity: Severity;
  ruleId: string | null;
  description: string;
  impact: string;
  recommendation: string;
  aiExplanation: string | null;
  createdAt: string;
};

export type FindingWithDiff = Finding & { diffStatus: DiffStatus };

// ---- Memory ----

export type HotspotEndpoint = {
  method: HttpMethod;
  endpoint: string;
  occurrences: number;
  distinctRuns: number;
  lastSeen: string;
  changeTypes: ChangeType[];
};

export type EndpointMemoryEntry = {
  id: string;
  runId: string;
  severity: Severity;
  changeType: ChangeType;
  description: string;
  createdAt: string;
};

// ---- Report ----

export type RunReport = {
  run: Run;
  project: Project;
  summary: RunSummary;
  findings: Finding[];
  releaseStatus: ReleaseStatus;
};

// ---- Admin ----

export type AdminOverview = {
  runs: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    last24h: number;
  };
  events: {
    total: number;
    duplicateCount: number;
    rejectedCount: number;
  };
  projects: { total: number };
  users: { total: number };
};

export type WorkflowHealth = {
  status: 'ok' | 'degraded' | 'unknown';
  lastCheck: string;
  details: string;
};

// ---- SSE ----

export type SseRunUpdated = { type: 'run.updated'; projectId: string; data: Run };
export type SseEventReceived = { type: 'event.received'; data: Event };
export type SseEventDuplicate = { type: 'event.duplicate'; data: Event };
export type SseMessage = SseRunUpdated | SseEventReceived | SseEventDuplicate;

