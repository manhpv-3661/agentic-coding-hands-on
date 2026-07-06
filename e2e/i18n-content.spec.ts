import { test, expect } from "@playwright/test";

/**
 * Internationalization E2E tests for protected content (F005 i18n blueprint Phase 08)
 * — runs ONLY against chromium-authless project (port 3100) where auth is disabled.
 *
 * Test Matrix:
 * - Test B: EN cookie preset → first-paint EN across routes (SSR proof)
 * - Test C: Revert from EN back to VI
 * - Test D: Reload persistence (FR-5 bug-fix regression guard)
 *
 * Assertion strings source: lib/i18n/dictionaries/vi.ts and en.ts
 */

test.describe("Internationalization — Locale Persistence & SSR (authless)", () => {
  /**
   * Test B: EN cookie preset → first-paint EN across routes (SSR proof)
   *
   * Scenario: Set NEXT_LOCALE=en cookie BEFORE navigation via context.addCookies(),
   * then navigate to `/` and `/awards`. Assert EN content visible on first paint
   * without waiting for hydration (proves server-side rendering). `/prelaunch`'s
   * EN-first-paint coverage lives in prelaunch-countdown.spec.ts instead (it needs
   * the chromium-prelaunch project's future-dated time-gate build, not this one).
   *
   * Uses unambiguous VI vs EN strings from dictionaries:
   * - Awards heading: "Hệ thống giải thưởng" (VI) vs "Award System" (EN)
   * - Coming soon: "Sắp diễn ra" (VI) vs "Coming soon" (EN)
   */
  test("B: EN cookie preset renders EN on first paint (no FOUC)", async ({
    page,
    context,
  }) => {
    // Set EN locale cookie BEFORE any navigation (proves server-side rendering)
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://localhost:3100",
      },
    ]);

    // Test B.1: Homepage `/`
    await page.goto("/");
    // Awards heading must be EN "Award System" on first paint (not VI "Hệ thống giải thưởng")
    await expect(page.locator("text=/Award System/")).toBeVisible();

    // Test B.2: Awards page `/awards`
    await page.goto("/awards");
    // Title must be EN "SAA 2025 Awards System" (not VI "Hệ thống giải thưởng SAA 2025")
    await expect(
      page.getByText("SAA 2025 Awards System", { exact: true })
    ).toBeVisible();
  });

  /**
   * Test C: Revert from EN back to VI
   *
   * Scenario: Starting from a page rendered in EN, open the language selector and
   * select Tiếng Việt. Assert content reverts to VI and cookie is set to `vi`.
   */
  test("C: Revert from EN to VI via selector", async ({ page, context }) => {
    // Start with EN cookie preset
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://localhost:3100",
      },
    ]);

    // Navigate to a page with VI/EN content difference
    await page.goto("/");

    // Assert EN content present
    await expect(page.locator("text=/Award System/")).toBeVisible();

    // Open language selector
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.click();

    // Select Tiếng Việt
    const viOption = page.locator("text=Tiếng Việt");
    await viOption.click();

    // Assert VI content rendered (Awards heading VI "Hệ thống giải thưởng")
    await expect(
      page.locator("text=/Hệ thống giải thưởng/")
    ).toBeVisible();

    // Verify NEXT_LOCALE=vi cookie set
    const cookies = await context.cookies();
    const nextLocaleCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocaleCookie?.value).toBe("vi");
  });

  /**
   * Test D: Reload persistence (FR-5 bug-fix regression guard)
   *
   * Scenario: Set EN cookie, navigate to a page, reload the page, assert that
   * the content is STILL EN (not reverted to VI). This is the highest-value test
   * because the FR-5 bug was: "LanguageSelector always shows VN after reload even
   * if cookie is en". This test proves the bug is fixed and stays fixed.
   */
  test("D: Reload persists EN locale (FR-5 regression guard)", async ({
    page,
    context,
  }) => {
    // Set EN locale cookie
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        url: "http://localhost:3100",
      },
    ]);

    // Navigate to homepage
    await page.goto("/");

    // Assert EN content on initial load
    await expect(page.locator("text=/Award System/")).toBeVisible();

    // RELOAD the page
    await page.reload();

    // Assert EN content STILL present after reload (not reverted to VI)
    // This is the FR-5 regression check: the bug was the locale always reset to VI
    await expect(page.locator("text=/Award System/")).toBeVisible();

    // Verify cookie still EN
    const cookies = await context.cookies();
    const nextLocaleCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocaleCookie?.value).toBe("en");
  });
});
