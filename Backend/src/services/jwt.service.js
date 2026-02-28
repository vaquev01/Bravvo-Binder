/**
 * JWT Service - Geração e verificação de tokens JWT reais
 */
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export const jwtService = {
    /**
     * Gera um access token para o usuário
     */
    sign(payload) {
        const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    /**
     * Verifica e decodifica um token
     * @returns {Object|null} payload decodificado ou null se inválido
     */
    verify(token) {
        try {
            const { JWT_SECRET } = getEnv();
            return jwt.verify(token, JWT_SECRET);
        } catch {
            return null;
        }
    },

    /**
     * Extrai o token do header Authorization: Bearer <token>
     */
    extractFromHeader(authHeader) {
        if (!authHeader?.startsWith('Bearer ')) return null;
        return authHeader.slice(7);
    }
};
