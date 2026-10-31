import { z } from 'zod';
import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES } from '../enums.js';
import { objectIdSchema } from './common.js';

export const notificationDtoSchema = z.object({
  id: objectIdSchema,
  runId: objectIdSchema,
  projectId: objectIdSchema,
  channel: z.enum(NOTIFICATION_CHANNELS),
  status: z.enum(NOTIFICATION_STATUSES),
  target: z.string().min(1),
  responseCode: z.number().int().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type Notification = z.infer<typeof notificationDtoSchema>;
