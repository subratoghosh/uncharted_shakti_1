import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const apiTokenDtoSchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
  name: z.string().min(1).max(50).trim(),
  prefix: z.string().min(4).max(16),
  lastUsedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type ApiToken = z.infer<typeof apiTokenDtoSchema>;

export const createApiTokenRequestSchema = z.object({
  name: z.string().min(1).max(50).trim(),
});

export type CreateApiTokenRequest = z.infer<typeof createApiTokenRequestSchema>;

export const createApiTokenResponseSchema = z.object({
  apiToken: apiTokenDtoSchema,
  token: z.string(), // Raw token only displayed once at creation
});

export type CreateApiTokenResponse = z.infer<typeof createApiTokenResponseSchema>;
