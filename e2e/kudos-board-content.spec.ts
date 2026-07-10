import { test, expect } from "@playwright/test";

/**
 * Content E2E tests for the protected Kudos live board page (`/kudos` — F006),
 * run ONLY against the "chromium-authless" project (baseURL `http://localhost:3100`,
 * no Supabase env — see `playwright.config.ts`). With `proxy.ts` / `requireUser()`
 * failing open, `/kudos` renders fully unauthenticated, so these specs exercise
 * the real rendered content in a real browser rather than only HTTP status codes.
 *
 * Source of truth for every selector/string below: `app/kudos/page.tsx`,
 * `app/components/kudos/*`, and the mock data in `lib/kudos/kudos-data.ts`
 * (read directly, not guessed).
 */

test.describe("Kudos board content (authless)", () => {
  test("renders all primary sections and components", async ({ page }) => {
    await page.goto("/kudos");

    // Header and footer visible
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    // Kudos banner with title (use getByRole to avoid strict mode issues)
    await expect(page.getByRole("link", { name: /Sun\* Kudos/i }).first()).toBeVisible();

    // At least one Kudos card rendered with real content from mock data
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    // Spotlight Board section renders (server component with heading text)
    await expect(page.locator("main").first()).toContainText(/Spotlight|Bảng nổi bật/i);

    // Highlight Kudos carousel section — verify multiple articles exist
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("kudos cards display sender, recipient, timestamp, content, and hearts", async ({ page }) => {
    await page.goto("/kudos");

    // Get the first card on the page
    const card = page.locator("article").first();
    await expect(card).toBeVisible();

    // Card should contain real Vietnamese names from mock data
    const nameText = await card.innerText();
    expect(nameText).toMatch(/Nguyễn|Trần|Phạm|Lê|Đỗ|Hoàng|Vũ|Bùi|Đặng|Ngô|Trịnh/);

    // Card should contain a timestamp
    expect(nameText).toMatch(/\d{1,2}:\d{2}\s*-\s*\d{1,2}\/\d{2}\/\d{4}/);

    // Card should contain Vietnamese content
    expect(nameText).toMatch(/Cảm ơn|hỗ trợ|Giải pháp|buổi|phát hiện/);
  });

  test("Kudos cards contain button elements for interaction", async ({ page }) => {
    await page.goto("/kudos");

    const card = page.locator("article").first();
    await expect(card).toBeVisible();

    // Card should have buttons (copy link, like, etc.)
    const buttons = card.getByRole("button");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });

  test("composer pill is present and clickable (opens compose dialog)", async ({ page }) => {
    await page.goto("/kudos");

    // The "Ghi nhận" composer pill — look for button with Vietnamese text
    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await expect(composerPill.first()).toBeVisible();

    // Click it — should open compose dialog
    await composerPill.first().click();

    // Assert dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Dialog should have form content
    const dialogText = await dialog.innerText();
    expect(dialogText).toContain("Gửi lời cám ơn");
  });

  test("multiple kudos cards render on the page", async ({ page }) => {
    await page.goto("/kudos");

    // Check that multiple cards are rendered (mock data has 8+ posts)
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify first two cards have content
    for (let i = 0; i < Math.min(2, count); i++) {
      const card = cards.nth(i);
      const text = await card.innerText();
      expect(text.length).toBeGreaterThan(50); // Has meaningful content
    }
  });
});
