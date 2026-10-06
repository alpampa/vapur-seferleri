/**
 * planJourney — rota planlayıcı testleri.
 *
 * Kritik senaryolar: direkt ve aktarmalı rota, yön doğrulaması, ara duraktan
 * inme/bine, geçmiş kalkış toleransı, gece yarısı normalizasyonu
 * (akşam planlamasında 00:00–04:59 kalkışlar ertesi güne taşınır),
 * aktarma bekleme penceresi, sıralama ve sonuç sınırı.
 */
import { describe, it, expect } from "vitest";
import { planJourney } from "@/lib/services/route-planner";
import type { ScheduleCardDto } from "@/lib/types/schedule";

/** Zorunlu alanlar dolu bir ScheduleCardDto üretir. */
function makeSchedule(overrides: Partial<ScheduleCardDto> & Pick<ScheduleCardDto, "origin" | "destination" | "departureTime">): ScheduleCardDto {
  return {
    id: `trip-${Math.random().toString(36).slice(2, 8)}`,
    operator: "Şehir Hatları",
    routeTitle: `${overrides.origin} ➔ ${overrides.destination}`,
    departureTime12: `${overrides.departureTime} AM`,
    status: "ON_TIME",
    platform: "3",
    price: "₺45.00",
    progress: 0,
    ...overrides,
  } as ScheduleCardDto;
}

describe("planJourney — temel doğrulama", () => {
  it("aynı iskele veya boş girdi → sonuç yok", () => {
    const schedules = [makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "10:00" })];
    expect(planJourney(schedules, "Kadıköy", "Kadıköy", 540)).toEqual([]);
    expect(planJourney(schedules, "", "Eminönü", 540)).toEqual([]);
    expect(planJourney(schedules, "Kadıköy", "", 540)).toEqual([]);
  });
});

describe("planJourney — direkt rota", () => {
  it("eşleşen sefer DIRECT seçenek üretir", () => {
    const schedules = [
      makeSchedule({
        origin: "Kadıköy",
        destination: "Eminönü",
        departureTime: "10:00",
        arrivalTime: "10:25",
        id: "direct-1",
      }),
    ];
    const results = planJourney(schedules, "Kadıköy", "Eminönü", 540); // 09:00

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("DIRECT");
    expect(results[0].departureTime).toBe("10:00");
    expect(results[0].arrivalTime).toBe("10:25");
    expect(results[0].durationMinutes).toBe(25);
    expect(results[0].legs).toHaveLength(1);
    expect(results[0].legs[0]).toMatchObject({
      origin: "Kadıköy",
      destination: "Eminönü",
      tripId: "direct-1",
    });
  });

  it("ara durak varış noktası olabilir — durak saati kullanılır", () => {
    const schedules = [
      makeSchedule({
        origin: "Kadıköy",
        destination: "Büyükada",
        departureTime: "10:00",
        stops: [
          { name: "Kınalıada", time: "10:10" },
          { name: "Burgazada", time: "10:20" },
        ],
        id: "islands-1",
      }),
    ];
    const results = planJourney(schedules, "Kadıköy", "Burgazada", 540);

    expect(results).toHaveLength(1);
    expect(results[0].departureTime).toBe("10:00");
    expect(results[0].arrivalTime).toBe("10:20");
    expect(results[0].durationMinutes).toBe(20);
  });

  it("ara durak kalkış noktası olabilir", () => {
    const schedules = [
      makeSchedule({
        origin: "Kadıköy",
        destination: "Büyükada",
        departureTime: "10:00",
        stops: [
          { name: "Kınalıada", time: "10:10" },
          { name: "Burgazada", time: "10:20" },
        ],
      }),
    ];
    const results = planJourney(schedules, "Burgazada", "Büyükada", 540);

    expect(results).toHaveLength(1);
    expect(results[0].departureTime).toBe("10:20"); // Burgazada kalkış saati
    expect(results[0].durationMinutes).toBe(20); // 1 hop × 20 dk tahmin
  });

  it("ters yön seferi eşleşmez (yön doğrulaması)", () => {
    const schedules = [
      makeSchedule({ origin: "Eminönü", destination: "Kadıköy", departureTime: "10:00" }),
    ];
    const results = planJourney(schedules, "Kadıköy", "Eminönü", 540);
    expect(results).toHaveLength(0);
  });
});

describe("planJourney — geçmiş kalkış filtresi", () => {
  it("5 dakikadan daha geçmiş kalkışlar listelenmez", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "09:00" }),
    ];
    // Şu an 10:00 → 09:00 kalkışı 60 dk önce → hariç
    expect(planJourney(schedules, "Kadıköy", "Eminönü", 600)).toHaveLength(0);
  });

  it("5 dakika tolerans içindeki kalkışlar korunur", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "09:58" }),
    ];
    // Şu an 10:00 → 09:58 kalkışı 2 dk önce → tolerans içinde, listelenir
    expect(planJourney(schedules, "Kadıköy", "Eminönü", 600)).toHaveLength(1);
  });
});

describe("planJourney — gece yarısı normalizasyonu", () => {
  it("akşam planlamasında gece kalkışı ertesi güne taşınır ve sıralamada sona düşer", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "21:00" }),
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "00:30" }),
    ];
    // Şu an 20:50 → 21:00 bugün, 00:30 yarın (mutlak 1470)
    const results = planJourney(schedules, "Kadıköy", "Eminönü", 1250);

    expect(results).toHaveLength(2);
    expect(results[0].departureTime).toBe("21:00"); // bugünkü önce
    expect(results[1].departureTime).toBe("00:30"); // gece seferi sonra
  });

  it("gece yarısını aşan varış süresi doğru hesaplanır (23:50 → 00:20)", () => {
    const schedules = [
      makeSchedule({
        origin: "Kadıköy",
        destination: "Bostancı",
        departureTime: "23:50",
        arrivalTime: "00:20",
      }),
    ];
    // Şu an 23:00 → kalkış bugün 23:50
    const results = planJourney(schedules, "Kadıköy", "Bostancı", 1380);

    expect(results).toHaveLength(1);
    expect(results[0].durationMinutes).toBe(30); // 23:50 → 00:20
    expect(results[0].arrivalTime).toBe("00:20");
  });
});

describe("planJourney — aktarmalı rota", () => {
  it("uygun bekleme penceresiyle 1 aktarmalı seçenek üretir", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Büyükada", departureTime: "10:00", id: "leg-1" }),
      makeSchedule({ origin: "Büyükada", destination: "Kabataş", departureTime: "10:50", id: "leg-2" }),
    ];
    // Kadıköy 10:00 → Büyükada ~10:35 (35 dk tahmin) → Kabataş 10:50 kalkış = 15 dk bekleme
    const results = planJourney(schedules, "Kadıköy", "Kabataş", 540);

    const transfer = results.find((r) => r.type === "TRANSFER");
    expect(transfer).toBeDefined();
    expect(transfer!.transferPier).toBe("Büyükada");
    expect(transfer!.transferWaitMinutes).toBe(15);
    expect(transfer!.legs).toHaveLength(2);
    expect(transfer!.legs[0].tripId).toBe("leg-1");
    expect(transfer!.legs[1].tripId).toBe("leg-2");
    expect(transfer!.durationMinutes).toBe(85); // 10:00 → 11:25 (2×35 dk + 15 dk bekleme)
  });

  it("bekleme penceresi dışındaki aktarmalar önerilmez", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Büyükada", departureTime: "10:00" }),
      makeSchedule({ origin: "Büyükada", destination: "Kabataş", departureTime: "18:00" }), // ~7.4 saat bekleme
    ];
    const results = planJourney(schedules, "Kadıköy", "Kabataş", 540);
    expect(results.filter((r) => r.type === "TRANSFER")).toHaveLength(0);
  });
});

describe("planJourney — sıralama ve sınır", () => {
  it("DIRECT seçenekler TRANSFER'lardan önce gelir", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Büyükada", departureTime: "10:00" }),
      makeSchedule({ origin: "Büyükada", destination: "Kabataş", departureTime: "10:50" }),
      makeSchedule({ origin: "Kadıköy", destination: "Kabataş", departureTime: "10:15", id: "direct-k" }),
    ];
    const results = planJourney(schedules, "Kadıköy", "Kabataş", 540);

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].type).toBe("DIRECT");
    expect(results[0].departureTime).toBe("10:15");
    expect(results[results.length - 1].type).toBe("TRANSFER");
  });

  it("aynı tipte erken kalkış önce sıralanır", () => {
    const schedules = [
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "11:00" }),
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "10:30" }),
      makeSchedule({ origin: "Kadıköy", destination: "Eminönü", departureTime: "10:45" }),
    ];
    const results = planJourney(schedules, "Kadıköy", "Eminönü", 540);
    expect(results.map((r) => r.departureTime)).toEqual(["10:30", "10:45", "11:00"]);
  });

  it("en fazla 10 sonuç döner", () => {
    const schedules = Array.from({ length: 14 }, (_, i) =>
      makeSchedule({
        origin: "Kadıköy",
        destination: "Eminönü",
        departureTime: `1${String(i % 10)}:${String((i * 7) % 60).padStart(2, "0")}`,
      })
    );
    const results = planJourney(schedules, "Kadıköy", "Eminönü", 0); // currentMinutes=0 → geçmiş filtresi kapalı
    expect(results).toHaveLength(10);
  });
});
