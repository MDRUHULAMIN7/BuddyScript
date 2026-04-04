import { z } from 'zod';

export const createPostValidationSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z
      .string()
      .trim()
      .optional()
      .refine((value) => {
        if (!value) return true;
        try {
          // Accept absolute URLs (Cloudinary or user-provided)...
          new URL(value);
          return true;
        } catch {
          // ...or our local upload paths like `/uploads/posts/<file>.jpg`.
          return value.startsWith('/');
        }
      }, 'imageUrl must be a valid URL or a relative path starting with `/`.'),
    visibility: z.enum(['private', 'public']).default('public'),
  })
  .refine((value) => Boolean(value.text || value.imageUrl), {
    message: 'A post must include text, an image, or both.',
  });

export const feedQueryValidationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
  // Backwards compatibility: older clients might still send `page`.
  page: z.coerce.number().int().min(1).optional(),
});
