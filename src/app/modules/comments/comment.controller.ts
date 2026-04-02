import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { commentQueryValidationSchema, createCommentValidationSchema } from './comment.validation.js';
import { commentServices } from './comment.service.js';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const payload = createCommentValidationSchema.parse(req.body);
  const comment = await commentServices.createCommentIntoDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment created successfully.',
    data: comment,
  });
});

const getCommentsByPost = catchAsync(async (req: Request, res: Response) => {
  const payload = commentQueryValidationSchema.parse(req.query);
  const result = await commentServices.getCommentsByPostFromDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully.',
    data: result,
  });
});

export const commentControllers = {
  createComment,
  getCommentsByPost,
};
