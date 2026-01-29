// Simple Express server for Railway (ES Modules)
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== BRAVVO SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT from env:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;
console.log('Using PORT:', PORT);

// Health check - FIRST
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from dist
const distPath = path.join(__dirname, 'dist');
console.log('Serving from:', distPath);

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // SPA fallback (avoid app.get('*') issues on Express 5)
    app.use((req, res, next) => {
        if (req.method !== 'GET') return next();
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log('WARNING: dist folder not found!');
    app.use((req, res) => {
        res.status(500).send('Build folder not found');
    });
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Health check available at http://0.0.0.0:${PORT}/health`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
