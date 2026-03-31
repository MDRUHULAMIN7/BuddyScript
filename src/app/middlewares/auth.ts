import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config/index.js';
import AppError from '../errors/AppError.js';

type TAccessTokenPayload = JwtPayload & {
  email: string;
  userId: string;
};

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authorization token is required.'));
    return;
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret) as TAccessTokenPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired access token.'));
  }
};

export default auth;
