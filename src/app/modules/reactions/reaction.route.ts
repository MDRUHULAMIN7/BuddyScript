import express from 'express';
import auth from '../../middlewares/auth.js';
import { reactionControllers } from './reaction.controller.js';

const router = express.Router();

router.use(auth);
router.post('/toggle', reactionControllers.toggleReaction);
router.get('/', reactionControllers.getReactionsByTarget);

export const ReactionRoutes = router;
