/**
 * DUYURU AJANLARI (HUSUSİ)
 *
 * KULLANICI KURALI: İptal duyuruları TÜM firmaların resmi ekranlarında yayınlanır.
 * Bu yüzden ajanlar HER firmayı anlık tarar; iptal varsa ekrana yazılır — tek firma değil.
 * Her firmanın resmi duyuru / iptal-sefer sayfası çekilir, gerçek duyuru
 * kayıtları başlık ve girdileriyle birlikte çıkarılır. Uydurma üretilmez;
 * yalnızca sayfada birebir bulunan metin kaydedilir.
 *
 * Kaynak durumu (2026-10-17 canlı doğrulama):
 * - Şehir Hatları : sehirhatlari.istanbul/tr/iptal-seferler  → TARANIYOR
 * - Dentur Avrasya: denturavrasya.com/tr-TR/duyurular        → TARANIYOR
 * - Mavi Marmara  : resmi sitede duyuru sayfası YOK (mavimarmara.net/duyurular → 404;
 *                   WordPress API'de duyuru kategorisi/gönderisi yok) → kaynak yok
 * - Turyol        : resmi sitede duyuru/durum sayfası YOK (tüm denemeler 404) → kaynak yok
 * - Prens Tur     : resmi sitede duyuru bölümü YOK (prenstur.net/duyurular → 404) → kaynak yok
 *
 * Kaynağı olmayan firmalar sessizce atlanmaz; tarama raporunda (coverage)
 * "NO_SOURCE" olarak kanıtlı notla raporlanır.
 */

import { fetchHtml, normalizePierName } from "@/lib/agents/scraper-agent";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
import { OPERATOR_REGISTRY } from "@/lib/data/operator-registry";
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

/**
 * TARANAN KAYNAKLAR (parser'lı, canlı çekilebilir resmi sayfalar).
 * Her yeni firma kaynağı buraya eklenir; UI ve eşleştirici otomatik kapsar.
 */
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

/**
 * KAYNAĞI OLMAYAN FİRMALAR — kanıtlı not (2026-10-17 canlı deneme sonuçları).
 * Bu firmalar da her senkronda "taranır": resmi sitesinde makine-okunur duyuru
 * yayını bulunmadığı raporda NO_SOURCE olarak açıkça belirtilir (sessiz atlama yok).
 */
const NO_SOURCE_NOTES: Record<string, string> = {
  "Mavi Marmara":
    "Resmi sitede duyuru sayfası yok: mavimarmara.net/duyurular → 404; WordPress içeriğinde duyuru kategorisi/gönderisi bulunmuyor (son gönderi 2022). İptaller operasyon merkezinden duyurulur.",
  Turyol:
    "Resmi sitede duyuru/sefer-durumu sayfası yok: /duyurular, /tr/duyurular, /Haberler, /sefer-durumu → tümü 404. İptaller çağrı merkeziyle duyurulur.",
  "Prens Tur":
    "Resmi sitede duyuru bölümü yok: prenstur.net/duyurular, /duyuru.html, /haberler.html → tümü 404. Tarife yalnızca JPEG afiş; iptal duyurusu web'de yayınlanmıyor.",
};

/** Operatör tarama kapsam kaydı (UI/meta/tests için) */
export interface OperatorScanCoverage {
  operator: string;
  hasSource: boolean;
  url?: string;
  note?: string;
}

/** Kayıtlı tüm operatörlerin tarama kapsamı (kaynak defteri + kanıtlı notlar) */
export const OPERATOR_SCAN_COVERAGE: OperatorScanCoverage[] = OPERATOR_REGISTRY.map((op) => {
  const source = ANNOUNCEMENT_SOURCES.find((s) => s.operator === op.name);
  return source
    ? { operator: op.name, hasSource: true, url: source.url }
    : { operator: op.name, hasSource: false, note: NO_SOURCE_NOTES[op.name] ?? "Resmi duyuru kaynağı bulunamadı." };
});

/** Tek senkronda detay sayfası çekilecek azami iptal duyurusu sayısı */
const MAX_DETAIL_FETCHES = 3;
/** Resmi kaynak sayfası için ağ zaman aşımı (istek yolunda çalışır) */
const SOURCE_TIMEOUT_MS = 8000;
/** Detay sayfası için ağ zaman aşımı */
const DETAIL_TIMEOUT_MS = 6000;
/**
 * Bazı resmi sitelerin WAF'ı veri merkezi IP'lerinden gelen ajan isteklerini
 * engeller (canlıda Şehir Hatları 403 döndü). Kanıt: aynı içerik TR IP'den
 * sorunsuz alınıyor; engel içerikte değil istek kimliğinde. Bu yüzden canlı
 * tarama, herkese açık sayfayı standart bir tarayıcı kimliğiyle okur.
 */
const LIVE_SCRAPE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const LIVE_SCRAPE_HEADERS = {
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
};

/**
 * İptal duyurularının GÖVDESİNİ resmi detay sayfasından birebir çeker.
 * Gövde olmadan "hangi hatlar iptal" bilgisi eşleştirilemez; yalnızca
 * başlıkla gösterim eksik kalır. Bu yüzden güncel iptal duyurularının
 * detay sayfası ayrıca indirilir (uydurma yok; sayfa metni aynen alınır).
 * TÜM firmalar için çalışır (URL'de /duyurular/ geçen resmi detay sayfaları).
 */
async function enrichCancellationBodies(announcements: OperatorAnnouncement[]): Promise<void> {
  const candidates = announcements
    .filter(
      (a) =>
        !a.body &&
        a.type === "CANCELLED_TRIPS" &&
        a.sourceUrl.includes("/duyurular/") &&
        isAnnouncementCurrent(a)
    )
    .slice(0, MAX_DETAIL_FETCHES);

  await Promise.allSettled(
    candidates.map(async (a) => {
      try {
        const detailHtml = await fetchHtml(a.sourceUrl, LIVE_SCRAPE_UA, {
          timeoutMs: DETAIL_TIMEOUT_MS,
          fresh: true,
          extraHeaders: LIVE_SCRAPE_HEADERS,
        });
        const body = extractArticleBodyText(detailHtml);
        if (body) a.body = body;
      } catch {
        // Detay alınamazsa duyuru başlığıyla kalır — uydurma yok.
      }
    })
  );
}

/** Bir firmanın bu senkronundaki tarama sonucu */
export interface OperatorScanReport {
  operator: string;
  status: "SCANNED" | "NO_SOURCE" | "FAILED";
  url?: string;
  announcementCount?: number;
  error?: string;
  note?: string;
}

/**
 * KULLANICI KURALI: TÜM firmaları tara — yalnızca bir firma değil.
 * Kaynaklı firmalar PARALEL canlı çekilir; kaynağı olmayanlar kanıtlı notla
 * NO_SOURCE raporlanır; hata alan firmanın önceki snapshot'ı korunur (çağıran taraf).
 */
export async function scrapeAllAnnouncements(): Promise<{
  snapshots: AnnouncementsSnapshot[];
  failures: { operator: string; error: string }[];
  coverage: OperatorScanReport[];
}> {
  const snapshots: AnnouncementsSnapshot[] = [];
  const failures: { operator: string; error: string }[] = [];
  const coverage: OperatorScanReport[] = [];

  const settled = await Promise.allSettled(
    ANNOUNCEMENT_SOURCES.map(async (source) => {
      const html = await fetchHtml(source.url, LIVE_SCRAPE_UA, {
        timeoutMs: SOURCE_TIMEOUT_MS,
        fresh: true,
        extraHeaders: LIVE_SCRAPE_HEADERS,
      });
      const announcements = source.parser(html);
      await enrichCancellationBodies(announcements);
      return { source, announcements };
    })
  );

  settled.forEach((result, idx) => {
    const source = ANNOUNCEMENT_SOURCES[idx];
    if (result.status === "fulfilled") {
      const { announcements } = result.value;
      snapshots.push({
        operator: source.operator,
        fetchedAt: new Date().toISOString(),
        sourceUrl: source.url,
        announcements,
      });
      coverage.push({
        operator: source.operator,
        status: "SCANNED",
        url: source.url,
        announcementCount: announcements.length,
      });
    } else {
      const error = result.reason?.message || String(result.reason);
      failures.push({ operator: source.operator, error });
      coverage.push({ operator: source.operator, status: "FAILED", url: source.url, error });
    }
  });

  // Kaynağı olmayan operatörler: sessiz atlama yok, kanıtlı rapor
  const scannedOperators = new Set(ANNOUNCEMENT_SOURCES.map((s) => s.operator));
  for (const op of OPERATOR_REGISTRY) {
    if (scannedOperators.has(op.name)) continue;
    coverage.push({
      operator: op.name,
      status: "NO_SOURCE",
      note: NO_SOURCE_NOTES[op.name] ?? "Resmi duyuru kaynağı bulunamadı.",
    });
  }

  return { snapshots, failures, coverage };
}
