import { describe, it, expect } from "vitest";
import { getMaviMarmaraSchedules } from "@/lib/data/mavi-marmara-schedules";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import type { RawOfficialTrip } from "@/lib/data/official-schedules";

const MM = getMaviMarmaraSchedules();
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

describe("Mavi Marmara — gerçek resmi tarife verisi", () => {
  it("kayıt sayısı resmi tarifeyle birebir aynıdır (109)", () => {
    // Bostancı kalkış: H hattı 16 + K hattı 15 = 31
    // Büyükada kalkış: 17, Heybeliada: 17, Burgazada: 15, Kınalıada: 17 = 66
    // Kabataş turizm: gidiş 4 + dönüş (Büyükada 4 + Heybeliada 4) = 12
    // TOPLAM = 31 + 66 + 12 = 109
    expect(MM).toHaveLength(109);
  });

  it("hiçbir sefer gece 00:00-04:59 arası kalkmaz (eski uydurma gece seferleri yok)", () => {
    const nightAnomalies = MM.filter((t) => {
      const h = parseInt(t.departureTime.slice(0, 2), 10);
      return h >= 0 && h < 5;
    });
    expect(nightAnomalies).toHaveLength(0);
  });

  it("id'ler benzersizdir", () => {
    const ids = new Set<string>();
    for (const t of MM) {
      expect(ids.has(t.id)).toBe(false);
      ids.add(t.id);
    }
  });

  it("aynı (kalkış, varış, saat) kombinasyonu iki kez geçmez", () => {
    const seen = new Set<string>();
    for (const t of MM) {
      const key = `${t.origin}➔${t.destination}@${t.departureTime}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("bütün saatler HH:mm formatındadır", () => {
    for (const t of MM) {
      expect(t.departureTime).toMatch(timeRegex);
      expect(t.arrivalTime).toMatch(timeRegex);
      for (const s of t.stops ?? []) expect(s.time).toMatch(timeRegex);
    }
  });

  it("varış ve ara durak saatleri kalkıştan sonradır", () => {
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    for (const t of MM) {
      const dep = toMin(t.departureTime);
      for (const s of t.stops ?? []) {
        expect(toMin(s.time)).toBeGreaterThan(dep);
      }
      expect(toMin(t.arrivalTime!)).toBeGreaterThan(dep);
    }
  });

  it("ara durak saatleri kronolojiktir ve varıştan öncedir", () => {
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    for (const t of MM) {
      const stops = t.stops ?? [];
      for (let i = 0; i < stops.length; i++) {
        if (i > 0) expect(toMin(stops[i].time)).toBeGreaterThan(toMin(stops[i - 1].time));
        expect(toMin(stops[i].time)).toBeLessThan(toMin(t.arrivalTime!));
      }
    }
  });

  it("yıldızlı seferler Pazar/Tatil günü kapalıdır, normal seferler her gün açıktır", () => {
    // Yıldızlılar: Bostancı 07:10 (H ve K), Büyükada 07:25, Heybeliada 07:10, Burgazada 06:15, Kınalıada 06:30
    const starredTimes = [
      "Bostancı➔Büyükada@07:10",
      "Bostancı➔Kınalıada@07:10",
      "Büyükada➔Bostancı@07:25",
      "Heybeliada➔Bostancı@07:10",
      "Burgazada➔Bostancı@06:15",
      "Kınalıada➔Bostancı@06:30",
    ];
    for (const t of MM) {
      const key = `${t.origin}➔${t.destination}@${t.departureTime}`;
      if (starredTimes.includes(key)) {
        expect(t.runsSunday).toBe(false);
        expect(t.runsWeekday).toBe(true);
        expect(t.runsSaturday).toBe(true);
      } else {
        expect(t.runsSunday).toBe(true);
      }
    }
  });

  it("Kabataş turizm hafta sonuna özel seferler hafta içi kapalıdır", () => {
    const weekendOnly = MM.filter(
      (t) => t.origin === "Kabataş" || t.destination === "Kabataş"
    ).filter((t) => !t.runsWeekday);
    const expectedWeekendOnly = [
      "Kabataş➔Büyükada@10:45",
      "Kabataş➔Büyükada@13:00",
      "Büyükada➔Kabataş@17:00",
      "Büyükada➔Kabataş@18:00",
      "Heybeliada➔Kabataş@17:15",
      "Heybeliada➔Kabataş@18:15",
    ];
    expect(weekendOnly.map((t) => `${t.origin}➔${t.destination}@${t.departureTime}`).sort()).toEqual(
      [...expectedWeekendOnly].sort()
    );
    for (const t of weekendOnly) {
      expect(t.runsSaturday).toBe(true);
      expect(t.runsSunday).toBe(true);
    }
  });

  it("Kabataş gidiş seferleri Heybeliada durağını içerir ve varış resmi sayfayla uyumludur", () => {
    const out = MM.filter((t) => t.origin === "Kabataş");
    expect(out).toHaveLength(4);
    const byDeparture: Record<string, RawOfficialTrip> = {};
    for (const t of out) byDeparture[t.departureTime] = t;
    expect(byDeparture["09:45"].arrivalTime).toBe("11:15");
    expect(byDeparture["10:45"].arrivalTime).toBe("12:15");
    expect(byDeparture["11:45"].arrivalTime).toBe("13:15");
    expect(byDeparture["13:00"].arrivalTime).toBe("14:30");
    // Hepsi Heybeliada'da durur; resmi sayfadaki Heybeliada varış saatleriyle birebir uyumlu
    const expectedHeybeliada: Record<string, string> = {
      "09:45": "11:00",
      "10:45": "12:00",
      "11:45": "13:00",
      "13:00": "14:15",
    };
    for (const t of out) {
      expect(t.stops?.some((s) => s.name === "Heybeliada")).toBe(true);
      expect(t.stops!.find((s) => s.name === "Heybeliada")!.time).toBe(
        expectedHeybeliada[t.departureTime]
      );
    }
  });

  it("Bostancı hattı kaynak sayfalardaki birebir saatleri içerir", () => {
    const bos = MM.filter((t) => t.origin === "Bostancı").map((t) => t.departureTime).sort();
    // H hattı: 07:10, 08:00, 09:00, 10:30, 11:30, 12:30, 13:30, 14:45, 15:30, 16:20, 17:30, 18:20, 19:30, 21:00, 22:00, 23:00
    // K hattı: 07:10, 08:05, 09:05, 10:30, 12:00, 13:10, 14:30, 15:45, 16:45, 17:35, 18:25, 19:40, 21:05, 22:05, 23:00
    const expected = [
      "07:10", "07:10", "08:00", "08:05", "09:00", "09:05", "10:30", "10:30",
      "11:30", "12:00", "12:30", "13:10", "13:30", "14:30", "14:45", "15:30",
      "15:45", "16:20", "16:45", "17:30", "17:35", "18:20", "18:25", "19:30",
      "19:40", "21:00", "21:05", "22:00", "22:05", "23:00", "23:00",
    ];
    expect(bos).toEqual(expected.sort());
  });

  it("gece yarısı/normal dönemde motor üzerinden geçerlilik: tüm MM kayıtları OFFICIAL_SCHEDULES_DATA'e eklenir", () => {
    const mmInFull = OFFICIAL_SCHEDULES_DATA.filter((t) => t.operator === "Mavi Marmara");
    expect(mmInFull).toHaveLength(109);
  });

  it("genel listede ada kalkışları ya ana sefer durak devamıdır ya da meşru pier kalkışıdır", () => {
    // Master-voyage tekilleştirmesi (ScheduleListClient selectedOrigin=ALL): bir kart, başka bir
    // aynı-firma seferin (origin, departureTime) ikilisi bu kartın durağında geçiyorsa listeden silinir.
    // Ada kalkışlarının çoğu Bostancı/Kabataş ana seferlerinin ring devamı olduğu için bu kural
    // sayesinde ALL görünümde hayalet kart üretilmez.
    //
    // Durak karşılığı OLMAYAN meşru ada kalkışları (gerçek pier başlangıcı):
    //  • Büyükada 06:20 → günün ilk Bostancı-Heybeliada-Büyükada gemisi
    //  • Büyükada 14:30/15:30/17:00/18:00 → Kabataş turizm dönüş seferleri
    //  • Burgazada tümü → K-halkasının dönüş ayağı
    //  • Heybeliada 07:10/17:10/19:05/20:20 → B-H kolunun dönüş ayağı (durakta karşılığı yok)
    const islandOrigins = ["Kınalıada", "Burgazada", "Heybeliada", "Büyükada"];
    const continuationKeys = new Set(
      MM.filter((t) => islandOrigins.includes(t.origin))
        .filter((t) =>
          MM.some(
            (other) =>
              other.id !== t.id &&
              (other.stops ?? []).some((s) => s.name === t.origin && s.time === t.departureTime)
          )
        )
        .map((t) => `${t.origin}@${t.departureTime}`)
    );
    const nonContinuations = MM.filter(
      (t) => islandOrigins.includes(t.origin) && !continuationKeys.has(`${t.origin}@${t.departureTime}`)
    ).map((t) => `${t.origin}@${t.departureTime}`);

    const expectedNonContinuations = new Set([
      "Büyükada@06:20", "Büyükada@14:30", "Büyükada@15:30", "Büyükada@17:00", "Büyükada@18:00",
      "Heybeliada@07:10", "Heybeliada@17:10", "Heybeliada@19:05", "Heybeliada@20:20",
      ...["06:15", "07:00", "07:45", "08:45", "09:45", "11:15", "12:45", "13:55", "15:10", "16:25", "17:25", "18:15", "19:05", "20:25", "21:50"].map((t) => `Burgazada@${t}`)
    ]);
    expect(new Set(nonContinuations)).toEqual(expectedNonContinuations);
  });

  it("Bostancı 23:00'te iki AYRI sefer vardır: kısa hat Kınalıada-Burgazada, uzun hat Heybeliada-Büyükada (kullanıcı regresyonu)", () => {
    // KULLANICI TESPİTİ (2026-10-04): "Bostancıdan MM 23:00 KINALIADA-BURGAZADA seferi
    // bu sefer Heybeliada/Büyükada YAPMAZ; MM 23:00 HEYBELİADA-BÜYÜKADA bu sefer AYRI."
    // Aynı saatte kalkan iki sefer birbirine bulaştırılmamalı ve zincir birleştirilmemeli.
    const bos2300 = MM.filter((t) => t.origin === "Bostancı" && t.departureTime === "23:00");
    expect(bos2300).toHaveLength(2);

    const short = bos2300.find((t) => t.destination === "Burgazada");
    const long = bos2300.find((t) => t.destination === "Büyükada");
    expect(short).toBeDefined();
    expect(long).toBeDefined();

    // Kısa hat: SADECE Bostancı → Kınalıada → Burgazada. Heybeliada/Büyükada TÜMÜYLE yok.
    expect((short!.stops ?? []).map((s) => s.name)).toEqual(["Kınalıada"]);
    expect(short!.arrivalTime).toBe("23:40");
    expect(short!.stops!.some((s) => s.name === "Heybeliada")).toBe(false);
    expect(short!.stops!.some((s) => s.name === "Büyükada")).toBe(false);

    // Uzun hat: SADECE Bostancı → Heybeliada → Büyükada. Kınalıada/Burgazada TÜMÜYLE yok.
    expect((long!.stops ?? []).map((s) => s.name)).toEqual(["Heybeliada"]);
    expect(long!.arrivalTime).toBe("23:50");
    expect(long!.stops!.some((s) => s.name === "Kınalıada")).toBe(false);
    expect(long!.stops!.some((s) => s.name === "Burgazada")).toBe(false);

    // id'ler ayrı olmalı (tekilleştirme birleştirme değil)
    expect(short!.id).not.toBe(long!.id);
  });

  it("hiçbir Bostancı kısa hat (Kınalıada-Burgazada) seferi Büyükada'ya uğramaz", () => {
    const shortLine = MM.filter(
      (t) => t.origin === "Bostancı" && t.destination === "Burgazada"
    );
    for (const t of shortLine) {
      const stopNames = (t.stops ?? []).map((s) => s.name);
      expect(stopNames).not.toContain("Heybeliada");
      expect(stopNames).not.toContain("Büyükada");
      // Her kısa hat seferi durağının/varışının sırası: en az Kınalıada
      expect(stopNames).toContain("Kınalıada");
    }
  });

  it("hiçbir Bostancı uzun hat (Heybeliada-Büyükada) seferi Kınalıada/Burgazada'ya uğramaz", () => {
    const longLine = MM.filter(
      (t) => t.origin === "Bostancı" && t.destination === "Büyükada"
    );
    for (const t of longLine) {
      const stopNames = (t.stops ?? []).map((s) => s.name);
      expect(stopNames).not.toContain("Kınalıada");
      expect(stopNames).not.toContain("Burgazada");
      expect(stopNames).toContain("Heybeliada");
    }
  });
});
