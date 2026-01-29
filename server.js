// Root server for Railway deployment (serves the web frontend)
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== BRAVVO SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('PORT from env:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check - FIRST
app.get('/health', (req, res) => {
    console.log('Health check hit');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from apps/web/dist
const distPath = path.join(__dirname, 'apps', 'web', 'dist');
console.log('Serving from:', distPath);

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log('WARNING: dist folder not found!');
    app.get('*', (req, res) => {
        res.status(500).send('Build folder not found');
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
