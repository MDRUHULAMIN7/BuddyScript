import AppError from '../../errors/AppError.js';
import { Post } from '../posts/post.model.js';
import { Comment } from './comment.model.js';

const createCommentIntoDB = async (
  userId: string,
  payload: {
    content: string;
    parentCommentId?: string;
    postId: string;
  },
) => {
  const post = await Post.findById(payload.postId);

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
    });

    if (!parentComment) {
      throw new AppError(404, 'Parent comment not found.');
    }
  }

  const comment = await Comment.create({
    author: userId,
    content: payload.content,
    parentComment: payload.parentCommentId,
    post: payload.postId,
  });

  await Post.findByIdAndUpdate(payload.postId, {
    $inc: { commentCount: 1 },
  });

  if (payload.parentCommentId) {
    await Comment.findByIdAndUpdate(payload.parentCommentId, {
      $inc: { replyCount: 1 },
    });
  }

  return Comment.findById(comment._id).populate('author', 'firstName lastName email profilePicture');
};

const getCommentsByPostFromDB = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  if (post.visibility === 'private' && post.author.toString() !== userId) {
    throw new AppError(403, 'You are not allowed to access this post comments.');
  }

  return Comment.find({ post: postId })
    .populate('author', 'firstName lastName email profilePicture')
    .sort({ createdAt: 1 });
};

export const commentServices = {
  createCommentIntoDB,
  getCommentsByPostFromDB,
};
