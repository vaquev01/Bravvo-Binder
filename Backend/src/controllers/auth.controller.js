/**
 * Auth Controller - Camada HTTP para autenticação
 * Responsabilidade: validar input, chamar service, formatar resposta
 */
import { authService } from '../services/auth.service.js';

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

            res.json({
                status: 'ok',
                role: result.user.role,
                token: result.token,
                user: result.user
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
