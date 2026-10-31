import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { sendError } from './response.js';

let redisInstance: Redis | null = null;
let isRedisChecked = false;

/**
 * Initializes and returns the Upstash Redis client if credentials are configured.
 * Seamlessly returns null if not configured or invalid, enabling automatic fallback.
 */
export function getRedisClient(): Redis | null {
  if (isRedisChecked) return redisInstance;

  isRedisChecked = true;
  const url = env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    try {
      redisInstance = new Redis({
        url,
        token,
      });
      logger.info('⚡ Upstash Redis connected for distributed rate limiting & fast caching');
    } catch (err) {
      logger.warn({ err }, 'Failed to initialize Upstash Redis, falling back to memory');
      redisInstance = null;
    }
  } else {
    logger.info('ℹ️ Upstash Redis credentials not configured. Using high-performance in-memory engine.');
  }

  return redisInstance;
}

// In-memory sliding window cache fallback
interface MemoryLimitRecord {
  timestamps: number[];
}
const memoryRateLimitStore = new Map<string, MemoryLimitRecord>();

// Memory LRU / TTL Cache fallback
interface MemoryCacheRecord {
  value: any;
  expiresAt: number;
}
const memoryCacheStore = new Map<string, MemoryCacheRecord>();

// Cleanup stale memory rate limit and cache items periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryRateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter(t => t > now - 120_000);
    if (record.timestamps.length === 0) memoryRateLimitStore.delete(key);
  }
  for (const [key, record] of memoryCacheStore.entries()) {
    if (record.expiresAt < now) memoryCacheStore.delete(key);
  }
}, 60_000).unref?.();

export interface RateLimitOptions {
  requests: number;
  windowMs: number;
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms
}

/**
 * Creates a rate limiter backed by Upstash Redis with automatic in-memory fallback.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { requests, windowMs, prefix = 'shaktiq:rl' } = options;
  const redis = getRedisClient();

  let upstashLimiter: Ratelimit | null = null;
  if (redis) {
    try {
      // Calculate window string for upstash (e.g. "60 s", "1 m")
      const seconds = Math.max(1, Math.round(windowMs / 1000));
      upstashLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, `${seconds} s`),
        prefix,
        analytics: true,
      });
    } catch (err) {
      logger.warn({ err }, 'Could not create Upstash sliding window limiter, using memory');
      upstashLimiter = null;
    }
  }

  return {
    async limit(identifier: string): Promise<RateLimitResult> {
      if (upstashLimiter) {
        try {
          const res = await upstashLimiter.limit(identifier);
          return {
            success: res.success,
            limit: res.limit,
            remaining: res.remaining,
            reset: res.reset,
          };
        } catch (err) {
          logger.warn({ err }, 'Upstash ratelimit query error, falling back to in-memory check');
        }
      }

      // Memory sliding-window fallback
      const now = Date.now();
      const windowStart = now - windowMs;
      const key = `${prefix}:${identifier}`;
      let record = memoryRateLimitStore.get(key);

      if (!record) {
        record = { timestamps: [] };
        memoryRateLimitStore.set(key, record);
      }

      // Evict timestamps outside the window
      record.timestamps = record.timestamps.filter(t => t > windowStart);

      if (record.timestamps.length >= requests) {
        const oldest = record.timestamps[0] || now;
        const reset = oldest + windowMs;
        return {
          success: false,
          limit: requests,
          remaining: 0,
          reset,
        };
      }

      record.timestamps.push(now);
      return {
        success: true,
        limit: requests,
        remaining: requests - record.timestamps.length,
        reset: now + windowMs,
      };
    },
  };
}

// Pre-configured rate limiters for specific endpoint classes
export const authRateLimiter = createRateLimiter({
  requests: 15,
  windowMs: 60 * 1000, // 15 requests per minute
  prefix: 'rl:auth',
});

export const analyzeRateLimiter = createRateLimiter({
  requests: 30,
  windowMs: 60 * 1000, // 30 AST analyses per minute
  prefix: 'rl:analyze',
});

export const generalApiLimiter = createRateLimiter({
  requests: 120,
  windowMs: 60 * 1000, // 120 general requests per minute
  prefix: 'rl:api',
});

/**
 * Fastify preHandler guard for rate limiting.
 */
export function rateLimitGuard(limiter: ReturnType<typeof createRateLimiter>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Determine client identifier (authenticated user ID > IP address)
    const user = (request as any).user;
    const rawForwarded = request.headers['x-forwarded-for'];
    const ip =
      (typeof rawForwarded === 'string'
        ? rawForwarded.split(',')[0]?.trim()
        : Array.isArray(rawForwarded)
          ? rawForwarded[0]?.trim()
          : undefined) || request.ip;
    const identifier = user?.id || ip || 'unknown-client';

    const result = await limiter.limit(identifier);

    reply.header('X-RateLimit-Limit', result.limit);
    reply.header('X-RateLimit-Remaining', Math.max(0, result.remaining));
    reply.header('X-RateLimit-Reset', Math.ceil(result.reset / 1000));

    if (!result.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      reply.header('Retry-After', retryAfterSeconds);
      return sendError(
        reply,
        'RATE_LIMITED',
        `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before retrying.`,
        429,
        [{ message: `Retry after ${retryAfterSeconds}s` }],
      );
    }
  };
}

/**
 * Cache retrieval with Upstash Redis and in-memory fallback
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<T>(key);
      if (data !== null && data !== undefined) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } catch (err) {
      logger.warn({ err, key }, 'Redis cache get failed, checking memory');
    }
  }

  const memory = memoryCacheStore.get(key);
  if (memory && memory.expiresAt > Date.now()) {
    return memory.value as T;
  }
  return null;
}

/**
 * Cache storage with Upstash Redis and in-memory fallback
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return;
    } catch (err) {
      logger.warn({ err, key }, 'Redis cache set failed, writing to memory');
    }
  }

  memoryCacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
