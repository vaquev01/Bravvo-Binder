/**
 * Middleware compartilhado do Backend
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Adiciona correlationId e userId ao request
 */
export function addMetadata(req, res, next) {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.userId = req.headers['x-user-id'] || 'anonymous';
    next();
}

/**
 * Error handler global
 */
export function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message,
        timestamp: new Date().toISOString()
    });
}
