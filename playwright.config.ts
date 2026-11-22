import { defineConfig } from '@playwright/test'

/**
 * Two servers run during e2e:
 *  - the React app (Vite dev server) on :5173
 *  - the original WordPress site, served from the archive + FTP assets, on :8125
 * Fidelity specs load both at the same viewport and compare them.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'phone', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: 'http://localhost:5173/',
      reuseExistingServer: true,
    },
    {
      command: 'npm run ref',
      url: 'http://localhost:8125/',
      reuseExistingServer: true,
    },
  ],
})
