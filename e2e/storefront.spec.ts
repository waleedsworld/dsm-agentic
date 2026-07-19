import { test, expect, Page } from "@playwright/test";

/**
 * Seed a cart into localStorage before the SPA boots so the Cart page renders
 * deterministically from persisted state (mirrors a returning shopper).
 */
async function seedCart(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "dsm-cart",
      JSON.stringify([
        {
          id: "e2e-office",
          name: "Microsoft Office 2021",
          price: "AED 499.00",
          unitPrice: 499,
          quantity: 2,
          brand: "Microsoft",
          category: "Productivity",
          licenseType: "Retail",
          glbSrc: "/models/e2e-office.glb",
        },
      ]),
    );
  });
}

test.describe("DSM storefront smoke", () => {
  test("home page renders the concierge hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DSM/i);
    // The SPA root must actually mount (not a blank shell).
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.getByRole("link", { name: "Store" }).first()).toBeVisible();
  });

  test("store page lists catalogue products from the offline fallback", async ({ page }) => {
    await page.goto("/store");
    await expect(page.getByRole("heading", { name: "Store", level: 1 })).toBeVisible();
    // Product cards hydrate from the bundled catalogue even with no backend.
    const cards = page.locator("h3");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("cart page renders persisted items and the AED total", async ({ page }) => {
    await seedCart(page);
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Cart", level: 1 })).toBeVisible();
    await expect(page.getByText("Microsoft Office 2021").first()).toBeVisible();
    // 2 x AED 499 = AED 998 — the formatted total must appear somewhere on the page.
    await expect(page.getByText(/998/).first()).toBeVisible();
  });

  test("unknown routes fall through to the 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});
