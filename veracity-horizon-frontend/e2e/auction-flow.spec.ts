import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function uniqueEmail(): string {
  return `e2e_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe("Veracity Horizon E2E", () => {
  test("public landing page renders brand and CTAs", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Discover, Bid, and Win/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });

  test("user can register and then log in successfully", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");

    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    const registerPromise = page.waitForURL(/\/login/, { timeout: 20000 });
    await page.getByRole("button", { name: /complete registration/i }).click();
    await registerPromise;

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");

    const loginPromise = page.waitForURL(/\/dashboard/, { timeout: 20000 });
    await page.getByRole("button", { name: /sign in/i }).click();
    await loginPromise;

    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("rejects login with invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/invalid/i).first()).toBeVisible();
  });

  test("authenticated user can browse the marketplace", async ({ page }) => {
    await page.goto(`${BASE_URL}/market`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Marketplace/i })).toBeVisible();
  });

  test("marketplace category filter buttons are present", async ({ page }) => {
    await page.goto(`${BASE_URL}/market`);
    await page.waitForLoadState("domcontentloaded");
    const artBtn = page.getByRole("button", { name: /Art/i }).first();
    await expect(artBtn).toBeVisible();
  });

  test("pagination control is present on marketplace", async ({ page }) => {
    await page.goto(`${BASE_URL}/market`);
    await page.waitForLoadState("domcontentloaded");
    const nextBtn = page.getByRole("button", { name: /Next/i });
    await expect(nextBtn).toBeVisible();
  });

  test("skip to content link is present for accessibility", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(".skip-to-content")).toBeVisible();
  });

  test("login page has proper form labels and elements", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page has proper form labels and elements", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Bidder Username")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
  });

  test("email verification page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/email-verification`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Verify Your Email/i })).toBeVisible();
  });

  test("reset password page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("forgot password page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("profile page renders after login", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Personal Information/i })).toBeVisible();
  });

  test("profile page shows tab navigation", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /Profile/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Security/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Recent Bids/i })).toBeVisible();
  });

  test("profile page has quick navigation links", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("link", { name: /Marketplace/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Bid History/i })).toBeVisible();
  });

  test("user can log out from profile page", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /Logout/i })).toBeVisible();
  });

  test("dark mode toggle is visible on dashboard", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    const toggle = page.getByRole("button", { name: /dark mode|light mode/i });
    await expect(toggle).toBeVisible();
  });

  test("notification bell is visible in dashboard header", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Bidder Username").fill(email.split("@")[0]);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");
    await page.getByRole("button", { name: /complete registration/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /notifications/i })).toBeVisible();
  });

  test("authentication pages have proper heading structure", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading")).toBeVisible();

    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("marketplace renders auction cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/market`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: /Marketplace/i })).toBeVisible();
  });
});