/**
 * Auth Routes - /api/auth
 * Controller → Service → Repository
 */
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', authController.login);

export default router;
