import { z } from 'zod';
import { ROLES } from '../enums.js';
import { objectIdSchema } from './common.js';

export const userDtoSchema = z.object({
  id: objectIdSchema,
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(ROLES),
  disabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof userDtoSchema>;

export const registerRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1).max(100).trim(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const updateUserRequestSchema = z.object({
  role: z.enum(ROLES).optional(),
  disabled: z.boolean().optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
