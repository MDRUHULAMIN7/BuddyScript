import express from 'express';
import auth from '../../middlewares/auth.js';
import { postControllers } from './post.controller.js';

const router = express.Router();

router.use(auth);
router.post('/', postControllers.createPost);
router.get('/', postControllers.getFeed);
router.get('/:postId', postControllers.getSinglePost);

export const PostRoutes = router;
