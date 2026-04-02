import { z } from 'zod';

export const createCommentValidationSchema = z.object({
  content: z.string().trim().min(1).max(1000),
  parentCommentId: z.string().trim().optional(),
  postId: z.string().trim().min(1),
});

export const commentQueryValidationSchema = z.object({
  postId: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
  // When omitted, we fetch top-level comments (parentCommentId = null).
  parentCommentId: z.string().trim().optional(),
});
