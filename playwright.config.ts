import { defineConfig, devices } from "@playwright/test";

/**
 * E2E test configuration — three hermetic webServers, three projects.
 *
 * 1. "chromium" (port 3000, fake Supabase creds): the proxy/`requireUser()`
 *    guard is ACTIVE, so these specs verify auth redirects (unauth users
 *    cannot reach protected routes). See `access-control.spec.ts`,
 *    `homepage-access.spec.ts`, `login.spec.ts`.
 * 2. "chromium-authless" (port 3100, NO Supabase env): `proxy.ts` and
 *    `lib/auth/require-user.ts` both read `NEXT_PUBLIC_SUPABASE_URL` /
 *    `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `process.env` and fail open
 *    (no-op / return null) when either is falsy — so the protected homepage
 *    (`/`) renders fully, unauthenticated, letting `homepage-content.spec.ts`
 *    exercise the REAL rendered content (hero, countdown, awards grid,
 *    kudos, footer, menus, responsive layout) in a real browser instead of
 *    only asserting HTTP status codes.
 * 3. "chromium-prelaunch" (port 3200, NO Supabase env, FUTURE
 *    `NEXT_PUBLIC_EVENT_START_AT`): dedicated build for the Countdown
 *    Prelaunch time-gate (`prelaunch-countdown.spec.ts`). The time-gate in
 *    `proxy.ts` runs before the auth-gate and, before launch, redirects
 *    EVERY route (including `/login`) to `/prelaunch` — which would break
 *    projects 1 and 2 if they shared this build. Projects 1 and 2 therefore
 *    run with `NEXT_PUBLIC_EVENT_START_AT` in the PAST (event already
 *    launched), so the new time-gate is a no-op for them and they keep
 *    testing exactly what they tested before F003 existed.
 *
 * IMPORTANT: Next.js inlines every `NEXT_PUBLIC_*` reference at BUILD time,
 * everywhere it's read — including server-only code like `proxy.ts` and
 * `lib/auth/require-user.ts`. It is NOT re-read from `process.env` at
 * request time. That means the webServers below CANNOT share one build:
 * each runs its own `next build` into its own `NEXT_DIST_DIR` (see
 * `next.config.ts`) with its own baked-in env, then starts from that dir.
 * (An earlier version of this config shared one build across the first two
 * ports — the authless server silently inherited port 3000's truthy fake
 * creds and never actually failed open, permanently redirecting `/` to
 * `/login`. Do not reintroduce a shared build.)
 */

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
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000" },
      testIgnore: /homepage-content|awards-content|prelaunch-countdown|i18n-content/,
    },
    {
      name: "chromium-authless",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100" },
      testMatch: /homepage-content|awards-content|i18n-content/,
    },
    {
      name: "chromium-prelaunch",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3200" },
      testMatch: /prelaunch-countdown/,
    },
  ],

  webServer: [
    {
      // Own build, own dist dir (default "build" from next.config.ts) —
      // deterministic fake Supabase creds baked in so the auth guard is
      // ACTIVE. OAuth requests are route-intercepted in specs — no real
      // network calls. Event start is in the PAST so the Prelaunch
      // time-gate (proxy.ts) is a no-op here (see file header).
      command: "npm run build && npm run start",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "https://test-project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-000000000000000000000000",
        NEXT_PUBLIC_EVENT_START_AT: "2020-01-01T00:00:00Z",
      },
    },
    {
      // INDEPENDENT build into its own dist dir, with Supabase creds baked
      // in as empty strings — so the auth guard genuinely fails open in
      // this build's compiled output, not just in this process's env.
      // Runs concurrently with the webServer above; no shared build
      // directory, so no ordering/race dependency between the two. Event
      // start is in the PAST — `/` is reachable so `homepage-content.spec.ts`
      // can exercise the post-launch homepage (no "Comming soon", the
      // Prelaunch gate is a no-op).
      command: "sh -c 'npm run build && npx next start -p 3100'",
      url: "http://localhost:3100",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_DIST_DIR: "build-authless",
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        NEXT_PUBLIC_EVENT_START_AT: "2020-01-01T00:00:00Z",
      },
    },
    {
      // Dedicated build with event start in the FUTURE, so the Prelaunch
      // time-gate is ACTIVE — this is the only build where
      // `prelaunch-countdown.spec.ts`'s redirect assertions are meaningful.
      // Authless (empty creds): the gate runs before the auth check either
      // way, so real Supabase creds add nothing here.
      command: "sh -c 'npm run build && npx next start -p 3200'",
      url: "http://localhost:3200",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_DIST_DIR: "build-prelaunch",
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        NEXT_PUBLIC_EVENT_START_AT: "2027-12-31T18:30:00Z",
      },
    },
  ],
});
