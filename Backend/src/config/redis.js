/**
 * Redis Client Configuration
 * 
 * Conecta ao Railway Redis em produção (via REDIS_URL).
 * Em desenvolvimento local, usa fallback gracioso (NodeCache).
 */
import Redis from 'ioredis';
import { logger } from './logger.js';

let redis = null;

export function getRedisClient() {
    if (redis) return redis;

    const url = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
    if (!url) {
        logger.warn('REDIS_URL não configurado. Cache de IA rodando em memória (NodeCache).');
        return null;
    }

    redis = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 5) return null; // Stop retrying after 5 attempts
            return Math.min(times * 100, 3000);
        },
        lazyConnect: true,
    });

    redis.on('connect', () => logger.info('✅ Redis conectado'));
    redis.on('error', (err) => logger.warn({ err }, '⚠️ Redis error (fallback para in-memory)'));

    return redis;
}

/**
 * Cache abstraction - usa Redis se disponível, senão retorna null
 * para o caller usar NodeCache como fallback.
 */
export const redisCache = {
    async get(key) {
        const client = getRedisClient();
        if (!client) return null;
        try {
            const val = await client.get(key);
            return val ? JSON.parse(val) : null;
        } catch {
            return null;
        }
    },

    async set(key, value, ttlSeconds = 7200) {
        const client = getRedisClient();
        if (!client) return false;
        try {
            await client.setex(key, ttlSeconds, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    async del(key) {
        const client = getRedisClient();
        if (!client) return;
        try {
            await client.del(key);
        } catch {
            // silently ignore
        }
    }
};
