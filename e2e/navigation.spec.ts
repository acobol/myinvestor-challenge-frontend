import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates to funds page by default", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /fondos/i })).toBeVisible();
  });

  test("navigates to portfolio page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /cartera/i }).click();
    await expect(page).toHaveURL("/portfolio");
    await expect(
      page.getByRole("heading", { name: /cartera/i }),
    ).toBeVisible();
  });

  test("navigates back to funds page from portfolio", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByRole("link", { name: /fondos/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("active nav link is highlighted", async ({ page }) => {
    await page.goto("/");
    const fundsLink = page.getByRole("link", { name: /fondos/i });
    await expect(fundsLink).toHaveAttribute("aria-current", "page");

    await page.goto("/portfolio");
    const portfolioLink = page.getByRole("link", { name: /cartera/i });
    await expect(portfolioLink).toHaveAttribute("aria-current", "page");
  });
});
