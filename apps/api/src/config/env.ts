import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017'),
  MONGODB_DB: z.string().default('shaktiq'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  INTERNAL_API_KEY: z.string().min(32, 'INTERNAL_API_KEY must be at least 32 characters long'),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, 'GITHUB_WEBHOOK_SECRET is required'),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  N8N_WEBHOOK_URL: z.string().default('http://localhost:5678/webhook/shaktiq-analyze-run'),
  N8N_WEBHOOK_TOKEN: z.string().default('shaktiq-secret-n8n-token'),
  OASDIFF_MODE: z.enum(['binary', 'docker']).default('binary'),
  MAX_SPEC_BYTES: z.coerce.number().int().default(5242880), // 5 MB
  ADMIN_EMAIL: z.string().email().default('admin@shaktiq.dev'),
  ADMIN_PASSWORD: z.string().min(8).default('admin1234!'),
  AI_EXPLANATIONS_ENABLED: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  GEMINI_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '❌ Invalid environment variables:\n',
    JSON.stringify(parsed.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
export type Env = typeof env;
