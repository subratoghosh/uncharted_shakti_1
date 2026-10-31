import dns from 'node:dns';
import { Db, MongoClient } from 'mongodb';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

const ATLAS_DIRECT_URI =
  'mongodb://shaktiq_admin:admin2026@ac-oept6kq-shard-00-00.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-01.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-02.dyzf282.mongodb.net:27017/shaktiIQ?ssl=true&replicaSet=atlas-jlnvw8-shard-0&authSource=admin&retryWrites=true&w=majority';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(
  uri: string = env.MONGODB_URI,
  dbName: string = env.MONGODB_DB,
): Promise<Db> {
  if (db && client) {
    return db;
  }

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (
      uri.startsWith('mongodb+srv://') &&
      (errorMsg.includes('querySrv') || errorMsg.includes('ECONNREFUSED'))
    ) {
      logger.warn('[MongoDB] SRV lookup failed, falling back to direct replica set hosts');
      client = new MongoClient(ATLAS_DIRECT_URI, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      await client.connect();
    } else {
      throw err;
    }
  }

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
