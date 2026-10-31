import type {
  Finding,
  Hotspot,
  Project,
  Run,
  RunSummary,
  ReleaseStatus,
  Severity,
  ChangeType,
  DiffStatus,
} from '@shaktiq/shared';

export type FindingWithDiff = Finding & { diffStatus: DiffStatus };

export type HotspotEndpoint = Hotspot;

export type EndpointMemoryEntry = {
  id: string;
  runId: string;
  severity: Severity;
  changeType: ChangeType;
  description: string;
  createdAt: string;
};

export type ApiTokenCreated = {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  rawToken: string;
};

export type RunReport = {
  run: Run;
  project: Project;
  summary: RunSummary;
  findings: Finding[];
  releaseStatus: ReleaseStatus;
};

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
