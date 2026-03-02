/**
 * Auth Controller - Login e Register
 */
import { authService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

export const authController = {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'username e password são obrigatórios' });
            }

            const result = await authService.login(username, password);

            if (!result.success) {
                return res.status(401).json({ error: result.error });
            }

            logger.info({ username, role: result.user.role }, 'User logged in');

            res.json({
                status: 'ok',
                role: result.user.role,
                token: result.token,
                user: result.user
            });
        } catch (error) {
            logger.error({ error }, 'Login error');
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async register(req, res) {
        try {
            const { username, password, role } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'username e password são obrigatórios' });
            }

            const result = await authService.register(username, password, role);

            if (!result.success) {
                return res.status(409).json({ error: result.error });
            }

            logger.info({ username, role: result.user.role }, 'User registered');

            res.status(201).json({
                status: 'ok',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            logger.error({ error }, 'Register error');
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async me(req, res) {
        res.json({ user: req.user });
    }
};
