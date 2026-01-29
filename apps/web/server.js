// Simple Express server for Railway (ES Modules)
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== BRAVVO SERVER STARTING ===');

const app = express();
const PORT = process.env.PORT || 3000;

// Health check - FIRST
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from dist
const distPath = path.join(__dirname, 'dist');
console.log('Serving from:', distPath);

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    // SPA fallback
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
