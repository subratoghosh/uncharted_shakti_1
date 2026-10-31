import { z } from 'zod';
import { EVENT_TYPES, PROCESSING_STATUSES, SOURCES } from '../enums.js';
import { objectIdSchema } from './common.js';

export const eventPayloadSubsetSchema = z.object({
  ref: z.string().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  repository: z.string().optional(),
  pullRequestNumber: z.number().int().nullable().optional(),
  commitMessage: z.string().optional(),
  sender: z.string().optional(),
});

export type EventPayloadSubset = z.infer<typeof eventPayloadSubsetSchema>;

export const eventDtoSchema = z.object({
  id: objectIdSchema,
  eventId: z.string().min(8),
  projectId: objectIdSchema.nullable().optional(),
  eventType: z.enum(EVENT_TYPES),
  source: z.enum(SOURCES),
  payload: eventPayloadSubsetSchema.optional(),
  receivedAt: z.string().datetime(),
  processingStatus: z.enum(PROCESSING_STATUSES),
  runId: objectIdSchema.nullable().optional(),
  duplicateCount: z.number().int().min(0).default(0),
  lastDuplicateAt: z.string().datetime().nullable().optional(),
  error: z.string().nullable().optional(),
});

export type Event = z.infer<typeof eventDtoSchema>;

export const webhookDeliveryResponseSchema = z.object({
  duplicate: z.boolean(),
  eventId: z.string(),
  runId: objectIdSchema.nullable().optional(),
});

export type WebhookDeliveryResponse = z.infer<typeof webhookDeliveryResponseSchema>;
