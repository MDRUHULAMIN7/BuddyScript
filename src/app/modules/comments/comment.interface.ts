import type { Model, Types } from 'mongoose';

export type TComment = {
  author: Types.ObjectId;
  post: Types.ObjectId;
  parentComment?: Types.ObjectId;
  content: string;
  reactionCount: number;
  replyCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CommentModel = Model<TComment>;
