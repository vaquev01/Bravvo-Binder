// Ultra-simple server with aggressive error handling
console.log('=== SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('CWD:', process.cwd());
console.log('PORT env:', process.env.PORT);

try {
    const express = require('express');
    console.log('Express loaded OK');

    const path = require('path');
    console.log('Path loaded OK');

    const app = express();
    const PORT = process.env.PORT || 8080;

    console.log('Using PORT:', PORT);

    // Health check - FIRST route
    app.get('/health', (req, res) => {
        console.log('Health check hit!');
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Check if dist exists
    const distPath = path.join(__dirname, 'dist');
    const fs = require('fs');
    if (fs.existsSync(distPath)) {
        console.log('dist folder exists');
        console.log('dist contents:', fs.readdirSync(distPath));
    } else {
        console.log('WARNING: dist folder does NOT exist!');
    }

    // Serve static files
    app.use(express.static(distPath));

    // SPA fallback
    app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('index.html not found');
        }
    });

    // Start server
    app.listen(parseInt(PORT), '0.0.0.0', () => {
        console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
        console.log(`✅ Health: http://0.0.0.0:${PORT}/health`);
    }).on('error', (err) => {
        console.error('Server listen error:', err);
        process.exit(1);
    });

} catch (err) {
    console.error('FATAL ERROR:', err);
    process.exit(1);
}
