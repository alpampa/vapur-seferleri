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

import { fetchHtml, normalizePierName } from "@/lib/agents/scraper-agent";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
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
/* HTML → DÜZ METİN (sayfadaki birebir içerik; uydurma yok)            */
/* ------------------------------------------------------------------ */

const ENTITY_MAP: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  ccedil: "ç", Ccedil: "Ç", uuml: "ü", Uuml: "Ü", ouml: "ö", Ouml: "Ö",
  gbreve: "ğ", Gbreve: "Ğ", imath: "ı", Idot: "İ", scedil: "ş", Scedil: "Ş",
  ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”",
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => ENTITY_MAP[name] ?? m);
}

/**
 * Resmî duyuru sayfasının makale gövdesini DÜZ METİN olarak çıkarır.
 * - Tablolar (tarife düzenleme çizelgeleri) gövdeye alınmaz; yalnızca açıklama
 *   cümleleri + "İptal Seferler:" hat listesi saklanır.
 * - Metin sayfada birebir bulunan içeriktir; hiçbir cümle üretilmez.
 */
export function extractArticleBodyText(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const containerMatch = cleaned.match(/class="[^"]*news-detail-content[^"]*"/);
  if (!containerMatch || containerMatch.index === undefined) return "";
  const tagEnd = cleaned.indexOf(">", containerMatch.index + containerMatch[0].length);
  if (tagEnd === -1) return "";
  const start = tagEnd + 1;
  const endCandidates = ["Diğer Duyurular", "</main>"]
    .map((m) => cleaned.indexOf(m, start))
    .filter((i) => i > start);
  const end = endCandidates.length > 0 ? Math.min(...endCandidates) : start + 30000;
  const body = cleaned
    .slice(start, end)
    .replace(/<table[\s\S]*?<\/table>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|tr|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(body)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 1200);
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

  // ESKİ FORMAT: tek satır durum cümlesi ("İptal seferimiz bulunmamaktadır.")
  const stmtMatch = html.match(/İptal seferimiz\s+([^<]{2,120})\.?\s*<\/p>/i);
  if (stmtMatch) {
    const rawStmt = stmtMatch[1].trim().replace(/\.+$/, "");
    const statement = `İptal seferimiz ${rawStmt}.`;
    return {
      date: dateMatch?.[1],
      statement,
      hasCancellations: /bulunmaktadır/i.test(statement) && !/bulunmamaktadır/i.test(statement),
    };
  }

  // YENİ FORMAT (17.10.2026'dan itibaren): sayfada doğrudan iptal duyurusu
  // yayınlanır (açıklama + "İptal Seferler:" hat listesi + düzenleme tabloları).
  const body = extractArticleBodyText(html);
  const normBody = normalizePierName(body);
  const hasCancelList = normBody.includes("iptalseferler");
  const cannotBeOperated =
    normBody.includes("gerceklestirilemeyecektir") ||
    normBody.includes("iptaledilmistir");
  if (body && (hasCancelList || cannotBeOperated)) {
    return { date: dateMatch?.[1], statement: body, hasCancellations: true };
  }

  return {
    date: dateMatch?.[1],
    statement: "İptal sefer bilgisi sayfada bulunamadı.",
    hasCancellations: false,
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
    // KULLANICI KURALI: Aynı günün iptal duyurusu durum kaydıyla zaten
    // gösteriliyorsa listede İKİNCİ kez gösterilmez (mükerrer duyuru yok).
    if (
      status.hasCancellations &&
      status.date &&
      title.includes(status.date) &&
      classifyAnnouncement(title) === "CANCELLED_TRIPS"
    ) {
      continue;
    }
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

/** Tek senkronda detay sayfası çekilecek azami iptal duyurusu sayısı */
const MAX_DETAIL_FETCHES = 3;

/**
 * İptal duyurularının GÖVDESİNİ resmi detay sayfasından birebir çeker.
 * Gövde olmadan "hangi hatlar iptal" bilgisi eşleştirilemez; yalnızca
 * başlıkla gösterim eksik kalır. Bu yüzden güncel iptal duyurularının
 * detay sayfası ayrıca indirilir (uydurma yok; sayfa metni aynen alınır).
 */
async function enrichCancellationBodies(announcements: OperatorAnnouncement[]): Promise<void> {
  let fetches = 0;
  for (const a of announcements) {
    if (fetches >= MAX_DETAIL_FETCHES) break;
    if (a.body || a.type !== "CANCELLED_TRIPS") continue;
    if (!a.sourceUrl.includes("/duyurular/")) continue;
    if (!isAnnouncementCurrent(a)) continue;
    try {
      const detailHtml = await fetchHtml(a.sourceUrl);
      const body = extractArticleBodyText(detailHtml);
      if (body) a.body = body;
      fetches++;
    } catch {
      // Detay alınamazsa duyuru başlığıyla kalır — uydurma yok.
    }
  }
}

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
      if (source.operator === "Şehir Hatları") {
        await enrichCancellationBodies(announcements);
      }
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
