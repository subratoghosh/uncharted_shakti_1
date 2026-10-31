import { Document } from 'mongodb';
import {
  CHANGE_TYPES,
  EVENT_TYPES,
  HTTP_METHODS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  PROCESSING_STATUSES,
  RELEASE_STATUSES,
  ROLES,
  RUN_STATUSES,
  SEVERITIES,
  SOURCES,
} from '@shaktiq/shared';

export const userValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'name', 'role', 'disabled', 'createdAt', 'updatedAt'],
    properties: {
      email: { bsonType: 'string' },
      passwordHash: { bsonType: ['string', 'null'] },
      name: { bsonType: 'string' },
      role: { enum: [...ROLES] },
      disabled: { bsonType: 'bool' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

export const apiTokenValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['userId', 'name', 'tokenHash', 'prefix', 'createdAt'],
    properties: {
      userId: { bsonType: 'objectId' },
      name: { bsonType: 'string' },
      tokenHash: { bsonType: 'string' },
      prefix: { bsonType: 'string' },
      lastUsedAt: { bsonType: ['date', 'null'] },
      revokedAt: { bsonType: ['date', 'null'] },
      createdAt: { bsonType: 'date' },
    },
  },
};

export const projectValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'ownerUserId',
      'name',
      'repositoryUrl',
      'owner',
      'repo',
      'fullName',
      'defaultBranch',
      'specPath',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      ownerUserId: { bsonType: 'objectId' },
      name: { bsonType: 'string' },
      repositoryUrl: { bsonType: 'string' },
      owner: { bsonType: 'string' },
      repo: { bsonType: 'string' },
      fullName: { bsonType: 'string' },
      defaultBranch: { bsonType: 'string' },
      specPath: { bsonType: 'string' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

export const eventValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'eventId',
      'eventType',
      'source',
      'receivedAt',
      'processingStatus',
      'duplicateCount',
    ],
    properties: {
      eventId: { bsonType: 'string', minLength: 8 },
      eventType: { enum: [...EVENT_TYPES] },
      source: { enum: [...SOURCES] },
      projectId: { bsonType: ['objectId', 'null'] },
      receivedAt: { bsonType: 'date' },
      processingStatus: { enum: [...PROCESSING_STATUSES] },
      runId: { bsonType: ['objectId', 'null'] },
      duplicateCount: { bsonType: ['int', 'long'], minimum: 0 },
      lastDuplicateAt: { bsonType: ['date', 'null'] },
      error: { bsonType: ['string', 'null'] },
    },
  },
};

export const runValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['projectId', 'eventId', 'source', 'status', 'createdAt', 'currentVersion'],
    properties: {
      projectId: { bsonType: 'objectId' },
      eventId: { bsonType: 'string' },
      source: { enum: [...SOURCES] },
      status: { enum: [...RUN_STATUSES] },
      createdAt: { bsonType: 'date' },
      startedAt: { bsonType: ['date', 'null'] },
      completedAt: { bsonType: ['date', 'null'] },
      currentVersion: { bsonType: 'string' },
      summary: {
        bsonType: ['object', 'null'],
        properties: {
          total: { bsonType: ['int', 'long'], minimum: 0 },
          breaking: { bsonType: ['int', 'long'], minimum: 0 },
          warning: { bsonType: ['int', 'long'], minimum: 0 },
          info: { bsonType: ['int', 'long'], minimum: 0 },
          releaseStatus: { enum: [...RELEASE_STATUSES] },
        },
      },
    },
  },
};

export const findingValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'projectId',
      'runId',
      'fingerprint',
      'endpoint',
      'method',
      'changeType',
      'severity',
      'description',
      'impact',
      'recommendation',
      'createdAt',
    ],
    properties: {
      projectId: { bsonType: 'objectId' },
      runId: { bsonType: 'objectId' },
      fingerprint: { bsonType: 'string', minLength: 64, maxLength: 64 },
      method: { enum: [...HTTP_METHODS] },
      severity: { enum: [...SEVERITIES] },
      changeType: { enum: [...CHANGE_TYPES] },
      ruleId: { bsonType: 'string' },
      description: { bsonType: 'string' },
      impact: { bsonType: 'string' },
      recommendation: { bsonType: 'string' },
      aiExplanation: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
    },
  },
};

export const specSnapshotValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['projectId', 'sha256', 'format', 'sizeBytes', 'content', 'createdAt'],
    properties: {
      projectId: { bsonType: 'objectId' },
      sha256: { bsonType: 'string', minLength: 64, maxLength: 64 },
      format: { enum: ['yaml', 'json'] },
      sizeBytes: { bsonType: ['int', 'long'], minimum: 1, maximum: 5242880 },
      content: { bsonType: 'string' },
      repo: { bsonType: ['string', 'null'] },
      path: { bsonType: ['string', 'null'] },
      commitSha: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
    },
  },
};

export const notificationValidator: Document = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['runId', 'projectId', 'channel', 'status', 'target', 'createdAt'],
    properties: {
      runId: { bsonType: 'objectId' },
      projectId: { bsonType: 'objectId' },
      channel: { enum: [...NOTIFICATION_CHANNELS] },
      status: { enum: [...NOTIFICATION_STATUSES] },
      target: { bsonType: 'string' },
      responseCode: { bsonType: ['int', 'long', 'null'] },
      error: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
    },
  },
};
