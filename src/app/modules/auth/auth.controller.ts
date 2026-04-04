import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { loginValidationSchema, registerValidationSchema } from './auth.validation.js';
import { authServices } from './auth.service.js';
import config from '../../config/index.js';

const durationToMs = (duration: string) => {
  const match = duration.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

const buildAuthCookieOptions = () => {
  const isProduction = config.nodeEnv === 'production';
  const sameSite: 'lax' | 'none' = isProduction ? 'none' : 'lax';

  return {
    httpOnly: true,
    sameSite,
    secure: isProduction,
    maxAge: durationToMs(config.jwtAccessExpiresIn),
    path: '/',
  };
};

const register = catchAsync(async (req: Request, res: Response) => {
  const payload = registerValidationSchema.parse(req.body);
  const result = await authServices.registerUserIntoDB({
    ...payload,
    isDeleted: false,
  });
  res.cookie(config.authCookieName, result.accessToken, buildAuthCookieOptions());

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully.',
    data: {
      user: result.user,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = loginValidationSchema.parse(req.body);
  const result = await authServices.loginUser(payload);
  res.cookie(config.authCookieName, result.accessToken, buildAuthCookieOptions());

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: {
      user: result.user,
    },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const isProduction = config.nodeEnv === 'production';

  res.clearCookie(config.authCookieName, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully.',
    data: null,
  });
});

export const authControllers = {
  login,
  logout,
  register,
};
