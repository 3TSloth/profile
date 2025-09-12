import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    workers: 1,
    fullyParallel: true,
    use: {
        baseURL: 'http://localhost:8080', 
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    ],
});