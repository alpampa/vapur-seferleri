/**
 * istanbul-time — merkezi saat motoru testleri.
 *
 * Referans anlar ISO +03:00 damgalarıyla sabitlenir; böylece testler
 * çalıştırıldığı cihazın saat diliminden bağımsızdır (kural #26/#36).
 */
import { describe, it, expect } from "vitest";
import {
  hhmmToMinutes,
  minutesToHhmm,
  compareHhmm,
  getIstanbulParts,
  nextOccurrenceMs,
  istanbulIsoFor,
  isNightDepartureHhmm,
  nightRolloverDayOffset,
  toAbsoluteDayMinutes,
  formatRemainingShort,
} from "@/lib/utils/istanbul-time";

// Sabit referans anlar (İstanbul yerel saatiyle):
const EVENING_2150 = new Date("2026-10-01T21:50:00+03:00").getTime(); // Perşembe akşamı
const AFTERNOON_1530 = new Date("2026-10-01T15:30:00+03:00").getTime(); // Perşembe öğleden sonra
const NIGHT_2350 = new Date("2026-10-01T23:50:00+03:00").getTime(); // Perşembe gece yarısına 10 dk
const AFTER_MIDNIGHT_0005 = new Date("2026-10-02T00:05:00+03:00").getTime(); // Cuma gece yarısı sonrası

describe("hhmmToMinutes", () => {
  it("geçerli saatleri dakikaya çevirir", () => {
    expect(hhmmToMinutes("00:00")).toBe(0);
    expect(hhmmToMinutes("09:05")).toBe(545); // tek haneli saat kabul edilir
    expect(hhmmToMinutes("21:50")).toBe(1310);
    expect(hhmmToMinutes("23:59")).toBe(1439);
  });

  it("geçersiz girdileri null döndürür", () => {
    expect(hhmmToMinutes("24:00")).toBeNull(); // saat aralık dışı
    expect(hhmmToMinutes("12:60")).toBeNull(); // dakika aralık dışı
    expect(hhmmToMinutes("12:6")).toBeNull(); // dakika 2 haneli olmalı
    expect(hhmmToMinutes("abc")).toBeNull();
    expect(hhmmToMinutes("")).toBeNull();
  });
});

describe("minutesToHhmm", () => {
  it("dakikayı HH:mm gösterir", () => {
    expect(minutesToHhmm(0)).toBe("00:00");
    expect(minutesToHhmm(545)).toBe("09:05");
    expect(minutesToHhmm(1310)).toBe("21:50");
  });

  it("gün sarmasını doğru işler", () => {
    expect(minutesToHhmm(1440)).toBe("00:00"); // tam bir gün
    expect(minutesToHhmm(1450)).toBe("00:10");
    expect(minutesToHhmm(-10)).toBe("23:50"); // negatif → önceki gün
  });
});

describe("compareHhmm", () => {
  it("kronolojik sıralama için işaret döndürür", () => {
    expect(compareHhmm("09:00", "10:30")).toBeLessThan(0);
    expect(compareHhmm("10:30", "09:00")).toBeGreaterThan(0);
    expect(compareHhmm("10:30", "10:30")).toBe(0);
  });
});

describe("getIstanbulParts", () => {
  it("İstanbul takvimine göre parçalar", () => {
    const parts = getIstanbulParts(EVENING_2150);
    expect(parts.dateStr).toBe("2026-10-01");
    expect(parts.hour).toBe(21);
    expect(parts.minute).toBe(50);
    expect(parts.dayOfWeek).toBe(4); // 2026-10-01 Perşembe
  });

  it("gece yarısından sonraki an yeni güne aittir", () => {
    const parts = getIstanbulParts(AFTER_MIDNIGHT_0005);
    expect(parts.dateStr).toBe("2026-10-02");
    expect(parts.hour).toBe(0);
    expect(parts.minute).toBe(5);
  });
});

describe("nextOccurrenceMs", () => {
  it("gelecek saat için bugünkü gerçekleşimi döndürür", () => {
    const ms = nextOccurrenceMs("15:45", AFTERNOON_1530);
    expect(ms).toBe(new Date("2026-10-01T15:45:00+03:00").getTime());
  });

  it("23:50'de sorulan 00:20 → yarın 00:20 (gece yarısı aşımı)", () => {
    const ms = nextOccurrenceMs("00:20", NIGHT_2350);
    expect(ms).toBe(new Date("2026-10-02T00:20:00+03:00").getTime());
  });

  it("tam gerçekleşme anında (<=) bir sonraki güne geçer", () => {
    const ms = nextOccurrenceMs("21:50", EVENING_2150);
    expect(ms).toBe(new Date("2026-10-02T21:50:00+03:00").getTime());
  });

  it("geçersiz saat → null", () => {
    expect(nextOccurrenceMs("abc", AFTERNOON_1530)).toBeNull();
  });
});

describe("istanbulIsoFor", () => {
  it("rollover kapalıyken geçmiş saat bugüne ait kalir", () => {
    // 23:50'de "00:15" bugünün sabahı (geçmiş) — kaydırma yok
    const iso = istanbulIsoFor("00:15", NIGHT_2350, false);
    expect(iso).toBe(new Date("2026-10-01T00:15:00+03:00").toISOString());
  });

  it("rollover açıkken 23:50'deki 00:15 → yarın (gece seferi)", () => {
    const iso = istanbulIsoFor("00:15", NIGHT_2350, true);
    expect(iso).toBe(new Date("2026-10-02T00:15:00+03:00").toISOString());
  });

  it("geçerli olmayan saat → null", () => {
    expect(istanbulIsoFor("99:99", NIGHT_2350, true)).toBeNull();
  });
});

describe("isNightDepartureHhmm", () => {
  it("00:00–04:59 kalkışlar gece seferidir", () => {
    expect(isNightDepartureHhmm("00:00")).toBe(true);
    expect(isNightDepartureHhmm("04:59")).toBe(true);
  });

  it("05:00 ve sonrası gece seferi değildir", () => {
    expect(isNightDepartureHhmm("05:00")).toBe(false);
    expect(isNightDepartureHhmm("23:59")).toBe(false);
    expect(isNightDepartureHhmm("geçersiz")).toBe(false);
  });
});

describe("nightRolloverDayOffset", () => {
  it("akşam (>= 20:00) + gece kalkışı → ertesi gün", () => {
    expect(nightRolloverDayOffset("00:15", NIGHT_2350)).toBe(1);
    expect(nightRolloverDayOffset("00:15", EVENING_2150)).toBe(1);
  });

  it("gündüz saatlerinde gece kalkışı kaymaz", () => {
    expect(nightRolloverDayOffset("00:15", AFTERNOON_1530)).toBe(0);
  });

  it("gece olmayan kalkışlar hiçbir durumda kaymaz", () => {
    expect(nightRolloverDayOffset("21:00", NIGHT_2350)).toBe(0);
    expect(nightRolloverDayOffset("05:00", NIGHT_2350)).toBe(0);
  });
});

describe("toAbsoluteDayMinutes", () => {
  it("gündüz planlamasında kaydırma yok", () => {
    expect(toAbsoluteDayMinutes("14:30", 900)).toBe(870);
    expect(toAbsoluteDayMinutes("00:30", 900)).toBe(30);
  });

  it("akşam planlamasında gece kalkışları ertesi güne (+1440) taşınır", () => {
    expect(toAbsoluteDayMinutes("00:15", 1430)).toBe(1455); // 23:50'de 00:15
    expect(toAbsoluteDayMinutes("04:59", 1250)).toBe(1739); // 20:50'de 04:59
  });

  it("akşamda bile 05:00 ve sonrası kaymaz", () => {
    expect(toAbsoluteDayMinutes("05:00", 1430)).toBe(300);
    expect(toAbsoluteDayMinutes("21:00", 1430)).toBe(1260);
  });
});

describe("formatRemainingShort", () => {
  it("60 dakikanın altı düz dakika gösterir", () => {
    expect(formatRemainingShort(14)).toBe("14 dk");
    expect(formatRemainingShort(0)).toBe("0 dk");
    expect(formatRemainingShort(59)).toBe("59 dk");
  });

  it("tam saatler kısa gösterilir", () => {
    expect(formatRemainingShort(60)).toBe("1 sa");
    expect(formatRemainingShort(120)).toBe("2 sa");
  });

  it("karma süreler saat + sıfır dolgulu dakika", () => {
    expect(formatRemainingShort(65)).toBe("1 sa 05 dk");
    expect(formatRemainingShort(125)).toBe("2 sa 05 dk");
  });
});
