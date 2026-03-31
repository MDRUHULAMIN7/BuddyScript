import { Schema, model } from 'mongoose';
import type { PostModel, TPost } from './post.interface.js';

const postSchema = new Schema<TPost, PostModel>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'public',
      index: true,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactionCount: {
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

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, visibility: 1, createdAt: -1 });

export const Post = model<TPost, PostModel>('Post', postSchema);
