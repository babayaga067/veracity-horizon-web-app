import { test, expect, type Page } from "@playwright/test";

/**
 * END-TO-END TESTS — Veracity Horizon (Chromium)
 *
 * These tests drive the real front-end against a live back-end API
 * (http://localhost:5000). They cover the primary user journeys required by
 * the assignment: public browsing, registration, authentication, auction
 * creation, and bidding.
 *
 * Run order:
 *   1. Start the API:   cd veracity-horizon-backend && npm run dev
 *   2. Start E2E:       cd veracity-horizon-frontend && npx playwright test
 */

const uniqueEmail = () => `e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

async function registerUser(page: Page, email: string) {
  await page.goto("/register");
  await page.getByLabel("First Name").fill("E2E");
  await page.getByLabel("Last Name").fill("Tester");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm Password").fill("password123");
  await page.getByRole("button", { name: /complete registration/i }).click();
  // Registration redirects to the login page on success.
  await page.waitForURL("**/login", { timeout: 15_000 });
  // Reload to guarantee a clean, hydrated login form before signing in.
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
}

async function loginUser(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Veracity Horizon E2E", () => {
  test("public landing page renders brand and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Discover, Bid, and Win/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });

  test("user can register and then log in", async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);
    await loginUser(page, email);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
  });

  test("user can log in with valid credentials", async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);
    await page.goto("/");
    await loginUser(page, email);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("rejects login with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated user can browse the marketplace", async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);
    await loginUser(page, email);
    await page.goto("/market");
    await expect(
      page.getByRole("heading", { name: /Marketplace/i })
    ).toBeVisible();
  });

  test("authenticated user can create an auction", async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);
    await loginUser(page, email);
    await page.goto("/dashboard/auctions/create");
    await page.getByLabel("Title").fill("E2E Test Painting");
    await page
      .getByLabel("Description")
      .fill("A rare piece created by the E2E suite.");
    await page.getByLabel(/Starting Price/i).fill("1500");
    await page.getByLabel("Category").selectOption("Art");
    await page.getByRole("button", { name: /create auction/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/auctions/);
  });
});
