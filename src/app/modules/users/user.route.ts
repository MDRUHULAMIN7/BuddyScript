import express from 'express';
import auth from '../../middlewares/auth.js';
import { userControllers } from './user.controller.js';

const router = express.Router();

router.get('/me', auth, userControllers.getMyProfile);
router.patch('/me', auth, userControllers.updateMyProfile);

export const UserRoutes = router;
