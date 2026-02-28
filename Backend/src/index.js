/**
 * Bravvo OS API - Entry Point
 * Arquitetura: Controller → Service → Repository (Prisma)
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import workspacesRoutes from './routes/workspaces.routes.js';

// Middleware
import { errorHandler } from './middleware/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: true,
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

// Routes
app.use('/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspacesRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`✅ API running on port ${PORT}`);
    console.log(`🤖 AI Orchestration endpoints available at /ai`);
    console.log(`🏗️ Architecture: Controller → Service → Repository`);
});
