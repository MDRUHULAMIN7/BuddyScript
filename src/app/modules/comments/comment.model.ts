import { Schema, model } from 'mongoose';
import type { CommentModel, TComment } from './comment.interface.js';

const commentSchema = new Schema<TComment, CommentModel>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    reactionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ post: 1, parentComment: 1, createdAt: -1, _id: -1 });

export const Comment = model<TComment, CommentModel>('Comment', commentSchema);
