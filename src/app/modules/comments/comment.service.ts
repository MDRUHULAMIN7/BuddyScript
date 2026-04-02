import mongoose from 'mongoose';
import AppError from '../../errors/AppError.js';
import { Post } from '../posts/post.model.js';
import { Comment } from './comment.model.js';
import { Reaction } from '../reactions/reaction.model.js';
import { decodeCursor, encodeCursor } from '../../utils/cursor.js';

const createCommentIntoDB = async (
  userId: string,
  payload: {
    content: string;
    parentCommentId?: string;
    postId: string;
  },
) => {
  const session = await mongoose.startSession();
  let commentId: string | undefined;

  try {
    await session.withTransaction(async () => {
      const post = await Post.findById(payload.postId).session(session);

      if (!post) {
        throw new AppError(404, 'Post not found.');
      }

      if (post.visibility === 'private' && post.author.toString() !== userId) {
        throw new AppError(403, 'You are not allowed to comment on this post.');
      }

      if (payload.parentCommentId) {
        const parentComment = await Comment.findOne({
          _id: payload.parentCommentId,
          post: payload.postId,
        }).session(session);

        if (!parentComment) {
          throw new AppError(404, 'Parent comment not found.');
        }

        await Comment.updateOne(
          { _id: payload.parentCommentId },
          { $inc: { replyCount: 1 } },
          { session },
        );
      }

      const comment = await Comment.create(
        [
          {
            author: userId,
            content: payload.content,
            parentComment: payload.parentCommentId,
            post: payload.postId,
          },
        ],
        { session },
      );

      commentId = comment[0]._id.toString();

      await Post.updateOne(
        { _id: payload.postId },
        { $inc: { commentCount: 1 } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return Comment.findById(commentId).populate('author', 'firstName lastName email profilePicture');
};

const getCommentsByPostFromDB = async (
  userId: string,
  params: {
    postId: string;
    limit: number;
    cursor?: string;
    // If set, fetch replies for that parent comment id.
    // If omitted, fetch top-level comments (parentComment = null).
    parentCommentId?: string;
  },
) => {
  const { postId } = params;
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  if (post.visibility === 'private' && post.author.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to access this post comments.');
  }

  const parentCommentFilter = params.parentCommentId
    ? new mongoose.Types.ObjectId(params.parentCommentId)
    : null;

  const baseFilter = {
    post: postId,
    parentComment: parentCommentFilter,
  };

  const attachLikedByMe = async (
    comments: Array<{ _id: mongoose.Types.ObjectId }>,
  ) => {
    if (comments.length === 0) return comments;

    const commentIds = comments.map((c) => c._id.toString());
    const reactions = await Reaction.find({
      user: userId,
      targetType: 'comment',
      targetId: { $in: commentIds },
    })
      .select('targetId')
      .lean();

    const likedSet = new Set(reactions.map((r) => r.targetId.toString()));

    return comments.map((c) => ({
      ...c,
      likedByMe: likedSet.has(c._id.toString()),
    }));
  };

  // Cursor pagination uses createdAt + _id for stable ordering.
  const limit = params.limit;
  const getCursorPage = async () => {
    const filter = params.cursor
      ? (() => {
          const decoded = decodeCursor(params.cursor!);
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

    // Newest-first for a consistent UX with the feed.
    const comments = await Comment.find(filter)
      .populate('author', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasNextPage = comments.length > limit;
    const pageComments = hasNextPage ? comments.slice(0, limit) : comments;
    const pageCommentsWithLikes = await attachLikedByMe(pageComments as any);

    const nextCursor = hasNextPage
      ? encodeCursor({
          createdAt: pageComments[pageComments.length - 1]!.createdAt!.getTime(),
          id: pageComments[pageComments.length - 1]!._id.toString(),
        })
      : null;

    return {
      meta: {
        limit,
        hasNextPage,
        nextCursor,
      },
      comments: pageCommentsWithLikes,
    };
  };

  return getCursorPage();
};

export const commentServices = {
  createCommentIntoDB,
  getCommentsByPostFromDB,
};
