import { z } from 'zod';

export const createPostValidationSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z.string().trim().url().optional(),
    visibility: z.enum(['private', 'public']).default('public'),
  })
  .refine((value) => Boolean(value.text || value.imageUrl), {
    message: 'A post must include text, an image, or both.',
  });

export const feedQueryValidationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});
