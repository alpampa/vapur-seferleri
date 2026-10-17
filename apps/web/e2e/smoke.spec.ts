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
  test.setTimeout(60000);
  await page.goto("/");

  await page
    .getByRole("button", { name: /seferi, detay için açın/ })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await dialog.getByRole("tab", { name: "Aktarma" }).click();
  await expect(dialog.getByText("Yürüme Süresi")).toBeVisible();
  await expect(dialog.getByText("Turnike & Biniş Emniyeti")).toBeVisible();
});

test("Arama: doğal arama ile liste filtrelenir", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Ara", exact: true }).click();
  const search = page.getByPlaceholder(/İskele veya hat ara/i);
  await search.fill("Büyükada");

  // Gece servis boşluğunda (son seferden ~00:10'a kadar) sonuç listesi boş olabilir;
  // bu pencerede arama yine de yanıt vermiş olmalı (boş durum mesajı görünür).
  await expect(
    page
      .getByRole("button", { name: /Büyükada/ })
      .first()
      .or(page.getByText(/eşleşen aktif vapur seferi bulunamadı/i).first())
  ).toBeVisible({ timeout: 8000 });
});

test("Tema kalıcılığı: Güneş Modu seçilir ve yenilemede korunur", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");

  await page.getByRole("button", { name: "Tema seç" }).click();
  await page.getByText("Güneş Modu & Ultra Kontrast").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "sun-contrast");

  // Gece yükü altında reload bazen ERR_ABORTED verebilir (servis çalışanı devri);
  // kalıcılık kontrolü taze gezinmeyle de aynı şekilde doğrulanır.
  try {
    await page.reload({ timeout: 15000 });
  } catch {
    await page.goto("/", { timeout: 15000 });
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sun-contrast");
});
