/**
 * DUYURU AJANLARI (HUSUSİ)
 *
 * Her firmanın resmi duyuru / iptal-sefer sayfasını çeker, gerçek duyuru
 * kayıtlarını başlık ve girdileriyle birlikte çıkarır. Uydurma üretilmez;
 * yalnızca sayfada birebir bulunan metin kaydedilir.
 *
 * Kaynaklar (doğrulandı 2026-10-04):
 * - Şehir Hatları : sehirhatlari.istanbul/tr/iptal-seferler
 *                   → bugünkü iptal durumu + "Diğer Duyurular" listesi
 * - Dentur Avrasya: denturavrasya.com/tr-TR/duyurular
 *                   → duyuru sayfa linkleri (slug, resmi URL)
 *
 * Turyol / Prens Tur: düzenli, makine-okunur duyuru yayını bulunamadı:
 * döngüde "kaynak yok" olarak işaretlenir (uydurma duyuru üretilmez).
 */

import { fetchHtml } from "@/lib/agents/scraper-agent";
import type { OperatorAnnouncement, AnnouncementsSnapshot } from "@/lib/types/announcement";

/** Türkçe slug → okunur başlık (yalnızca resmi URL'den, uydurma değil) */
function slugToTitle(slug: string): string {
  return slug
    .replace(/^\d+-/gm, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toLocaleUpperCase("tr-TR"))
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* ŞEHİR HATLARI                                                       */
/* ------------------------------------------------------------------ */

export interface SehirHatlariCancellationStatus {
  date?: string;
  statement: string;
  /** true → bugün iptal sefer var */
  hasCancellations: boolean;
}

export function parseSehirHatlariCancellationStatus(html: string): SehirHatlariCancellationStatus {
  const dateMatch = html.match(/news-detail-date[^>]*>\s*([\d.]+)\s*<\/p>/);
  const stmtMatch = html.match(/İptal seferimiz\s+([^<]{2,120})\.?\s*<\/p>/i);
  const rawStmt = (stmtMatch ? stmtMatch[1].trim() : "").replace(/\.+$/, "");
  const statement = rawStmt
    ? `İptal seferimiz ${rawStmt}.`
    : "İptal sefer bilgisi sayfada bulunamadı.";
  return {
    date: dateMatch?.[1],
    statement,
    hasCancellations: /bulunmaktadır/i.test(statement) && !/bulunmamaktadır/i.test(statement),
  };
}

export function parseSehirHatlariAnnouncements(html: string): OperatorAnnouncement[] {
  const out: OperatorAnnouncement[] = [];

  // 1. Bugünün iptal durumu (en önemli canlı sinyal) — sayfadan birebir
  const status = parseSehirHatlariCancellationStatus(html);
  out.push({
    id: `sh-status-${status.date ?? "bugun"}`,
    operator: "Şehir Hatları",
    title: status.hasCancellations
      ? `İptal Seferler — ${status.date ?? "Bugün"}`
      : `Sefer Durumu — ${status.date ?? "Bugün"}`,
    body: status.statement,
    type: status.hasCancellations ? "CANCELLED_TRIPS" : "INFO",
    affectedLines: [],
    publishedAt: status.date,
    sourceUrl: "https://sehirhatlari.istanbul/tr/iptal-seferler",
    sourceVerified: true,
  });

  // 2. Diğer Duyurular listesi
  const liRe = /<li>\s*<a[^>]*href="(\/tr\/duyurular\/[^"]+)"[^>]*>\s*([^<]{2,160}?)\s*<\/a>\s*<\/li>/g;
  for (const m of html.matchAll(liRe)) {
    const [, href, titleRaw] = m;
    const title = titleRaw.replace(/\s+/g, " ").trim();
    out.push({
      id: `sh-${href.split("/").pop() ?? Date.now()}`,
      operator: "Şehir Hatları",
      title,
      type: classifyAnnouncement(title),
      sourceUrl: `https://sehirhatlari.istanbul${href}`,
      sourceVerified: true,
      body: undefined,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* DENTUR AVRASYA                                                       */
/* ------------------------------------------------------------------ */

export function parseDenturAnnouncements(html: string): OperatorAnnouncement[] {
  const out: OperatorAnnouncement[] = [];
  // HTML attr: href="/tr-TR/duyurular/<slug>"  (ve RSC "href":"..." formu)
  const hrefRe = /href[=:]\s*["'](\/tr-TR\/duyurular\/[^"']+)["']/g;
  const seen = new Set<string>();
  for (const m of html.matchAll(hrefRe)) {
    const href = m[1];
    if (seen.has(href)) continue;
    seen.add(href);
    const slugParts = href.replace(/\/tr-TR\/duyurular\//, "").split("/");
    const slug = slugParts[0];
    if (!slug) continue;
    const titleFromSlug = slugToTitle(slug);
    out.push({
      id: `den-${slug.split("-").slice(-1)[0]}-${slug}`,
      operator: "Dentur Avrasya",
      title: titleFromSlug,
      type: classifyAnnouncement(titleFromSlug),
      sourceUrl: `https://www.denturavrasya.com${href}`,
      sourceVerified: true,
      body: undefined,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* ORTAK SINIFLANDIRICI                                                 */
/* ------------------------------------------------------------------ */

export function classifyAnnouncement(title: string): OperatorAnnouncement["type"] {
  const t = title.toLocaleLowerCase("tr-TR");
  if (t.includes("iptal")) return "CANCELLED_TRIPS";
  if (t.includes("ek sefer") || t.includes("ilave sefer")) return "EXTRA_SERVICE";
  if (
    t.includes("düzenleme") ||
    t.includes("tarife") ||
    t.includes("tarifes") ||
    t.includes("değişiklik") ||
    t.includes("sefer durumu") ||
    t.includes("sefer saati")
  ) {
    return "SCHEDULE_CHANGE";
  }
  // "bilgilendirme", "bilgi" tek başına bilgilendirme kategorisinde değilse INFO
  return "INFO";
}

/* ------------------------------------------------------------------ */
/* ORKESTRASYON                                                         */
/* ------------------------------------------------------------------ */

export interface AnnouncementSource {
  operator: string;
  url: string;
  parser: (html: string) => OperatorAnnouncement[];
  /** İptal durumunu ayrıca üretir (Şehir Hatları için) */
  parseStatus?: (html: string) => unknown;
}

export const ANNOUNCEMENT_SOURCES: AnnouncementSource[] = [
  {
    operator: "Şehir Hatları",
    url: "https://sehirhatlari.istanbul/tr/iptal-seferler",
    parser: parseSehirHatlariAnnouncements,
    parseStatus: parseSehirHatlariCancellationStatus,
  },
  {
    operator: "Dentur Avrasya",
    url: "https://www.denturavrasya.com/tr-TR/duyurular",
    parser: parseDenturAnnouncements,
  },
];

/** Tüm duyuru kaynaklarını çeker; hata olan operatörü atlar */
export async function scrapeAllAnnouncements(): Promise<{
  snapshots: AnnouncementsSnapshot[];
  failures: { operator: string; error: string }[];
}> {
  const snapshots: AnnouncementsSnapshot[] = [];
  const failures: { operator: string; error: string }[] = [];

  for (const source of ANNOUNCEMENT_SOURCES) {
    try {
      const html = await fetchHtml(source.url);
      const announcements = source.parser(html);
      snapshots.push({
        operator: source.operator,
        fetchedAt: new Date().toISOString(),
        sourceUrl: source.url,
        announcements,
      });
    } catch (err: any) {
      failures.push({ operator: source.operator, error: err?.message || String(err) });
    }
  }

  return { snapshots, failures };
}
