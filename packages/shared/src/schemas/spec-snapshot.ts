import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const specSnapshotDtoSchema = z.object({
  id: objectIdSchema,
  projectId: objectIdSchema,
  sha256: z.string().length(64),
  format: z.enum(['yaml', 'json']),
  sizeBytes: z.number().int().min(1).max(5242880), // 5 MB max
  content: z.string().max(5242880),
  repo: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  commitSha: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type SpecSnapshot = z.infer<typeof specSnapshotDtoSchema>;
