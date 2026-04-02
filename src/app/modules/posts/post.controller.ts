import type { Express, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { createPostValidationSchema, feedQueryValidationSchema } from './post.validation.js';
import { postServices } from './post.service.js';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = (req as unknown as { file?: Express.Multer.File }).file;

  // If the request contains an uploaded file, we convert it into the stored `imageUrl`.
  // Otherwise we keep the user-provided `imageUrl` (URL or local upload path).
  const payload = createPostValidationSchema.parse({
    ...req.body,
    imageUrl: uploadedFile ? `/uploads/posts/${uploadedFile.filename}` : req.body.imageUrl,
  });

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
