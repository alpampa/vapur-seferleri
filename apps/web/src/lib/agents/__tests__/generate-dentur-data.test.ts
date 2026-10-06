import { describe, it } from "vitest";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scrapeAllDenturSchedules } from "@/lib/agents/dentur-scraper";

/**
 * GERÇEK VERİ ÜRETİCİ:
 * `GENERATE_DENTUR=1 npx vitest run src/lib/agents/__tests__/generate-dentur-data.test.ts`
 * çalıştırınca denturavrasya.com canlı sayfalarını çeker, parse eder ve
 * src/lib/data/dentur-schedules.json dosyasını YENİDEN yazar.
 *
 * Varsayılan (env yokken) bu test HİÇBİR ŞEY yapmaz → CI/push sırasında
 * ağ çağrısı yapılmaz. Üretilen JSON repoya işlenmiş gerçek veridir.
 */
describe("dentur üretici", () => {
  it("canlı veriyi çekip JSON üretir (env ile)", async () => {
    if (process.env.GENERATE_DENTUR !== "1") return;

    const { records, failures } = await scrapeAllDenturSchedules();
    const payload = {
      operator: "Dentur Avrasya",
      sourceBase: "https://www.denturavrasya.com/tr-TR/hatlarimiz/*",
      generatedAt: new Date().toISOString(),
      scrapedAtUserAgent:
        "Vapur-Sync-Agent/3.0 (resmi denturavrasya.com sayfalarından birebir)",
      note: "Sayfalarda birebir yazılı saatler kaydedildi; 'Sürekli Sefer' pencereleri isContinuous ile işaretlidir, sahte dakika üretilmedi.",
      failures,
      lines: records,
    } as const;

    const outPath = fileURLToPath(
      new URL("../../data/dentur-schedules.json", import.meta.url)
    );
    writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf-8");

    if (failures.length > 0) {
      throw new Error(
        `Dentur üretimi kısmen başarısız: ${JSON.stringify(failures)}`
      );
    }
  });
});
