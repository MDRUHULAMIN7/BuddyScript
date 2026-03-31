import type { Model, Types } from 'mongoose';

export type TPostVisibility = 'private' | 'public';

export type TPost = {
  author: Types.ObjectId;
  text?: string;
  imageUrl?: string;
  visibility: TPostVisibility;
  commentCount: number;
  reactionCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PostModel = Model<TPost>;
