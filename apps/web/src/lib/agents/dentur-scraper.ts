/**
 * DENTUR AVRASYA — GERÇEK TARİFE PARSE ENGİNİ
 *
 * Kaynak: denturavrasya.com/tr-TR/hatlarimiz/* (resmi hat sayfaları).
 * Erişim & doğrulama: 2026-10-04. Parse kuralları sitenin GERÇEK sayfa
 * yapısından birebir çıkarılmıştır (aşağıda her hat için belgelenmiştir).
 *
 * DÜRÜSTLÜK KURALI:
 * - Sayfada "Sürekli Sefer" ifadesi geçen aralıklar için sahte dakika üretilmez;
 *   o pencere tek bir "sürekli sefer" kaydı olarak işaretlenir (isContinuous).
 * - Yalnızca sayfada GERÇEKTEN birebir yazılı saatler trip üretir.
 * - "-" (hizmet yok) hücreleri atlanır.
 *
 * Aynı veri hem masaüstü hem mobil DOM'da iki kez bulunur → sonuçlar
 * kimlik (line+direction+dayType+dep) üzerinden tekilleştirilir.
 */

export type DenturDayType =
  | "WEEKDAY"       // Hafta İçi
  | "WEEKDAY_SAT"   // Hafta İçi ve Cumartesi
  | "SATURDAY"      // Cumartesi
  | "SUNDAY"        // Pazar / Resmi Tatil
  | "WEEKEND";      // Hafta Sonu

export interface DenturStopTime {
  name: string;
  time: string;
}

export interface DenturLineRecord {
  line: string;
  origin: string;
  destination: string;
  directionLabel: string;
  dayType: DenturDayType;
  departureTime: string;
  arrivalTime?: string;
  stops?: DenturStopTime[];
  isContinuous?: boolean;
  continuousUntil?: string;
}

/** HTML varlıkları ve \uXXXX kaçışlarını çözer (sayfa iki form kullanıyor) */
export function decodeDenturHtml(raw: string): string {
  let out = raw
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
  if (out.includes("\\u003c")) {
    try {
      out = out.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
    } catch {
      // pas
    }
  }
  return out;
}

const TIME_RE = /^([0-2]\d):[0-5]\d$/;
const RANGE_RE = /([0-2]\d:[0-5]\d)\s*-\s*([0-2]\d:[0-5]\d)/;
const HAS_CONTINUOUS = /sürekli sefer/i;

function cleanCell(cell: string): string {
  return cell.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function uniq<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

/**
 * HAT: Beşiktaş ↔ Kadıköy
 * Sayfa yapısı: 4 adet <ul><li>HH:mm</li></ul> bloğu.
 * Blok başlığında "HAFTA İÇİ VE CUMARTESİ" veya "PAZAR VE RESMİ TATİLLER" geçer.
 * İki yön (Beşiktaş→Kadıköy ve Kadıköy→Beşiktaş) aynı saat listesini paylaşır.
 */
export function parseBesiktasKadikoySchedules(html: string): DenturLineRecord[] {
  const d = decodeDenturHtml(html);
  const records: DenturLineRecord[] = [];

  const blocks = d.match(/<ul[^>]*>([\s\S]*?)<\/ul>/g) || [];
  for (const block of blocks) {
    const times = [...block.matchAll(/<li>\s*([0-2]\d:[0-5]\d)\s*<\/li>/g)].map(
      (m) => m[1]
    );
    if (times.length === 0) continue;

    const before = d.slice(Math.max(0, d.indexOf(block) - 600), d.indexOf(block));
    const header = cleanCell(before).toLocaleUpperCase("tr-TR");
    if (header.includes("PAZAR")) {
      for (const origin of ["Beşiktaş", "Kadıköy"]) {
        const destination = origin === "Beşiktaş" ? "Kadıköy" : "Beşiktaş";
        for (const dep of times) {
          records.push({
            line: "Beşiktaş-Kadıköy",
            origin,
            destination,
            directionLabel: `${origin} → ${destination}`,
            dayType: "SUNDAY",
            departureTime: dep,
          });
        }
      }
    } else {
      for (const origin of ["Beşiktaş", "Kadıköy"]) {
        const destination = origin === "Beşiktaş" ? "Kadıköy" : "Beşiktaş";
        for (const dep of times) {
          records.push({
            line: "Beşiktaş-Kadıköy",
            origin,
            destination,
            directionLabel: `${origin} → ${destination}`,
            dayType: "WEEKDAY_SAT",
            departureTime: dep,
          });
        }
      }
    }
  }

  return uniq(
    records,
    (r) => `${r.line}|${r.origin}|${r.destination}|${r.dayType}|${r.departureTime}`
  );
}

/**
 * HAT: Adalar (Beşiktaş/Kabataş/Sirkeci ↔ Heybeliada/Büyükada)
 * Sayfa yapısı: <table> blokları. Başlıkta "GİDİŞ" veya "DÖNÜŞ",
 * "HAFTA İÇİ" veya "HAFTA SONU" geçer. Sütun etiketleri <th> iskelelerdir;
 * her satır bir seferin iskele bazlı saatleridir (ara duraklar dahil).
 */
export function parseAdalarSchedules(html: string): DenturLineRecord[] {
  const d = decodeDenturHtml(html);
  const records: DenturLineRecord[] = [];

  const tableMatches = [...d.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)];
  for (const t of tableMatches) {
    const block = t[0];
    const rows = [...block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);

    const headers: string[] = rows[0]
      ? cleanCell(rows[0])
          .split(/\s*BEŞİKTAŞ\s*/)?.[0] !== undefined
        ? (
            rows[0].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || []
          ).map((c) => cleanCell(c))
        : []
      : [];
    if (headers.length < 4) continue;

    const before = d.slice(Math.max(0, d.indexOf(block) - 700), d.indexOf(block));
    const headerTxt = cleanCell(before).toLocaleUpperCase("tr-TR");
    const isGidis = headerTxt.includes("GİDİŞ") || headers[0].includes("BEŞİKTAŞ");
    const isHaftaSonu = headerTxt.includes("HAFTA SONU");

    // Sütun iskele adlarını temizle
    const colNames = headers.map((h) =>
      h
        .toLocaleUpperCase("tr-TR")
        .replace(/[^A-ZÇĞİÖŞÜ ]/g, "")
        .trim()
    );

    for (let i = 1; i < rows.length; i++) {
      const cells = (rows[i].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || []).map(
        (c) => cleanCell(c)
      );
      if (cells.length < headers.length) continue;

      const times: DenturStopTime[] = [];
      for (let c = 0; c < headers.length; c++) {
        const time = cells[c].trim();
        if (TIME_RE.test(time)) {
          times.push({ name: colNames[c], time });
        }
      }
      if (times.length === 0) continue;

      const isBezikSet = headers[0].toLocaleUpperCase("tr-TR").includes("BEŞİKTAŞ");
      const origin = isBezikSet ? "Beşiktaş" : "Büyükada";
      const destination = isBezikSet ? "Büyükada" : "Beşiktaş";

      records.push({
        line: "Adalar",
        origin,
        destination,
        directionLabel: isGidis ? "Gidiş" : "Dönüş",
        dayType: isHaftaSonu ? "WEEKEND" : "WEEKDAY",
        departureTime: times[0].time,
        arrivalTime: times[times.length - 1].time,
        stops: times.slice(1, -1),
      });
    }
  }

  return uniq(
    records,
    (r) =>
      `${r.line}|${r.origin}|${r.destination}|${r.dayType}|${r.departureTime}|${
        r.stops?.map((s) => s.time).join(",") ?? ""
      }`
  );
}

/**
 * HAT: Üsküdar ↔ Kabataş
 * Sayfa yapısı: iki <table> (ÜSKÜDAR KALKIŞ ve KABATAŞ KALKIŞ).
 * Sütunlar [HAFTA İÇİ, CUMARTESİ, PAZAR]. Her hücre:
 *  - "HH:mm"         → birebir sefer
 *  - "HH:mm - HH:mm Arası Sürekli Sefer" → sürekli sefer penceresi (tek kayıt)
 *  - "-"             → hizmet yok
 */
export function parseUskudarKabatasSchedules(html: string): DenturLineRecord[] {
  const d = decodeDenturHtml(html);
  const records: DenturLineRecord[] = [];

  const tables = [...d.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)];
  for (const t of tables) {
    const block = t[0];
    const rows = [...block.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
    if (rows.length < 3) continue;

    const headerRow = rows[0];
    const headers = (headerRow.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || []).map(
      (c) => cleanCell(c).toLocaleUpperCase("tr-TR")
    );
    if (!headers.some((h) => h.includes("HAFTA"))) continue;

    const before = d.slice(Math.max(0, d.indexOf(block) - 800), d.indexOf(block));
    const dirTxt = cleanCell(before).toLocaleUpperCase("tr-TR");
    const isUskudarKalkis = dirTxt.includes("ÜSKÜDAR KALKIŞ") || dirTxt.includes("ÜSKÜDAR");

    for (let i = 1; i < rows.length; i++) {
      const cells = (rows[i].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || []).map((c) =>
        cleanCell(c)
      );
      if (cells.length < 3) continue;

      const dayCols: Array<DenturDayType | null> = ["WEEKDAY", "SATURDAY", "SUNDAY"];
      for (let c = 0; c < 3; c++) {
        const raw = cells[c].trim();
        if (raw === "" || raw === "-") continue;

        if (HAS_CONTINUOUS.test(raw)) {
          const range = raw.match(RANGE_RE);
          if (range) {
            records.push({
              line: "Üsküdar-Kabataş",
              origin: isUskudarKalkis ? "Üsküdar" : "Kabataş",
              destination: isUskudarKalkis ? "Kabataş" : "Üsküdar",
              directionLabel: isUskudarKalkis ? "Üsküdar → Kabataş" : "Kabataş → Üsküdar",
              dayType: dayCols[c]!,
              departureTime: range[1],
              isContinuous: true,
              continuousUntil: range[2],
            });
          }
        } else if (TIME_RE.test(raw)) {
          records.push({
            line: "Üsküdar-Kabataş",
            origin: isUskudarKalkis ? "Üsküdar" : "Kabataş",
            destination: isUskudarKalkis ? "Kabataş" : "Üsküdar",
            directionLabel: isUskudarKalkis ? "Üsküdar → Kabataş" : "Kabataş → Üsküdar",
            dayType: dayCols[c]!,
            departureTime: raw,
          });
        }
      }
    }
  }

  return uniq(
    records,
    (r) => `${r.line}|${r.origin}|${r.destination}|${r.dayType}|${r.departureTime}|${r.continuousUntil ?? ""}`
  );
}

/**
 * HAT: Üsküdar ↔ Beşiktaş
 * Sayfa yapısı: tek tablo; iskele bazında "HH:mm - HH:mm arası sürekli sefer".
 * Gerçek bir tarife listesi içermez; yalnızca sürekli sefer pencereleri sunar.
 */
export function parseUskudarBesiktasSchedules(html: string): DenturLineRecord[] {
  const d = decodeDenturHtml(html);
  const records: DenturLineRecord[] = [];
  const dirCells = [...d.matchAll(/(ÜSKÜDAR|BEŞİKTAŞ)\s*<\/td>\s*<td[^>]*>[\s\S]*?(\d{2}:\d{2})-(\d{2}:\d{2})[\s\S]*?<\/td>/gi)];

  // Daha dayanıklı: hücre etiketi + aynı satırdaki aralıkları bul
  const rows = [...d.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  for (const r of rows) {
    const cells = (r.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || []).map((c) =>
      cleanCell(c)
    );
    if (cells.length === 0) continue;
    const label = cells[0].toLocaleUpperCase("tr-TR");
    const isUskudar = label.includes("ÜSKÜDAR");
    const isBesiktas = label.includes("BEŞİKTAŞ");
    if (!isUskudar && !isBesiktas) continue;

    // Bu satırda 2 aralık: [Hafta içi+Cmt, Pazar]
    const ranges = cells.slice(1).map((c) => c.match(RANGE_RE));
    const dayTypes: DenturDayType[] = ["WEEKDAY_SAT", "SUNDAY"];
    ranges.forEach((rg, idx) => {
      if (rg && idx < dayTypes.length) {
        records.push({
          line: "Üsküdar-Beşiktaş",
          origin: isUskudar ? "Üsküdar" : "Beşiktaş",
          destination: isUskudar ? "Beşiktaş" : "Üsküdar",
          directionLabel: isUskudar ? "Üsküdar → Beşiktaş" : "Beşiktaş → Üsküdar",
          dayType: dayTypes[idx],
          departureTime: rg[1],
          isContinuous: true,
          continuousUntil: rg[2],
        });
      }
    });
  }

  return uniq(
    records,
    (r) => `${r.line}|${r.origin}|${r.destination}|${r.dayType}|${r.departureTime}|${r.continuousUntil ?? ""}`
  );
}

/** Tek sayfayı çekip ilgili hattın kayıtlarını üretir */
export async function scrapeDenturLine(
  url: string,
  lineKey: "besiktaskadikoy" | "adalar" | "uskudarkabatas" | "uskudarbesiktas"
): Promise<DenturLineRecord[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Dentur ${lineKey} HTTP ${res.status}`);
  const html = await res.text();

  switch (lineKey) {
    case "besiktaskadikoy":
      return parseBesiktasKadikoySchedules(html);
    case "adalar":
      return parseAdalarSchedules(html);
    case "uskudarkabatas":
      return parseUskudarKabatasSchedules(html);
    case "uskudarbesiktas":
      return parseUskudarBesiktasSchedules(html);
  }
}

export const DENTUR_LINE_ENDPOINTS: Record<
  "besiktaskadikoy" | "adalar" | "uskudarkabatas" | "uskudarbesiktas",
  string
> = {
  besiktaskadikoy: "https://www.denturavrasya.com/tr-TR/hatlarimiz/besiktaskadikoy",
  adalar: "https://www.denturavrasya.com/tr-TR/hatlarimiz/adalar",
  uskudarkabatas: "https://www.denturavrasya.com/tr-TR/hatlarimiz/uskudar-kabatas",
  uskudarbesiktas: "https://www.denturavrasya.com/tr-TR/hatlarimiz/uskudar-besiktas",
};

/** Tüm hatları canlı çeker; başarısız hatları atlar (durum bilgisiyle raporlar) */
export async function scrapeAllDenturSchedules(): Promise<{
  records: DenturLineRecord[];
  failures: { line: string; error: string }[];
}> {
  const failures: { line: string; error: string }[] = [];
  const records: DenturLineRecord[] = [];

  for (const [line, url] of Object.entries(DENTUR_LINE_ENDPOINTS) as Array<
    [keyof typeof DENTUR_LINE_ENDPOINTS, string]
  >) {
    try {
      const recs = await scrapeDenturLine(url, line);
      records.push(...recs);
    } catch (err: any) {
      failures.push({ line, error: err?.message || String(err) });
    }
  }

  return { records, failures };
}
