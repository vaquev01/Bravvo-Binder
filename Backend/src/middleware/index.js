/**
 * Middleware compartilhado do Backend
 */
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { jwtService } from '../services/jwt.service.js';
import { logger } from '../config/logger.js';

// In-memory JWT blacklist for logout revocation (cleared on restart)
// For persistence across restarts, migrate to Redis or DB
const tokenBlacklist = new Set();

/**
 * Adiciona correlationId ao request
 */
export function addMetadata(req, res, next) {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.userId = req.headers['x-user-id'] || 'anonymous';
    next();
}

/**
 * Autenticação JWT obrigatória
 */
export function requireAuth(req, res, next) {
    const token = jwtService.extractFromHeader(req.headers.authorization);

    if (!token) {
        return res.status(401).json({ error: 'Token de autenticação obrigatório' });
    }

    // Check blacklist (logout)
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Sess\u00e3o encerrada. Fa\u00e7a login novamente.' });
    }

    const payload = jwtService.verify(token);
    if (!payload) {
        return res.status(401).json({ error: 'Token inv\u00e1lido ou expirado' });
    }

    req.user = payload;
    req.userId = payload.sub;
    req.authToken = token; // Store for potential logout
    next();
}

/**
 * Revoga um token (logout) adicionando à blacklist
 */
export function revokeToken(token) {
    if (token) tokenBlacklist.add(token);
}

/**
 * Autenticação JWT opcional (não bloqueia, mas preenche req.user se tiver token)
 */
export function optionalAuth(req, res, next) {
    const token = jwtService.extractFromHeader(req.headers.authorization);
    if (token) {
        const payload = jwtService.verify(token);
        if (payload) {
            req.user = payload;
            req.userId = payload.sub;
        }
    }
    next();
}

/**
 * Rate limiter global
 */
export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ipAddress: false },
    message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

/**
 * Rate limiter para endpoints de IA (mais restritivo — custoso e caro)
 * Usa o ID do usuário autenticado para quota por conta, não por IP
 */
export const aiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ipAddress: false },
    message: { error: 'Limite de geração de IA atingido. Aguarde 1 minuto.' },
    keyGenerator: (req) => req.user?.sub || req.userId || 'unknown',
});

/**
 * Rate limiter para auth (anti-brute-force)
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    validate: { ipAddress: false },
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

/**
 * Error handler global
 */
export function errorHandler(err, req, res, next) {
    logger.error({ err, correlationId: req.correlationId }, 'Unhandled error');
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
}
