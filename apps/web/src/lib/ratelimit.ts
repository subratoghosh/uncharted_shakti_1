import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redisInstance: Redis | null = null;
let isRedisChecked = false;

export function getWebRedis(): Redis | null {
  if (isRedisChecked) return redisInstance;
  isRedisChecked = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    try {
      redisInstance = new Redis({ url, token });
    } catch {
      redisInstance = null;
    }
  }
  return redisInstance;
}

// Memory fallback store for client / web serverless
const memoryStore = new Map<string, number[]>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60,
  prefix: string = 'web:rl'
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const redis = getWebRedis();
  if (redis) {
    try {
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix,
      });
      const res = await ratelimit.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch {
      // Fallback to memory
    }
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;
  const key = `${prefix}:${identifier}`;

  let timestamps = memoryStore.get(key) || [];
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0] || now;
    return {
      success: false,
      remaining: 0,
      reset: oldest + windowMs,
    };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);

  return {
    success: true,
    remaining: limit - timestamps.length,
    reset: now + windowMs,
  };
}
