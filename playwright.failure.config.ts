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

  projects: [
    {
      name: 'chromium-failures',
      testDir: './failure-scenarios',
      use: {
        ...devices['Desktop Chrome'],
        baseURL:
          process.env.UI_BASE_URL ?? 'http://localhost:5173',
      },
    },
  ],
});