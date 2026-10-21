import { describe, it, expect } from "vitest";
import { getIdoSchedules } from "@/lib/data/ido-schedules";

describe("İDO Seferleri Doğrulama", () => {
  it("İDO tarifesi geçerli ve eksiksiz sefer kayıtları üretir", () => {
    const trips = getIdoSchedules();
    expect(trips.length).toBeGreaterThanOrEqual(20);
    expect(trips.every((t) => t.operator === "İDO")).toBe(true);
    expect(trips.every((t) => /^\d{2}:\d{2}$/.test(t.departureTime))).toBe(true);
    expect(trips.every((t) => t.platform.includes("İDO"))).toBe(true);
    expect(trips.every((t) => t.category === "ADALAR")).toBe(true);
  });

  it("Bostancı ➔ Büyükada ve Kabataş ➔ Büyükada hızlı deniz otobüsü seferlerini içerir", () => {
    const trips = getIdoSchedules();
    const bosToAda = trips.filter((t) => t.origin === "Bostancı");
    expect(bosToAda.length).toBeGreaterThan(0);

    const kabToAda = trips.filter((t) => t.origin === "Kabataş");
    expect(kabToAda.length).toBeGreaterThan(0);
  });
});
