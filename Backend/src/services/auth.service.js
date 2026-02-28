/**
 * Auth Service - Lógica de autenticação com bcrypt + JWT reais
 * Controller → Service → Repository
 */
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { jwtService } from './jwt.service.js';

export const authService = {
    /**
     * Autentica um usuário
     * @returns {{ success, user, token, error }}
     */
    async login(username, password) {
        const user = await userRepository.findByUsername(username);

        if (!user) {
            return { success: false, error: 'Credenciais inválidas' };
        }

        // Verifica senha com bcrypt
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { success: false, error: 'Credenciais inválidas' };
        }

        const payload = { sub: user.id, username: user.username, role: user.role };
        const token = jwtService.sign(payload);

        return {
            success: true,
            user: { id: user.id, username: user.username, role: user.role },
            token
        };
    },

    /**
     * Registra um novo usuário
     */
    async register(username, password, role = 'client') {
        const existing = await userRepository.findByUsername(username);
        if (existing) {
            return { success: false, error: 'Username já em uso' };
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await userRepository.create({ username, password: hashed, role });

        const payload = { sub: user.id, username: user.username, role: user.role };
        const token = jwtService.sign(payload);

        return {
            success: true,
            user: { id: user.id, username: user.username, role: user.role },
            token
        };
    }
};
