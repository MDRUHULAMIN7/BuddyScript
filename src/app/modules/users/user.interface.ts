import type { HydratedDocument, Model, Types } from 'mongoose';

export type TUser = {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TUserMethods = {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

export type TUserDocument = HydratedDocument<TUser, TUserMethods>;
export type UserModel = Model<TUser, Record<string, never>, TUserMethods>;
