import { z } from 'zod';

export const createCommentValidationSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  parentCommentId: z.string().trim().optional(),
  postId: z.string().trim().min(1),
});

export const commentQueryValidationSchema = z.object({
  postId: z.string().trim().min(1),
});
