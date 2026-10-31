import dns from 'node:dns';
import { MongoClient, Db } from 'mongodb';

// Custom DNS server override is ONLY useful for local Windows development where router DNS fails.
// NEVER run setServers on Vercel / AWS Lambda where external port 53 is blocked by cloud firewalls.
if (process.platform === 'win32' && !process.env.VERCEL && !process.env.AWS_REGION) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    // @ts-ignore
    if (!global._dnsLookupPatched) {
      // @ts-ignore
      global._dnsLookupPatched = true;
      const origLookup = dns.lookup;
      // @ts-ignore
      dns.lookup = function (hostname: string, options: any, callback: any) {
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }
        if (!hostname || typeof hostname !== 'string' || /^[\d.]+$/.test(hostname) || hostname.includes(':') || hostname === 'localhost') {
          return origLookup(hostname, options, callback);
        }
        dns.resolve4(hostname, (err, addrs) => {
          if (!err && Array.isArray(addrs) && addrs.length > 0) {
            if (options && options.all) {
              return callback(null, addrs.map((a: string) => ({ address: a, family: 4 })));
            }
            return callback(null, addrs[0], 4);
          }
          origLookup(hostname, options, callback);
        });
      };
    }
  } catch {
    // Ignore in environments where setServers is restricted
  }
}

const ATLAS_DIRECT_URI =
  'mongodb://shaktiq_admin:admin2026@ac-oept6kq-shard-00-00.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-01.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-02.dyzf282.mongodb.net:27017/shaktiIQ?ssl=true&replicaSet=atlas-jlnvw8-shard-0&authSource=admin&retryWrites=true&w=majority';

// On Windows local development where router DNS blocks SRV, immediately use direct replica set to prevent timeout
const shouldUseDirect =
  process.platform === 'win32' &&
  !process.env.VERCEL &&
  !process.env.AWS_REGION &&
  process.env.MONGODB_URI?.startsWith('mongodb+srv://');

const rawUri = shouldUseDirect ? ATLAS_DIRECT_URI : (process.env.MONGODB_URI || ATLAS_DIRECT_URI);
const uri = rawUri.replace(/[\r\n\t]/g, '').trim();
const rawDbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || 'shaktiIQ';
const dbName = rawDbName.replace(/[\r\n\t]/g, '').trim();

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const MONGO_POOL_CONFIG = {
  maxPoolSize: 25,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 45000,
};

async function connectWithFallback(targetUri: string): Promise<MongoClient> {
  try {
    const client = new MongoClient(targetUri, MONGO_POOL_CONFIG);
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
      const fallbackClient = new MongoClient(ATLAS_DIRECT_URI, MONGO_POOL_CONFIG);
      return await fallbackClient.connect();
    }
    throw err;
  }
}

function getClientPromise(): Promise<MongoClient> {
  // In both local development and Vercel serverless, caching the client promise
  // in global._mongoClientPromise prevents exhausting the MongoDB Atlas connection pool
  // and eliminates repeated multi-second TLS handshakes on every request.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithFallback(uri).catch((err) => {
      // Clear cache on failure so future requests can retry rather than staying broken
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export default getClientPromise;

export async function getDb(name?: string): Promise<Db> {
  const client = await getClientPromise();
  const targetDbName = (name || dbName).replace(/[\r\n\t]/g, '').trim();
  return client.db(targetDbName);
}
