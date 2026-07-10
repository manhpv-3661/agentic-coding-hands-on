import { test, expect } from "@playwright/test";

/**
 * Content E2E tests for the Kudos like toggle (F008), run ONLY against
 * the "chromium-authless" project (baseURL `http://localhost:3100`,
 * no Supabase env — see `playwright.config.ts`). With Supabase unconfigured,
 * like actions return `{ ok: true, skipped: true }` (no DB write), so
 * optimistic updates drive the observable behavior entirely.
 *
 * Source of truth for every selector/string below: `app/components/kudos/kudos-card.tsx`,
 * `app/components/kudos/kudos-page-client.tsx`, and `use-kudos-optimistic-likes.ts`.
 */

test.describe("Kudos like toggle (authless)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and scroll to top to ensure consistent state
    await page.goto("/kudos");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  test("like button is present on kudos cards", async ({ page }) => {
    // Find a kudos card (article element)
    const card = page.locator("article").first();
    await expect(card).toBeVisible();

    // Like button should be present (a button with aria-pressed attribute)
    const likeButton = card.locator("button[aria-pressed]");
    await expect(likeButton.first()).toBeVisible();
  });

  test("clicking like button increments heart count", async ({ page }) => {
    // Get a card
    const card = page.locator("article").nth(2); // Use 3rd card to avoid overlaps
    await card.scrollIntoViewIfNeeded();

    // Get like button with aria-pressed
    const likeButton = card.locator("button[aria-pressed]").first();
    await expect(likeButton).toBeVisible();

    // Get initial count (parse the button text for the number)
    const initialButtonText = await likeButton.innerText();
    const initialCount = parseInt(initialButtonText?.replace(/\D/g, "") || "0", 10) || 0;

    // Click the like button
    await likeButton.click({ timeout: 5000 });

    // Wait for optimistic update
    await page.waitForTimeout(300);

    // Get the new count
    const newButtonText = await likeButton.innerText();
    const newCount = parseInt(newButtonText?.replace(/\D/g, "") || "0", 10) || 0;

    // Assert the count incremented by 1
    expect(newCount).toBe(initialCount + 1);
  });

  test("clicking like again decrements heart count back", async ({ page }) => {
    const card = page.locator("article").nth(3);
    await card.scrollIntoViewIfNeeded();

    const likeButton = card.locator("button[aria-pressed]").first();

    // Get initial count
    const initialText = await likeButton.innerText();
    const initialCount = parseInt(initialText?.replace(/\D/g, "") || "0", 10) || 0;

    // Click to like
    await likeButton.click({ timeout: 5000 });
    await page.waitForTimeout(300);

    // Verify count incremented
    let currentText = await likeButton.innerText();
    let currentCount = parseInt(currentText?.replace(/\D/g, "") || "0", 10) || 0;
    expect(currentCount).toBe(initialCount + 1);

    // Click again to unlike
    await likeButton.click({ timeout: 5000 });
    await page.waitForTimeout(300);

    // Verify count decremented back
    currentText = await likeButton.innerText();
    currentCount = parseInt(currentText?.replace(/\D/g, "") || "0", 10) || 0;
    expect(currentCount).toBe(initialCount);
  });

  test("aria-pressed toggles between true and false", async ({ page }) => {
    const card = page.locator("article").nth(4);
    await card.scrollIntoViewIfNeeded();

    const likeButton = card.locator("button[aria-pressed]").first();

    // Initially should be false (not liked) or true (already liked)
    let pressed = await likeButton.getAttribute("aria-pressed");
    expect(pressed).toBeTruthy();

    const initialPressed = pressed;

    // Click to toggle
    await likeButton.click({ timeout: 5000 });
    await page.waitForTimeout(300);

    // Should toggle to opposite state
    pressed = await likeButton.getAttribute("aria-pressed");
    expect(pressed).not.toBe(initialPressed);
  });

  test("multiple cards have like buttons", async ({ page }) => {
    // Get the first few cards
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Check that first 2 cards have like buttons
    for (let i = 0; i < Math.min(2, count); i++) {
      const card = cards.nth(i);
      const likeButton = card.locator("button[aria-pressed]").first();
      await expect(likeButton).toBeVisible();
    }
  });
});
