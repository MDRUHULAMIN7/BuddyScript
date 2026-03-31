import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        email: string;
        userId: string;
      };
    }
  }
}

export {};
