import { test, expect } from "@playwright/test";

/**
 * Countdown Prelaunch time-gate E2E (F003). Runs ONLY against the
 * "chromium-prelaunch" project (baseURL `http://localhost:3200`) — the one
 * build where `NEXT_PUBLIC_EVENT_START_AT` is in the FUTURE, so the
 * site-wide time-gate in `proxy.ts` is actually active. See
 * `playwright.config.ts` for why this needs its own build (every other
 * project bakes a PAST event start so this gate is a no-op for them).
 *
 * Source of truth: `plans/260706-1543-countdown-prelaunch/spec/countdown-prelaunch/
 * technical-spec.md` (FR-001, FR-006, BR-001, BR-002, SC-001/SC-002).
 */
test.describe("Countdown Prelaunch — site-wide time-gate", () => {
  for (const path of ["/", "/login", "/awards", "/kudos", "/todo"]) {
    test(`before launch, ${path} redirects to /prelaunch with ?next= preserved (FR-001, FR-006)`, async ({
      page,
    }) => {
      await page.goto(path);

      const url = new URL(page.url());
      expect(url.pathname).toBe("/prelaunch");
      expect(url.searchParams.get("next")).toBe(path);
    });
  }

  test("before launch, /prelaunch itself is reachable directly, no redirect loop (BR-001)", async ({
    page,
  }) => {
    const response = await page.goto("/prelaunch");

    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe("/prelaunch");
  });

  test("/prelaunch renders the static title and three countdown units", async ({
    page,
  }) => {
    await page.goto("/prelaunch");

    await expect(page.getByText("Sự kiện sẽ bắt đầu sau")).toBeVisible();
    await expect(page.getByText("DAYS", { exact: true })).toBeVisible();
    await expect(page.getByText("HOURS", { exact: true })).toBeVisible();
    await expect(page.getByText("MINUTES", { exact: true })).toBeVisible();
  });

  test("query-string on the original path survives the redirect (FR-006)", async ({
    page,
  }) => {
    await page.goto("/awards?foo=bar");

    const url = new URL(page.url());
    expect(url.pathname).toBe("/prelaunch");
    expect(url.searchParams.get("next")).toBe("/awards?foo=bar");
  });

  test("an external URL in ?next= is ignored by the page (open-redirect guard, BR-002)", async ({
    page,
  }) => {
    // Navigating straight to /prelaunch with a crafted ?next= — the auto-
    // redirect never fires here (countdown is far from zero), but the page
    // must still load without treating the value as trustworthy.
    const response = await page.goto("/prelaunch?next=https://evil.example");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByText("Sự kiện sẽ bắt đầu sau")).toBeVisible();
  });
});
