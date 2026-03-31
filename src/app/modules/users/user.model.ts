import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import config from '../../config/index.js';
import type { TUser, TUserDocument, TUserMethods, UserModel } from './user.interface.js';

const userSchema = new Schema<TUser, UserModel, TUserMethods>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function () {
  const user = this as TUserDocument;

  if (!user.isModified('password')) {
    return;
  }

  user.password = await bcrypt.hash(user.password, config.bcryptSaltRounds);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const responseObject = ret as Record<string, unknown>;
    delete responseObject.password;
    return responseObject;
  },
});

export const User = model<TUser, UserModel>('User', userSchema);
