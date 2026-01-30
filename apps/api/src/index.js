import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// AI Routes
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Allow all origins in production for now
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Correlation-Id']
}));
app.use(express.json({ limit: '10mb' })); // Increased for large vault data

app.get('/', (req, res) => {
    res.json({
        message: 'Bravvo OS API',
        status: 'active',
        version: '1.0.0',
        ai_orchestration: 'enabled'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Orchestration Routes
app.use('/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ API running on port ${PORT}`);
    console.log(`🤖 AI Orchestration endpoints available at /ai`);
});
