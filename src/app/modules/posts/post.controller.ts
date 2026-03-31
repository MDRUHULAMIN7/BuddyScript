import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { createPostValidationSchema, feedQueryValidationSchema } from './post.validation.js';
import { postServices } from './post.service.js';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const payload = createPostValidationSchema.parse(req.body);
  const post = await postServices.createPostIntoDB(req.user!.userId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Post created successfully.',
    data: post,
  });
});

const getFeed = catchAsync(async (req: Request, res: Response) => {
  const pagination = feedQueryValidationSchema.parse(req.query);
  const result = await postServices.getFeedFromDB(req.user!.userId, pagination);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feed retrieved successfully.',
    data: result,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const post = await postServices.getSinglePostFromDB(req.user!.userId, req.params.postId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Post retrieved successfully.',
    data: post,
  });
});

export const postControllers = {
  createPost,
  getFeed,
  getSinglePost,
};
