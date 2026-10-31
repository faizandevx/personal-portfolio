import { defineConfig, devices } from "@playwright/test";

const APP_URL = "http://localhost:3000";
// The approved V21 prototype, served read-only from ../design-reference.
export const REFERENCE_URL = "http://localhost:4100";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
  },
  // Documented parity tolerances (see CLAUDE.md). Differences above these are
  // reported and explained, not suppressed.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "e2e",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "visual",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], channel: "chrome", reducedMotion: "reduce" },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run reference",
      url: REFERENCE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
