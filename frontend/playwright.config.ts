import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './e2e',

  timeout: 120000,

  expect: {
    timeout: 10000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  use: {

    baseURL: 'http://localhost:4200',

    trace: process.env.CI 
      ? 'retain-on-failure'
      : 'on-first-retry',

    screenshot: 'only-on-failure',

    video: process.env.CI
      ? 'retain-on-failure'
      : 'off',
  },


  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },


  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});
