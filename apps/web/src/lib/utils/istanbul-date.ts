/**
 * İSTANBUL TAKVİM GÜNÜ YARDIMCILARI
 *
 * KULLANICI KURALI: İptal duyuruları yalnızca yayınlandığı TAKVİM GÜNÜ
 * geçerlidir; gün 00:00'da (İstanbul saati) biter. Sunucu UTC'de çalıştığı
 * için `getDate()` doğrudan kullanılamaz (00:00–03:00 arası bir önceki günü
 * verir). Tüm gün karşılaştırmaları bu yardımcılarla yapılır.
 */

import { getIstanbulParts } from "@/lib/utils/istanbul-time";

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
