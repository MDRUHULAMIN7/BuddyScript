import express from 'express';
import auth from '../../middlewares/auth.js';
import { postControllers } from './post.controller.js';
import { uploadPostImage } from '../../middlewares/uploadPostImage.js';

const router = express.Router();

router.use(auth);
// `image` is a multipart/form-data field name.
router.post('/', uploadPostImage.single('image'), postControllers.createPost);
router.get('/', postControllers.getFeed);
router.get('/:postId', postControllers.getSinglePost);

export const PostRoutes = router;
