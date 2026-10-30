import type {
  User,
  Project,
  Run,
  Finding,
  FindingWithDiff,
  Event,
  ApiToken,
  HotspotEndpoint,
  AdminOverview,
  WorkflowHealth,
} from '@shaktiq/shared';

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'dev@shaktiq.dev',
  name: 'Dev User',
  role: 'user',
  disabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_ADMIN: User = {
  ...MOCK_USER,
  id: 'admin-1',
  email: 'admin@shaktiq.dev',
  name: 'Admin',
  role: 'admin',
};

export const MOCK_PROJECT: Project = {
  id: 'proj-1',
  ownerUserId: 'user-1',
  name: 'Orders API',
  repositoryUrl: 'https://github.com/acme/orders',
  owner: 'acme',
  repo: 'orders',
  fullName: 'acme/orders',
  defaultBranch: 'main',
  specPath: 'openapi.yaml',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_RUN_COMPLETED: Run = {
  id: 'run-1',
  projectId: 'proj-1',
  eventId: 'manual:uuid-1',
  source: 'manual',
  previousVersion: 'abc1234',
  currentVersion: 'def5678',
  commitId: 'def5678abcdef1234567890abcdef1234567890',
  branch: 'main',
  pullRequestNumber: null,
  baseSnapshotId: null,
  headSnapshotId: null,
  baseSpecHash: null,
  headSpecHash: null,
  status: 'completed',
  startedAt: new Date(Date.now() - 10000).toISOString(),
  completedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  summary: {
    total: 3,
    breaking: 1,
    warning: 1,
    info: 1,
    releaseStatus: 'blocked',
    newCount: 2,
    resolvedCount: 0,
    unresolvedCount: 1,
  },
  errorCode: null,
  errorMessage: null,
  aiStatus: 'disabled',
  aiSummary: null,
};

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f-1',
    projectId: 'proj-1',
    runId: 'run-1',
    fingerprint: 'a'.repeat(64),
    previousVersion: 'abc1234',
    currentVersion: 'def5678',
    endpoint: '/users/{id}',
    method: 'DELETE',
    changeType: 'ENDPOINT_REMOVED',
    severity: 'breaking',
    ruleId: 'api-path-removed-without-deprecation',
    description: 'Endpoint DELETE /users/{id} was removed',
    impact: 'Clients calling this endpoint will receive 404/405 HTTP status errors.',
    recommendation: 'Restore the endpoint or deprecate first and communicate a sunset date.',
    aiExplanation: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f-2',
    projectId: 'proj-1',
    runId: 'run-1',
    fingerprint: 'b'.repeat(64),
    previousVersion: 'abc1234',
    currentVersion: 'def5678',
    endpoint: '/orders',
    method: 'POST',
    changeType: 'REQUIRED_REQUEST_FIELD_ADDED',
    severity: 'warning',
    ruleId: null,
    description: 'Required field "currency" added to POST /orders request body',
    impact: 'Clients not sending "currency" will receive a 422 Unprocessable Entity error.',
    recommendation: 'Add "currency" to your request body or make it optional with a default value.',
    aiExplanation: 'The OpenAPI schema now defines "currency" in the required array for OrderCreateDto.',
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_HOTSPOTS: HotspotEndpoint[] = [
  {
    method: 'DELETE',
    endpoint: '/users/{id}',
    occurrences: 3,
    distinctRuns: 2,
    lastSeen: new Date().toISOString(),
    changeTypes: ['ENDPOINT_REMOVED'],
  },
  {
    method: 'POST',
    endpoint: '/orders',
    occurrences: 2,
    distinctRuns: 2,
    lastSeen: new Date().toISOString(),
    changeTypes: ['REQUIRED_REQUEST_FIELD_ADDED'],
  },
];

export const MOCK_TOKENS: ApiToken[] = [
  {
    id: 'tok-1',
    userId: 'user-1',
    name: 'laptop-vscode',
    prefix: 'sq_ab12',
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    revokedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    eventId: 'github:72d3162e-cc78-11e3-81ab-4c9367dc0958',
    projectId: 'proj-1',
    eventType: 'github.push',
    source: 'github',
    receivedAt: new Date().toISOString(),
    processingStatus: 'processed',
    runId: 'run-1',
    duplicateCount: 1,
    lastDuplicateAt: new Date().toISOString(),
    error: null,
  },
  {
    id: 'evt-2',
    eventId: 'rejected:bad-signature-uuid',
    projectId: null,
    eventType: 'github.push',
    source: 'github',
    receivedAt: new Date().toISOString(),
    processingStatus: 'rejected',
    runId: null,
    duplicateCount: 0,
    lastDuplicateAt: null,
    error: 'INVALID_SIGNATURE',
  },
];

export const MOCK_OVERVIEW: AdminOverview = {
  runs: { total: 42, queued: 1, running: 2, completed: 38, failed: 1, last24h: 12 },
  events: { total: 55, duplicateCount: 3, rejectedCount: 2 },
  projects: { total: 8 },
  users: { total: 15 },
};

export const MOCK_WORKFLOW_HEALTH: WorkflowHealth = {
  status: 'ok',
  lastCheck: new Date().toISOString(),
  details: 'n8n workflow shaktiq-analyze-run active and reachable',
};

