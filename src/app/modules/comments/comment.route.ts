import express from 'express';
import auth from '../../middlewares/auth.js';
import { commentControllers } from './comment.controller.js';

const router = express.Router();

router.use(auth);
router.post('/', commentControllers.createComment);
router.get('/', commentControllers.getCommentsByPost);

export const CommentRoutes = router;
