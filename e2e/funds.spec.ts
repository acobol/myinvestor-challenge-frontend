import { test, expect } from "@playwright/test";

test.describe("Funds page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays funds table with data", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();
    const rowNum = await page.getByRole("row").count();
    expect(rowNum).toBeGreaterThan(1);
  });

  test("sorts funds by name ascending", async ({ page }) => {
    const nameHeader = page.getByRole("columnheader", { name: /nombre/i });
    await nameHeader.click();

    const firstRow = page.getByRole("row").nth(1);
    const secondRow = page.getByRole("row").nth(2);
    const firstName = await firstRow.getByRole("cell").first().textContent();
    const secondName = await secondRow.getByRole("cell").first().textContent();
    expect(firstName!.localeCompare(secondName!)).toBeLessThanOrEqual(0);
  });

  test("sorts funds by name descending on second click", async ({ page }) => {
    const nameHeader = page.getByRole("columnheader", { name: /nombre/i });
    await nameHeader.click();
    await nameHeader.click();

    const firstRow = page.getByRole("row").nth(1);
    const secondRow = page.getByRole("row").nth(2);
    const firstName = await firstRow.getByRole("cell").first().textContent();
    const secondName = await secondRow.getByRole("cell").first().textContent();
    expect(firstName!.localeCompare(secondName!)).toBeGreaterThanOrEqual(0);
  });

  test("paginates to next page", async ({ page }) => {
    const firstPageFirstRow = await page
      .getByRole("row")
      .nth(1)
      .getByRole("cell")
      .first()
      .textContent();

    await page.getByRole("button", { name: /siguiente/i }).click();

    const secondPageFirstRow = await page
      .getByRole("row")
      .nth(1)
      .getByRole("cell")
      .first()
      .textContent();

    expect(firstPageFirstRow).not.toBe(secondPageFirstRow);
  });

  test("buys a fund successfully", async ({ page }) => {
    const actionsButton = page.getByRole("button", { name: /acciones/i }).first();
    await actionsButton.click();

    await page.getByRole("menuitem", { name: /comprar/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("spinbutton").fill("100");
    await dialog.getByRole("button", { name: /comprar/i }).click();

    await expect(page.getByText(/compra realizada/i)).toBeVisible();
  });
});
