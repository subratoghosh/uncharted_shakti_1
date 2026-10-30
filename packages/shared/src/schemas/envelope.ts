import { z } from 'zod';
import { ERROR_CODES } from '../errors.js';

export const errorDetailSchema = z.object({
  path: z.string().optional(),
  message: z.string(),
});

export const apiErrorSchema = z.object({
  code: z.enum(ERROR_CODES),
  message: z.string(),
  details: z.array(errorDetailSchema).optional(),
});

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;

export function createSuccessEnvelope<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: dataSchema,
    meta: paginationMetaSchema.optional(),
  });
}

export const apiFailureEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: apiErrorSchema,
});

export type ApiFailureResponse = z.infer<typeof apiFailureEnvelopeSchema>;

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;
