import AppError from '../../errors/AppError.js';
import { User } from '../users/user.model.js';
import { Post } from './post.model.js';
import mongoose from 'mongoose';
import { decodeCursor, encodeCursor } from '../../utils/cursor.js';
import { Reaction } from '../reactions/reaction.model.js';

const createPostIntoDB = async (
  userId: string,
  payload: {
    text?: string;
    imageUrl?: string;
    visibility: 'private' | 'public';
  },
) => {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(404, 'User not found.');
  }

  const post = await Post.create({
    author: user._id,
    imageUrl: payload.imageUrl,
    text: payload.text,
    visibility: payload.visibility,
  });

  return Post.findById(post._id).populate('author', 'firstName lastName email profilePicture');
};

const getFeedFromDB = async (
  userId: string,
  pagination: { limit: number; cursor?: string; page?: number },
) => {
  const baseFilter = { $or: [{ visibility: 'public' }, { author: userId }] };

  const attachLikedByMe = async (posts: Array<{ _id: unknown }>) => {
    if (posts.length === 0) return posts;

    const postIds = posts.map((p) => (p._id as mongoose.Types.ObjectId).toString());
    const reactions = await Reaction.find({
      user: userId,
      targetType: 'post',
      targetId: { $in: postIds },
    })
      .select('targetId')
      .lean();

    const likedSet = new Set(reactions.map((r) => r.targetId.toString()));

    return posts.map((p) => ({
      ...p,
      likedByMe: likedSet.has((p._id as mongoose.Types.ObjectId).toString()),
    }));
  };

  // Cursor-based pagination: fast even for deep pages.
  const getCursorPage = async (cursor?: string) => {
    const filter = cursor
      ? (() => {
          const decoded = decodeCursor(cursor);
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

    const posts = await Post.find(filter)
      .populate('author', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1, _id: -1 })
      .limit(pagination.limit + 1)
      .lean();

    const hasNextPage = posts.length > pagination.limit;
    const pagePosts = hasNextPage ? posts.slice(0, pagination.limit) : posts;

    const postsWithLikes = await attachLikedByMe(pagePosts);

    const nextCursor = hasNextPage
      ? encodeCursor({
          createdAt: pagePosts[pagePosts.length - 1]!.createdAt!.getTime(),
          id: pagePosts[pagePosts.length - 1]!._id.toString(),
        })
      : null;

    return {
      meta: {
        limit: pagination.limit,
        hasNextPage,
        nextCursor,
      },
      posts: postsWithLikes,
    };
  };

  // Prefer cursor pagination; fall back to legacy skip/limit for older clients.
  if (pagination.cursor) {
    return getCursorPage(pagination.cursor);
  }

  const page = pagination.page ?? 1;
  if (page === 1) {
    return getCursorPage(undefined);
  }

  const skip = (page - 1) * pagination.limit;
  const [posts, total] = await Promise.all([
    Post.find(baseFilter)
      .populate('author', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    Post.countDocuments(baseFilter),
  ]);

  const postsWithLikes = await attachLikedByMe(posts);

  return {
    meta: {
      limit: pagination.limit,
      page,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
    posts: postsWithLikes,
  };
};

const getSinglePostFromDB = async (userId: string, postId: string) => {
  const post = await Post.findById(postId).populate(
    'author',
    'firstName lastName email profilePicture',
  );

  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  if (post.visibility === 'private' && post.author._id.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to access this post.');
  }

  const liked = await Reaction.exists({
    user: userId,
    targetType: 'post',
    targetId: post._id,
  });

  return {
    ...post.toObject(),
    likedByMe: Boolean(liked),
  };
};

export const postServices = {
  createPostIntoDB,
  getFeedFromDB,
  getSinglePostFromDB,
};
