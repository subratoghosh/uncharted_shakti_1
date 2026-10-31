import dns from 'node:dns';
import { MongoClient, Db } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

const ATLAS_DIRECT_URI =
  'mongodb://shaktiq_admin:admin2026@ac-oept6kq-shard-00-00.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-01.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-02.dyzf282.mongodb.net:27017/shaktiIQ?ssl=true&replicaSet=atlas-jlnvw8-shard-0&authSource=admin&retryWrites=true&w=majority';

const uri = process.env.MONGODB_URI || ATLAS_DIRECT_URI;
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || 'shaktiIQ';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | undefined;
}

async function connectWithFallback(targetUri: string): Promise<MongoClient> {
  try {
    const client = new MongoClient(targetUri, {
      maxPoolSize: 20,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    return await client.connect();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isSrvOrDnsError =
      targetUri.startsWith('mongodb+srv://') &&
      (errorMsg.includes('querySrv') ||
        errorMsg.includes('ECONNREFUSED') ||
        errorMsg.includes('ENOTFOUND') ||
        errorMsg.includes('ETIMEOUT'));

    if (isSrvOrDnsError) {
      console.warn('[MongoDB] SRV DNS resolution failed, automatically falling back to direct replica set hosts...');
      const fallbackClient = new MongoClient(ATLAS_DIRECT_URI, {
        maxPoolSize: 20,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      return await fallbackClient.connect();
    }
    throw err;
  }
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectWithFallback(uri).catch((err) => {
        // Reset cached promise on failure so next request can retry instead of permanently failing
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  return connectWithFallback(uri);
}

const clientPromise: Promise<MongoClient> = getClientPromise();
export default clientPromise;

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise();
    return client.db(dbName);
  } catch (err) {
    // Reset global promise if connection failed
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined;
    }
    throw err;
  }
}
