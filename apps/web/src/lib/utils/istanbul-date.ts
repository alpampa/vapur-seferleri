/**
 * İSTANBUL TAKVİM GÜNÜ YARDIMCILARI
 *
 * KULLANICI KURALI: İptal duyuruları yalnızca yayınlandığı TAKVİM GÜNÜ
 * geçerlidir; gün 00:00'da (İstanbul saati) biter. Sunucu UTC'de çalıştığı
 * için `getDate()` doğrudan kullanılamaz (00:00–03:00 arası bir önceki günü
 * verir). Tüm gün karşılaştırmaları bu yardımcılarla yapılır.
 */

import { getIstanbulParts } from "@/lib/utils/istanbul-time";
import { checkTurkishHoliday } from "@/lib/utils/holiday-calendar";

export interface IstanbulDateParts {
  year: number;
  month: number;
  day: number;
}

/** Tek saat kaynağı (istanbul-time) üzerinden İstanbul takvim günü. */
export function getIstanbulDateParts(nowMs: number = Date.now()): IstanbulDateParts {
  const { year, month, day } = getIstanbulParts(nowMs);
  return { year, month, day };
}

/** GG.AA.YYYY (İstanbul takvim günü) */
export function toTrDate(nowMs: number = Date.now()): string {
  const { year, month, day } = getIstanbulDateParts(nowMs);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

/** Takvim gününü karşılaştırılabilir tamsayıya çevirir (YYYYMMDD). */
export function toDateKey(parts: IstanbulDateParts): number {
  return parts.year * 10000 + parts.month * 100 + parts.day;
}

/** "GG.AA.YYYY" metninden gün anahtarı (metin içinde geçen ilk tarih). */
export function parseTrDateKey(value?: string | null): number | null {
  if (!value) return null;
  const m = value.match(/\b(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})\b/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !month || !year) return null;
  return year * 10000 + month * 100 + day;
}

/** ISO tarih/saatten İstanbul takvim günü anahtarı. */
export function parseIsoDateKey(value?: string | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return toDateKey(getIstanbulDateParts(ms));
}

/**
 * Gün anahtarını UTC gün indeksine çevirir; iki gün arasındaki farkı
 * yaz saati/gece yarısı kaymalarından bağımsız hesaplamak için kullanılır.
 */
export function dateKeyToDayIndex(key: number): number {
  const year = Math.floor(key / 10000);
  const month = Math.floor((key % 10000) / 100);
  const day = key % 100;
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

/** İstanbul takvim gününü YYYY-MM-DD olarak döner. */
export function toIsoDate(nowMs: number = Date.now()): string {
  const { year, month, day } = getIstanbulDateParts(nowMs);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** ISO güne gün ekler/çıkarır (takvim günü bazında, saat dilimi kaymasız). */
export function addDaysToIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days, 12));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

/** Verilen ISO günün tarife tipi (resmî tatiller Pazar tarifesine eşlenir). */
export function getDayTypeForIso(dateIso: string): "WEEKDAY" | "SATURDAY" | "SUNDAY" {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (checkTurkishHoliday(y, m, d).isHoliday) return "SUNDAY";
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  if (dow === 0) return "SUNDAY";
  if (dow === 6) return "SATURDAY";
  return "WEEKDAY";
}

/** Bugünden itibaren sonraki belirli hafta gününün ISO tarihi (0=Pazar). */
export function nextWeekdayIso(fromIso: string, targetDow: number): string {
  const [y, m, d] = fromIso.split("-").map(Number);
  const current = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  const delta = (targetDow - current + 7) % 7;
  return addDaysToIso(fromIso, delta);
}
