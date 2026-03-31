import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { loginValidationSchema, registerValidationSchema } from './auth.validation.js';
import { authServices } from './auth.service.js';

const register = catchAsync(async (req: Request, res: Response) => {
  const payload = registerValidationSchema.parse(req.body);
  const result = await authServices.registerUserIntoDB({
    ...payload,
    isDeleted: false,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully.',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = loginValidationSchema.parse(req.body);
  const result = await authServices.loginUser(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: result,
  });
});

export const authControllers = {
  login,
  register,
};
