import { z } from 'zod';

export const aiQueryRequestSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty').max(1000, 'Question too long'),
});

export type AiQueryRequest = z.infer<typeof aiQueryRequestSchema>;

export const aiQueryResponseSchema = z.object({
  answer: z.string(),
  suggestedFix: z.string().optional(),
  riskLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE']),
  relatedEndpoints: z.array(z.string()).default([]),
  generatedBy: z.string(),
});

export type AiQueryResponse = z.infer<typeof aiQueryResponseSchema>;
