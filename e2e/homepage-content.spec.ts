import { test, expect, type Page } from "@playwright/test";

/**
 * Content E2E tests for the protected homepage (`/`), run ONLY against the
 * "chromium-authless" project (baseURL `http://localhost:3100`, no Supabase
 * env — see `playwright.config.ts`). With `proxy.ts` / `requireUser()`
 * failing open, `/` renders fully unauthenticated, so these specs exercise
 * the real rendered content in a real browser rather than only HTTP status
 * codes.
 *
 * Source of truth for every selector/string below: `app/page.tsx` and
 * `app/components/home/*` (read directly, not guessed).
 */

/**
 * Reads the digits rendered by a `CountdownTimer` unit (`app/components/home
 * /countdown-timer.tsx`'s `CountdownUnit`, `className="... w-29 ..."`).
 * `DigitBoxes` renders one `<span>` per character followed by the unit's
 * label `<span>` (e.g. "DAYS") as a sibling — `innerText()` on the whole
 * unit concatenates both (with whitespace from the block-level digit boxes),
 * so stripping whitespace then the trailing label leaves just the digits.
 */
async function readCountdownUnitDigits(
  page: Page,
  label: "DAYS" | "HOURS" | "MINUTES",
): Promise<string> {
  const unit = page.locator("div.w-29").filter({ hasText: label });
  const raw = (await unit.innerText()).replace(/\s+/g, "");
  return raw.slice(0, raw.length - label.length);
}

test.describe("Homepage content (authless)", () => {
  test("renders all primary sections", async ({ page }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");

    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.locator('header img[alt="Sun* Annual Awards 2025"]'),
    ).toBeVisible();
    await expect(page.locator('img[alt="Root Further"]')).toBeVisible();
    await expect(page.getByText("DAYS", { exact: true })).toBeVisible();
    await expect(page.getByText("HOURS", { exact: true })).toBeVisible();
    await expect(page.getByText("MINUTES", { exact: true })).toBeVisible();
    await expect(page.locator("#awards-section")).toBeVisible();
    await expect(page.locator("#kudos-section")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Quick actions" }),
    ).toBeVisible();
  });

  test("countdown shows zero-padded zero state, no 'Comming soon'", async ({
    page,
  }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");

    // NEXT_PUBLIC_EVENT_START_AT is in the PAST for this build (see
    // playwright.config.ts) — required so the Countdown Prelaunch time-gate
    // (proxy.ts, F003) treats the event as launched and lets `/` through at
    // all. At/after the target, `computeCountdown` returns the zero state:
    // "00 00 00" and `showComingSoon: false` (lib/event-countdown.ts) — the
    // pre-launch "Comming soon" hero state is exercised at the unit level
    // (`use-event-countdown.test.tsx`) instead, since real navigation can
    // never observe it once F003's gate is in front of `/`.
    await expect(
      page.getByText("Comming soon", { exact: true }),
    ).not.toBeVisible();

    const days = await readCountdownUnitDigits(page, "DAYS");
    const hours = await readCountdownUnitDigits(page, "HOURS");
    const minutes = await readCountdownUnitDigits(page, "MINUTES");

    expect(days).toBe("00");
    expect(hours).toBe("00");
    expect(minutes).toBe("00");
  });

  test("event info shows the date, venue, and livestream note", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("26/12/2025", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Âu Cơ Art Center", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Tường thuật trực tiếp qua sóng Livestream", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("each award card links to its category anchor with the correct title", async ({
    page,
  }) => {
    await page.goto("/");

    const expectations: Array<[string, string]> = [
      ["top-talent", "Top Talent"],
      ["top-project", "Top Project"],
      ["top-project-leader", "Top Project Leader"],
      ["best-manager", "Best Manager"],
      ["signature-2025-creator", "Signature 2025 - Creator"],
      ["mvp", "MVP (Most Valuable Person)"],
    ];

    for (const [slug, title] of expectations) {
      const card = page.locator(`a[href="/awards#${slug}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByRole("img", { name: title, exact: true })).toBeVisible();
    }
  });

  test("clicking an award card navigates to /awards and scrolls to its section", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator('a[href="/awards#top-talent"]').click();

    await expect(page).toHaveURL(/\/awards#top-talent$/);
    await expect(page.locator("#top-talent")).toBeInViewport();
  });

  test("header nav links route to the awards and kudos pages", async ({
    page,
  }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");
    await page
      .locator("header nav")
      .getByRole("link", { name: "Award Information" })
      .click();
    await expect(page).toHaveURL(/\/awards$/);

    await page.goto("/");
    await page
      .locator("header nav")
      .getByRole("link", { name: "Sun* Kudos" })
      .click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("footer links point to the correct destinations and navigate correctly", async ({
    page,
  }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");
    const footer = page.locator("footer");

    // "/awards" and "/kudos" (the placeholder pages) render no footer of
    // their own, so the home link is checked via its `href` — clicking it
    // from "/" would be a same-page no-op (scroll-to-top), not a navigation.
    await expect(
      footer.getByRole("link", { name: "About SAA 2025" }),
    ).toHaveAttribute("href", "/");
    await expect(
      footer.getByRole("link", { name: "General Standards" }),
    ).toHaveAttribute("href", "#");

    await footer.getByRole("link", { name: "Award Information" }).click();
    await expect(page).toHaveURL(/\/awards$/);

    await page.goto("/");
    await page
      .locator("footer")
      .getByRole("link", { name: "Sun* Kudos" })
      .click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("hero CTA buttons route to the awards and kudos pages", async ({
    page,
  }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");
    await page.getByRole("link", { name: /ABOUT AWARDS/ }).click();
    await expect(page).toHaveURL(/\/awards$/);

    await page.goto("/");
    await page.getByRole("link", { name: /ABOUT KUDOS/ }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("notification bell opens the empty-state panel and Escape closes it", async ({
    page,
  }) => {
    await page.goto("/");

    const bell = page.getByRole("button", { name: "Notifications" });
    await bell.click();

    const panel = page.getByRole("status", { name: "Notifications" });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveText("Chưa có thông báo");

    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
  });

  test("account menu shows Profile/Sign out (no Admin Dashboard) and sign out redirects to /login", async ({
    page,
  }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" },
    ]);
    await page.goto("/");

    const accountButton = page.getByRole("button", { name: "Account menu" });
    await accountButton.click();

    const menu = page.getByRole("menu", { name: "Account" });
    await expect(menu.getByRole("menuitem", { name: "Profile" })).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: "Sign out" }),
    ).toBeVisible();
    await expect(page.getByText("Admin Dashboard")).toHaveCount(0);

    await menu.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL(/\/login$/);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("widget button toggles aria-expanded on click", async ({ page }) => {
    await page.goto("/");

    const widget = page.getByRole("button", { name: "Quick actions" });
    await expect(widget).toHaveAttribute("aria-expanded", "false");

    await widget.click();
    await expect(widget).toHaveAttribute("aria-expanded", "true");

    await widget.click();
    await expect(widget).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking outside an open menu closes it", async ({ page }) => {
    await page.goto("/");

    const bell = page.getByRole("button", { name: "Notifications" });
    await bell.click();
    const panel = page.getByRole("status", { name: "Notifications" });
    await expect(panel).toBeVisible();

    // Top-left corner: outside the sticky header's interactive content and
    // outside every menu's panel.
    await page.mouse.click(2, 2);
    await expect(panel).not.toBeVisible();
  });

  test("awards grid uses 3 columns at desktop width and 2 columns at tablet width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 900 });
    await page.goto("/");

    const cards = page.locator('a[href^="/awards#"]');

    const desktopBoxes = await Promise.all([0, 1, 2].map((i) => cards.nth(i).boundingBox()));
    for (const box of desktopBoxes) {
      expect(box).not.toBeNull();
    }
    const [d0, d1, d2] = desktopBoxes.map((box) => {
      if (!box) throw new Error("expected award card bounding box");
      return box;
    });
    // 3-column grid (lg:grid-cols-3): first 3 cards share a row.
    expect(Math.abs(d0.y - d1.y)).toBeLessThan(2);
    expect(Math.abs(d1.y - d2.y)).toBeLessThan(2);

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    const tabletBoxes = await Promise.all([0, 1, 2].map((i) => cards.nth(i).boundingBox()));
    for (const box of tabletBoxes) {
      expect(box).not.toBeNull();
    }
    const [t0, t1, t2] = tabletBoxes.map((box) => {
      if (!box) throw new Error("expected award card bounding box");
      return box;
    });
    // 2-column grid (grid-cols-2 below lg): first 2 cards share a row, the
    // 3rd wraps to the next row (strictly lower).
    expect(Math.abs(t0.y - t1.y)).toBeLessThan(2);
    expect(t2.y).toBeGreaterThan(t0.y + 10);
  });

  test("language selector opens with VN and EN options", async ({ page }) => {
    await page.goto("/");

    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const listbox = page.locator("ul[role='listbox']");
    await expect(listbox).toBeVisible();
    await expect(page.getByText("Tiếng Việt")).toBeVisible();
    await expect(page.getByText(/^English/)).toBeVisible();
  });
});
