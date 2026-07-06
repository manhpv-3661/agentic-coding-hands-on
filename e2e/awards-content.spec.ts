import { test, expect } from "@playwright/test";

/**
 * Content E2E tests for the protected awards page (`/awards`), run ONLY
 * against the "chromium-authless" project (baseURL `http://localhost:3100`,
 * no Supabase env — see `playwright.config.ts`). With `proxy.ts` /
 * `requireUser()` failing open, `/awards` renders fully unauthenticated,
 * so these specs exercise the real rendered content in a real browser rather
 * than only HTTP status codes.
 *
 * Source of truth for every selector/string below: `app/awards/page.tsx`
 * and `app/components/awards/*` (read directly, not guessed).
 */

test.describe("Awards content (authless)", () => {
  test("renders all primary sections", async ({ page }) => {
    await page.goto("/awards");

    // Header and hero visible
    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.locator('img[alt="Keyvisual Sun* Annual Award 2025"]'),
    ).toBeVisible();

    // Title section (FR-5)
    await expect(
      page.getByText("Sun* annual awards 2025", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Hệ thống giải thưởng SAA 2025", { exact: true }),
    ).toBeVisible();

    // All 6 award sections present
    const sections = [
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ];
    for (const slug of sections) {
      await expect(page.locator(`section#${slug}`)).toBeVisible();
    }

    // Award titles visible
    await expect(
      page.getByRole("heading", { name: "Top Talent", level: 3, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Top Project", level: 3, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Top Project Leader", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Best Manager", level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Signature 2025 - Creator",
        level: 3,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "MVP (Most Valuable Person)",
        level: 3,
      }),
    ).toBeVisible();

    // Kudos section and footer present
    await expect(page.locator("#kudos-section")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("nav menu items click and scroll to their sections with aria-current", async ({
    page,
  }) => {
    await page.goto("/awards");

    const slugs = [
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ];

    // Test each nav item
    for (const slug of slugs) {
      // Click the nav link for this slug
      const navLink = page
        .locator(`nav[aria-label="Award categories"] a[href="#${slug}"]`)
        .first();
      await navLink.click();

      // Wait for the section to be in viewport
      const section = page.locator(`section#${slug}`);
      await expect(section).toBeInViewport();

      // Verify this nav item has aria-current set (and others don't)
      const activeLink = page
        .locator(`nav[aria-label="Award categories"] a[href="#${slug}"]`)
        .first();
      await expect(activeLink).toHaveAttribute("aria-current", "true");

      // Verify only ONE nav link has aria-current at a time
      const allActive = page.locator(
        `nav[aria-label="Award categories"] a[aria-current]`,
      );
      await expect(allActive).toHaveCount(1);
    }
  });

  test("scroll-spy passive activation: scrolling to a section sets its nav item active", async ({
    page,
  }) => {
    await page.goto("/awards");

    // Scroll the MVP section (last one) into view manually
    const mvpSection = page.locator("section#mvp");
    await mvpSection.scrollIntoViewIfNeeded();

    // Wait for the MVP nav item to become active
    const mvpNavLink = page.locator(
      'nav[aria-label="Award categories"] a[href="#mvp"]',
    );
    await expect(mvpNavLink).toHaveAttribute("aria-current", "true");

    // Verify only one nav item is active
    const allActive = page.locator(
      `nav[aria-label="Award categories"] a[aria-current]`,
    );
    await expect(allActive).toHaveCount(1);
  });

  test("hash-anchor deep link: goto('/awards#mvp') lands with #mvp in viewport", async ({
    page,
  }) => {
    await page.goto("/awards#mvp");

    // URL has the hash
    await expect(page).toHaveURL(/\/awards#mvp$/);

    // Section is in viewport
    await expect(page.locator("section#mvp")).toBeInViewport();

    // Nav item is active
    const mvpNavLink = page.locator(
      'nav[aria-label="Award categories"] a[href="#mvp"]',
    );
    await expect(mvpNavLink).toHaveAttribute("aria-current", "true");
  });

  test("hash-anchor deep link: goto('/awards#best-manager') works", async ({
    page,
  }) => {
    await page.goto("/awards#best-manager");

    await expect(page).toHaveURL(/\/awards#best-manager$/);
    await expect(page.locator("section#best-manager")).toBeInViewport();

    const navLink = page.locator(
      'nav[aria-label="Award categories"] a[href="#best-manager"]',
    );
    await expect(navLink).toHaveAttribute("aria-current", "true");
  });

  test("Sun* Kudos 'Chi tiết' CTA navigates to /kudos", async ({ page }) => {
    await page.goto("/awards");

    const kudosCTA = page.locator('section#kudos-section a[href="/kudos"]');
    await expect(kudosCTA).toBeVisible();
    await expect(kudosCTA).toContainText("Chi tiết");

    await kudosCTA.click();

    await page.waitForURL(/\/kudos$/);
    await expect(page).toHaveURL(/\/kudos$/);
  });
});
