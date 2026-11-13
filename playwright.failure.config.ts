
import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './failure-scenarios',
  outputDir: 'failure-results/artifacts',

  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'failure-results/html',
      open: 'never',
    }],
    ['json', {
      outputFile: 'failure-results/results.json',
    }],
  ],

  webServer: [
    {
      command:
        'python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000',
      url: 'http://127.0.0.1:8000/docs',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command:
        'npm run dev --prefix frontend -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],

  projects: [
    {
      name: 'chromium-failures',
      testDir: './failure-scenarios',
      use: {
        ...devices['Desktop Chrome'],
        baseURL:
          process.env.UI_BASE_URL ?? 'http://127.0.0.1:5173',
      },
    },
  ],
});
