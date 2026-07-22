import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for the Veracity Horizon front-end.
 *
 * The webServer block boots `next dev` automatically. The back-end REST API
 * is expected to be running at http://localhost:5000 (see .env.local) — start
 * it with `npm run dev` in veracity-horizon-backend, or via docker compose,
 * before running `npx playwright test`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
