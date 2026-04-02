import { Schema, model } from 'mongoose';
import type { ReactionModel, TReaction } from './reaction.interface.js';

const reactionSchema = new Schema<TReaction, ReactionModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['comment', 'post'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reactionSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });
reactionSchema.index({ targetId: 1, targetType: 1, createdAt: -1, _id: -1 });

export const Reaction = model<TReaction, ReactionModel>('Reaction', reactionSchema);
