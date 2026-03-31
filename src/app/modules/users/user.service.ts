import AppError from '../../errors/AppError.js';
import { User } from './user.model.js';

const getMyProfileFromDB = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(404, 'User not found.');
  }

  return user;
};

const updateMyProfileIntoDB = async (
  userId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  },
) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  return user;
};

export const userServices = {
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};
