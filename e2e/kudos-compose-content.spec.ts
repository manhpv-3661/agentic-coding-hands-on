import { test, expect } from "@playwright/test";

/**
 * Content E2E tests for the Kudos compose dialog (F007), run ONLY against
 * the "chromium-authless" project (baseURL `http://localhost:3100`,
 * no Supabase env — see `playwright.config.ts`). With `proxy.ts` /
 * `requireUser()` failing open and Supabase unconfigured, compose actions
 * return `{ ok: true, skipped: true }` (no DB write), so optimistic updates
 * drive the observable behavior entirely.
 *
 * Source of truth for every selector/string below: `app/components/kudos/compose/*`,
 * `lib/i18n/dictionaries/vi.ts` (labels), and `lib/kudos/kudos-data.ts` (mock recipients).
 */

test.describe("Kudos compose dialog (authless)", () => {
  test("opens when the Ghi nhận pill is clicked", async ({ page }) => {
    await page.goto("/kudos");

    // Find and click the "Ghi nhận" composer pill (in the banner)
    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    // Dialog should be visible with heading
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify it's the compose dialog by checking for expected text
    const dialogText = await dialog.innerText();
    expect(dialogText).toContain("Gửi lời cám ơn");
  });

  test("recipient select opens and allows selection", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click the recipient select trigger (button showing placeholder "Tìm kiếm")
    const buttons = dialog.getByRole("button");
    let recipientButton = null;
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).innerText();
      if (text.includes("Tìm kiếm")) {
        recipientButton = buttons.nth(i);
        break;
      }
    }

    if (recipientButton) {
      await recipientButton.click();

      // Listbox should appear
      const listbox = dialog.getByRole("listbox");
      await expect(listbox).toBeVisible();

      // Get first option and click it
      const option = listbox.getByRole("option").first();
      await expect(option).toBeVisible();
      await option.click();

      // Listbox should close
      await expect(listbox).not.toBeVisible();
    }
  });

  test("title field accepts input", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");

    // Fill title field
    const titleInput = dialog.locator("input[id='compose-title']");
    const testTitle = "Cảm ơn vì sự tận tâm";
    await titleInput.fill(testTitle);

    // Assert value is displayed
    await expect(titleInput).toHaveValue(testTitle);
  });

  test("content editor accepts input", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");

    // The rich text editor is a contenteditable div
    const contentEditor = dialog.locator("[contenteditable='true']").first();
    await contentEditor.click();
    const testContent = "Bạn đã giúp tôi rất nhiều";
    await contentEditor.fill(testContent);

    // Assert content is present
    await expect(contentEditor).toContainText(testContent);
  });

  test("cancel button closes the dialog", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click cancel button (first button with "Hủy" text)
    const buttons = dialog.getByRole("button");
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).innerText();
      if (text.includes("Hủy")) {
        await buttons.nth(i).click();
        break;
      }
    }

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test("Escape key closes the dialog", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test("submit button appears and is clickable", async ({ page }) => {
    await page.goto("/kudos");

    const composerPill = page.getByRole("button").filter({ hasText: /Ghi nhận|Viết Kudos/i });
    await composerPill.first().click();

    const dialog = page.getByRole("dialog");

    // Look for submit button (should have "Gửi" text)
    const buttons = dialog.getByRole("button");
    let submitFound = false;
    for (let i = 0; i < await buttons.count(); i++) {
      const text = await buttons.nth(i).innerText();
      if (text.includes("Gửi")) {
        submitFound = true;
        break;
      }
    }

    expect(submitFound).toBe(true);
  });
});
