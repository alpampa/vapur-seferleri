import { RawOfficialTrip, RawStop } from "./official-schedules";
import rawTuryolData from "./turyol-scraped.json";

interface ScrapedRoute {
  mainHatTuruId: string;
  kalkisVal: string;
  varisId: string;
  origin: string;
  destination: string;
  category: "BOGAZ" | "ADALAR";
  times: string[];
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function getTuryolSchedules(): RawOfficialTrip[] {
  const trips: RawOfficialTrip[] = [];
  const routes = rawTuryolData as ScrapedRoute[];

  routes.forEach((route, rIdx) => {
    // Turyol tablosu 3 sütunludur (Hafta İçi / Cumartesi / Pazar).
    // Bir saat 3 kez geçiyorsa her gün, 2 kez geçiyorsa Hafta Sonu (Cmt+Paz) veya H.İçi+Cmt,
    // tek sütunlu mesai hatlarında (17:05-18:20 Kadıköy-Karaköy/Eminönü) sadece Hafta İçi çalışır.
    const freqMap = new Map<string, number>();
    for (const t of route.times) {
      freqMap.set(t, (freqMap.get(t) ?? 0) + 1);
    }
    const maxFreqInRoute = Math.max(...Array.from(freqMap.values()), 1);
    const uniqueTimes = Array.from(freqMap.keys()).sort();

    uniqueTimes.forEach((depTime, tIdx) => {
      const count = freqMap.get(depTime) ?? 1;
      let runsWeekday = true;
      let runsSaturday = true;
      let runsSunday = true;

      if (maxFreqInRoute === 1) {
        // Tek sütunlu akşam mesai hattı (Karaköy/Eminönü ⇄ Kadıköy): yalnızca Hafta İçi
        runsWeekday = true;
        runsSaturday = false;
        runsSunday = false;
      } else if (route.category === "ADALAR") {
        // Adalar hattında 3 sütun: H.İçi, Cumartesi, Pazar.
        // 2 kez geçen akşam/öğleden sonra ek seferleri (14:40 gidiş, 19:15/20:15 dönüş) yalnızca Hafta Sonu (Cmt+Paz) çalışır!
        if (count === 2) {
          runsWeekday = false;
          runsSaturday = true;
          runsSunday = true;
        } else if (count === 1) {
          // 14:15 gibi tek sütun geçişi yalnızca Hafta İçi
          runsWeekday = true;
          runsSaturday = false;
          runsSunday = false;
        }
      } else {
        // Boğaz hattı (Üsküdar ⇄ Eminönü / Karaköy): 2 kez geçen sabah erken/akşam seferleri H.İçi + Cumartesi çalışır, Pazar çalışmaz
        if (count === 2) {
          runsWeekday = true;
          runsSaturday = true;
          runsSunday = false;
        } else if (count === 1) {
          runsWeekday = true;
          runsSaturday = false;
          runsSunday = false;
        }
      }

      let estDurationMins = 20;
      if (route.category === "ADALAR") {
        if (route.destination === "Büyükada") estDurationMins = 70;
        else if (route.destination === "Heybeliada") estDurationMins = 55;
        else if (route.destination === "Kınalıada") estDurationMins = 40;
        else if (route.destination === "Kadıköy") estDurationMins = 60;
        else estDurationMins = 75; // Eminönü (Kadıköy durağının ötesi)
      } else {
        // Varış süresi hedef iskeleye göre; aynı dakikadaki çoklu kayıtların
        // en uzak varışta birleşmesini (Eminönü < Karaköy, Üsküdar < Kadıköy) sağlar.
        if (route.destination === "Eminönü") estDurationMins = 15;
        else if (route.destination === "Üsküdar") estDurationMins = 15;
        else if (route.destination === "Karaköy") estDurationMins = 20;
        else estDurationMins = 25; // Kadıköy
      }

      const arrTime = addMinutes(depTime, estDurationMins);
      const platform = `${route.origin} Turyol İskelesi`;
      // Resmi doğrulama 2026-10-18: turyol.com/Home/Tarifeler (POST) —
      // Adalar hatları Tam 230 TL; Boğaz hatları Kurumsal Bilet 65 TL.
      const price = route.category === "ADALAR" ? "230 ₺" : "65 ₺";

      trips.push({
        id: `turyol-${route.origin.toLowerCase()}-${route.destination.toLowerCase()}-${rIdx}-${tIdx}`,
        origin: route.origin,
        destination: route.destination,
        operator: "Turyol",
        category: route.category,
        departureTime: depTime,
        arrivalTime: arrTime,
        platform,
        price,
        runsWeekday,
        runsSaturday,
        runsSunday,
        lineName: `Turyol ${route.origin} - ${route.destination} Hattı`,
      });
    });
  });

  // Çoklu kart düzeltmesi: Aynı iskeleden aynı saatte kalkan Ada hattı kayıtları
  // tek fiziksel gemiye aittir (örn. Eminönü 10:40 Kınalıada+Heybeliada+Büyükada
  // aynı seferin ayrı satılan bacaklarıdır). Gün bayrakları aynı olan kayıtlar tek
  // kartta en uzak varışa göre birleştirilir; ara adalar alt şeritte durak olur.
  const grouped = new Map<string, RawOfficialTrip[]>();
  for (const trip of trips) {
    const key = `${trip.origin}|${trip.departureTime}|${trip.runsWeekday}|${trip.runsSaturday}|${trip.runsSunday}`;
    const list = grouped.get(key);
    if (list) list.push(trip);
    else grouped.set(key, [trip]);
  }

  const mergedTrips: RawOfficialTrip[] = [];
  for (const group of grouped.values()) {
    // Aynı kategorideki (Ada / Boğaz) eşleşmeler tek geminin ayrı satılan
    // bacaklarıdır; farklı kategori (aynı dakikada ada + boğaz gemisi) ayrı gemidir.
    const byCategory = new Map<string, RawOfficialTrip[]>();
    for (const t of group) {
      const cat = t.category ?? "DIGER";
      const list = byCategory.get(cat);
      if (list) list.push(t);
      else byCategory.set(cat, [t]);
    }
    for (const catGroup of byCategory.values()) {
      if (catGroup.length <= 1) {
        mergedTrips.push(...catGroup);
        continue;
      }
      const sorted = [...catGroup].sort((a, b) =>
        (a.arrivalTime ?? a.departureTime).localeCompare(b.arrivalTime ?? b.departureTime)
      );
      const target = sorted[sorted.length - 1];
      const hopStops: RawStop[] = sorted
        .slice(0, -1)
        .map((t) => ({ name: t.destination, time: t.arrivalTime ?? t.departureTime }));
      mergedTrips.push({
        ...target,
        stops: hopStops,
        lineName: `Turyol ${target.origin} - ${target.destination} Hattı (${hopStops.map((s) => s.name).join(", ")} uğramalı)`
      });
    }
  }

  return mergedTrips;
}
