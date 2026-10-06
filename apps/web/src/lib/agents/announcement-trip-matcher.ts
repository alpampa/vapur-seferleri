/**
 * DUYURU → SEFER EŞLEŞTİRİCİ
 *
 * Bir duyuru başlığı/gövdesindeki bilgileri (operatör, iskele, saat,
 * iptal/düzenleme kelimeleri) gerçek tarife kayıtlarıyla eşleştirip
 * uygulamaya işlenebilir `TripDisruption` üretir.
 *
 * Bu katman VERİ ÜRETMEZ: yalnızca var olan gerçek sefer kayıtlarını
 * resmi duyuruya bağlar. Eşleşme yoksa boş dizi döner (uydurma yok).
 */

import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import { normalizePierName } from "@/lib/agents/scraper-agent";
import type {
  OperatorAnnouncement,
  TripDisruption,
  DisruptionKind,
} from "@/lib/types/announcement";

/** Bilinen İstanbul iskeleleri / rota adları (eşleştirme için) */
const KNOWN_PIERS = [
  "Kadıköy", "Eminönü", "Karaköy", "Beşiktaş", "Üsküdar", "Kabataş", "Bostancı",
  "Heybeliada", "Büyükada", "Burgazada", "Kınalıada", "Kartal", "Yalova", "Moda",
  "Sirkeci", "Harem", "Bebek", "Ortaköy", "Arnavutköy", "Sarıyer", "Rumeli Kavağı",
  "Anadolu Kavağı", "Adalar", "Boğaz", "Haliç", "Maltepe", "Pendik", "Yenikapı",
  "Bakırköy", "Avcılar", "Balat", "Eyüp", "Beykoz", "Çengelköy", "Küçüksu",
];

const TIME_RE_G = /\b([01]\d|2[0-3]):[0-5]\d\b/g;

function pierMentions(announcement: OperatorAnnouncement): string[] {
  const text = `${announcement.title ?? ""} ${announcement.body ?? ""}`;
  const norm = normalizePierName(text);
  return KNOWN_PIERS.filter((p) => norm.includes(normalizePierName(p)));
}

function timeMentions(announcement: OperatorAnnouncement): string[] {
  const text = `${announcement.title ?? ""} ${announcement.body ?? ""}`;
  return Array.from(new Set([...text.matchAll(TIME_RE_G)].map((m) => m[0])));
}

function inferKind(type: OperatorAnnouncement["type"]): DisruptionKind {
  switch (type) {
    case "CANCELLATION":
    case "CANCELLED_TRIPS":
      return "CANCELLED";
    case "EXTRA_SERVICE":
      return "EXTRA";
    case "SCHEDULE_CHANGE":
      return "SCHEDULE_CHANGE";
    default:
      return "SCHEDULE_CHANGE";
  }
}

/**
 * Bir duyuruyu gerçek sefer kayıtlarıyla eşleştirir.
 * Eşleşme kuralları (tamamı deterministik):
 *  - operatör aynı olmalı
 *  - duyuruda geçen iskelelerden biri seferin origin/destination'ında olmalı
 *  - "iç hat/haliç/bostancı" gibi hat kelimeleri de katkı sağlar
 *  - saat geçiyorsa yakın saatli kayıtlar önceliklidir (mahalle eşleştirme)
 */
export function matchAnnouncementToTrips(
  announcement: OperatorAnnouncement
): TripDisruption[] {
  const kind = inferKind(announcement.type);
  const piers = pierMentions(announcement);
  const times = timeMentions(announcement);
  const opName = announcement.operator;

  const candidates = OFFICIAL_SCHEDULES_DATA.filter((trip) => trip.operator === opName);

  if (candidates.length === 0) return [];

  // Hiç iskele bilgisi yoksa genel duyuru: seferleri işaretlemek spekülatiftir → boş
  if (piers.length === 0) return [];

  const tripsOnPier: { trip: (typeof candidates)[0]; score: number }[] = [];

  for (const trip of candidates) {
    const routeText = normalizePierName(`${trip.origin}|${trip.destination}|${trip.lineName ?? ""}`);
    let score = 0;
    for (const p of piers) {
      const pn = normalizePierName(p);
      if (routeText.includes(pn)) score += 2;
    }
    // "Adalar" geniş eşleşmesi
    const broadAda = piers.some((p) => normalizePierName(p) === "adalar");
    if (broadAda && (trip.category === "ADALAR" || normalizePierName(trip.origin).includes("ada") || normalizePierName(trip.destination).includes("ada"))) {
      score += 1;
    }
    if (trip.lineName && normalizePierName(trip.lineName).includes("halic") && piers.some((p) => normalizePierName(p) === "halic")) {
      score += 2;
    }
    if (score > 0) {
      tripsOnPier.push({ trip, score });
    }
  }

  if (tripsOnPier.length === 0) return [];

  // Saat varsa: en yakın saatli kayıtları önceliklendir (spekülatif geniş eşleşmeyi daralt)
  if (times.length > 0) {
    for (const item of tripsOnPier) {
      const dep = item.trip.departureTime;
      const depMin = parseInt(dep.slice(0, 2), 10) * 60 + parseInt(dep.slice(3, 5), 10);
      let minGap = Infinity;
      for (const t of times) {
        const tMin = parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(3, 5), 10);
        minGap = Math.min(minGap, Math.abs(depMin - tMin));
      }
      // Saat farkı ≤ 60 dk altındaysa skor artır
      if (minGap <= 60) item.score += 3;
    }
  }

  tripsOnPier.sort((a, b) => b.score - a.score);
  const matched = tripsOnPier.slice(0, tripsOnPier.length); // tüm skorlu kayıtları işaretle

  return matched.map(({ trip }) => ({
    operator: opName,
    tripId: trip.id,
    kind,
    announcementTitle: announcement.title,
    announcementId: announcement.id,
    reason: announcement.body,
  }));
}

/** Duyuru kümesini tek geçişte eşleştirir */
export function matchAnnouncementsToTrips(
  announcements: OperatorAnnouncement[]
): TripDisruption[] {
  const result: TripDisruption[] = [];
  for (const a of announcements) {
    result.push(...matchAnnouncementToTrips(a));
  }
  return result;
}

/** TripDisruption kümesini tripId → disruption haritasına çevirir (UI kolaylığı) */
export function indexDisruptionsByTrip(
  disruptions: TripDisruption[]
): Map<string, TripDisruption> {
  const map = new Map<string, TripDisruption>();
  for (const d of disruptions) {
    if (!map.has(d.tripId)) map.set(d.tripId, d);
  }
  return map;
}
