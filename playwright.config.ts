import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    // Fake Supabase project: the playlist tests answer its requests with page.route().
    command:
      "NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co NEXT_PUBLIC_SUPABASE_KEY=test npm run build && node tests/serve-out.mjs 3125",
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
