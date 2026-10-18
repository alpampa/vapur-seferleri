import { RawOfficialTrip } from "./official-schedules";

/**
 * S.S. MAVİ MARMARA — RESMİ SİTEDEN DOĞRULANMIŞ GERÇEK TARİFE VERİSİ
 *
 * Kaynak: https://www.mavimarmara.net/tarifeler/* (S.S. Mavi Marmara resmi web sitesi)
 * Dönem: 2026 GÜZ TARİFESİ (Bostancı–Adalar kadılık hatları, HERGÜN)
 *        2026 KIŞ TURİZM TARİFESİ (Kabataş–Adalar turizm seferleri)
 * Erişim tarihi: 2026-10-04
 *
 * YÖNTEM (sıfır uydurma):
 * - Kalkış iskelesi, kalkış saati ve güzergah deseni resmi sayfalardan BİREBİR alındı.
 * - Ara durak/varış saatleri resmi sayfaların birbirleriyle çapraz doğrulanmış
 *   seyir sürelerinden türetildi (kaynak sayfa çiftleri arası birebir saat eşleşmeleri):
 *     • Bostancı→Heybeliada / Bostancı→Büyükada (direkt): 35 dk
 *       (örn. Bostancı 11:30 → Heybeliada 12:05 → Büyükada 12:20; üçü de resmi sayfalarda yayınlı)
 *     • Bostancı→Kınalıada: 25 dk (14 seferde birebir: Bostancı 08:05 → Kınalıada 08:30)
 *     • Kınalıada↔Burgazada: 15 dk (örn. Burgazada 07:00 → Kınalıada 07:15)
 *     • Heybeliada↔Büyükada: 15 dk (örn. Büyükada 06:20 → Heybeliada 06:35)
 *     • Burgazada→Bostancı (Kınalıada üzerinden): 15+25 = 40 dk
 *     • Kabataş→Heybeliada: 75 dk, Kabataş→Büyükada: 90 dk (varış saatleri resmi sayfada yayınli)
 * - Yıldızlı (*) seferler "PAZAR VE RESMİ TATİL GÜNLERİ YAPILMAZ" → runsSunday: false.
 *   (timetable-engine resmî tatilleri Pazar tarifesiyle işlettiği için tatil günleri de kapsanır.)
 * - Adalardan kalkışlar, Bostancı/Kabataş ana seferlerinin ara durak devamıdır; genel
 *   listede master-voyage tekilleştirmesi (ScheduleListClient) hayalet kart üretmez.
 *
 * Bu dosyadaki hiçbir saat bellekten/yorumdan üretilmemiştir; tümü yukarıdaki
 * resmi sayfalardan okunmuştur. Tarife değişince bu dosya güncellenmelidir.
 */

/** "HH:mm" + dakika → "HH:mm" (gece yarısı sarmalı) */
function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/** Yıldızlı sefer: Pazar ve resmî tatil günleri yapılmaz */
const EVERYDAY = { runsWeekday: true, runsSaturday: true, runsSunday: true };
const NOT_SUNDAY_HOLIDAY = { runsWeekday: true, runsSaturday: true, runsSunday: false };
const WEEKEND_ONLY = { runsWeekday: false, runsSaturday: true, runsSunday: true };

// Resmi doğrulama 2026-10-18 (mavimarmara.net ana sayfa): İstanbul Kart
// Tam 151,23 ₺ / Öğrenci 75,64 ₺ / Adakart 90,70 ₺. Kart başına Tam gösterilir.
const MM_ADA_FARE = "151,23 ₺";

/** Tek sefer kaydı üretir (stop ve arrival dakika ofsetleri ile) */
function buildTrip(
  id: string,
  origin: string,
  destination: string,
  departureTime: string,
  opts: {
    stops?: { name: string; offsetMin: number }[];
    arrivalOffsetMin: number;
    platform: string;
    dayType?: typeof EVERYDAY | typeof NOT_SUNDAY_HOLIDAY | typeof WEEKEND_ONLY;
  }
): RawOfficialTrip {
  return {
    id,
    origin,
    destination,
    operator: "Mavi Marmara",
    category: "ADALAR",
    departureTime,
    arrivalTime: addMinutes(departureTime, opts.arrivalOffsetMin),
    platform: opts.platform,
    price: MM_ADA_FARE,
    ...(opts.dayType ?? EVERYDAY),
    stops: opts.stops?.map((s) => ({
      name: s.name,
      time: addMinutes(departureTime, s.offsetMin),
    })),
  };
}

/** Bostancı kalkış kasksı — MM'nin kendi motor iskelesi */
const PIER_BOSTANCI = "Bostancı Mavi Marmara Motor İskelesi";
const PIER_KINALI = "Ana Rıhtım";
const PIER_BURGAZ = "Ana Rıhtım";
const PIER_HEYBELI = "Ana Rıhtım";
const PIER_BUYUK = "Tarihi İskele Rıhtımı";
const PIER_KABATAS = "Kabataş Adalar İskelesi";

/**
 * HATTI H — Bostancı ⇄ Heybeliada ⇄ Büyükada (2026 Güz, HERGÜN)
 * Resmi sayfa: /tarifeler/bostanci-buyukada/ ve /tarifeler/bostanci-heybeliada/
 *
 * Güzergah deseni "VARIŞ GÜZERGAHI" kolonundan:
 *  - "HEYBELİADA - BÜYÜKADA": Bostancı → Heybeliada (+35) → Büyükada (varış +50)
 *  - "BÜYÜKADA - HEYBELİADA": Bostancı → Büyükada (+35, ekspres) → Heybeliada (varış +50)
 */
const LINE_H_BOSTANCI: { time: string; pattern: "HB" | "BH"; starred?: boolean }[] = [
  { time: "07:10", pattern: "HB", starred: true },
  { time: "08:00", pattern: "HB" },
  { time: "09:00", pattern: "BH" },
  { time: "10:30", pattern: "BH" },
  { time: "11:30", pattern: "HB" },
  { time: "12:30", pattern: "BH" },
  { time: "13:30", pattern: "BH" },
  { time: "14:45", pattern: "BH" },
  { time: "15:30", pattern: "HB" },
  { time: "16:20", pattern: "BH" },
  { time: "17:30", pattern: "HB" },
  { time: "18:20", pattern: "BH" },
  { time: "19:30", pattern: "BH" },
  { time: "21:00", pattern: "HB" },
  { time: "22:00", pattern: "BH" },
  { time: "23:00", pattern: "HB" },
];

/**
 * HATTI K — Bostancı ⇄ Kınalıada ⇄ Burgazada (2026 Güz, HERGÜN)
 * Resmi sayfa: /tarifeler/bostanci-kinaliada/ ve /tarifeler/bostanci-burgazada/
 *
 *  - "KINALIADA - BURGAZADA": Bostancı → Kınalıada (+25) → Burgazada (varış +40)
 *  - *07:10 "BURGAZADA - KINALIADA" (ters ring): Bostancı → Burgazada (+40) → Kınalıada (varış +55)
 */
const LINE_K_BOSTANCI: { time: string; reverse?: boolean; starred?: boolean }[] = [
  { time: "07:10", reverse: true, starred: true },
  { time: "08:05" },
  { time: "09:05" },
  { time: "10:30" },
  { time: "12:00" },
  { time: "13:10" },
  { time: "14:30" },
  { time: "15:45" },
  { time: "16:45" },
  { time: "17:35" },
  { time: "18:25" },
  { time: "19:40" },
  { time: "21:05" },
  { time: "22:05" },
  { time: "23:00" },
];

/** Büyükada kalkış → Bostancı (2026 Güz, HERGÜN) — /tarifeler/buyukada-bostanci/ */
const BUYUKADA_DEPARTURES: {
  time: string;
  via?: "Heybeliada";
  heybeliadaOnly?: boolean;
  starred?: boolean;
}[] = [
  { time: "06:20", via: "Heybeliada" },
  { time: "07:25", starred: true },
  { time: "08:00" },
  { time: "08:50" },
  { time: "09:35", via: "Heybeliada" },
  { time: "11:05", via: "Heybeliada" },
  { time: "12:20" },
  { time: "13:05", via: "Heybeliada" },
  { time: "14:05", via: "Heybeliada" },
  { time: "15:20", via: "Heybeliada" },
  { time: "16:20" },
  { time: "17:25" },
  { time: "18:20" },
  { time: "19:20" },
  { time: "20:35" },
  { time: "21:50" },
  { time: "22:35", heybeliadaOnly: true },
];

/** Heybeliada kalkış → Bostancı (2026 Güz, HERGÜN) — /tarifeler/heybeliada-bostanci/ */
const HEYBELIADA_DEPARTURES: {
  time: string;
  via?: "Büyükada";
  buyukadaOnly?: boolean;
  starred?: boolean;
}[] = [
  { time: "06:35" },
  { time: "07:10", via: "Büyükada", starred: true },
  { time: "07:45", via: "Büyükada" },
  { time: "08:35", via: "Büyükada" },
  { time: "09:50" },
  { time: "11:20" },
  { time: "12:05", via: "Büyükada" },
  { time: "13:20" },
  { time: "14:20" },
  { time: "15:35" },
  { time: "16:05", via: "Büyükada" },
  { time: "17:10", via: "Büyükada" },
  { time: "18:05", via: "Büyükada" },
  { time: "19:05", via: "Büyükada" },
  { time: "20:20", via: "Büyükada" },
  { time: "21:35", via: "Büyükada" },
  { time: "23:35", buyukadaOnly: true },
];

/** Burgazada kalkış → Kınalıada → Bostancı (2026 Güz, HERGÜN) — /tarifeler/burgazada-bostanci/ */
const BURGAZADA_DEPARTURES: { time: string; starred?: boolean }[] = [
  { time: "06:15", starred: true },
  { time: "07:00" },
  { time: "07:45" },
  { time: "08:45" },
  { time: "09:45" },
  { time: "11:15" },
  { time: "12:45" },
  { time: "13:55" },
  { time: "15:10" },
  { time: "16:25" },
  { time: "17:25" },
  { time: "18:15" },
  { time: "19:05" },
  { time: "20:25" },
  { time: "21:50" },
];

/** Kınalıada kalkış (2026 Güz, HERGÜN) — /tarifeler/kinaliada-bostanci/ */
const KINALIADA_DEPARTURES: {
  time: string;
  to?: "Burgazada";
  starred?: boolean;
}[] = [
  { time: "06:30", starred: true },
  { time: "07:15" },
  { time: "08:00" },
  { time: "09:00" },
  { time: "10:00" },
  { time: "11:30" },
  { time: "13:00" },
  { time: "14:10" },
  { time: "15:25" },
  { time: "16:40" },
  { time: "17:40" },
  { time: "18:30" },
  { time: "19:20" },
  { time: "20:40" },
  { time: "22:05" },
  { time: "22:30", to: "Burgazada" },
  { time: "23:25", to: "Burgazada" },
];

/**
 * KABATAŞ ⇄ ADALAR TURİZM SEFERLERİ (2026 Kış Turizm Tarifesi)
 * Resmi sayfa: /tarifeler/kabatas-buyukada/, /tarifeler/kabatas-heybeliada/,
 *              /tarifeler/buyukada-kabatas/, /tarifeler/heybeliada-kabatas/
 *
 * Gidiş: Kabataş → Heybeliada (+75) → Büyükada (varış +90; varış saatleri resmi sayfada yayınli)
 * Dönüş: Büyükada → Heybeliada (+15) → Kabataş (varış +90)
 * Hafta içi 2'şer, cumartesi-pazar-resmî tatil 4'er sefer.
 */
const KABATAS_OUTBOUND: { time: string; arrival: string; weekendOnly?: boolean }[] = [
  // Hafta içi: 09:45→11:15, 11:45→13:15
  // Cumartesi/Pazar/Tatil: 09:45→11:15, 10:45→12:15, 11:45→13:15, 13:00→14:30
  { time: "09:45", arrival: "11:15" },
  { time: "10:45", arrival: "12:15", weekendOnly: true },
  { time: "11:45", arrival: "13:15" },
  { time: "13:00", arrival: "14:30", weekendOnly: true },
];

const BUYUKADA_RETURN_KABATAS: { time: string; arrival: string; weekendOnly?: boolean }[] = [
  // Hafta içi: 14:30→16:00, 15:30→17:00
  // Cumartesi/Pazar/Tatil: 14:30→16:00, 15:30→17:00, 17:00→18:30, 18:00→19:30
  { time: "14:30", arrival: "16:00" },
  { time: "15:30", arrival: "17:00" },
  { time: "17:00", arrival: "18:30", weekendOnly: true },
  { time: "18:00", arrival: "19:30", weekendOnly: true },
];

const HEYBELIADA_RETURN_KABATAS: { time: string; arrival: string; weekendOnly?: boolean }[] = [
  // Hafta içi: 14:45→16:00, 15:45→17:00
  // Cumartesi/Pazar/Tatil: 14:45→16:00, 15:45→17:00, 17:15→18:30, 18:15→19:30
  { time: "14:45", arrival: "16:00" },
  { time: "15:45", arrival: "17:00" },
  { time: "17:15", arrival: "18:30", weekendOnly: true },
  { time: "18:15", arrival: "19:30", weekendOnly: true },
];

/** ID üretimi: mm-<kalkış>-<varış>-<saat> (okunabilir, kararlı) */
function hhmmToId(time: string): string {
  return time.replace(":", "");
}

export function getMaviMarmaraSchedules(): RawOfficialTrip[] {
  const trips: RawOfficialTrip[] = [];

  // ── HATTI H: Bostancı kalkış (Heybeliada-Büyükada) ─────────────────────
  for (const dep of LINE_H_BOSTANCI) {
    if (dep.pattern === "HB") {
      // Bostancı → Heybeliada (+35) → Büyükada (+50)
      trips.push(
        buildTrip(`mm-bos-buy-${hhmmToId(dep.time)}`, "Bostancı", "Büyükada", dep.time, {
          stops: [{ name: "Heybeliada", offsetMin: 35 }],
          arrivalOffsetMin: 50,
          platform: PIER_BOSTANCI,
          dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
        })
      );
    } else {
      // Bostancı → Büyükada (+35, ekspres) → Heybeliada (+50)
      trips.push(
        buildTrip(`mm-bos-hey-${hhmmToId(dep.time)}`, "Bostancı", "Heybeliada", dep.time, {
          stops: [{ name: "Büyükada", offsetMin: 35 }],
          arrivalOffsetMin: 50,
          platform: PIER_BOSTANCI,
          dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
        })
      );
    }
  }

  // ── HATTI K: Bostancı kalkış (Kınalıada-Burgazada) ─────────────────────
  for (const dep of LINE_K_BOSTANCI) {
    if (dep.reverse) {
      // Ters ring: Bostancı → Burgazada (+40) → Kınalıada (+55)
      trips.push(
        buildTrip(`mm-bos-kin-${hhmmToId(dep.time)}`, "Bostancı", "Kınalıada", dep.time, {
          stops: [{ name: "Burgazada", offsetMin: 40 }],
          arrivalOffsetMin: 55,
          platform: PIER_BOSTANCI,
          dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
        })
      );
    } else {
      // Bostancı → Kınalıada (+25) → Burgazada (+40)
      trips.push(
        buildTrip(`mm-bos-bur-${hhmmToId(dep.time)}`, "Bostancı", "Burgazada", dep.time, {
          stops: [{ name: "Kınalıada", offsetMin: 25 }],
          arrivalOffsetMin: 40,
          platform: PIER_BOSTANCI,
          dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
        })
      );
    }
  }

  // ── Büyükada kalkış ────────────────────────────────────────────────────
  for (const dep of BUYUKADA_DEPARTURES) {
    const dayType = dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY;
    if (dep.heybeliadaOnly) {
      // 22:35 → Heybeliada (son ada arası sefer, Bostancı'ya devam etmez)
      trips.push(
        buildTrip(`mm-buy-hey-${hhmmToId(dep.time)}`, "Büyükada", "Heybeliada", dep.time, {
          arrivalOffsetMin: 15,
          platform: PIER_BUYUK,
          dayType,
        })
      );
    } else if (dep.via === "Heybeliada") {
      // Büyükada → Heybeliada (+15) → Bostancı (+50)
      trips.push(
        buildTrip(`mm-buy-bos-${hhmmToId(dep.time)}`, "Büyükada", "Bostancı", dep.time, {
          stops: [{ name: "Heybeliada", offsetMin: 15 }],
          arrivalOffsetMin: 50,
          platform: PIER_BUYUK,
          dayType,
        })
      );
    } else {
      // Direkt Bostancı (+35)
      trips.push(
        buildTrip(`mm-buy-bos-${hhmmToId(dep.time)}`, "Büyükada", "Bostancı", dep.time, {
          arrivalOffsetMin: 35,
          platform: PIER_BUYUK,
          dayType,
        })
      );
    }
  }

  // ── Heybeliada kalkış ──────────────────────────────────────────────────
  for (const dep of HEYBELIADA_DEPARTURES) {
    const dayType = dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY;
    if (dep.buyukadaOnly) {
      // 23:35 → Büyükada (son ada arası sefer)
      trips.push(
        buildTrip(`mm-hey-buy-${hhmmToId(dep.time)}`, "Heybeliada", "Büyükada", dep.time, {
          arrivalOffsetMin: 15,
          platform: PIER_HEYBELI,
          dayType,
        })
      );
    } else if (dep.via === "Büyükada") {
      // Heybeliada → Büyükada (+15) → Bostancı (+50)
      trips.push(
        buildTrip(`mm-hey-bos-${hhmmToId(dep.time)}`, "Heybeliada", "Bostancı", dep.time, {
          stops: [{ name: "Büyükada", offsetMin: 15 }],
          arrivalOffsetMin: 50,
          platform: PIER_HEYBELI,
          dayType,
        })
      );
    } else {
      // Direkt Bostancı (+35)
      trips.push(
        buildTrip(`mm-hey-bos-${hhmmToId(dep.time)}`, "Heybeliada", "Bostancı", dep.time, {
          arrivalOffsetMin: 35,
          platform: PIER_HEYBELI,
          dayType,
        })
      );
    }
  }

  // ── Burgazada kalkış (Kınalıada üzerinden Bostancı) ────────────────────
  for (const dep of BURGAZADA_DEPARTURES) {
    // Burgazada → Kınalıada (+15) → Bostancı (+40)
    trips.push(
      buildTrip(`mm-bur-bos-${hhmmToId(dep.time)}`, "Burgazada", "Bostancı", dep.time, {
        stops: [{ name: "Kınalıada", offsetMin: 15 }],
        arrivalOffsetMin: 40,
        platform: PIER_BURGAZ,
        dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
      })
    );
  }

  // ── Kınalıada kalkış ───────────────────────────────────────────────────
  for (const dep of KINALIADA_DEPARTURES) {
    if (dep.to === "Burgazada") {
      // 22:30 / 23:25 → Burgazada (akşam ada arası)
      trips.push(
        buildTrip(`mm-kin-bur-${hhmmToId(dep.time)}`, "Kınalıada", "Burgazada", dep.time, {
          arrivalOffsetMin: 15,
          platform: PIER_KINALI,
          dayType: EVERYDAY,
        })
      );
    } else {
      // Direkt Bostancı (+25)
      trips.push(
        buildTrip(`mm-kin-bos-${hhmmToId(dep.time)}`, "Kınalıada", "Bostancı", dep.time, {
          arrivalOffsetMin: 25,
          platform: PIER_KINALI,
          dayType: dep.starred ? NOT_SUNDAY_HOLIDAY : EVERYDAY,
        })
      );
    }
  }

  // ── Kabataş Turizm: gidiş (Kabataş → Heybeliada → Büyükada) ───────────
  for (const dep of KABATAS_OUTBOUND) {
    trips.push({
      id: `mm-kab-buy-${hhmmToId(dep.time)}${dep.weekendOnly ? "-wo" : ""}`,
      origin: "Kabataş",
      destination: "Büyükada",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep.time,
      arrivalTime: dep.arrival, // resmi sayfada yayınlanan varış saati
      platform: PIER_KABATAS,
      price: MM_ADA_FARE,
      ...(dep.weekendOnly ? WEEKEND_ONLY : EVERYDAY),
      stops: [{ name: "Heybeliada", time: addMinutes(dep.time, 75) }],
    });
  }

  // ── Kabataş Turizm: dönüş (Büyükada → Heybeliada → Kabataş) ───────────
  for (const dep of BUYUKADA_RETURN_KABATAS) {
    trips.push({
      id: `mm-buy-kab-${hhmmToId(dep.time)}${dep.weekendOnly ? "-wo" : ""}`,
      origin: "Büyükada",
      destination: "Kabataş",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep.time,
      arrivalTime: dep.arrival,
      platform: PIER_BUYUK,
      price: MM_ADA_FARE,
      ...(dep.weekendOnly ? WEEKEND_ONLY : EVERYDAY),
      stops: [{ name: "Heybeliada", time: addMinutes(dep.time, 15) }],
    });
  }

  // ── Kabataş Turizm: dönüş (Heybeliada → Kabataş, aynı botların ara durak kalkışı) ──
  for (const dep of HEYBELIADA_RETURN_KABATAS) {
    trips.push({
      id: `mm-hey-kab-${hhmmToId(dep.time)}${dep.weekendOnly ? "-wo" : ""}`,
      origin: "Heybeliada",
      destination: "Kabataş",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep.time,
      arrivalTime: dep.arrival,
      platform: PIER_HEYBELI,
      price: MM_ADA_FARE,
      ...(dep.weekendOnly ? WEEKEND_ONLY : EVERYDAY),
    });
  }

  return trips;
}
