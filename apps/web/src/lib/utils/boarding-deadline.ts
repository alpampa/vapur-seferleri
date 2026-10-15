import {
  LAST_ENTRY_WARNING_WINDOW_MIN,
  MS_PER_MINUTE,
  TURNSTILE_GANGWAY_BUFFER_MIN,
  WALKING_METERS_PER_MINUTE,
} from "@/lib/constants";
import { formatIstanbulHhmm } from "@/lib/utils/istanbul-time";

/**
 * "Son giriş" (boarding deadline) hesabı.
 *
 * ÖNEMLİ — DÜRÜSTLÜK KURALI: Bu bir RESMÎ kapı kapanış saati DEĞİLDİR.
 * Uydurma operasyonel veri üretmemek için kalkıştan yalnızca turnike + rampa
 * geçiş payı (TURNSTILE_GANGWAY_BUFFER_MIN) düşülür ve arayüzde her zaman
 * "tahmini" olarak etiketlenir. Resmî bir kapı kapanış saati doğrulandığında
 * tek yapılacak, buradaki payı operatör bazlı bir kaynaktan beslemektir.
 */
export interface BoardingDeadline {
  /** Önerilen son giriş anı (ms). */
  lastEntryMs: number;
  /** Son giriş saati "HH:mm" (Europe/Istanbul). */
  lastEntryHhmm: string;
  /** Son girişe kalan dakika (yukarı yuvarlanır); pencere geçtiyse null. */
  minutesUntilLastEntry: number | null;
  /** Son giriş penceresi geçti mi? (Kalkış beklemeden "artık geç" durumu) */
  isPastLastEntry: boolean;
  /** Uyarı penceresi içinde miyiz? (son LAST_ENTRY_WARNING_WINDOW_MIN dakika) */
  isWithinWarningWindow: boolean;
  /** Bu hesap tavsiye niteliğindedir, resmî kapı kapanış saati değildir. */
  isAdvisory: true;
}

/**
 * Kalkışa göre önerilen "son giriş" anını çözer.
 * Geçersiz kalkış zamanı için null döner (sessizce yanlış bilgi üretmez).
 */
export function resolveBoardingDeadline(
  departureMs: number,
  nowMs: number = Date.now(),
): BoardingDeadline | null {
  if (!Number.isFinite(departureMs)) return null;

  const lastEntryMs = departureMs - TURNSTILE_GANGWAY_BUFFER_MIN * MS_PER_MINUTE;
  const diffMs = lastEntryMs - nowMs;
  const isPastLastEntry = diffMs <= 0;

  const minutesUntilLastEntry = isPastLastEntry
    ? null
    : Math.ceil(diffMs / MS_PER_MINUTE);

  return {
    lastEntryMs,
    lastEntryHhmm: formatIstanbulHhmm(lastEntryMs),
    minutesUntilLastEntry,
    isPastLastEntry,
    isWithinWarningWindow:
      !isPastLastEntry && minutesUntilLastEntry !== null
        ? minutesUntilLastEntry <= LAST_ENTRY_WARNING_WINDOW_MIN
        : false,
    isAdvisory: true,
  };
}

/** Mesafeye göre tahmini yürüme süresi (dk). */
export function estimateWalkingMinutes(distanceMeters: number): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) return 0;
  return Math.ceil(distanceMeters / WALKING_METERS_PER_MINUTE);
}

/**
 * "Şimdi çık" anı: kalkıştan (yürüme + turnike/rampa payı) düşülür.
 * @param walkingMinutes Yürüme süresi (dk)
 */
export function recommendedLeaveMs(
  departureMs: number,
  walkingMinutes: number = 0,
): number | null {
  if (!Number.isFinite(departureMs)) return null;
  const walk = Number.isFinite(walkingMinutes) && walkingMinutes > 0 ? walkingMinutes : 0;
  return (
    departureMs - (walk + TURNSTILE_GANGWAY_BUFFER_MIN) * MS_PER_MINUTE
  );
}

/**
 * "Kaçırırsan ne olur?" — verilen kalkıştan SONRAKİ ilk seferi bulur.
 * Girdi listesi sırasız olabilir; en yakın ileri kalkış seçilir.
 */
export function findNextDepartureAfter<T extends { departureTime: string }>(
  schedules: T[],
  currentDepartureHhmm: string,
  candidates?: (item: T) => boolean,
): T | null {
  const parse = (hhmm: string): number | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  };

  const current = parse(currentDepartureHhmm);
  if (current === null) return null;

  let best: T | null = null;
  let bestMinutes = Number.POSITIVE_INFINITY;

  for (const item of schedules) {
    if (candidates && !candidates(item)) continue;
    const minutes = parse(item.departureTime);
    if (minutes === null || minutes <= current) continue;
    if (minutes < bestMinutes) {
      bestMinutes = minutes;
      best = item;
    }
  }

  return best;
}

/** İki "HH:mm" arasındaki dakika farkı (negatifse null). */
export function minutesBetweenHhmm(fromHhmm: string, toHhmm: string): number | null {
  const parse = (hhmm: string): number | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const a = parse(fromHhmm);
  const b = parse(toHhmm);
  if (a === null || b === null) return null;
  const diff = b - a;
  return diff < 0 ? null : diff;
}
