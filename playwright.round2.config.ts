import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'cmp1-round2-visual.spec.ts',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
