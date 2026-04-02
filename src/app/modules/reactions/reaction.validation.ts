import { z } from 'zod';

export const reactionTargetValidationSchema = z.object({
  targetId: z.string().trim().min(1),
  targetType: z.enum(['comment', 'post']),
});

export const reactionQueryValidationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
});
