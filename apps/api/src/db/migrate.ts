import argon2 from 'argon2';
import { Db, ObjectId } from 'mongodb';
import { env } from '../config/env.js';
import { closeDb, connectDb } from './client.js';
import { createIndexes } from './indexes.js';
import {
  apiTokenValidator,
  eventValidator,
  findingValidator,
  notificationValidator,
  projectValidator,
  runValidator,
  specSnapshotValidator,
  userValidator,
} from './validators/index.js';
import { logger } from '../lib/logger.js';

const VALIDATORS_MAP: Record<string, object> = {
  users: userValidator,
  apiTokens: apiTokenValidator,
  projects: projectValidator,
  events: eventValidator,
  runs: runValidator,
  findings: findingValidator,
  specSnapshots: specSnapshotValidator,
  notifications: notificationValidator,
};

export async function migrate(db: Db): Promise<void> {
  logger.info('Starting database migration...');

  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map(c => c.name));

  for (const [name, validator] of Object.entries(VALIDATORS_MAP)) {
    if (!existingNames.has(name)) {
      logger.info({ collection: name }, 'Creating collection with validator');
      await db.createCollection(name, {
        validator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
    } else {
      logger.info({ collection: name }, 'Updating validator for existing collection');
      try {
        await db.command({
          collMod: name,
          validator,
          validationLevel: 'strict',
          validationAction: 'error',
        });
      } catch (err) {
        logger.warn({ collection: name, err }, 'collMod failed, continuing');
      }
    }
  }

  // Create indexes
  await createIndexes(db);

  // Seed default admin user
  const usersColl = db.collection('users');
  const existingAdmin = await usersColl.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });

  if (!existingAdmin) {
    logger.info({ email: env.ADMIN_EMAIL }, 'Seeding default admin user');
    const passwordHash = await argon2.hash(env.ADMIN_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const now = new Date();
    await usersColl.insertOne({
      _id: new ObjectId(),
      email: env.ADMIN_EMAIL.toLowerCase().trim(),
      passwordHash,
      name: 'System Admin',
      role: 'admin',
      disabled: false,
      createdAt: now,
      updatedAt: now,
    });
    logger.info('Admin user seeded successfully');
  } else {
    logger.info({ email: env.ADMIN_EMAIL }, 'Admin user already exists');
  }

  logger.info('Database migration completed successfully');
}

// CLI runner
if (process.argv[1]?.endsWith('migrate.ts')) {
  (async () => {
    try {
      const db = await connectDb();
      await migrate(db);
      await closeDb();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Migration failed');
      process.exit(1);
    }
  })();
}
