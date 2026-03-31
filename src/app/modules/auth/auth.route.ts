import express from 'express';
import { authControllers } from './auth.controller.js';

const router = express.Router();

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);

export const AuthRoutes = router;
