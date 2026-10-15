import { defineConfig, devices } from '@playwright/test';

/**
 * Records the portfolio demo clip against a throwaway local stack: `npm run demo:record`.
 * Needs Docker. Starts Postgres in a temporary container, seeds it, runs the compiled
 * backend and serves the production build of the frontend (vite preview proxies /api).
 * Nothing here talks to the live deployment.
 */
export const DEMO_DB_CONTAINER = 'ot-tracker-demo-db';
const DB_PORT = 54339;
const API_PORT = 3001; // vite preview proxies /api here (see vite.config.ts)
const APP_PORT = 4173;

const backendEnv = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: String(DB_PORT),
  DATABASE_NAME: 'ot_tracker',
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: 'password',
  DATABASE_SSL: 'false',
  JWT_SECRET: 'demo-recording-secret-not-used-anywhere-else',
  NODE_ENV: 'test',
  PORT: String(API_PORT),
};

export default defineConfig({
  testDir: './demo',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 120_000,
  globalTeardown: './demo/teardown.ts',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    video: 'off',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Data lives in tmpfs, so every run starts from an empty database.
      command: `docker run --rm --name ${DEMO_DB_CONTAINER} -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ot_tracker -p ${DB_PORT}:5432 --tmpfs /var/lib/postgresql/data postgres:15-alpine`,
      port: DB_PORT,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // The seed also runs the migrations; retry until Postgres accepts connections.
      command: [
        'npm --prefix ../backend run build',
        'until npm --prefix ../backend run seed; do sleep 1; done',
        `docker exec -i ${DEMO_DB_CONTAINER} psql -q -U postgres -d ot_tracker -v ON_ERROR_STOP=1 < demo/demo-data.sql`,
        'node ../backend/dist/main.js',
      ].join(' && '),
      url: `http://localhost:${API_PORT}/api/health`,
      env: backendEnv,
      reuseExistingServer: false,
      timeout: 300_000,
    },
    {
      command: `npm run build && npm run preview -- --port ${APP_PORT} --strictPort`,
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: false,
      timeout: 300_000,
    },
  ],
});
