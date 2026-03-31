import type { Response } from 'express';

type TSendResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
};

const sendResponse = <T>(res: Response, payload: TSendResponse<T>) => {
  const { statusCode, ...rest } = payload;
  res.status(statusCode).json(rest);
};

export default sendResponse;
