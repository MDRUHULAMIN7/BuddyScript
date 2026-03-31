import { z } from 'zod';

export const registerValidationSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const loginValidationSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
