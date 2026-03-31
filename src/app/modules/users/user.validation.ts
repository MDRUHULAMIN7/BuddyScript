import { z } from 'zod';

export const updateUserValidationSchema = z
  .object({
    firstName: z.string().trim().min(1).max(25).optional(),
    lastName: z.string().trim().min(1).max(20).optional(),
    profilePicture: z.string().trim().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required to update the profile.',
  });
