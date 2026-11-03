import { defineConfig, devices } from '@playwright/test';

const uiBaseURL = process.env.UI_BASE_URL ?? 'http://localhost:5173';
const apiBaseURL = process.env.API_BASE_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
  testDir: './tests',
  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command:
        'backend/.venv/bin/python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000',
      url: 'http://127.0.0.1:8000/api/products',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command:
        'npm --prefix frontend run dev -- --host localhost --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
      },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: uiBaseURL,
      },
    },
  ],
});