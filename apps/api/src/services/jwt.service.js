/**
 * JWT Service - Geração e verificação de tokens JWT reais
 */
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export const jwtService = {
    /**
     * Gera um access token para o usuário (curta duração: default 7d)
     */
    sign(payload) {
        const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    /**
     * Gera um refresh token de longa duração (30 dias)
     * Inclui type:'refresh' para diferenciar de access tokens.
     */
    signRefreshToken(payload) {
        const { JWT_SECRET } = getEnv();
        return jwt.sign(
            { sub: payload.sub, username: payload.username, role: payload.role, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
    },

    /**
     * Verifica e decodifica um access token
     * @returns {Object|null} payload decodificado ou null se inválido
     */
    verify(token) {
        try {
            const { JWT_SECRET } = getEnv();
            const payload = jwt.verify(token, JWT_SECRET);
            // Reject refresh tokens used as access tokens
            if (payload.type === 'refresh') return null;
            return payload;
        } catch {
            return null;
        }
    },

    /**
     * Verifica e decodifica um refresh token
     * @returns {Object|null}
     */
    verifyRefreshToken(token) {
        try {
            const { JWT_SECRET } = getEnv();
            const payload = jwt.verify(token, JWT_SECRET);
            if (payload.type !== 'refresh') return null;
            return payload;
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

