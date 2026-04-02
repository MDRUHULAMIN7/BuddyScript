import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { reactionQueryValidationSchema, reactionTargetValidationSchema } from './reaction.validation.js';
import { reactionServices } from './reaction.service.js';

const likeReaction = catchAsync(async (req: Request, res: Response) => {
  const payload = reactionTargetValidationSchema.parse(req.params);
  const result = await reactionServices.addReactionIntoDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reaction added successfully.',
    data: result,
  });
});

const unlikeReaction = catchAsync(async (req: Request, res: Response) => {
  const payload = reactionTargetValidationSchema.parse(req.params);
  const result = await reactionServices.removeReactionFromDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reaction removed successfully.',
    data: result,
  });
});

const getReactionsByTarget = catchAsync(async (req: Request, res: Response) => {
  const payload = reactionTargetValidationSchema.parse(req.params);
  const pagination = reactionQueryValidationSchema.parse(req.query);
  const result = await reactionServices.getReactionsByTargetFromDB(req.user!.userId, payload, pagination);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reactions retrieved successfully.',
    data: result,
  });
});

export const reactionControllers = {
  getReactionsByTarget,
  likeReaction,
  unlikeReaction,
};
