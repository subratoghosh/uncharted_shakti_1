import { Db } from 'mongodb';
import { logger } from '../lib/logger.js';

export async function createIndexes(db: Db): Promise<void> {
  logger.info('Applying MongoDB indexes...');

  // Users
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // API Tokens
  await db.collection('apiTokens').createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection('apiTokens').createIndex({ userId: 1, createdAt: -1 });

  // Projects
  await db.collection('projects').createIndex({ fullName: 1 }, { unique: true });
  await db.collection('projects').createIndex({ ownerUserId: 1, createdAt: -1 });

  // Events
  await db.collection('events').createIndex({ eventId: 1 }, { unique: true });
  await db.collection('events').createIndex({ projectId: 1, receivedAt: -1 });
  await db.collection('events').createIndex({ processingStatus: 1, receivedAt: -1 });
  await db.collection('events').createIndex({ receivedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

  // Runs
  await db.collection('runs').createIndex({ eventId: 1 }, { unique: true });
  await db.collection('runs').createIndex({ projectId: 1, createdAt: -1 });
  await db.collection('runs').createIndex({ projectId: 1, status: 1 });
  await db.collection('runs').createIndex({ status: 1, createdAt: -1 });

  // Findings
  await db.collection('findings').createIndex({ runId: 1, severity: 1 });
  await db.collection('findings').createIndex({ runId: 1, fingerprint: 1 }, { unique: true });
  await db.collection('findings').createIndex({ projectId: 1, fingerprint: 1, createdAt: -1 });
  await db
    .collection('findings')
    .createIndex({ projectId: 1, method: 1, endpoint: 1, createdAt: -1 });

  // Spec Snapshots
  await db.collection('specSnapshots').createIndex({ projectId: 1, sha256: 1 }, { unique: true });

  // Notifications
  await db.collection('notifications').createIndex({ runId: 1, createdAt: -1 });
  await db
    .collection('notifications')
    .createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

  logger.info('MongoDB indexes applied successfully');
}
