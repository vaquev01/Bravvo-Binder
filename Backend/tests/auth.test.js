/**
 * Integration Tests — Auth API
 * Cobre fluxos críticos de autenticação: login, logout, token inválido.
 * 
 * Run: node --test Backend/tests/auth.test.js  (Node.js 20+)
 */

import { strict as assert } from 'node:assert';
import { test, describe, before, after } from 'node:test';

const BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function post(path, body = {}, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    return { status: res.status, body: await res.json() };
}

async function get(path, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    return { status: res.status, body: await res.json() };
}

describe('POST /auth/login', () => {
    test('returns 200 and JWT for valid credentials', async () => {
        const { status, body } = await post('/auth/login', {
            username: 'admin@wardogs.com',
            password: 'wardogs'
        });
        assert.equal(status, 200);
        assert.equal(body.status, 'ok');
        assert.ok(body.token, 'should return a JWT token');
        assert.ok(body.user?.id, 'should return user with id');
    });

    test('returns 401 for wrong password', async () => {
        const { status, body } = await post('/auth/login', {
            username: 'admin@wardogs.com',
            password: 'wrong_password'
        });
        assert.equal(status, 401);
        assert.ok(body.error);
    });

    test('returns 401 for non-existent user', async () => {
        const { status } = await post('/auth/login', {
            username: 'nobody@example.com',
            password: 'irrelevant'
        });
        assert.equal(status, 401);
    });

    test('enforces rate limit after 10+ fast logins', async () => {
        const requests = Array.from({ length: 11 }, () =>
            post('/auth/login', { username: 'x', password: 'y' })
        );
        const results = await Promise.all(requests);
        const hitLimit = results.some(r => r.status === 429);
        assert.ok(hitLimit, 'rate limit should trigger on 11+ rapid attempts');
    });
});

describe('GET /auth/me', () => {
    let token;

    before(async () => {
        const { body } = await post('/auth/login', {
            username: 'admin@wardogs.com',
            password: 'wardogs'
        });
        token = body.token;
    });

    test('returns 200 with valid token', async () => {
        const { status, body } = await get('/auth/me', token);
        assert.equal(status, 200);
        assert.ok(body.user);
    });

    test('returns 401 without token', async () => {
        const { status } = await get('/auth/me');
        assert.equal(status, 401);
    });

    test('returns 401 with malformed token', async () => {
        const { status } = await get('/auth/me', 'not.a.valid.token');
        assert.equal(status, 401);
    });
});

describe('POST /auth/logout', () => {
    let token;

    before(async () => {
        const { body } = await post('/auth/login', {
            username: 'admin@wardogs.com',
            password: 'wardogs'
        });
        token = body.token;
    });

    test('returns 200 on logout', async () => {
        const { status, body } = await post('/auth/logout', {}, token);
        assert.equal(status, 200);
        assert.equal(body.status, 'ok');
    });

    test('token is blacklisted after logout', async () => {
        const { status } = await get('/auth/me', token);
        assert.equal(status, 401, 'should reject revoked token');
    });
});

describe('GET /health', () => {
    test('returns 200 with status ok', async () => {
        const { status, body } = await get('/health');
        assert.equal(status, 200);
        assert.equal(body.status, 'ok');
    });
});
