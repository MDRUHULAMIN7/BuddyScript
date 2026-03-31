import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { UserRoutes } from '../modules/users/user.route.js';
import { PostRoutes } from '../modules/posts/post.route.js';
import { CommentRoutes } from '../modules/comments/comment.route.js';
import { ReactionRoutes } from '../modules/reactions/reaction.route.js';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/posts', route: PostRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/reactions', route: ReactionRoutes },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
