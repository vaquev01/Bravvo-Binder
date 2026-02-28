/**
 * Auth Routes - /api/auth
 */
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, authRateLimit, revokeToken } from '../middleware/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Agency and Client authentication endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Unauthorized
 */
router.post('/login', authRateLimit, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [agency, client, admin]
 *                 default: client
 *     responses:
 *       201:
 *         description: Successfully registered
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
router.post('/register', authRateLimit, authController.register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Valid token, user profile returned
 *       401:
 *         description: Invalid or missing token
 */
router.get('/me', requireAuth, authController.me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out and revoke the current JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Token missing or already revoked
 */
router.post('/logout', requireAuth, (req, res) => {
    revokeToken(req.authToken);
    res.json({ status: 'ok', message: 'Sess\u00e3o encerrada com sucesso.' });
});

export default router;
