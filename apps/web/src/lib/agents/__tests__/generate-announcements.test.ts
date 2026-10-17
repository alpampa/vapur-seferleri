import { describe, it } from "vitest";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scrapeAllAnnouncements } from "@/lib/agents/announcements-agent";

/**
 * DUYURU SNAPSHOT ÜRETİCİ:
 * `GENERATE_ANNOUNCEMENTS=1 npx vitest run src/lib/agents/__tests__/generate-announcements.test.ts`
 * resmi duyuru sayfalarını canlı çeker ve
 * src/lib/agents/data-snapshots/announcements.json dosyasını YENİDEN yazar.
 * env yokken test hiçbir şey yapmaz (CI'da ağ çağrısı yok).
 */
describe("duyuru üretici", () => {
  it("canlı duyuruları çekip snapshot üretir (env ile)", async () => {
    if (process.env.GENERATE_ANNOUNCEMENTS !== "1") return;

    const { snapshots, failures, coverage } = await scrapeAllAnnouncements();
    const payload = {
      generatedAt: new Date().toISOString(),
      failures,
      coverage,
      sources: snapshots,
    };

    const outPath = fileURLToPath(
      new URL("../data-snapshots/announcements.json", import.meta.url)
    );
    writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  });
});
