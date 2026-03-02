/**
 * Logger - Structured logging com pino
 * Substitui console.log por logs JSON estruturados.
 */
import pino from 'pino';

export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    base: { service: 'bravvo-api' },
    timestamp: pino.stdTimeFunctions.isoTime,
});
