import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { reactionQueryValidationSchema, toggleReactionValidationSchema } from './reaction.validation.js';
import { reactionServices } from './reaction.service.js';

const toggleReaction = catchAsync(async (req: Request, res: Response) => {
  const payload = toggleReactionValidationSchema.parse(req.body);
  const result = await reactionServices.toggleReactionIntoDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reaction state updated successfully.',
    data: result,
  });
});

const getReactionsByTarget = catchAsync(async (req: Request, res: Response) => {
  const payload = reactionQueryValidationSchema.parse(req.query);
  const result = await reactionServices.getReactionsByTargetFromDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reactions retrieved successfully.',
    data: result,
  });
});

export const reactionControllers = {
  getReactionsByTarget,
  toggleReaction,
};
