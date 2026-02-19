import { expect, test } from "@playwright/test";

test("user can add a dive", async ({ page }) => {
  await page.goto("http://localhost:5173");

  // Login (adapt selectors to your UI)
  await page.getByTestId("email").fill(process.env.E2E_EMAIL!);
  await page.getByTestId("password").fill(process.env.E2E_PASSWORD!);
  await page.getByTestId("login-button").click();

  // Add dive
  await page.getByTestId("add-dive-button").click();
  await page.getByTestId("dive-location").fill("Arrábida");
  await page.getByTestId("dive-depth").fill("18");
  await page.getByTestId("dive-duration").fill("42");
  await page.getByTestId("save-dive").click();

  // Assert it appears
  await expect(page.getByText("Arrábida")).toBeVisible();
});
