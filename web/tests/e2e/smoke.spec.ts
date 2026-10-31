import { expect, test } from "@playwright/test";
import { REFERENCE_URL } from "../../playwright.config";

test("app home responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page.locator("h1")).toBeVisible();
});

test("design reference is served for parity tests", async ({ page }) => {
  const response = await page.goto(`${REFERENCE_URL}/index.html`);
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/Faizan Ali/);
});
