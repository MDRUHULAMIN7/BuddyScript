import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import AppError from '../../errors/AppError.js';
import { User } from '../users/user.model.js';
import type { TUser } from '../users/user.interface.js';

const createAccessToken = (payload: { email: string; userId: string }) => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
};

const registerUserIntoDB = async (payload: TUser) => {
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

  if (existingUser) {
    throw new AppError(409, 'An account already exists with this email.');
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
  });

  const accessToken = createAccessToken({
    email: user.email,
    userId: user._id!.toString(),
  });

  return {
    accessToken,
    user,
  };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const user = await User.findOne({
    email: payload.email.toLowerCase(),
    isDeleted: false,
  }).select('+password');

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const isPasswordMatched = await user.comparePassword(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const accessToken = createAccessToken({
    email: user.email,
    userId: user._id!.toString(),
  });

  const sanitizedUser = await User.findById(user._id);

  return {
    accessToken,
    user: sanitizedUser,
  };
};

export const authServices = {
  loginUser,
  registerUserIntoDB,
};
