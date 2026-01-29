const express = require('express');
const path = require('path');

const app = express();

// Railway injects PORT dynamically - we MUST use it
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting server...');
console.log(`📍 PORT: ${PORT}`);

// Health check endpoint for Railway - MUST be first!
app.get('/health', (req, res) => {
    console.log('✅ Healthcheck hit');
    res.status(200).json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: return index.html for any unknown route
app.get('*', (req, res) => {
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
