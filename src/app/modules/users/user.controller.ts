import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { updateUserValidationSchema } from './user.validation.js';
import { userServices } from './user.service.js';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userServices.getMyProfileFromDB(req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully.',
    data: user,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = updateUserValidationSchema.parse(req.body);
  const user = await userServices.updateMyProfileIntoDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
});

export const userControllers = {
  getMyProfile,
  updateMyProfile,
};
