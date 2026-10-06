/**
 * resolveDynamicTrip — canlı sefer durum çözümleme testleri.
 *
 * Kritik senaryolar: geri sayım pencereleri, kalkış sonrası 30 sn grace,
 * gece yarısı geçişi (23:50'de 00:15 kalkış), ara durak gün kaydırması,
 * varış fallback'i ve tüm bacaklar geçince COMPLETED/expired durumuna geçiş.
 */
import { describe, it, expect } from "vitest";
import { resolveDynamicTrip, isTripCancelled } from "@/lib/utils/dynamic-trip";

// 2026-10-01 Perşembe — sabit referans gün (İstanbul yerel saati)
const at = (iso: string) => new Date(iso).getTime();

const TARGET_ISO = "2026-10-01T19:40:00.000Z"; // 22:40 İstanbul

describe("resolveDynamicTrip — yaklaşan sefer (ON_TIME)", () => {
  it("14 dakika kala tam dakika sayısı verir, countdown yoktur", () => {
    // Kalkış 22:40; şimdi 22:26 → 14 dk
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      [{ name: "Burgazada", time: "22:55" }],
      "23:10",
      at("2026-10-01T22:26:00+03:00")
    );

    expect(res.isExpired).toBe(false);
    expect(res.isDeparted).toBe(false);
    expect(res.status).toBe("ON_TIME");
    expect(res.countdown).toBeNull();
    expect(res.minutesUntilDeparture).toBe(14);
    expect(res.currentOrigin).toBe("Kınalıada");
    expect(res.currentTargetIso).toBe("2026-10-01T22:40:00+03:00");
  });

  it("5 dakikadan uzun süre kalan ilk durak kalkış noktasıdır", () => {
    // Ara durak kalkışı 22:55; şimdi 22:30 → aktif bacak hâlâ Kınalıada (25 dk)
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      [{ name: "Burgazada", time: "22:55" }],
      "23:10",
      at("2026-10-01T22:30:00+03:00")
    );
    expect(res.currentOrigin).toBe("Kınalıada");
    expect(res.activeLegIndex).toBe(0);
  });
});

describe("resolveDynamicTrip — canlı geri sayım penceresi (≤ 5 dk)", () => {
  it("2 dakika kala BOARDING + MM:SS countdown", () => {
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      undefined,
      "23:00",
      at("2026-10-01T22:38:00+03:00")
    );
    expect(res.status).toBe("BOARDING");
    expect(res.countdown).toBe("02:00");
    expect(res.minutesUntilDeparture).toBe(2);
  });

  it("2–5 dk arası DEPARTING_SOON", () => {
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      undefined,
      "23:00",
      at("2026-10-01T22:36:00+03:00")
    );
    expect(res.status).toBe("DEPARTING_SOON");
    expect(res.countdown).toBe("04:00");
  });

  it("tam pencere sınırında (5 dk) countdown görünür", () => {
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      undefined,
      "23:00",
      at("2026-10-01T22:35:00+03:00")
    );
    expect(res.countdown).toBe("05:00");
    expect(res.status).toBe("DEPARTING_SOON");
  });
});

describe("resolveDynamicTrip — kalkış anı ve grace penceresi", () => {
  it("kalkıştan sonraki 30 sn içinde IN_TRANSIT + HAREKET ETTİ", () => {
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      undefined,
      "23:00",
      at("2026-10-01T22:40:10+03:00") // kalkıştan 10 sn sonra
    );
    expect(res.isDeparted).toBe(true);
    expect(res.status).toBe("IN_TRANSIT");
    expect(res.countdown).toBeNull();
    expect(res.minutesUntilDeparture).toBeNull();
    expect(res.isExpired).toBe(false); // grace içinde
  });

  it("ara durak kalkışı geçince aktif bacak ilerler", () => {
    // Kalkış 22:40, Burgazada 22:55; şimdi 22:56 → aktif bacak Burgazada
    const res = resolveDynamicTrip(
      "Kınalıada",
      "Bostancı",
      "22:40",
      TARGET_ISO,
      [{ name: "Burgazada", time: "22:55" }],
      "23:10",
      at("2026-10-01T22:55:20+03:00") // ara durak kalkışından 20 sn sonra (grace içinde)
    );
    expect(res.currentOrigin).toBe("Burgazada");
    expect(res.activeLegIndex).toBe(1);
    // İlk durak tamamlandı, kalanlar bekliyor
    expect(res.waypoints[0].state).toBe("COMPLETED");
    expect(res.waypoints[1].state).toBe("CURRENT");
    expect(res.waypoints[2].state).toBe("UPCOMING");
    expect(res.activeChain[0]).toMatchObject({ name: "Burgazada", isOrigin: true });
    expect(res.activeChain[1]).toMatchObject({ name: "Bostancı", isDestination: true });
  });
});

describe("resolveDynamicTrip — gece yarısı geçişi", () => {
  it("23:50'de görüntülenen 00:15 kalkışlı sefer yarına aittir, yaklaşan seferdir", () => {
    const res = resolveDynamicTrip(
      "Kadıköy",
      "Bostancı",
      "00:15",
      "2026-09-30T21:15:00.000Z",
      undefined,
      "00:45",
      at("2026-10-01T23:50:00+03:00")
    );
    expect(res.isExpired).toBe(false);
    expect(res.minutesUntilDeparture).toBe(25);
    expect(res.currentTargetIso).toBe("2026-10-02T00:15:00+03:00");
    expect(res.currentOrigin).toBe("Kadıköy");
  });

  it("gece kalkışı gündüz görüntülendiğinde bugüne ait kalır (geçmiş → sonraki bacak/expire)", () => {
    // 15:30'da "00:15" kalkışı bugün 00:15 → çoktan geçti, tek bacak → expired
    const res = resolveDynamicTrip(
      "Kadıköy",
      "Bostancı",
      "00:15",
      "2026-09-30T21:15:00.000Z",
      undefined,
      "00:45",
      at("2026-10-01T15:30:00+03:00")
    );
    expect(res.isExpired).toBe(true);
    expect(res.status).toBe("COMPLETED");
  });
});

describe("resolveDynamicTrip — ara durak gün kaydırması", () => {
  it("23:45 kalkış → 00:10 ara durak ertesi güne işlenir", () => {
    const res = resolveDynamicTrip(
      "Kadıköy",
      "Büyükada",
      "23:45",
      "2026-10-01T20:45:00.000Z",
      [{ name: "Kınalıada", time: "00:10" }],
      "00:30",
      at("2026-10-01T23:40:00+03:00") // kalkıştan 5 dk önce
    );
    expect(res.isExpired).toBe(false);
    expect(res.countdown).toBe("05:00");
    // Ara durağın hedef anı ertesi gün 00:10
    expect(res.waypoints.map((w) => w.name)).toEqual(["Kadıköy", "Kınalıada", "Büyükada"]);
  });
});

describe("resolveDynamicTrip — varış fallback", () => {
  it("varış saati yoksa son durak + 20 dk tahmini süre kullanılır", () => {
    const res = resolveDynamicTrip(
      "Kadıköy",
      "Eminönü",
      "22:00",
      "2026-10-01T19:00:00.000Z",
      undefined,
      undefined,
      at("2026-10-01T21:30:00+03:00")
    );
    // Varış 22:20 → sefer 22:00 kalkışlı, 30 dk sonra hâlâ aktif midir?
    // Tek bacak: kalkış bacağı 22:00. now 21:30 → 30 dk kaldı.
    expect(res.waypoints).toHaveLength(2);
    expect(res.waypoints[1].time).toBe("22:20");
  });
});

describe("resolveDynamicTrip — tüm bacaklar geçti", () => {
  it("son kalkış bacağından 30 sn sonra COMPLETED + isExpired", () => {
    // Kalkış 22:00, Burgazada 22:30, varış 23:00 → son kalkış bacağı 22:30
    const res = resolveDynamicTrip(
      "Kadıköy",
      "Büyükada",
      "22:00",
      "2026-10-01T19:00:00.000Z",
      [{ name: "Burgazada", time: "22:30" }],
      "23:00",
      at("2026-10-01T23:00:00+03:00")
    );
    expect(res.isExpired).toBe(true);
    expect(res.status).toBe("COMPLETED");
    expect(res.activeChain).toEqual([]);
    expect(res.activeLegIndex).toBe(2); // bacak sayısı
    expect(res.waypoints.every((w) => w.state === "COMPLETED")).toBe(true);
  });
});

describe("isTripCancelled — ortak iptal tespiti", () => {
  const okDyn = { status: "ON_TIME" } as const;
  const cancelledDyn = { status: "CANCELLED" } as const;

  it("schedule.status CANCELLED ise iptaldir", () => {
    expect(isTripCancelled({ status: "CANCELLED" }, okDyn)).toBe(true);
  });

  it("dyn.status CANCELLED ise iptaldir", () => {
    expect(isTripCancelled({ status: "ON_TIME" }, cancelledDyn)).toBe(true);
  });

  it("delayText içinde 'iptal' geçiyorsa iptaldir (küçük harf)", () => {
    expect(isTripCancelled({ status: "ON_TIME", delayText: "sefer iptal edildi" }, okDyn)).toBe(true);
  });

  it("Türkçe büyük 'İ' ile yazılmış 'İptal' de yakalanır", () => {
    // Not: plain toLowerCase burada başarısız olurdu (İ → i̇ combining dot)
    expect(isTripCancelled({ status: "ON_TIME", delayText: "SEFER İPTAL" }, okDyn)).toBe(true);
  });

  it("Normal gecikme metni iptal değildir", () => {
    expect(isTripCancelled({ status: "DELAYED", delayText: "Lodos / Fırtına" }, okDyn)).toBe(false);
  });

  it("delayText yoksa ve status açıksa iptal değildir", () => {
    expect(isTripCancelled({ status: "ON_TIME" }, okDyn)).toBe(false);
  });
});
