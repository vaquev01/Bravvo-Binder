/**
 * Auth Routes - /api/auth
 */
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, authRateLimit } from '../middleware/index.js';

const router = Router();

router.post('/login', authRateLimit, authController.login);
router.post('/register', authRateLimit, authController.register);
router.get('/me', requireAuth, authController.me);

export default router;
