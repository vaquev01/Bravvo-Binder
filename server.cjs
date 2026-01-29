const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('=== BRAVVO ROOT SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('PORT from env:', process.env.PORT);

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'apps', 'web', 'dist');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, body) {
    const payload = JSON.stringify(body);
    res.writeHead(statusCode, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload)
    });
    res.end(payload);
}

function safeResolve(baseDir, urlPath) {
    const decoded = decodeURIComponent(urlPath);
    const normalized = path.posix.normalize(decoded).replace(/^\/+/, '');
    const resolved = path.join(baseDir, normalized);
    if (!resolved.startsWith(baseDir)) return null;
    return resolved;
}

const server = http.createServer((req, res) => {
    try {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

        if (url.pathname === '/health') {
            return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
        }

        if (!fs.existsSync(distPath)) {
            return sendJson(res, 500, { error: 'dist folder not found', expected: distPath });
        }

        let pathname = url.pathname;
        if (pathname === '/') pathname = '/index.html';

        const hasExtension = path.posix.basename(pathname).includes('.');
        let filePath = safeResolve(distPath, pathname);

        if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'content-type': mimeTypes[ext] || 'application/octet-stream' });
            return fs.createReadStream(filePath).pipe(res);
        }

        // SPA fallback: if route doesn't look like a file, serve index.html
        if (!hasExtension) {
            const indexPath = path.join(distPath, 'index.html');
            res.writeHead(200, { 'content-type': mimeTypes['.html'] });
            return fs.createReadStream(indexPath).pipe(res);
        }

        return sendJson(res, 404, { error: 'not found' });
    } catch (err) {
        console.error('Request error:', err);
        return sendJson(res, 500, { error: 'internal error' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Listening on 0.0.0.0:${PORT}`);
    console.log(`✅ Healthcheck: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});
