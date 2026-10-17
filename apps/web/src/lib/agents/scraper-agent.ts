/**
 * GENEL SCRAPER AJANI — ALTYAPI
 *
 * Her firma ajanı şu döngüyü kullanır:
 *   1. belirtilen adresten sayfa çek (fetchHtml)
 *   2. ham içeriği normalleştir (normalize) → sabit bir "ayak izi" (hash) üret
 *   3. önceki senkronun ayak iziyle karşılaştır (compareSnapshot)
 *   4. değişiklik varsa raporla ve yeni senkronu sakla (persistSnapshot)
 *
 * Önemli: Bu katman veri ÜRETMEZ; yalnızca kaynaktan alıp değişikliği
 * bildirir. "Uydurma veri" sadece veri modeline GERÇEK kaynaktan çekilen
 * kayıtların işlenmesiyle önlenir.
 */

export interface HashableContent {
  /** içeriğin ayak izi için normalize edilmiş metni */
  fingerprint: string;
  /** nitelik sayısı (örn. kayıt sayısı) */
  recordCount?: number;
}

export interface ScrapeChangeReport {
  operator: string;
  changed: boolean;
  detail: string;
  previousFingerprint?: string;
  currentFingerprint?: string;
  previousRecordCount?: number;
  currentRecordCount?: number;
  checkedAt: string;
}

export interface SnapshotState {
  fingerprint: string;
  recordCount?: number;
  updatedAt: string;
}

/** Ham HTML'i içerik ayak izine dönüştürür */
export function computeFingerprint(raw: string, recordCount?: number): HashableContent {
  const normalized = raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\r?\n/g, " ")
    .replace(/[\t ]+/g, " ")
    .trim();
  return { fingerprint: `${normalized.length}:${recordCount ?? ""}`, recordCount };
}

/** İki ayak izini karşılaştır → değişiklik raporu üret (içerik uzunluğu bazlı) */
export function compareSnapshots(
  operator: string,
  previous: SnapshotState | undefined,
  current: HashableContent
): ScrapeChangeReport {
  const changed =
    !previous ||
    previous.fingerprint !== current.fingerprint ||
    (current.recordCount !== undefined &&
      previous.recordCount !== undefined &&
      previous.recordCount !== current.recordCount);

  return {
    operator,
    changed,
    detail: changed
      ? "Tarifede değişiklik algılandı (yeni senkron uygulanmalı)."
      : "Değişiklik yok — tarife birebir aynı.",
    previousFingerprint: previous?.fingerprint,
    currentFingerprint: current.fingerprint,
    previousRecordCount: previous?.recordCount,
    currentRecordCount: current.recordCount,
    checkedAt: new Date().toISOString(),
  };
}

/** Kimlikli, tarihli bir senkron kaydı üretir */
export function buildSnapshotState(current: HashableContent): SnapshotState {
  return {
    fingerprint: current.fingerprint,
    recordCount: current.recordCount,
    updatedAt: new Date().toISOString(),
  };
}

/** Firmaların canlı sayfalarını çeker (ajanlar arasında ortak).
 *  - timeoutMs: ağ yanıtı için üst sınır (iptal taraması istek yolunda çalışır)
 *  - fresh: true → önbelleğe almadan canlı çek (anlık iptal taraması)
 */
export async function fetchHtml(
  url: string,
  ua = "Vapur-Sync-Agent/3.0",
  options: { timeoutMs?: number; fresh?: boolean } = {}
): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    ...(options.fresh ? { cache: "no-store" as RequestCache } : { next: { revalidate: 3600 } }),
    ...(options.timeoutMs ? { signal: AbortSignal.timeout(options.timeoutMs) } : {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

/** küçültme: TEK tuşa inen (kabaca) stabil şehir adı slug */
export function normalizePierName(name: string): string {
  return name
    .toLocaleLowerCase("tr-TR")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/** Üst veri/duyuru eşleşmesinde kullanılan Türkçe büyük-İ güvenli küçültme */
export function normalizeTR(text: string): string {
  return normalizePierName(text);
}

export function containsAny(normalizedText: string, needles: string[]): boolean {
  const t = normalizePierName(normalizedText);
  return needles.some((n) => t.includes(normalizePierName(n)));
}
