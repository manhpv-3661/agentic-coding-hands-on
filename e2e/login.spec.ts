import { test, expect } from "@playwright/test";

test.describe("Login Page (GUI & Interaction Tests)", () => {
  test.beforeEach(async ({ page }) => {
    // Set dummy Supabase env for testing
    await page.evaluate(() => {
      // This won't work since env is server-side, but we'll intercept routes instead
    });

    await page.goto("/login");
  });

  test("renders all layout elements", async ({ page }) => {
    // Header with logo
    const logo = page.locator("header img[alt='Sun* Annual Awards 2025']");
    await expect(logo).toBeVisible();

    // Language selector in header
    const languageSelector = page.locator("header button[aria-haspopup='listbox']");
    await expect(languageSelector).toBeVisible();
    await expect(languageSelector).toContainText("VN");

    // Main heading/hero content (ROOT FURTHER is an image)
    const heading = page.locator("img[alt='Root Further']");
    await expect(heading).toBeVisible();

    // Subtitle
    await expect(page.locator("main")).toContainText("Bắt đầu hành trình của bạn cùng SAA 2025");

    // Tagline
    await expect(page.locator("main")).toContainText("Đăng nhập để khám phá");

    // Login button
    const loginButton = page.locator("button:has-text('Đăng nhập với Google')");
    await expect(loginButton).toBeVisible();

    // Google icon
    const googleIcon = page.locator("img[src*='Google.svg']");
    await expect(googleIcon).toBeVisible();

    // Footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Bản quyền thuộc về Sun*");
  });

  test("footer is fixed at bottom of page", async ({ page }) => {
    const footer = page.locator("footer");
    const footerBox = await footer.boundingBox();

    // Get viewport height
    const viewportSize = page.viewportSize();
    if (viewportSize && footerBox) {
      // Footer should be at or near the bottom
      expect(footerBox.y + footerBox.height).toBeGreaterThan(
        viewportSize.height - 100
      );
    }
  });

  test("language selector opens dropdown on click", async ({ page }) => {
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = page.locator("ul[role='listbox']");
    await expect(listbox).toBeVisible();
  });

  test("language selector dropdown shows VN and EN options", async ({ page }) => {
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.click();

    const viOption = page.locator("text=Tiếng Việt");
    const enOption = page.locator("text=English");

    await expect(viOption).toBeVisible();
    await expect(enOption).toBeVisible();
  });

  test("selecting language from dropdown closes it", async ({ page }) => {
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.click();

    const enOption = page.locator("text=/^English/");
    await enOption.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const listbox = page.locator("ul[role='listbox']");
    await expect(listbox).not.toBeVisible();
  });

  test("selecting EN language sets cookie", async ({ page, context }) => {
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.click();

    const enOption = page.locator("text=/^English/");
    await enOption.click();

    const cookies = await context.cookies();
    const nextLocaleCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocaleCookie?.value).toBe("en");
  });

  test("pressing Escape closes language selector dropdown", async ({ page }) => {
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    // Wait for the dropdown to close
    const listbox = page.locator("ul[role='listbox']");
    await expect(listbox).not.toBeVisible();

    // Verify aria-expanded is false
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("login button has hover shadow effect", async ({ page }) => {
    const loginButton = page.locator("button:has-text('Đăng nhập với Google')");

    // Check that the button element exists and has the hover shadow class
    const classList = await loginButton.evaluate(
      (el) => Array.from(el.classList).join(" ")
    );
    expect(classList).toContain("hover:shadow");
  });

  test("clicking login button initiates Google OAuth flow", async ({ page }) => {
    // Intercept the Supabase OAuth redirect so no real network call happens.
    // Capture the URL to assert the flow is wired correctly (provider + redirect).
    let authorizeUrl: string | null = null;
    await page.route("**/auth/v1/authorize**", async (route) => {
      authorizeUrl = route.request().url();
      await route.abort();
    });

    await page.locator("button:has-text('Đăng nhập với Google')").click();

    await expect
      .poll(() => authorizeUrl, { timeout: 5000 })
      .not.toBeNull();
    expect(authorizeUrl!).toContain("provider=google");
    expect(authorizeUrl!).toContain(
      encodeURIComponent("http://localhost:3000/auth/callback"),
    );
  });

  test("login page renders correctly on different viewport sizes", async ({
    page,
  }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/login");

      // Check that main elements are still visible
      const loginButton = page.locator("button:has-text('Đăng nhập với Google')");
      await expect(loginButton).toBeVisible();

      const header = page.locator("header");
      await expect(header).toBeVisible();

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    }
  });

  test("initial error from query param is displayed", async ({ page }) => {
    await page.goto("/login?error=auth_callback_failed");

    const errorAlert = page.locator("p[role='alert']");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(
      "Đăng nhập không thành công. Vui lòng thử lại."
    );
  });

  test("page is accessible with keyboard navigation", async ({ page }) => {
    // Direct focus on the language selector button
    const trigger = page.locator("header button[aria-haspopup='listbox']");
    await trigger.focus();

    // Verify it's focused
    const isFocused = await trigger.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Open via Enter
    await trigger.press("Enter");
    const listbox = page.locator("ul[role='listbox']");
    await expect(listbox).toBeVisible();
  });
});
