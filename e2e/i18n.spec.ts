import { test, expect } from "@playwright/test";

/**
 * Internationalization E2E tests (F005 i18n blueprint Phase 08)
 *
 * Test Matrix:
 * - Test A (Login switch): open `/login` (default VI), open selector, pick English
 * - Test B (persist + first-paint): EN cookie preset via context.addCookies() →
 *   first-paint EN on `/`, `/awards`, `/prelaunch` with NO wait-for-hydration
 *   (proves server-side rendering)
 * - Test C (revert to VI): from EN, pick Tiếng Việt
 * - Test D (reload persistence): set EN cookie, load page, reload → still EN
 *   (FR-5 bug-fix regression guard)
 *
 * Runs on chromium project (port 3000, fake Supabase auth) for Test A.
 * Tests B, C, D can run on chromium (they set their own cookies).
 *
 * Assertion strings source: lib/i18n/dictionaries/vi.ts and en.ts
 */

test.describe("Internationalization — Login Locale Selection (chromium)", () => {
  /**
   * Test A: Login page switch to EN + cookie verification
   *
   * Scenario: Open login page (default VI), open language selector, pick English,
   * assert text switches to EN and NEXT_LOCALE=en cookie is set.
   */
  test("A: Login switch to EN sets cookie and renders EN content", async ({
    page,
    context,
  }) => {
    // Navigate to login (default locale VI)
    await page.goto("/login");

    // Assert initial VI subtitle (from vi.ts login.hero.subtitle)
    await expect(page.locator("main")).toContainText(
      "Bắt đầu hành trình của bạn cùng SAA 2025"
    );

    // Open language selector
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Select English
    const enOption = page.locator("text=/^English/");
    await enOption.click();

    // Dropdown closes
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Assert EN subtitle rendered (from en.ts login.hero.subtitle)
    await expect(page.locator("main")).toContainText(
      "Start your journey with SAA 2025"
    );

    // Verify NEXT_LOCALE=en cookie set
    const cookies = await context.cookies();
    const nextLocaleCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocaleCookie?.value).toBe("en");
  });

  /**
   * Test E: Default fallback (VI when cookie cleared)
   *
   * Scenario: Clear the NEXT_LOCALE cookie, navigate to a page, assert VI content.
   * This confirms the default locale is VI when no cookie is set.
   */
  test("E: Default locale is VI when cookie cleared", async ({
    page,
    context,
  }) => {
    // Clear all cookies to ensure no locale cookie
    await context.clearCookies();

    // Navigate to login (default should be VI)
    await page.goto("/login");

    // Assert VI subtitle (from vi.ts login.hero.subtitle)
    await expect(page.locator("main")).toContainText(
      "Bắt đầu hành trình của bạn cùng SAA 2025"
    );

    // Verify no NEXT_LOCALE cookie
    const cookies = await context.cookies();
    const nextLocaleCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocaleCookie?.value).toBeUndefined();
  });
});
