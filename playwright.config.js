import { defineConfig, devices } from '@playwright/test';

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
        baseURL: 'http://127.0.0.1:4173/BravvoOS/',
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
        command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173/BravvoOS/',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
