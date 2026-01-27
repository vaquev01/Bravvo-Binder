import { defineConfig, devices } from '@playwright/test';

const PW_HOST = '127.0.0.1';
if (!process.env.PW_PORT) {
    process.env.PW_PORT = process.env.CI
        ? '4174'
        : String(40000 + Math.floor(Math.random() * 10000));
}
const PW_PORT = parseInt(process.env.PW_PORT, 10);
const PW_BASE_PATH = (() => {
    const raw = process.env.PW_BASE_PATH || '/';
    const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
    return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
})();
const PW_BASE_URL = `http://${PW_HOST}:${PW_PORT}${PW_BASE_PATH}`;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html']],
    use: {
        baseURL: PW_BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] }
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] }
        }
    ],
    webServer: {
        command: `VITE_BASE=${PW_BASE_PATH} npm run build && VITE_BASE=${PW_BASE_PATH} npx vite preview --host ${PW_HOST} --port ${PW_PORT} --strictPort`,
        url: PW_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
