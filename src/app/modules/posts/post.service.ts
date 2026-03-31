import AppError from '../../errors/AppError.js';
import { User } from '../users/user.model.js';
import { Post } from './post.model.js';

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
  pagination: { limit: number; page: number },
) => {
  const skip = (pagination.page - 1) * pagination.limit;
  const filter = {
    $or: [{ visibility: 'public' }, { author: userId }],
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit),
    Post.countDocuments(filter),
  ]);

  return {
    meta: {
      limit: pagination.limit,
      page: pagination.page,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
    posts,
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

  return post;
};

export const postServices = {
  createPostIntoDB,
  getFeedFromDB,
  getSinglePostFromDB,
};
