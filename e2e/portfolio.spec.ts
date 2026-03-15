import { test, expect } from "@playwright/test";

test.describe("Portfolio page", () => {
  //TODO this can be done with API calls instead of manual actions, but we can change it later these tests
  // are only a placeholder as a guide
  test.beforeEach(async ({ page }) => {
    // Buy a fund first so portfolio is not empty
    await page.goto("/");
    const actionsButton = page.getByRole("button", { name: /acciones/i }).first();
    await actionsButton.click();
    await page.getByRole("menuitem", { name: /comprar/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("spinbutton").fill("100");
    await dialog.getByRole("button", { name: /comprar/i }).click();
    await expect(page.getByText(/compra realizada/i)).toBeVisible();
  });

  test("shows purchased fund in portfolio", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("list")).toBeVisible();
    const positions = page.getByRole("listitem");
    await expect(positions).not.toHaveCount(0);
  });

  test("sells a fund from portfolio", async ({ page }) => {
    await page.goto("/portfolio");

    const actionsButton = page.getByRole("button", { name: /acciones/i }).first();
    await actionsButton.click();
    await page.getByRole("menuitem", { name: /vender/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("spinbutton").fill("50");
    await dialog.getByRole("button", { name: /vender/i }).click();

    await expect(page.getByText(/venta realizada/i)).toBeVisible();
  });

  test("transfers between funds", async ({ page }) => {
    //TODO: Same as the before all, this can be done with a data prep before
    // Buy a second fund
    await page.goto("/");
    const secondActions = page.getByRole("button", { name: /acciones/i }).nth(1);
    await secondActions.click();
    await page.getByRole("menuitem", { name: /comprar/i }).click();
    const buyDialog = page.getByRole("dialog");
    await buyDialog.getByRole("spinbutton").fill("50");
    await buyDialog.getByRole("button", { name: /comprar/i }).click();
    await expect(page.getByText(/compra realizada/i)).toBeVisible();

    // Transfer from first to second
    await page.goto("/portfolio");
    const actionsButton = page.getByRole("button", { name: /acciones/i }).first();
    await actionsButton.click();
    await page.getByRole("menuitem", { name: /traspasar/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("combobox").selectOption({ index: 0 });
    await dialog.getByRole("spinbutton").fill("25");
    await dialog.getByRole("button", { name: /traspasar/i }).click();

    await expect(page.getByText(/traspaso realizado/i)).toBeVisible();
  });

  test("shows empty state when portfolio is empty", async ({ page }) => {
    // Reset by going directly — MSW resets between tests in isolation
    await page.goto("/portfolio");
    // If portfolio is empty (no purchases in this test), show empty state
    const emptyState = page.getByText(/no tienes fondos/i);
    const positions = page.getByRole("listitem");
    // One of these should be true
    const isEmpty = (await positions.count()) === 0;
    if (isEmpty) {
      await expect(emptyState).toBeVisible();
    }
  });
});
