import { defineConfig } from '@playwright/test';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../backend');

const FRONTEND_PORT = 4173;
const BACKEND_PORT = 3100;
const POSTGRES_PORT = 55432;
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const useLocalDb = process.env.PLAYWRIGHT_USE_LOCAL_DB === '1';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 960 },
  },
  globalSetup: './e2e/global.setup.mjs',
  globalTeardown: './e2e/global.teardown.mjs',
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  webServer: [
    {
      command: 'node server.js',
      cwd: backendDir,
      url: `${BACKEND_URL}/api/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: String(BACKEND_PORT),
        FRONTEND_URL,
        PG_CONNECT_RETRIES: '30',
        PG_CONNECT_DELAY_MS: '1000',
        CMS_USERNAME: process.env.PLAYWRIGHT_CMS_USERNAME || 'e2e-admin',
        CMS_PASSWORD: process.env.PLAYWRIGHT_CMS_PASSWORD || 'e2e-password',
        JWT_SECRET: process.env.PLAYWRIGHT_JWT_SECRET || 'e2e-jwt-secret',
        ...(useLocalDb ? {} : {
          PGHOST: '127.0.0.1',
          PGPORT: String(POSTGRES_PORT),
          PGUSER: 'portfolio',
          PGPASSWORD: 'portfolio',
          PGDATABASE: 'portfolio_cms_e2e',
        }),
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${FRONTEND_PORT} --strictPort`,
      cwd: __dirname,
      url: `${FRONTEND_URL}/bitacora`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        VITE_API_URL: BACKEND_URL,
      },
    },
  ],
});
