import { Db, MongoClient } from 'mongodb';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(
  uri: string = env.MONGODB_URI,
  dbName: string = env.MONGODB_DB,
): Promise<Db> {
  if (db && client) {
    return db;
  }

  client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  db = client.db(dbName);
  logger.info({ db: dbName }, 'Connected to MongoDB');
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDb() first.');
  }
  return db;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error('MongoClient not initialized. Call connectDb() first.');
  }
  return client;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
}
