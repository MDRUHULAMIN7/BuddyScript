import type { Model, Types } from 'mongoose';

export type TReactionTargetType = 'comment' | 'post';

export type TReaction = {
  user: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: TReactionTargetType;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ReactionModel = Model<TReaction>;
