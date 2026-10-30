import { z } from 'zod';
import { objectIdSchema, specPathSchema } from './common.js';

export const projectDtoSchema = z.object({
  id: objectIdSchema,
  ownerUserId: objectIdSchema,
  name: z.string().min(1).max(100).trim(),
  repositoryUrl: z
    .string()
    .url()
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, {
      message: 'Repository URL must be a valid GitHub repository: https://github.com/owner/repo',
    }),
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  fullName: z.string().min(3).max(200),
  defaultBranch: z.string().min(1).max(100).default('main'),
  specPath: specPathSchema.default('openapi.yaml'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof projectDtoSchema>;

export const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  repositoryUrl: z
    .string()
    .url()
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, {
      message: 'Repository URL must be a valid GitHub repository: https://github.com/owner/repo',
    }),
  defaultBranch: z.string().min(1).max(100).default('main'),
  specPath: specPathSchema.default('openapi.yaml'),
});

export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

export const updateProjectRequestSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  defaultBranch: z.string().min(1).max(100).optional(),
  specPath: specPathSchema.optional(),
});

export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;
