/**
 * Istanbul Time Engine
 *
 * Tek ve doğrulanmış İstanbul (Europe/Istanbul, UTC+3) saat kaynağı.
 * Tüm sefer saatleri, geri sayım, gece yarısı geçişi ve sıralama bu modül üzerinden hesaplanır.
 * Component içinde rastgele saat hesabı YAPILMAZ.
 */

import { NIGHT_DEPARTURE_END_HOUR, EVENING_ROLLOVER_START_HOUR, MINUTES_PER_DAY } from "@/lib/constants";

export interface IstanbulParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  dayOfWeek: number; // 0 = Pazar ... 6 = Cumartesi (JS getDay semantiği)
  dateStr: string; // YYYY-MM-DD (İstanbul)
}

/**
 * Performans: formatter modül seviyesinde tek kez oluşturulur.
 * getIstanbulParts saniyede yüzlerce kez çağrıldığı için (kart başına geri
 * sayım) her çağrıda new Intl.DateTimeFormat oluşturmak gereksiz CPU yüküdür.
 */
const ISTANBUL_PARTS_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Şu anki İstanbul saatini parçalara ayırır. */
export function getIstanbulParts(nowMs: number = Date.now()): IstanbulParts {
  const parts = ISTANBUL_PARTS_FORMATTER.formatToParts(nowMs);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);

  // Istanbul günü: UTC(_) ile normalize, böylece haftanın günü İstanbul bazlı olur.
  const istanbulDate = new Date(Date.UTC(year, month - 1, day, (24 - (3 % 24)) % 24));
  const dayOfWeek = istanbulDate.getUTCDay();

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
    dateStr: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

/** "HH:mm" → dakika (0..1439). Geçersizse null. */
export function hhmmToMinutes(hhmm: string): number | null {
  if (!hhmm || typeof hhmm !== "string") return null;
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Dakika (0..1439) → "HH:mm" */
export function minutesToHhmm(min: number): string {
  const c = ((Math.round(min) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(c / 60);
  const m = c % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** İki "HH:mm" saatini sayısal olarak karşılaştırır. a<b → negatif, a>b → pozitif. */
export function compareHhmm(a: string, b: string): number {
  return (hhmmToMinutes(a) ?? 0) - (hhmmToMinutes(b) ?? 0);
}

/**
 * HH:mm gösteriminin belirtilen an itibariyle bundan SONRAKİ gerçekleşim anını (ms) döndürür.
 * Gece yarısını aşabilir: 23:50'de sorulan "00:20" → yarın 00:20.
 * 09:00'da sorulan "00:20" → bugün 00:20 (geçmiş kabul edilir).
 */
export function nextOccurrenceMs(hhmm: string, nowMs: number = Date.now()): number | null {
  const minutes = hhmmToMinutes(hhmm);
  if (minutes === null) return null;

  const parts = getIstanbulParts(nowMs);
  const todayIso = `${parts.dateStr}T${hhmm}:00+03:00`;
  let candidate = new Date(todayIso).getTime();

  // Eğer bugünkü gerçekleşim artık geçmişteyse, yarın gerçekleşimini hesapla.
  if (candidate <= nowMs) {
    const tomorrowIso = `${incrementDateStr(parts.dateStr)}T${hhmm}:00+03:00`;
    candidate = new Date(tomorrowIso).getTime();
  }

  return candidate;
}

/** YYYY-MM-DD → ertesi gün YYYY-MM-DD */
function incrementDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10);
}

/**
 * "HH:mm" + referans an için geçerli ISO zaman damgasını üretir.
 * - `referenceTimeMs` geçmişteyse ve `allowFutureRollover` açıksa yarına taşır (gece seferi mantığı).
 * - Kapalıysa (ör. bugünkü mesai listesinde sabah erken seferleri), aynı günde bırakır.
 */
export function istanbulIsoFor(hhmm: string, nowMs: number = Date.now(), allowFutureRollover = false): string | null {
  const minutes = hhmmToMinutes(hhmm);
  if (minutes === null) return null;

  const parts = getIstanbulParts(nowMs);
  const todayIso = `${parts.dateStr}T${hhmm}:00+03:00`;
  let targetMs = new Date(todayIso).getTime();

  if (allowFutureRollover && targetMs <= nowMs) {
    const tomorrowIso = `${incrementDateStr(parts.dateStr)}T${hhmm}:00+03:00`;
    targetMs = new Date(tomorrowIso).getTime();
  }

  return new Date(targetMs).toISOString();
}

/** Bir zaman iz (ms) → İstanbul bazlı "HH:mm" */
export function formatIstanbulHhmm(ms: number): string {
  const parts = getIstanbulParts(ms);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

/** Kalkış saati gece seferi mi? (00:00–04:59 kalkışlar) */
export function isNightDepartureHhmm(hhmm: string): boolean {
  const minutes = hhmmToMinutes(hhmm);
  return minutes !== null && minutes < NIGHT_DEPARTURE_END_HOUR * 60;
}

/**
 * Gece yarısı kaydırması: akşam saatlerinde (>= 20:00) görüntülenen gece kalkışlı
 * (00:00–04:59) seferler bir sonraki güne aittir.
 * Örn: 23:50'de 00:15 kalkışı → yarın 00:15 (25 dk sonra, yaklaşan sefer).
 * timetable-engine, resolveDynamicTrip ve route-planner bu kuralı paylaşır.
 */
export function nightRolloverDayOffset(depHhmm: string, nowMs: number): 0 | 1 {
  if (!isNightDepartureHhmm(depHhmm)) return 0;
  return getIstanbulParts(nowMs).hour >= EVENING_ROLLOVER_START_HOUR ? 1 : 0;
}

/**
 * HH:mm → gün içi mutlak dakika, gece kaydırması uygulanmış.
 * Akşam (>= 20:00) planlamasında 00:00–04:59 kalkışlar ertesi güne (+1440 dk) aittir.
 * Rota planlayıcının gece aktarma normalizasyonu için kullanılır.
 */
export function toAbsoluteDayMinutes(hhmm: string, currentMinutesOfDay: number): number {
  const m = hhmmToMinutes(hhmm) ?? 0;
  const isEvening = currentMinutesOfDay >= EVENING_ROLLOVER_START_HOUR * 60;
  return isEvening && m < NIGHT_DEPARTURE_END_HOUR * 60 ? m + MINUTES_PER_DAY : m;
}

/** Kalan süre (dk) → kısa gösterim: "14 dk", "1 sa 05 dk", "2 sa". */
export function formatRemainingShort(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} dk`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h} sa` : `${h} sa ${String(m).padStart(2, "0")} dk`;
}
