/**
 * Bravvo OS API - Entry Point
 * Arquitetura: Controller → Service → Repository (Prisma)
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

// Boot validation & Configs
import { validateEnv, getEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { setupSwagger } from './config/swagger.js';

// Define variáveis globais verificadas
validateEnv();

// Routes
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import workspacesRoutes from './routes/workspaces.routes.js';

// Middleware
import { errorHandler, globalRateLimit } from './middleware/index.js';

const app = express();
const env = getEnv();
const PORT = env.PORT || 3001;

// Security & Basic Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// HTTP Logging using Pino
app.use(pinoHttp({ logger }));

// Global Rate Limiting
app.use(globalRateLimit);

// CORS
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sem origin (ex: Postman ou server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Correlation-Id']
}));

app.use(express.json({ limit: '10mb' }));

// Health & Info
app.get('/', (req, res) => {
    res.json({
        message: 'Bravvo OS API',
        status: 'active',
        version: '1.0.0',
        ai_orchestration: 'enabled',
        architecture: 'Controller → Service → Repository'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Swagger UI Documentation
setupSwagger(app);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);
app.use('/api/v1/ai', aiRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`✅ API running on port ${PORT}`);
    logger.info(`🤖 AI Orchestration endpoints available at /ai`);
    logger.info(`🏗️ Architecture: Controller → Service → Repository`);
});
