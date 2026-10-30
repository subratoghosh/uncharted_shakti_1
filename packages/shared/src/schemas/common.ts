import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a 24-character hexadecimal ObjectId');

export const specPathSchema = z
  .string()
  .min(1)
  .max(500)
  .regex(/^[A-Za-z0-9._/-]+$/, 'Spec path may only contain alphanumeric characters, ., _, -, and /')
  .refine((val) => !val.includes('..'), {
    message: 'Spec path must not contain directory traversal (..)',
  });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
