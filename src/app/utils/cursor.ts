import { z } from 'zod';
import AppError from '../errors/AppError.js';

const cursorSchema = z.object({
  createdAt: z.number(),
  id: z.string().min(1),
});

export type CursorPayload = z.infer<typeof cursorSchema>;

export const encodeCursor = (payload: CursorPayload): string => {
  // base64url avoids needing URL escaping on the client.
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
};

export const decodeCursor = (cursor: string): CursorPayload => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = cursorSchema.parse(JSON.parse(decoded));
    return parsed;
  } catch {
    throw new AppError(400, 'Invalid cursor.');
  }
};

