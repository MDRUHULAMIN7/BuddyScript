import mongoose, { type ClientSession } from 'mongoose';
import AppError from '../../errors/AppError.js';
import { Comment } from '../comments/comment.model.js';
import { Post } from '../posts/post.model.js';
import { Reaction } from './reaction.model.js';

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

const toggleReactionIntoDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
) => {
  const session = await mongoose.startSession();
  let liked = false;

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

      if (deletedReaction) {
        await updateTargetReactionCount(payload.targetType, payload.targetId, -1, session);
        liked = false;
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
      liked = true;
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
    liked,
  };
};

const getReactionsByTargetFromDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
) => {
  await resolveTarget(userId, payload.targetType, payload.targetId);

  return Reaction.find({
    targetId: payload.targetId,
    targetType: payload.targetType,
  })
    .populate('user', 'firstName lastName email profilePicture')
    .sort({ createdAt: -1 });
};

export const reactionServices = {
  getReactionsByTargetFromDB,
  toggleReactionIntoDB,
};
