export type Project = {
  _id?: string;
  id?: string;
  name: string;
  repositoryUrl: string;
  owner?: string;
  repo?: string;
  fullName?: string;
  defaultBranch?: string;
  specPath?: string;
  createdAt?: string;
};

export type Run = {
  _id?: string;
  id?: string;
  projectId: string;
  headSha?: string;
  headBranch?: string;
  baseSha?: string;
  currentVersion?: string;
  source: string;
  status: string;
  releaseStatus?: string;
  summary?: {
    total?: number;
    breaking: number;
    warning: number;
    info?: number;
    releaseStatus?: string;
  };
  createdAt: string;
};

export type Finding = {
  _id?: string;
  id?: string;
  runId?: string;
  projectId?: string;
  endpoint: string;
  method: string;
  changeType: string;
  severity: string;
  description: string;
  impact?: string;
  recommendation?: string;
  fingerprint?: string;
};

export type Hotspot = {
  endpoint: string;
  method: string;
  distinctRuns: number;
  occurrences?: number;
  totalOccurrences?: number;
  lastSeen?: string;
  lastSeenAt?: string;
  changeTypes?: string[];
};

export type ApiToken = {
  _id?: string;
  id?: string;
  name: string;
  tokenPrefix?: string;
  createdAt: string;
  lastUsedAt?: string;
};

export type WebhookEvent = {
  _id?: string;
  id?: string;
  deliveryId?: string;
  type?: string;
  duplicateCount?: number;
  createdAt: string;
};

export type AdminOverview = {
  totalProjects: number;
  totalRuns: number;
  totalUsers: number;
};

export type CompareResult = {
  newFindings: Finding[];
  resolvedFindings: Finding[];
  unresolvedFindings: Finding[];
  counts: {
    new: number;
    resolved: number;
    unresolved: number;
  };
};

export type AnalyzerResult = {
  releaseStatus: string;
  findings: Finding[];
  summary: {
    breaking: number;
    warning: number;
    info: number;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};
