import express from 'express';
import auth from '../../middlewares/auth.js';
import { reactionControllers } from './reaction.controller.js';

const router = express.Router();

router.use(auth);
router.put('/:targetType/:targetId', reactionControllers.likeReaction);
router.delete('/:targetType/:targetId', reactionControllers.unlikeReaction);
router.get('/:targetType/:targetId', reactionControllers.getReactionsByTarget);

export const ReactionRoutes = router;
