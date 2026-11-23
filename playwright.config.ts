import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    command: "npm run build && npx next start -p 3125",
    port: 3125,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  use: { baseURL: "http://localhost:3125" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
