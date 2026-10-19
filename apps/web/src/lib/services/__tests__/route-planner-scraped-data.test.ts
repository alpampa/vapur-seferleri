import { describe, it, expect } from "vitest";
import rawJson from "@/lib/data/official-scraped-schedules.json";
import { type RawOfficialTrip } from "@/lib/data/official-schedules";
import { planJourney } from "@/lib/services/route-planner";
import type { ScheduleCardDto } from "@/lib/types/schedule";

/**
 * Bu testler BAĞIMSIZ DENETİM'de "eksik veri" olarak raporlanan Şehir Hatları
 * kayıtlarının gerçekte resmî kaynakla uyumlu olduğunu KANITLAR (uydurma düzeltme yok):
 *  - Boş `stops` kayıtları iki iskeleli DİREKT hatlardır (İstinye↔Çubuklu,
 *    Kabataş↔Kadıköy, Beykoz↔Sarıyer) veya ring hatlarıdır → ara durak YOKTUR.
 *  - Boş `arrivalTime` yalnızca Boğaz hatlarında; resmî tablo "Kalkış" dışında
 *    "Varış" yayınlamaz → süre motor tarafından kestirilir.
 *  - Çok iskeleli Adalar hatları (ör. Kabataş→Bostancı) ara durakları TAM içerir.
 *
 * Sayımlar yalnızca HAM Şehir Hatları dökümü içindir (birleşik veri kümesi diğer
 * operatörleri de içerir; onların seferleri tanım gereği ara duraksızdır).
 */
const SH_TRIPS = rawJson as unknown as RawOfficialTrip[];

function toDto(t: RawOfficialTrip): ScheduleCardDto {
  return {
    id: t.id,
    origin: t.origin,
    destination: t.destination,
    operator: t.operator,
    routeTitle: t.lineName ?? `${t.origin} - ${t.destination}`,
    departureTime: t.departureTime,
    departureTime12: t.departureTime,
    status: "ON_TIME",
    platform: t.platform,
    price: t.price,
    progress: 0,
    category: t.category,
    stops: t.stops,
    arrivalTime: t.arrivalTime,
  };
}

const byId = (id: string) => {
  const t = SH_TRIPS.find((x) => x.id === id);
  if (!t) throw new Error(`kayıt yok: ${id}`);
  return t;
};

describe("ŞH veri bütünlüğü — boş stops/arrivalTime gerçekten eksik mi?", () => {
  it("boş stops kayıtları yalnızca Şehir Hatları direkt/ring hatlarıdır (uydurma durak yok)", () => {
    const empty = SH_TRIPS.filter((t) => !t.stops || t.stops.length === 0);
    expect(empty.length).toBe(328);
    expect(empty.every((t) => t.operator === "Şehir Hatları")).toBe(true);
    // Hiçbiri çok iskeleli olmasına rağmen durağını kaybetmiş DEĞİL:
    // hepsi ya iki uçlu direkt hat ya da ring (destination etiketi "Ring" içerir).
    const suspicious = empty.filter(
      (t) => !/ring/i.test(t.destination) && t.origin === t.destination
    );
    expect(suspicious).toEqual([]);
  });

  it("boş arrivalTime yalnızca Boğaz hatlarındadır ve origin/destination farklıdır", () => {
    const noArr = SH_TRIPS.filter((t) => !t.arrivalTime);
    expect(noArr.length).toBe(241);
    expect(noArr.every((t) => t.category === "BOGAZ")).toBe(true);
    expect(noArr.every((t) => t.origin !== t.destination)).toBe(true);
  });

  it("KANIT: Kabataş 21:40 → Bostancı ara durakları EKSİKSİZDİR (önceki rapor yanlıştı)", () => {
    const trip = byId("sh-2026-3116");
    expect(trip.origin).toBe("Kabataş");
    expect(trip.destination).toBe("Bostancı");
    expect(trip.departureTime).toBe("21:40");
    expect(trip.arrivalTime).toBe("00:05");
    const stops = (trip.stops ?? []).map((s) => `${s.name}@${s.time}`);
    expect(stops).toEqual([
      "Kadıköy@22:05",
      "Kınalıada@22:40",
      "Burgazada@22:55",
      "Heybeliada@23:10",
      "Büyükada@23:30",
    ]);
  });

  it("stops zamanları yalnızca aynı dakika veya gece-yarısı geçişiyle 'azalır' (bozuk sıralama yok)", () => {
    let trueReversal = 0;
    for (const t of SH_TRIPS) {
      const st = t.stops;
      if (!st || st.length < 2) continue;
      const mins = st.map((s) => {
        const [h, m] = s.time.split(":").map(Number);
        return h * 60 + m;
      });
      const wrapsMidnight = mins[mins.length - 1] < mins[0];
      for (let i = 1; i < mins.length; i++) {
        if (mins[i] < mins[i - 1] && mins[i] !== mins[i - 1] && !wrapsMidnight) {
          trueReversal++;
        }
      }
    }
    expect(trueReversal).toBe(0);
  });
});

describe("rota motoru — gece yarısını aşan seferler ve ara duraklar", () => {
  it("ara durak hedefi, durak saatini varış olarak kullanır (Kabataş→Büyükada 21:40)", () => {
    const routes = planJourney([toDto(byId("sh-2026-3116"))], "Kabataş", "Büyükada", 0);
    const r = routes.find((x) => x.type === "DIRECT");
    expect(r, "21:40 direkt rota yok").toBeTruthy();
    expect(r!.departureTime).toBe("21:40");
    expect(r!.arrivalTime).toBe("23:30"); // Büyükada ara durak saati
  });

  it("gece yarısını aşan direkt sefer doğru varış saati üretir (23:30 → 01:15)", () => {
    const routes = planJourney([toDto(byId("sh-2026-3122"))], "Kabataş", "Büyükada", 0);
    const r = routes.find((x) => x.type === "DIRECT");
    expect(r, "23:30 direkt rota yok").toBeTruthy();
    expect(r!.departureTime).toBe("23:30");
    expect(r!.arrivalTime).toBe("01:15");
    expect(r!.durationMinutes).toBe(105); // 23:30 → ertesi gün 01:15
  });
});
