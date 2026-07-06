import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    // Don't reuse a stale dev server that lacks the hermetic env below.
    reuseExistingServer: false,
    timeout: 120000,
    // Hermetic env: deterministic fake Supabase creds so E2E behaves the same
    // regardless of any real .env.local on the machine. OAuth requests to this
    // host are route-intercepted in the specs — no real network call is made.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://test-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-000000000000000000000000",
    },
  },
});
