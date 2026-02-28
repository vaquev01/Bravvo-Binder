/**
 * Auth Service - Lógica de autenticação
 * Controller → Service → Repository
 */
import { userRepository } from '../repositories/user.repository.js';

export const authService = {
    /**
     * Autentica um usuário
     * @param {string} username
     * @param {string} password
     * @returns {Object} - { success, user, token, error }
     */
    async login(username, password) {
        // Mock fallback for dev
        if (username === 'bravvo' && password === '1@Wardogs') {
            return {
                success: true,
                user: { username: 'bravvo', role: 'agency' },
                token: 'mock-jwt-token-for-dev'
            };
        }

        const user = await userRepository.findByUsername(username);

        if (!user || user.password !== password) {
            return { success: false, error: 'Credenciais inválidas' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            token: `mock-jwt-token-user-${user.id}`
        };
    }
};
