/**
 * Env Validator - Valida variáveis de ambiente obrigatórias no boot
 * Falha rápido se variáveis críticas estiverem faltando.
 */
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),

    // Auth
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter ao menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // AI
    OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY inválida'),
    AI_MODEL: z.string().default('gpt-4o'),

    // Database (opcional em dev se não usar Prisma em cloud)
    DATABASE_URL: z.string().url().optional(),

    // CORS
    ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
});

let _env = null;

export function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const errors = result.error.errors.map(e => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
        console.error('❌ Variáveis de ambiente inválidas:\n' + errors);
        process.exit(1);
    }

    _env = result.data;
    return _env;
}

export function getEnv() {
    if (!_env) return validateEnv();
    return _env;
}
