import { expect, test } from "@playwright/test";

/**
 * Duman testleri: üretim build'i üzerinde kritik kullanıcı akışları.
 * Seçiciler mevcut erişilebilirlik etiketlerine dayanır (aria-label / role),
 * böylece kozmetik değişikliklerde kırılmaz.
 */

test("Ana sayfa: sefer listesi, güven şeridi ve alt menü görünür", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible();
  await expect(page.getByText("Duyuru doğrulama")).toBeVisible();
  await expect(page.getByText(/tarife/i).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /seferi, detay için açın/ }).first()
  ).toBeVisible();
});

test("Pano sekmesi: iskele kalkış panosu açılır", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Pano" }).click();

  await expect(page.getByText(/İSKELE KALKIŞ PANOSU/i)).toBeVisible();
  await expect(page.getByText(/İskelesi/).first()).toBeVisible();
});

test("Sefer detayı: çekmece açılır, Aktarma sekmesinde yürüme takibi görünür", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: /seferi, detay için açın/ })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("tab", { name: "Aktarma" }).click();
  await expect(dialog.getByText("Yürüme Süresi")).toBeVisible();
  await expect(dialog.getByText("Turnike & Biniş Emniyeti")).toBeVisible();
});

test("Arama: doğal arama ile liste filtrelenir", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Ara", exact: true }).click();
  const search = page.getByPlaceholder(/doğal arama/i);
  await search.fill("Büyükada");

  await expect(
    page.getByRole("button", { name: /Büyükada/ }).first()
  ).toBeVisible();
});

test("Tema kalıcılığı: Güneş Modu seçilir ve yenilemede korunur", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Tema seç" }).click();
  await page.getByText("Güneş Modu & Ultra Kontrast").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "sun-contrast");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sun-contrast");
});
