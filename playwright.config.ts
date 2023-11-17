import { defineConfig, devices } from '@playwright/test'

const { CI } = process.env

export default defineConfig({
  use: CI
    ? {
        baseURL: `https://${process.env.PREVIEW_HOST}`
      }
    : undefined,
  webServer: CI
    ? undefined
    : {
        command: 'pnpm run preview',
        port: 4173
      },
  testDir: 'tests',
  fullyParallel: true,
  workers: '100%',
  retries: CI ? 2 : 0,
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome']
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox']
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari']
    },
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5']
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12']
    }
  ]
})
