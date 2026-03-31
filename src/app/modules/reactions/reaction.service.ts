import AppError from '../../errors/AppError.js';
import { Comment } from '../comments/comment.model.js';
import { Post } from '../posts/post.model.js';
import { Reaction } from './reaction.model.js';

const resolveTarget = async (
  userId: string,
  targetType: 'comment' | 'post',
  targetId: string,
) => {
  if (targetType === 'post') {
    const post = await Post.findById(targetId);

    if (!post) {
      throw new AppError(404, 'Post not found.');
    }

    if (post.visibility === 'private' && post.author.toString() !== userId) {
      throw new AppError(403, 'You are not allowed to react to this post.');
    }

    return post;
  }

  const comment = await Comment.findById(targetId).populate('post');

  if (!comment) {
    throw new AppError(404, 'Comment not found.');
  }

  const post = comment.post as unknown as { author: { toString(): string }; visibility: string };

  if (post.visibility === 'private' && post.author.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to react to this comment.');
  }

  return comment;
};

const toggleReactionIntoDB = async (
  userId: string,
  payload: { targetId: string; targetType: 'comment' | 'post' },
) => {
  await resolveTarget(userId, payload.targetType, payload.targetId);

  const existingReaction = await Reaction.findOne({
    targetId: payload.targetId,
    targetType: payload.targetType,
    user: userId,
  });

  if (existingReaction) {
    await existingReaction.deleteOne();

    if (payload.targetType === 'post') {
      await Post.findByIdAndUpdate(payload.targetId, {
        $inc: { reactionCount: -1 },
      });
    } else {
      await Comment.findByIdAndUpdate(payload.targetId, {
        $inc: { reactionCount: -1 },
      });
    }

    return {
      liked: false,
    };
  }

  await Reaction.create({
    targetId: payload.targetId,
    targetType: payload.targetType,
    user: userId,
  });

  if (payload.targetType === 'post') {
    await Post.findByIdAndUpdate(payload.targetId, {
      $inc: { reactionCount: 1 },
    });
  } else {
    await Comment.findByIdAndUpdate(payload.targetId, {
      $inc: { reactionCount: 1 },
    });
  }

  return {
    liked: true,
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
