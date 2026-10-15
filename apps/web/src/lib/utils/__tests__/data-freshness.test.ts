import { describe, it, expect } from "vitest";
import {
  resolveDataFreshness,
  FRESH_MAX_AGE_DAYS,
  AGING_MAX_AGE_DAYS,
} from "@/lib/utils/data-freshness";

const DAY = 86_400_000;
const NOW = Date.parse("2026-10-15T12:00:00Z");

describe("resolveDataFreshness", () => {
  it("aynı gün doğrulanmış veriyi taze sayar", () => {
    const f = resolveDataFreshness(new Date(NOW - 2 * 3600_000).toISOString(), NOW);
    expect(f.level).toBe("FRESH");
    expect(f.ageDays).toBe(0);
    expect(f.ageLabel).toBe("bugün");
    expect(f.isStale).toBe(false);
  });

  it("eşik içindeki gecikmeyi hâlâ taze sayar", () => {
    const f = resolveDataFreshness(
      new Date(NOW - FRESH_MAX_AGE_DAYS * DAY).toISOString(),
      NOW,
    );
    expect(f.level).toBe("FRESH");
    expect(f.isStale).toBe(false);
  });

  it("eşiği aşınca eskimekte sayar (uyarı yok)", () => {
    const f = resolveDataFreshness(
      new Date(NOW - (FRESH_MAX_AGE_DAYS + 1) * DAY).toISOString(),
      NOW,
    );
    expect(f.level).toBe("AGING");
    expect(f.isStale).toBe(false);
    expect(f.ageLabel).toBe("3 gün önce");
  });

  it("AGING eşiğini aşınca bayat sayar ve uyarır", () => {
    const f = resolveDataFreshness(
      new Date(NOW - (AGING_MAX_AGE_DAYS + 1) * DAY).toISOString(),
      NOW,
    );
    expect(f.level).toBe("STALE");
    expect(f.isStale).toBe(true);
    expect(f.ageDays).toBe(8);
  });

  it("dün için 'dün' etiketi verir", () => {
    const f = resolveDataFreshness(new Date(NOW - DAY).toISOString(), NOW);
    expect(f.ageLabel).toBe("dün");
    expect(f.ageDays).toBe(1);
  });

  it("doğrulama tarihi bilinmiyorsa tazelik iddia etmez", () => {
    for (const v of [undefined, null, "", "gecersiz-tarih"]) {
      const f = resolveDataFreshness(v, NOW);
      expect(f.level).toBe("UNKNOWN");
      expect(f.ageDays).toBeNull();
      expect(f.verifiedOnLabel).toBeNull();
      expect(f.isStale).toBe(true);
    }
  });

  it("gelecekteki damgayı negatif yaşa düşürmez", () => {
    const f = resolveDataFreshness(new Date(NOW + 3 * DAY).toISOString(), NOW);
    expect(f.ageDays).toBe(0);
    expect(f.level).toBe("FRESH");
  });

  it("Türkçe doğrulama tarihi etiketi üretir", () => {
    const f = resolveDataFreshness(Date.parse("2026-10-04T19:41:03.265Z").toString(), NOW);
    expect(f.level).toBe("UNKNOWN");
    const g = resolveDataFreshness("2026-10-04T19:41:03.265Z", NOW);
    expect(g.verifiedOnLabel).toContain("2026");
    expect(g.verifiedOnLabel).toContain("Ekim");
    expect(g.ageDays).toBe(10);
  });

  it("gerçek snapshot damgasını bayat olarak işaretler", () => {
    // Uygulamadaki announcements.json damgası (2026-10-04) — regresyon koruması
    const f = resolveDataFreshness("2026-10-04T19:41:03.265Z", NOW);
    expect(f.isStale).toBe(true);
  });
});
