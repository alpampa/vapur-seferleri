import { expect, test, type Page } from "@playwright/test";

/**
 * BAĞIMSIZ DENETİM (salt okuma) — üretim kodu değiştirilmez.
 * Amaç: ana sayfa, arama, sefer sonuçları, rota planlama, duyurular, hata ve
 * çevrimdışı davranışını gerçek tarayıcıda masaüstü + 320/360/390/430 px
 * genişliklerde test etmek; konsol hatalarını, başarısız ağ isteklerini,
 * yatay taşmayı ve çalışmayan butonları kaydetmek.
 *
 * Başarısızlık politikası:
 *  - HARD FAIL: yakalanmamış JS istisnası (pageerror), yatay taşma (>1px),
 *    aynı-kaynak 5xx yanıtları, sayfa açılmaması.
 *  - KAYIT: konsol hataları, aynı-kaynak 4xx (favicon hariç), harici hatalar.
 */

const BASE = "http://localhost:3000";

interface Diag {
  consoleErrors: string[];
  pageErrors: string[];
  sameOrigin5xx: string[];
  sameOrigin4xx: string[];
  externalFails: string[];
}

function attachDiag(page: Page): Diag {
  const d: Diag = { consoleErrors: [], pageErrors: [], sameOrigin5xx: [], sameOrigin4xx: [], externalFails: [] };
  page.on("console", (m) => {
    if (m.type() === "error") d.consoleErrors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => d.pageErrors.push(String(e).slice(0, 300)));
  page.on("response", (r) => {
    const st = r.status();
    if (st < 400) return;
    const u = r.url();
    const line = `${st} ${u}`;
    if (u.startsWith(BASE)) {
      if (u.includes("favicon.ico")) return;
      if (st >= 500) d.sameOrigin5xx.push(line);
      else d.sameOrigin4xx.push(line);
    } else {
      d.externalFails.push(line);
    }
  });
  page.on("requestfailed", (r) => {
    const u = r.url();
    const line = `FAILED ${r.failure()?.errorText ?? "?"} ${u}`;
    if (u.startsWith(BASE)) d.sameOrigin4xx.push(line);
    else d.externalFails.push(line);
  });
  return d;
}

async function overflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

async function report(tag: string, page: Page, d: Diag, extra: Record<string, unknown>, testInfo: import("@playwright/test").TestInfo) {
  const payload = {
    tag,
    ...extra,
    consoleErrors: d.consoleErrors,
    pageErrors: d.pageErrors,
    sameOrigin5xx: d.sameOrigin5xx,
    sameOrigin4xx: d.sameOrigin4xx,
    externalFails: [...new Set(d.externalFails)].slice(0, 15),
  };
  const summary =
    `${tag} | ${JSON.stringify(extra)} consoleErr=${d.consoleErrors.length} ` +
    `pageErr=${d.pageErrors.length} 5xx=${d.sameOrigin5xx.length} 4xx=${d.sameOrigin4xx.length} extFail=${d.externalFails.length}`;
  console.log(summary);
  if (d.consoleErrors.length) console.log(`  console: ${JSON.stringify(d.consoleErrors.slice(0, 6))}`);
  if (d.pageErrors.length) console.log(`  pageerror: ${JSON.stringify(d.pageErrors.slice(0, 6))}`);
  if (d.sameOrigin5xx.length) console.log(`  5xx: ${JSON.stringify(d.sameOrigin5xx.slice(0, 6))}`);
  if (d.sameOrigin4xx.length) console.log(`  4xx: ${JSON.stringify([...new Set(d.sameOrigin4xx)].slice(0, 6))}`);
  await testInfo.attach(`${tag}.json`, { body: JSON.stringify(payload, null, 2), contentType: "application/json" });
}

const VIEWPORTS = [
  { name: "desktop-1280x800", width: 1280, height: 800 },
  { name: "mob-320x640", width: 320, height: 640 },
  { name: "mob-360x740", width: 360, height: 740 },
  { name: "mob-390x844", width: 390, height: 844 },
  { name: "mob-430x932", width: 430, height: 932 },
];

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`ana sayfa yüklenir + teşhis (${vp.name})`, async ({ page }, testInfo) => {
      test.setTimeout(60000);
      const d = attachDiag(page);
      const resp = await page.goto("/", { waitUntil: "domcontentloaded" });
      expect(resp?.status(), "ana sayfa HTTP durumu").toBeLessThan(400);

      await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(3500);

      const ov = await overflow(page);
      const navVisible = await page
        .locator('nav[aria-label="Ana gezinme"]')
        .isVisible()
        .catch(() => false);

      await report(vp.name, page, d, { overflow: ov, navVisible, url: page.url() }, testInfo);
      await testInfo.attach(`${vp.name}.png`, { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });

      expect(ov, "yatay taşma olmamalı").toBeLessThanOrEqual(1);
      expect(d.pageErrors, "yakalanmamış JS istisnası olmamalı").toEqual([]);
      expect(d.sameOrigin5xx, "aynı-kaynak 5xx olmamalı").toEqual([]);
    });

    test(`küçük dokunma hedefleri (${vp.name})`, async ({ page }, testInfo) => {
      test.setTimeout(60000);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      const smallTargets = await page.evaluate(() => {
        const els = [...document.querySelectorAll("button, a, [role=button]")];
        const bad: { label: string; w: number; h: number }[] = [];
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.bottom < 0 || r.top > innerHeight) continue;
          let hitH = r.height;
          const after = getComputedStyle(el, "::after");
          if (after && after.position === "absolute" && after.content !== "none") {
            const ah = parseFloat(after.height);
            if (!isNaN(ah) && ah > hitH) hitH = ah;
          }
          if (hitH < 40) {
            const label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
            if (label) bad.push({ label, w: Math.round(r.width), h: Math.round(hitH) });
          }
        }
        return bad;
      });
      const uniq = new Map<string, { label: string; w: number; h: number }>();
      for (const t of smallTargets) if (!uniq.has(t.label)) uniq.set(t.label, t);
      const list = [...uniq.values()];
      console.log(`smallTargets@${vp.name} = ${list.length} :: ${JSON.stringify(list)}`);
      await testInfo.attach(`${vp.name}-small-targets.json`, { body: JSON.stringify(list, null, 2), contentType: "application/json" });
      // Bilgilendirici: kabul eşiği rapor düzeyinde değerlendirilir (hard fail yok).
    });
  });
}

test("arama: doğal arama sonuç verir (desktop)", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const d = attachDiag(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: "Ara", exact: true }).click();
  const search = page.getByPlaceholder(/İskele veya hat ara/i);
  await search.fill("Büyükada");
  const found = page
    .getByRole("button", { name: /Büyükada/ })
    .first()
    .or(page.getByText(/eşleşen aktif vapur seferi bulunamadı/i).first());
  await expect(found).toBeVisible({ timeout: 10000 });
  const text = await found.innerText().catch(() => "");
  await report("search", page, d, { overflow: await overflow(page), resultText: text.slice(0, 80) }, testInfo);
  await testInfo.attach("search.png", { body: await page.screenshot(), contentType: "image/png" });
  expect(d.pageErrors).toEqual([]);
});

test("iskele rehberi araması (mob-360)", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const d = attachDiag(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: "İskeleler" }).click();
  const input = page.getByPlaceholder(/İskele adı ara/i);
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill("Kadıköy");
  await page.waitForTimeout(800);
  const hasResult = await page.getByText(/Kadıköy/).first().isVisible().catch(() => false);
  await report("piers", page, d, { overflow: await overflow(page), hasResult }, testInfo);
  await testInfo.attach("piers.png", { body: await page.screenshot(), contentType: "image/png" });
  expect(d.pageErrors).toEqual([]);
  expect(hasResult, "Kadıköy araması sonuç döndürmeli").toBe(true);
});

test("rota planlama: sonuç veya açık boş-durum (desktop)", async ({ page }, testInfo) => {
  test.setTimeout(120000);
  const d = attachDiag(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  const resp = await page.goto("/live-map", { waitUntil: "domcontentloaded" });
  expect(resp?.status(), "/live-map durumu").toBeLessThan(400);

  const selects = page.locator("select");
  const selectCount = await selects.count();

  // Varsayılan seçimle sonuç/boş-durum görünmeli.
  // NOT: Aynı anda direkt ("Tahmini Varış") ve aktarmalı ("aktarma beklemesi")
  // kartlar bulunabilir; bu yüzden birleşim tek elemana indirgenmeli.
  const resultVisible = page
    .getByText(/Tahmini Varış/i)
    .or(page.getByText(/aktarma beklemesi/i))
    .or(page.getByText(/sefer bulunamadı/i))
    .first();
  let plannedDefault = false;
  try {
    await expect(resultVisible).toBeVisible({ timeout: 20000 });
    plannedDefault = true;
  } catch {
    plannedDefault = false;
  }

  // Kaynak == hedef engeli: hedef menüsünde kaynak iskelesi devre dışı olmalı.
  const disabledSameName = await page.evaluate(() => {
    const sels = [...document.querySelectorAll("select")];
    if (sels.length < 2) return null;
    const origin = (sels[0] as HTMLSelectElement).selectedOptions[0]?.text ?? "";
    const dest = sels[1] as HTMLSelectElement;
    const o = [...dest.options].find((op) => op.text === origin);
    return o ? o.disabled : null;
  });

  // Geçerli farklı bir hedef seçilebiliyorsa planı yeniden üret.
  let changed = false;
  if (selectCount >= 2) {
    try {
      await selects.nth(1).selectOption({ index: 2 }, { timeout: 4000 });
      await page.waitForTimeout(1500);
      changed = true;
    } catch {
      changed = false;
    }
  }

  await report(
    "route-planner",
    page,
    d,
    { overflow: await overflow(page), selectCount, plannedDefault, changed, disabledSameName, url: page.url() },
    testInfo
  );
  await testInfo.attach("route-planner.png", { body: await page.screenshot(), contentType: "image/png" });
  expect(selectCount, "/live-map iki iskele seçici içermeli").toBeGreaterThanOrEqual(2);
  expect(d.pageErrors).toEqual([]);
  expect(plannedDefault, "planlayıcı varsayılan seçimle sonuç/boş-durum göstermeli").toBe(true);
});

test("sefer sonuçları: kart açılır, detay + Aktarma sekmesi (desktop)", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const d = attachDiag(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cards = page.getByRole("button", { name: /seferi, detay için açın/ });
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  let idx = 0;
  for (let i = 0; i < Math.min(count, 15); i++) {
    const t = await cards.nth(i).innerText();
    if (!t.includes("HAREKET ETTİ")) {
      idx = i;
      break;
    }
  }
  await cards.nth(idx).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.getByRole("tab", { name: "Aktarma" }).click();
  const walk = await dialog.getByText("Yürüme Süresi").isVisible().catch(() => false);
  const turnstile = await dialog.getByText("Turnike & Biniş Emniyeti").isVisible().catch(() => false);
  await report("trip-detail", page, d, { overflow: await overflow(page), cardCount: count, idx, walk, turnstile }, testInfo);
  await testInfo.attach("trip-detail.png", { body: await page.screenshot(), contentType: "image/png" });
  expect(walk || turnstile, "Aktarma sekmesi içerik göstermeli").toBe(true);
  expect(d.pageErrors).toEqual([]);
});

test("duyurular API'si ve banner durumu", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const d = attachDiag(page);
  const api = await page.request.get(`${BASE}/api/announcements`, { timeout: 30000 }).catch((e) => {
    console.log("announcements API isteği başarısız:", String(e));
    return null;
  });
  let status = -1;
  let meta: Record<string, unknown> = {};
  if (api) {
    status = api.status();
    try {
      const j = await api.json();
      meta = {
        generatedAt: j?.generatedAt,
        announcementCount: j?.meta?.announcementCount,
        disruptionCount: j?.meta?.disruptionCount,
        liveScanAt: j?.meta?.liveScanAt,
      };
    } catch (e) {
      meta = { parseError: String(e) };
    }
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const banner = await page.locator('[role="region"][aria-label="Firma duyuruları"]').isVisible().catch(() => false);
  await report("announcements", page, d, { apiStatus: status, ...meta, bannerVisible: banner }, testInfo);
  expect(status, "/api/announcements erişilebilir olmalı").toBe(200);
});

test("hata durumu: bilinmeyen yol 404 döner", async ({ page }, testInfo) => {
  test.setTimeout(30000);
  const d = attachDiag(page);
  const resp = await page.goto("/kesinlikle-olmayan-sayfa-xyz-123", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await report("404", page, d, { status: resp?.status(), url: page.url() }, testInfo);
  await testInfo.attach("404.png", { body: await page.screenshot(), contentType: "image/png" });
  expect(resp?.status(), "bilinmeyen yol 404 olmalı").toBe(404);
});

test("hata dayanıklılığı: API kesilse de ana sayfa açılır", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const d = attachDiag(page);
  await page.route("**/api/announcements*", (r) => r.abort());
  await page.route("**/api/version*", (r) => r.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const navVisible = await page
    .getByRole("navigation", { name: "Ana gezinme" })
    .isVisible({ timeout: 20000 })
    .catch(() => false);
  await page.waitForTimeout(2500);
  await report("resilience", page, d, { navVisible }, testInfo);
  expect(navVisible, "API kesildiğinde bile temel arayüz görünmeli").toBe(true);
});

for (const w of [320, 390]) {
  test(`çevrimdışı davranışı (mob-${w})`, async ({ browser }, testInfo) => {
    test.setTimeout(120000);
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const page = await ctx.newPage();
    const d = attachDiag(page);
    await page.goto("/", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    // SW'nin sayfayı kontrol etmesini bekle — MANUEL YENİLEME YOK.
    // Kabuk ısısı (warm-up) sayesinde çevrimdışı yenileme doğrudan çalışmalıdır.
    await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 20000 }).catch(() => {});
    // Kabuk ısısının tamamlanmasını bekle: SW önbelleğinde "/" görünene kadar (deterministik).
    let shellCached = false;
    for (let i = 0; i < 20 && !shellCached; i++) {
      shellCached = await page
        .evaluate(async () => ("caches" in window) && !!(await caches.match("/", { ignoreVary: true })))
        .catch(() => false);
      if (!shellCached) await page.waitForTimeout(500);
    }
    await page.waitForTimeout(500);
    const onlineNav = await page.getByRole("navigation", { name: "Ana gezinme" }).isVisible().catch(() => false);
    const controlled = await page.evaluate(() => !!navigator.serviceWorker?.controller).catch(() => false);

    await ctx.setOffline(true);
    let reloadErr = "";
    try {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (e) {
      reloadErr = String(e).slice(0, 200);
    }
    await page.waitForTimeout(1500);
    const offlineNav = await page.getByRole("navigation", { name: "Ana gezinme" }).isVisible().catch(() => false);
    const bodyLen = (await page.locator("body").innerText().catch(() => "")).length;
    console.log(`offline-${w} controlled=${controlled} onlineNav=${onlineNav} offlineNav=${offlineNav} bodyLen=${bodyLen} reloadErr=${reloadErr ? "YES" : "no"}`);
    await report(`offline-${w}`, page, d, { controlled, shellCached, onlineNav, offlineNav, bodyLen, reloadErr }, testInfo);
    await testInfo.attach(`offline-${w}.png`, { body: await page.screenshot(), contentType: "image/png" });
    expect(controlled, "SW sayfayı kontrol etmeli").toBe(true);
    expect(shellCached, "çevrimdışı kabuk önbelleğe alınmış olmalı").toBe(true);
    expect(offlineNav, "çevrimdışı yenilemede uygulama kabuğu görünmeli").toBe(true);
    await ctx.close();
  });
}

test("profil işlevleri: bildirim anahtarı, dürüst ödeme satırı, veri temizleme", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const d = attachDiag(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const resp = await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // 1. Sahte kimlik gösterilmemeli (fabricated user data yok)
  const fakeIdentity = await page.getByText(/John Doe|john\.doe@example\.com|Verified/i).count();

  // 2. Bildirim satırı GERÇEK bir anahtar (switch) olmalı ve tıklamaya yanıt vermeli
  const notifSwitch = page.getByRole("switch", { name: /bildirim/i });
  const switchVisible = await notifSwitch.isVisible().catch(() => false);
  const beforeChecked = switchVisible ? await notifSwitch.getAttribute("aria-checked") : null;
  const beforeStatus = await page.getByText(/Açık|Kapalı|engellenmiş|desteklemiyor/i).first().innerText().catch(() => "");
  if (switchVisible) await notifSwitch.click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(800);
  const afterChecked = switchVisible ? await notifSwitch.getAttribute("aria-checked") : null;
  const afterStatus = await page.getByText(/Açık|Kapalı|engellenmiş|desteklemiyor/i).first().innerText().catch(() => "");
  const notifResponded = beforeChecked !== afterChecked || beforeStatus !== afterStatus;

  // 3. Ödeme satırı dürüst bilgi olmalı ve TIKLANABİLİR (önceden ölü) olmamalı
  const honestPayment = await page.getByText(/Kayıtlı ödeme yöntemi yok/i).isVisible().catch(() => false);

  // 4. Veri temizleme GERÇEK: onay diyaloğu açmalı
  let clearDialogMessage = "";
  page.once("dialog", (dlg) => {
    clearDialogMessage = dlg.message();
    dlg.dismiss().catch(() => {});
  });
  await page
    .getByRole("button", { name: /Clear Local Data/i })
    .click({ timeout: 3000 })
    .catch(() => {});
  await page.waitForTimeout(600);

  await report(
    "profile-functions",
    page,
    d,
    { status: resp?.status(), fakeIdentity, switchVisible, notifResponded, honestPayment, clearDialogMessage },
    testInfo
  );
  expect(resp?.status(), "/profile durumu").toBeLessThan(400);
  expect(fakeIdentity, "sahte kimlik gösterilmemeli").toBe(0);
  expect(switchVisible, "bildirim anahtarı görünür olmalı").toBe(true);
  expect(notifResponded, "bildirim anahtarı tıklamaya yanıt vermeli").toBe(true);
  expect(honestPayment, "ödeme satırı dürüst bilgi göstermeli").toBe(true);
  expect(clearDialogMessage, "veri temizleme onay diyaloğu açmalı").toMatch(/yerel veriler/i);
});
