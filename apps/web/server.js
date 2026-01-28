import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Railway injects PORT dynamically - we MUST use it
const PORT = process.env.PORT;
if (!PORT) {
    console.error('❌ ERROR: PORT environment variable is not set.');
    console.error('   This application requires the PORT env var to be set by Railway.');
    console.error('   For local testing, run: PORT=3000 node server.js');
    process.exit(1);
}

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: return index.html for any unknown route
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server - binding to 0.0.0.0 is critical for Railway
const server = app.listen(parseInt(PORT), '0.0.0.0', () => {
    console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
    console.log(`📍 Health check available at: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});
