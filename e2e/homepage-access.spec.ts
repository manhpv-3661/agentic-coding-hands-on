import { test, expect } from "@playwright/test";

/**
 * Access Control Tests for Homepage (Port 3000 with Supabase creds)
 *
 * These tests verify auth redirects work correctly when Supabase is configured.
 * With fake Supabase creds set, the proxy is ACTIVE and redirects unauthenticated
 * users to /login before reaching protected routes.
 */
test.describe("Homepage Access Control (Auth Redirect Tests)", () => {
  test("unauthenticated user accessing / redirects to /login", async ({
    page,
  }) => {
    // Navigate to protected homepage
    const response = await page.goto("/", { waitUntil: "networkidle" });

    // With proxy active (Supabase creds set), redirect to /login occurs
    expect(response?.status()).toBeLessThan(400);

    // Should be on login page or redirected
    const url = page.url();
    expect(url).toContain("/login");
  });

  test("unauthenticated user accessing /awards redirects to /login", async ({
    page,
  }) => {
    const response = await page.goto("/awards", { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);

    const url = page.url();
    expect(url).toContain("/login");
  });

  test("unauthenticated user accessing /kudos redirects to /login", async ({
    page,
  }) => {
    const response = await page.goto("/kudos", { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);

    const url = page.url();
    expect(url).toContain("/login");
  });

  test("login page is accessible without auth", async ({ page }) => {
    const response = await page.goto("/login", { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);

    const loginButton = page.locator("button:has-text('LOGIN With Google')");
    await expect(loginButton).toBeVisible();
  });
});
