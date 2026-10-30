import { Collection, ObjectId } from 'mongodb';
import {
  AiStatus,
  ChangeType,
  EventType,
  HttpMethod,
  NotificationChannel,
  NotificationStatus,
  ProcessingStatus,
  ReleaseStatus,
  Role,
  RunStatus,
  RunSummary,
  Severity,
  Source,
} from '@shaktiq/shared';
import { getDb } from './client.js';

export interface UserDoc {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiTokenDoc {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  tokenHash: string;
  prefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface ProjectDoc {
  _id: ObjectId;
  ownerUserId: ObjectId;
  name: string;
  repositoryUrl: string;
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  specPath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDoc {
  _id: ObjectId;
  eventId: string;
  projectId?: ObjectId | null;
  eventType: EventType;
  source: Source;
  payload?: Record<string, unknown> | null;
  receivedAt: Date;
  processingStatus: ProcessingStatus;
  runId?: ObjectId | null;
  duplicateCount: number;
  lastDuplicateAt?: Date | null;
  error?: string | null;
}

export interface RunDoc {
  _id: ObjectId;
  projectId: ObjectId;
  eventId: string;
  source: Source;
  previousVersion?: string | null;
  currentVersion: string;
  commitId?: string | null;
  branch: string;
  pullRequestNumber?: number | null;
  baseSnapshotId?: ObjectId | null;
  headSnapshotId?: ObjectId | null;
  baseSpecHash?: string | null;
  headSpecHash?: string | null;
  status: RunStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  summary?: RunSummary | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  aiStatus: AiStatus;
  aiSummary?: string | null;
}

export interface FindingDoc {
  _id: ObjectId;
  projectId: ObjectId;
  runId: ObjectId;
  fingerprint: string;
  previousVersion?: string | null;
  currentVersion: string;
  endpoint: string;
  method: HttpMethod;
  changeType: ChangeType;
  severity: Severity;
  ruleId: string;
  description: string;
  impact: string;
  recommendation: string;
  aiExplanation?: string | null;
  createdAt: Date;
}

export interface SpecSnapshotDoc {
  _id: ObjectId;
  projectId: ObjectId;
  sha256: string;
  format: 'yaml' | 'json';
  sizeBytes: number;
  content: string;
  repo?: string | null;
  path?: string | null;
  commitSha?: string | null;
  createdAt: Date;
}

export interface NotificationDoc {
  _id: ObjectId;
  runId: ObjectId;
  projectId: ObjectId;
  channel: NotificationChannel;
  status: NotificationStatus;
  target: string;
  responseCode?: number;
  error?: string | null;
  createdAt: Date;
}

export function getCollections() {
  const db = getDb();
  return {
    users: db.collection<UserDoc>('users'),
    apiTokens: db.collection<ApiTokenDoc>('apiTokens'),
    projects: db.collection<ProjectDoc>('projects'),
    events: db.collection<EventDoc>('events'),
    runs: db.collection<RunDoc>('runs'),
    findings: db.collection<FindingDoc>('findings'),
    specSnapshots: db.collection<SpecSnapshotDoc>('specSnapshots'),
    notifications: db.collection<NotificationDoc>('notifications'),
  };
}
