import { z } from 'zod';
import { CHANGE_TYPES, DIFF_STATUSES, HTTP_METHODS, SEVERITIES } from '../enums.js';
import { objectIdSchema } from './common.js';

export const findingDraftSchema = z.object({
  endpoint: z.string().min(1),
  method: z.enum(HTTP_METHODS),
  changeType: z.enum(CHANGE_TYPES),
  severity: z.enum(SEVERITIES),
  ruleId: z.string().min(1),
  description: z.string().min(1),
  impact: z.string().min(1),
  recommendation: z.string().min(1),
  locationText: z.string().optional(),
  fingerprint: z.string().length(64), // SHA-256
});

export type FindingDraft = z.infer<typeof findingDraftSchema>;

export const findingDtoSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  runId: objectIdSchema,
  fingerprint: z.string().length(64),
  previousVersion: z.string().nullable().optional(),
  currentVersion: z.string(),
  endpoint: z.string().min(1),
  method: z.enum(HTTP_METHODS),
  changeType: z.enum(CHANGE_TYPES),
  severity: z.enum(SEVERITIES),
  ruleId: z.string().min(1),
  description: z.string().min(1),
  impact: z.string().min(1),
  recommendation: z.string().min(1),
  aiExplanation: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  diffStatus: z.enum(DIFF_STATUSES).optional(),
});

export type Finding = z.infer<typeof findingDtoSchema>;

export const hotspotDtoSchema = z.object({
  endpoint: z.string(),
  method: z.enum(HTTP_METHODS),
  occurrences: z.number().int().min(1),
  distinctRuns: z.number().int().min(2),
  lastSeen: z.string().datetime(),
  changeTypes: z.array(z.enum(CHANGE_TYPES)),
});

export type Hotspot = z.infer<typeof hotspotDtoSchema>;
