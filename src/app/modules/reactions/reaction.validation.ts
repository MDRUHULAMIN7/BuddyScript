import { z } from 'zod';

export const toggleReactionValidationSchema = z.object({
  targetId: z.string().trim().min(1),
  targetType: z.enum(['comment', 'post']),
});

export const reactionQueryValidationSchema = z.object({
  targetId: z.string().trim().min(1),
  targetType: z.enum(['comment', 'post']),
});
