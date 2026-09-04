import { test, expect, type Page } from "@playwright/test";

// Every test starts from a clean device: the app persists to localStorage under kindred.v2.
test.beforeEach(async ({ page }) => {
  // Wipe persisted state once per test (each test gets a fresh context, so sessionStorage is the per-test flag).
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("e2e-reset")) { localStorage.setItem("kindred.v2", JSON.stringify({ account: { name: "Jules Renard", email: "jules@renard.co", provider: "email", signedIn: true, createdAt: "2026-09-01T00:00:00.000Z" }, onboarded: true })); sessionStorage.setItem("e2e-reset", "1"); } } catch {} });
});

const isMobile = (page: Page) => page.viewportSize()!.width < 768;

test("discover renders the hero, feed pills and product grid", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /kindred/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Following" })).toBeVisible();
  await expect(page.locator('a[href^="/product/"]:visible').first()).toBeVisible();
});

test("explore filters by a feel query and opens a product", async ({ page }) => {
  await page.goto("/explore?q=linen%20shirt");
  await expect(page.getByRole("heading").first()).toBeVisible();
  const first = page.getByRole("link", { name: /shirt/i }).first();
  await expect(first).toBeVisible();
  await first.click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("shopper can add to bag, apply a promo, and place an order", async ({ page }) => {
  await page.goto("/product/felted-cardigan");
  await page.getByRole("button", { name: /add to bag/i }).first().click();
  await page.goto("/bag");
  await expect(page.getByRole("heading", { name: "Your bag" })).toBeVisible();
  await expect(page.getByText("Felted Cardigan").first()).toBeVisible();
  // WARMUP is Core Theory's seeded promo; the cardigan is Core Theory.
  await page.getByPlaceholder(/promo or gift card code/i).fill("WARMUP");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(/WARMUP applied/)).toBeVisible();
  await page.goto("/checkout");
  await page.getByRole("button", { name: /^Pay \$/ }).click();
  await expect(page.getByText(/Order #UN-\d+ placed/i)).toBeVisible();
  await page.goto("/account?tab=Orders");
  await expect(page.getByText(/#UN-\d+ · placed/).first()).toBeVisible();
});

test("gift card is issued, applied, and debited by checkout", async ({ page }) => {
  await page.goto("/gift");
  await page.getByPlaceholder("Their name").fill("Mara");
  await page.getByRole("button", { name: /^Pay \$100/ }).click();
  const code = await page.locator("text=/^KIND-[A-Z0-9]{4}-[A-Z0-9]{4}$/").first().textContent();
  expect(code).toMatch(/^KIND-/);
  await page.getByRole("button", { name: "Use it myself" }).click();
  await page.goto("/bag");
  await expect(page.getByText(/Gift card ····/).first()).toBeVisible();
  await page.goto("/checkout");
  await page.getByRole("button", { name: /^Pay \$/ }).click();
  await expect(page.getByText(/placed/i).first()).toBeVisible();
  await page.goto("/gift");
  await expect(page.getByText("$0.00").first()).toBeVisible();
});

test("brand onboarding creates a live brand page and dashboard", async ({ page }) => {
  test.skip(isMobile(page), "the seven-step wizard is exercised on desktop");
  await page.goto("/sell");
  await page.getByRole("button", { name: /start · takes 5 minutes/i }).click();
  await page.getByPlaceholder("Form & Void").fill("Test Atelier");
  await page.getByPlaceholder("Workwear cut from one bolt at a time").fill("Cut slowly, worn for years");
  await page.getByPlaceholder("Rotterdam", { exact: true }).fill("Lisbon");
  await page.getByPlaceholder("NL", { exact: true }).fill("PT");
  await page.getByRole("button", { name: "Continue" }).click();
  // Aesthetic: 2 styles, 3 moods
  for (const s of ["Workwear", "Minimalist"]) await page.getByRole("button", { name: s, exact: true }).click();
  for (const m of ["cozy", "rugged", "clean"]) await page.getByRole("button", { name: m, exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  // Catalogue
  await page.getByRole("button", { name: "Shirting", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  // Production
  await page.getByRole("button", { name: "Linen", exact: true }).click();
  await page.getByRole("button", { name: "Small batch", exact: true }).click();
  await page.getByPlaceholder("Rotterdam, NL").fill("Lisbon, PT");
  await page.getByRole("button", { name: "Continue" }).click();
  // Shipping
  await page.getByPlaceholder("Rotterdam", { exact: true }).fill("Lisbon");
  await page.getByRole("button", { name: "EU", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("textarea").fill("Started in a garage in Lisbon with two sewing machines and a roll of linen we could not stop touching.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Launch brand page" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page.goto("/brand/test-atelier");
  await expect(page.getByRole("heading", { name: "Test Atelier" })).toBeVisible();
});

test("first visit requires an account; onboarding picks a look that restyles the app", async ({ page }) => {
  // Fresh device: no account at all.
  await page.addInitScript(() => { try { localStorage.removeItem("kindred.v2"); sessionStorage.setItem("e2e-reset", "1"); } catch {} });
  await page.goto("/explore");
  await expect(page).toHaveURL(/\/signup/);
  await page.getByPlaceholder("Jules Renard").fill("Ada Okafor");
  await page.locator('input[type="email"]').fill("ada@example.com");
  await page.locator('input[type="password"]').fill("hunter22");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  for (const s of ["Workwear", "Vintage revival", "Archive"]) await page.getByRole("button", { name: s, exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "See my look" }).click();
  await expect(page.getByRole("heading", { name: /Your look is Heritage/ })).toBeVisible();
  await page.getByRole("button", { name: "Start browsing" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.look)).toBe("heritage");
  await page.goto("/brands");
  await expect(page.getByText("Your look").first()).toBeVisible();
});
