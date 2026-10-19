/**
 * İPTAL BÜLTENİ — duyuru gövdesini okunur metne çevirir.
 *
 * KULLANICI KURALI:
 *  - Metnin BAŞINDA tarih olur (GG.AA.YYYY).
 *  - Hangi seferlerin/hatların iptal olduğu madde madde yazılır.
 *  - Metin kaynaktan birebir alınır; cümle ÜRETİLMEZ, yalnızca düzenlenir.
 *
 * Bu modül saf fonksiyonlardan oluşur (hem sunucu hem istemci kullanır).
 */

import type { OperatorAnnouncement } from "@/lib/types/announcement";
import { getIstanbulDateParts, parseIsoDateKey, parseTrDateKey } from "@/lib/utils/istanbul-date";

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export interface CancellationBulletin {
  /** GG.AA.YYYY */
  date: string;
  /** Uzun okunur tarih (örn. "19 Ekim 2026") */
  dateLong: string;
  operator: string;
  reason?: string;
  items: string[];
  /** Çok satırlı, tarih başta metin */
  text: string;
  /** Kayan şerit için tek satır */
  oneLine: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function trDateFromKey(key: number | null, fallbackMs: number): { short: string; long: string } {
  if (key) {
    const year = Math.floor(key / 10000);
    const month = Math.floor((key % 10000) / 100);
    const day = key % 100;
    return {
      short: `${pad(day)}.${pad(month)}.${year}`,
      long: `${day} ${TR_MONTHS[month - 1] ?? ""} ${year}`.trim(),
    };
  }
  const { year, month, day } = getIstanbulDateParts(fallbackMs);
  return {
    short: `${pad(day)}.${pad(month)}.${year}`,
    long: `${day} ${TR_MONTHS[month - 1] ?? ""} ${year}`.trim(),
  };
}

/** Duyurunun geçerlilik tarihi: publishedAt → başlık/gövdedeki ilk tarih → bugün. */
export function extractBulletinDate(
  announcement: Pick<OperatorAnnouncement, "publishedAt" | "title" | "body">,
  nowMs: number = Date.now()
): { short: string; long: string } {
  const pub = announcement.publishedAt;
  let key: number | null = null;
  if (pub) {
    key = pub.includes(".") ? parseTrDateKey(pub) : parseIsoDateKey(pub);
  }
  if (key === null) key = parseTrDateKey(announcement.title);
  if (key === null) key = parseTrDateKey(announcement.body);
  return trDateFromKey(key, nowMs);
}

/** Türkçe büyük İ güvenli normalize (başlık/başlık satırı karşılaştırması). */
function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function cleanLine(line: string): string {
  return line
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-•*·]\s*/, "")
    .trim();
}

function isDateLine(line: string): boolean {
  return /^\d{1,2}[.\/]\d{1,2}[.\/]\d{4}$/.test(line);
}

const BOILERPLATE: RegExp[] = [
  /^değerli yolcular/i,
  /^bilgilerinize sunar/i,
  /^saygılarımızla/i,
  /^bilgi edinmek için/i,
  /^detaylı bilgi/i,
  /^iptal seferler:?$/i,
  /^sefer durumu$/i,
  /^diğer duyurular$/i,
];

/** İptal nedeni (varsa) — kaynaktaki cümle aynen korunur. */
export function extractCancellationReason(
  announcement: Pick<OperatorAnnouncement, "body">
): string | undefined {
  const lines = (announcement.body ?? "").split(/\n+/).map(cleanLine).filter(Boolean);
  return lines.find(
    (l) =>
      /nedeniyle|sebebiyle|dolayısıyla|dolayı/i.test(l) &&
      !normalizeTr(l).includes("iptalseferler") &&
      !/^değerli yolcular/i.test(l)
  );
}

const ROUTE_HINT =
  /hatt|uğra|iskele|sefer|ada|köy|karaköy|kabataş|bostancı|moda|beşiktaş|eminönü|üsküdar|kadıköy|bakırköy|avcılar|büyükada|heybeli|burgaz|kınalı|sirkeci|ortaköy|bebek|anadolu|sarıyer|rumeli|çengelköy|kanlıca|kuzguncuk|üsküdar|harem|adalar/i;

/**
 * İptal edilen sefer/hat maddeleri. Öncelik resmî "İptal Seferler:" listesi;
 * yoksa hat/iskele/sefer ifadesi taşıyan satırlar. Uydurma madde eklenmez.
 */
export function extractCancellationItems(
  announcement: Pick<OperatorAnnouncement, "title" | "body">
): string[] {
  const lines = (announcement.body ?? "").split(/\n+/).map(cleanLine).filter(Boolean);
  const headerIdx = lines.findIndex((l) => normalizeTr(l) === "iptalseferler");
  const reason = extractCancellationReason(announcement);
  const candidates = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines;

  const items = candidates.filter((line) => {
    if (!line || isDateLine(line)) return false;
    if (normalizeTr(line) === "iptalseferler") return false;
    if (BOILERPLATE.some((re) => re.test(line))) return false;
    if (line === reason) return false;
    // Tarife düzenlemesi cümlesi iptal maddesi değildir.
    if (/uygulanacak sefer tarifeleri|tarife uygulanacak|aşağıdaki gibidir/i.test(line)) return false;
    return ROUTE_HINT.test(line) || normalizeTr(line).includes("iptal");
  });

  const unique = [...new Set(items)];
  if (unique.length > 0) return unique;

  if (normalizeTr(announcement.title).includes("iptal")) return [cleanLine(announcement.title)];
  if (lines.length > 0) return [lines[0]];
  return [];
}

/**
 * Duyuruyu "tarih başta + iptal maddeleri" biçiminde metne çevirir.
 * Tarih yoksa o günün İstanbul tarihi kullanılır (duyuru o gün yayında).
 */
export function buildCancellationBulletin(
  announcement: OperatorAnnouncement,
  nowMs: number = Date.now()
): CancellationBulletin {
  const date = extractBulletinDate(announcement, nowMs);
  const reason = extractCancellationReason(announcement);
  const items = extractCancellationItems(announcement);

  const lines: string[] = [`${date.short} · ${announcement.operator}`];
  if (reason) lines.push(`Sebep: ${reason}`);
  if (items.length > 0) {
    lines.push("İptal edilen seferler:");
    for (const item of items) lines.push(`• ${item}`);
  } else if (announcement.body) {
    lines.push(announcement.body);
  }

  const oneLine = [
    date.short,
    announcement.operator,
    reason ? `Sebep: ${reason}` : "",
    items.length > 0 ? `İptal: ${items.join("; ")}` : announcement.title,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    date: date.short,
    dateLong: date.long,
    operator: announcement.operator,
    reason,
    items,
    text: lines.join("\n"),
    oneLine,
  };
}
