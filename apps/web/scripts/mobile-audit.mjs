import { chromium } from "@playwright/test";

const TARGET = process.env.AUDIT_URL || "http://localhost:3210";

async function main() {
  const browser = await chromium.launch();
  for (const vp of [
    { name: "iPhone-390x844", width: 390, height: 844 },
    { name: "Android-360x740", width: 360, height: 740 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(TARGET, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    const bottomNav = await page
      .locator('nav[aria-label="Ana gezinme"]')
      .isVisible()
      .catch(() => false);

    const smallTargets = await page.evaluate(() => {
      const els = [...document.querySelectorAll("button, a, [role=button]")];
      const bad = [];
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
          const label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30);
          if (label) bad.push({ label, w: Math.round(r.width), h: Math.round(hitH) });
        }
      }
      return bad;
    });

    console.log(`--- ${vp.name} ---`);
    console.log(`H_OVERFLOW=${overflow}px BOTTOM_NAV=${bottomNav} SMALL_TARGETS=${smallTargets.length}`);
    const uniq = new Map();
    for (const t of smallTargets) if (!uniq.has(t.label)) uniq.set(t.label, t);
    [...uniq.values()].slice(0, 12).forEach((t) => console.log(`  <40px: "${t.label}" ${t.w}x${t.h}`));

    const firstCard = page.locator('[role="button"][aria-label*="detay için açın"]').first();
    if ((await firstCard.count()) > 0) {
      await firstCard.click();
      await page.waitForTimeout(1000);
      const dialog = await page
        .locator('[role="dialog"]')
        .first()
        .isVisible()
        .catch(() => false);
      const sheetOverflow = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.scrollWidth - d.clientWidth : -1;
      });
      console.log(`SHEET_OPEN=${dialog} SHEET_H_OVERFLOW=${sheetOverflow}px`);
    }
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error("ERR", e.message);
  console.error(`AUDIT_URL=${TARGET} adresine erişilemedi. Yerelde önce: npm run build && npm run start -- -p 3210`);
  process.exit(1);
});
