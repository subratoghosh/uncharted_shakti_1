import { z } from 'zod';
import { AI_STATUSES, RELEASE_STATUSES, RUN_STATUSES, SOURCES } from '../enums.js';
import { objectIdSchema } from './common.js';

export const runSummarySchema = z.object({
  total: z.number().int().min(0),
  breaking: z.number().int().min(0),
  warning: z.number().int().min(0),
  info: z.number().int().min(0),
  releaseStatus: z.enum(RELEASE_STATUSES),
  newCount: z.number().int().min(0).default(0),
  resolvedCount: z.number().int().min(0).default(0),
  unresolvedCount: z.number().int().min(0).default(0),
});

export type RunSummary = z.infer<typeof runSummarySchema>;

export function computeReleaseStatus(counts: {
  breaking: number;
  warning: number;
  info?: number;
}): (typeof RELEASE_STATUSES)[number] {
  if (counts.breaking > 0) return 'blocked';
  if (counts.warning > 0) return 'review';
  return 'safe';
}

export const runDtoSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  eventId: z.string().min(8),
  source: z.enum(SOURCES),
  previousVersion: z.string().nullable().optional(),
  currentVersion: z.string(),
  commitId: z.string().nullable().optional(),
  branch: z.string().default('main'),
  pullRequestNumber: z.number().int().nullable().optional(),
  baseSnapshotId: objectIdSchema.nullable().optional(),
  headSnapshotId: objectIdSchema.nullable().optional(),
  baseSpecHash: z.string().nullable().optional(),
  headSpecHash: z.string().nullable().optional(),
  status: z.enum(RUN_STATUSES),
  startedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  summary: runSummarySchema.nullable().optional(),
  errorCode: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  aiStatus: z.enum(AI_STATUSES).default('disabled'),
  aiSummary: z.string().nullable().optional(),
});

export type Run = z.infer<typeof runDtoSchema>;

export const createManualRunRequestSchema = z.object({
  baseSpec: z.string().min(1).max(5242880, 'Spec exceeds max 5 MB limit').optional(),
  headSpec: z.string().min(1).max(5242880, 'Spec exceeds max 5 MB limit'),
  baseRef: z.string().optional(),
  headRef: z.string().default('HEAD'),
  branch: z.string().default('main'),
});

export type CreateManualRunRequest = z.infer<typeof createManualRunRequestSchema>;

export const compareRunsQuerySchema = z.object({
  base: objectIdSchema,
  head: objectIdSchema,
});

export type CompareRunsQuery = z.infer<typeof compareRunsQuerySchema>;
