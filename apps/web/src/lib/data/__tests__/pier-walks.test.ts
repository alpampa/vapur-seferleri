import { describe, expect, it } from "vitest";
import { getPierWalkGuide } from "../pier-walks";

describe("pier-walks getPierWalkGuide", () => {
  it("bilinen iskele için kaynaklı kültür kartları döner", () => {
    const guide = getPierWalkGuide("Karaköy");
    expect(guide).not.toBeNull();
    expect(guide!.pierName).toBe("Karaköy");
    expect(guide!.facts.length).toBeGreaterThanOrEqual(1);
    expect(guide!.facts.some((f) => f.title.includes("Galata Kulesi"))).toBe(true);
  });

  it("tüm kaynak bağlantıları Wikipedia https adresidir", () => {
    for (const pierName of ["Karaköy", "Eminönü", "Üsküdar", "Beşiktaş", "Kadıköy", "Kabataş"]) {
      const guide = getPierWalkGuide(pierName);
      expect(guide).not.toBeNull();
      for (const fact of guide!.facts) {
        expect(fact.sourceUrl.startsWith("https://en.wikipedia.org/wiki/")).toBe(true);
        expect(fact.walkMinutes).toBeGreaterThan(0);
        expect(fact.description.length).toBeGreaterThan(20);
      }
    }
  });

  it("bilinmeyen veya boş iskele için null döner (kaynağı olmayan içerik gösterilmez)", () => {
    expect(getPierWalkGuide("Atlantis")).toBeNull();
    expect(getPierWalkGuide("")).toBeNull();
    expect(getPierWalkGuide(null)).toBeNull();
    expect(getPierWalkGuide(undefined)).toBeNull();
  });

  it("baştaki/sondaki boşluklar temizlenerek eşleşir", () => {
    expect(getPierWalkGuide("  Karaköy  ")?.pierName).toBe("Karaköy");
  });
});
