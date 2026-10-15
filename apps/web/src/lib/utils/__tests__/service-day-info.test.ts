import { describe, it, expect } from "vitest";
import { resolveServiceDayInfo, tariffBadgeLabel } from "@/lib/utils/service-day-info";

/** Europe/Istanbul sabit UTC+3; kesin anlar için +03:00 kullanılır. */
const at = (iso: string) => Date.parse(`${iso}+03:00`);

describe("resolveServiceDayInfo", () => {
  it("normal hafta içi günü hafta içi tarifesi verir", () => {
    // 15 Ekim 2026 = Perşembe
    const info = resolveServiceDayInfo(at("2026-10-15T12:00:00"));
    expect(info.tariffDay).toBe("WEEKDAY");
    expect(info.tariffLabel).toBe("Hafta içi tarifesi");
    expect(info.isHoliday).toBe(false);
    expect(info.holidayName).toBeNull();
  });

  it("cumartesi günü cumartesi tarifesi verir", () => {
    // 17 Ekim 2026 = Cumartesi
    const info = resolveServiceDayInfo(at("2026-10-17T12:00:00"));
    expect(info.tariffDay).toBe("SATURDAY");
    expect(info.tariffLabel).toBe("Cumartesi tarifesi");
  });

  it("pazar günü pazar tarifesi verir", () => {
    // 18 Ekim 2026 = Pazar
    const info = resolveServiceDayInfo(at("2026-10-18T12:00:00"));
    expect(info.tariffDay).toBe("SUNDAY");
    expect(info.tariffLabel).toBe("Pazar tarifesi");
  });

  it("sabit resmi tatilde tatil tarifesi ve tatil adı verir", () => {
    // 29 Ekim 2026 = Cumhuriyet Bayramı (Perşembe)
    const info = resolveServiceDayInfo(at("2026-10-29T12:00:00"));
    expect(info.tariffDay).toBe("HOLIDAY");
    expect(info.tariffLabel).toBe("Tatil tarifesi");
    expect(info.isHoliday).toBe(true);
    expect(info.holidayName).toBe("Cumhuriyet Bayramı");
  });

  it("hafta sonuna denk gelen tatilde tatil tarifesi önceliklidir", () => {
    // 30 Mayıs 2026 = Kurban Bayramı 4. Gün (Cumartesi) → motor tatil filtresi uygular
    const info = resolveServiceDayInfo(at("2026-05-30T12:00:00"));
    expect(info.tariffDay).toBe("HOLIDAY");
    expect(info.isHoliday).toBe(true);
  });

  it("arefe (yarım gün) tatil tarifesi UYGULAMAZ, yalnızca bilgi verir", () => {
    // 26 Mayıs 2026 = Kurban Bayramı Arefesi (Salı)
    const info = resolveServiceDayInfo(at("2026-05-26T12:00:00"));
    expect(info.isHoliday).toBe(false);
    expect(info.tariffDay).toBe("WEEKDAY");
    expect(info.holidayName).toBeNull();
    expect(info.halfDayName).toContain("Arefe");
  });

  it("Türkçe uzun tarih etiketi üretir", () => {
    const info = resolveServiceDayInfo(at("2026-10-15T12:00:00"));
    expect(info.dateLabel).toContain("2026");
    expect(info.dateLabel).toContain("Ekim");
  });

  it("gece yarısı İstanbul gününe göre hesaplar (UTC kayması yok)", () => {
    // 2026-10-17T22:30Z = 18 Ekim 01:30 İstanbul → Pazar
    const info = resolveServiceDayInfo(Date.parse("2026-10-17T22:30:00Z"));
    expect(info.tariffDay).toBe("SUNDAY");
  });
});

describe("tariffBadgeLabel", () => {
  it("'tarifesi' son ekini kısaltır", () => {
    const info = resolveServiceDayInfo(at("2026-10-15T12:00:00"));
    expect(tariffBadgeLabel(info)).toBe("Hafta içi");
  });
});
