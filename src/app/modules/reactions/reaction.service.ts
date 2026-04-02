import mongoose, { type ClientSession } from 'mongoose';
import AppError from '../../errors/AppError.js';
import { Comment } from '../comments/comment.model.js';
import { Post } from '../posts/post.model.js';
import { Reaction } from './reaction.model.js';
import { decodeCursor, encodeCursor } from '../../utils/cursor.js';

const isDuplicateKeyError = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
};

const resolveTarget = async (
  userId: string,
  targetType: 'comment' | 'post',
  targetId: string,
  session?: ClientSession,
) => {
  if (targetType === 'post') {
    const post = await Post.findById(targetId).session(session ?? null);

    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    if (post.visibility === 'private' && post.author.toString() !== userId) {
      throw new AppError(403, 'You are not allowed to react to this post.');
    }

    return post;
  }

  const comment = await Comment.findById(targetId).session(session ?? null);

  if (!comment) {
    throw new AppError(404, 'Comment not found.');
  }

  const post = await Post.findById(comment.post).session(session ?? null);

  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  if (post.visibility === 'private' && post.author.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to react to this comment.');
  }

  return comment;
};

const updateTargetReactionCount = async (
  targetType: 'comment' | 'post',
  targetId: string,
  delta: 1 | -1,
  session: ClientSession,
) => {
  if (targetType === 'post') {
    await Post.updateOne({ _id: targetId }, { $inc: { reactionCount: delta } }, { session });
    return;
  }

  await Comment.updateOne({ _id: targetId }, { $inc: { reactionCount: delta } }, { session });
};

const addReactionIntoDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
) => {
  const session = await mongoose.startSession();
  let changed = false;
  let liked = true;

  try {
    await session.withTransaction(async () => {
      await resolveTarget(userId, payload.targetType, payload.targetId, session);

      const existingReaction = await Reaction.findOne(
        {
          targetId: payload.targetId,
          targetType: payload.targetType,
          user: userId,
        },
      ).session(session);

      if (existingReaction) {
        return;
      }

      await Reaction.create(
        [
          {
            targetId: payload.targetId,
            targetType: payload.targetType,
            user: userId,
          },
        ],
        { session },
      );

      await updateTargetReactionCount(payload.targetType, payload.targetId, 1, session);
      changed = true;
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const existingReaction = await Reaction.findOne({
      targetId: payload.targetId,
      targetType: payload.targetType,
      user: userId,
    });

    liked = Boolean(existingReaction);
  } finally {
    await session.endSession();
  }

  return {
    changed,
    liked,
  };
};

const removeReactionFromDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
) => {
  const session = await mongoose.startSession();
  let changed = false;
  const liked = false;

  try {
    await session.withTransaction(async () => {
      await resolveTarget(userId, payload.targetType, payload.targetId, session);

      const deletedReaction = await Reaction.findOneAndDelete(
        {
          targetId: payload.targetId,
          targetType: payload.targetType,
          user: userId,
        },
        { session },
      );

      if (!deletedReaction) {
        return;
      }

      await updateTargetReactionCount(payload.targetType, payload.targetId, -1, session);
      changed = true;
    });
  } finally {
    await session.endSession();
  }

  return {
    changed,
    liked,
  };
};

const getReactionsByTargetFromDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
  pagination: { limit: number; cursor?: string },
) => {
  await resolveTarget(userId, payload.targetType, payload.targetId);

  const baseFilter = { targetId: payload.targetId, targetType: payload.targetType };

  const filter = pagination.cursor
    ? (() => {
        const decoded = decodeCursor(pagination.cursor!);
        const createdAt = new Date(decoded.createdAt);
        const id = new mongoose.Types.ObjectId(decoded.id);

        return {
          $and: [
            baseFilter,
            {
              $or: [
                { createdAt: { $lt: createdAt } },
                { createdAt, _id: { $lt: id } },
              ],
            },
          ],
        };
      })()
    : baseFilter;

  const reactions = await Reaction.find(filter)
    .select('_id user createdAt')
    .populate('user', 'firstName lastName profilePicture')
    .sort({ createdAt: -1, _id: -1 })
    .limit(pagination.limit + 1)
    .lean();

  const hasNextPage = reactions.length > pagination.limit;
  const pageReactions = hasNextPage ? reactions.slice(0, pagination.limit) : reactions;

  const nextCursor = hasNextPage
    ? encodeCursor({
        createdAt: pageReactions[pageReactions.length - 1]!.createdAt!.getTime(),
        id: pageReactions[pageReactions.length - 1]!._id.toString(),
      })
    : null;

  return {
    meta: {
      limit: pagination.limit,
      hasNextPage,
      nextCursor,
    },
    reactions: pageReactions,
  };
};

export const reactionServices = {
  addReactionIntoDB,
  getReactionsByTargetFromDB,
  removeReactionFromDB,
};
