import { z } from 'zod';
import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES, SPEC_SOURCES } from '../enums.js';
import { objectIdSchema } from './common.js';
import { findingDraftSchema } from './finding.js';
import { runSummarySchema } from './run.js';

// Webhook payload dispatched from API to n8n
export const n8nWebhookPayloadSchema = z.object({
  runId: objectIdSchema,
  projectId: objectIdSchema,
});

export type N8nWebhookPayload = z.infer<typeof n8nWebhookPayloadSchema>;

// POST /internal/runs/:runId/start
export const internalRunStartResponseSchema = z.object({
  runId: objectIdSchema,
  projectId: objectIdSchema,
  specSource: z.enum(SPEC_SOURCES),
  repo: z.object({
    fullName: z.string(),
    specPath: z.string(),
  }),
  baseRef: z.string().nullable().optional(),
  headRef: z.string(),
  source: z.string(),
  pullRequestNumber: z.number().int().nullable().optional(),
  aiEnabled: z.boolean(),
});

export type InternalRunStartResponse = z.infer<typeof internalRunStartResponseSchema>;

// POST /internal/runs/:runId/analyze
export const internalRunAnalyzeRequestSchema = z.object({
  base: z
    .object({
      content: z.string().max(5242880, 'Base spec exceeds 5 MB limit'),
    })
    .optional(),
  head: z
    .object({
      content: z.string().max(5242880, 'Head spec exceeds 5 MB limit'),
    })
    .optional(),
});

export type InternalRunAnalyzeRequest = z.infer<typeof internalRunAnalyzeRequestSchema>;

export const internalRunAnalyzeResponseSchema = z.object({
  summary: runSummarySchema,
  findingCount: z.number().int().min(0),
  topFindings: z.array(findingDraftSchema),
});

export type InternalRunAnalyzeResponse = z.infer<typeof internalRunAnalyzeResponseSchema>;

// POST /internal/runs/:runId/explanations
export const internalRunExplanationsRequestSchema = z.object({
  runSummaryText: z.string().max(2000).optional(),
  findings: z.array(
    z.object({
      fingerprint: z.string().length(64),
      explanation: z.string().max(2000),
    }),
  ),
});

export type InternalRunExplanationsRequest = z.infer<typeof internalRunExplanationsRequestSchema>;

// POST /internal/runs/:runId/notifications
export const internalRunNotificationsRequestSchema = z.object({
  channel: z.enum(NOTIFICATION_CHANNELS),
  status: z.enum(NOTIFICATION_STATUSES),
  target: z.string().min(1).max(200),
  responseCode: z.number().int().optional(),
  error: z.string().nullable().optional(),
});

export type InternalRunNotificationsRequest = z.infer<typeof internalRunNotificationsRequestSchema>;

// POST /internal/runs/:runId/fail
export const internalRunFailRequestSchema = z.object({
  errorCode: z.string().min(1),
  errorMessage: z.string().min(1),
});

export type InternalRunFailRequest = z.infer<typeof internalRunFailRequestSchema>;
