import express from 'express';
import { authControllers } from './auth.controller.js';

const router = express.Router();

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);
router.post('/logout', authControllers.logout);

export const AuthRoutes = router;
