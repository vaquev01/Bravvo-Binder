import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password, remember } = req.body;

        // Mock fallback for now until user is seeded
        if (username === 'bravvo' && password === '1@Wardogs') {
            return res.json({
                status: 'ok',
                role: 'agency',
                token: 'mock-jwt-token-for-dev',
                user: { username: 'bravvo', role: 'agency' }
            });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Ideally generate a JWT here
        res.json({
            status: 'ok',
            role: user.role,
            token: `mock-jwt-token-user-${user.id}`,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
