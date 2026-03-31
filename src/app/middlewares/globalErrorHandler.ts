import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError.js';

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;

  let statusCode = 500;
  let message = 'Something went wrong.';
  let errorDetails: unknown = error;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed.';
    errorDetails = error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path.join('.'),
    }));
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = undefined;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
  });
};

export default globalErrorHandler;
