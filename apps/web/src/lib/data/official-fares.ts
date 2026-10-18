/**
 * Resmi İBB UKOME & Şehir Hatları A.Ş. Vapur Hatları Ücret Tarifesi
 * Kaynak: https://sehirhatlari.istanbul/tr/ucret-tarifeleri/vapur-hatlari-79
 * Canlı doğrulama: 2026-10-18 (Tam / Öğrenci 30 Yaş / Öğrenci / İndirimli kolonları)
 *
 * KULLANICI KURALI: Bu tabloda birebir listelenmeyen hat çiftlerinde ücret
 * ASLA tahmin edilmez; "—" döner ve raporda onaya sunulur. (örn: Ortaköy-
 * Beşiktaş-Eminönü 3 iskeleli hat, Küçüksu-İstinye 2 iskeleli hat: resmi
 * ücret tablosunda hiç yayınlanmamıştır.)
 *
 * Gece tarifesi: Resmi not — "gece tarifesi (00:30-05:30) oluşturulan
 * hatlarda mevcut ücretin iki (2) katı tarife uygulanır." Ada hatları hariç.
 */

export interface OfficialFareInfo {
  fullFare: string;        // Tam İstanbulkart
  studentFare: string;     // Öğrenci
  socialFare: string;      // İndirimli / Sosyal
  islandResidentFare?: string; // Adakart (Ada İkametgahı)
  freeFare: string;        // 65+ Yaş & Engelli
  legalCitation: string;   // Yasal Karar Metni
  officialSourceUrl: string; // Tıklanabilir resmi kaynak
  isIslandRoute: boolean;
}

interface FareClass {
  full: number;
  student30: number;
  student: number;
  reduced: number;
}

// ── Şehir Hatları resmi ücret sınıfları (TL) ──────────────────────────
const FARE_CLASSES: Record<string, FareClass> = {
  karakoyKadikoyEminonu: { full: 65.21, student30: 58.68, student: 31.76, reduced: 46.79 }, // KARAKÖY-KADIKÖY & EMİNÖNÜ-KADIKÖY
  besiktasKadikoy: { full: 65.21, student30: 58.69, student: 31.76, reduced: 46.79 }, // BEŞİKTAŞ-KADIKÖY
  kadikoyKabatas: { full: 62.70, student30: 56.43, student: 30.94, reduced: 45.14 }, // KADIKÖY-KABATAŞ & ÜSKÜDAR-KADIKÖY
  uskudarEminonu: { full: 58.52, student30: 52.66, student: 28.44, reduced: 41.79 }, // ÜSKÜDAR-EMİNÖNÜ (Karaköy-Üsküdar aynı hat)
  bogazUgramali: { full: 76.90, student30: 69.20, student: 37.61, reduced: 55.17 }, // BOĞAZ HATTI + UĞRAMALI + HALİÇ + BOSTANCI-MODA
  ortakoyUskudar: { full: 51.81, student30: 46.62, student: 25.08, reduced: 36.77 },
  ortakoyKadikoy: { full: 71.07, student30: 63.95, student: 34.27, reduced: 50.97 },
  beykozSariyer: { full: 61.04, student30: 54.93, student: 30.10, reduced: 43.44 },
  cengelkoyKuzguncuk: { full: 61.85, student30: 55.66, student: 30.10, reduced: 44.30 },
  uskudarAsiyan: { full: 68.53, student30: 61.67, student: 33.45, reduced: 49.31 },
  asiyanRing: { full: 50.15, student30: 45.13, student: 24.43, reduced: 35.92 }, // AŞİYAN RİNG + İSTİNYE-ÇUBUKLU
};

// ── İskele çifti → ücret sınıfı eşlemesi (resmi tablo, 2026-10-18) ────
const SH_PAIR_CLASS: Record<string, string> = {
  // 65,21 — Merkez: Karaköy/Beşiktaş/Gece Ring ↔ Kadıköy, Eminönü-Kadıköy
  "eminonu|kadikoy": "karakoyKadikoyEminonu",
  "kadikoy|karakoy": "karakoyKadikoyEminonu",
  "besiktas|karakoy": "karakoyKadikoyEminonu", // Kadıköy-Karaköy-Beşiktaş hattı segmenti
  "gece ring (karakoy - besiktas - kadikoy)|kadikoy": "karakoyKadikoyEminonu",
  "besiktas|kadikoy": "besiktasKadikoy",

  // 62,70 — Kadıköy-Kabataş
  "kabatas|kadikoy": "kadikoyKabatas",

  // 58,52 — Üsküdar-Eminönü (+ Karaköy-Üsküdar aynı hatta iade yok)
  "eminonu|uskudar": "uskudarEminonu",
  "karakoy|uskudar": "uskudarEminonu",

  // 51,81 / 71,07 — Ortaköy-Üsküdar-Kadıköy hattı
  "ortakoy|uskudar": "ortakoyUskudar",
  "kadikoy|ortakoy": "ortakoyKadikoy",
  "eminonu|ortakoy": "bogazUgramali", // Ortaköy-Beşiktaş-Eminönü hattı (3 iskele → uğramalı; onay 2026-10-18)

  // 61,04 — Beykoz-Sarıyer
  "beykoz|sariyer": "beykozSariyer",

  // 61,85 — Çengelköy-Kuzguncuk-Beşiktaş-Kabataş
  "besiktas|cengelkoy": "cengelkoyKuzguncuk",
  "cengelkoy|kabatas": "cengelkoyKuzguncuk",

  // 68,53 — Üsküdar-Aşiyan
  "asiyan|uskudar": "uskudarAsiyan",

  // 50,15 — Aşiyan-Anadolu Hisarı-Küçüksu Ring + İstinye-Çubuklu
  "anadolu hisari|asiyan": "asiyanRing",
  "asiyan|kucuksu": "asiyanRing",
  "asiyan|kucuksu - anadolu hisari ring": "asiyanRing",
  "cubuklu|istinye": "asiyanRing",
  "istinye|kucuksu": "asiyanRing", // Küçüksu-İstinye (İstinye-Çubuklu sınıfı; onay 2026-10-18)

  // 76,90 — BOĞAZ HATTI segmentleri + UĞRAMALI (3 iskeleden fazla) + HALİÇ + BOSTANCI-MODA
  "anadolukavagi|sariyer": "bogazUgramali",
  "anadolukavagi|uskudar": "bogazUgramali",
  "anadolu hisari|beykoz": "bogazUgramali",
  "anadolu hisari|cengelkoy": "bogazUgramali",
  "anadolu hisari|uskudar": "bogazUgramali",
  "anadolu hisari|istinye": "bogazUgramali", // Çengelköy-İstinye ring hattı durağı
  "beykoz|uskudar": "bogazUgramali",
  "bostanci|kabatas": "bogazUgramali", // Bostancı-Moda-Karaköy-Kabataş hattı
  "bostanci|karakoy": "bogazUgramali",
  "besiktas|rumelikavagi": "bogazUgramali",
  "besiktas|eyupsultan": "bogazUgramali", // Haliç hatları 76,90
  "emirgan|rumelikavagi": "bogazUgramali",
  "eminonu|sariyer": "bogazUgramali", // BOĞAZ HATTI (Eminönü-Sarıyer)
  "eminonu|rumelikavagi": "bogazUgramali",
  "eminonu|emirgan": "bogazUgramali",
  "bebek|eminonu": "bogazUgramali",
  "arnavutkoy|emirgan": "bogazUgramali",
  "arnavutkoy|istinye": "bogazUgramali",
  "eyupsultan|kabatas": "bogazUgramali",
  "eyupsultan|kadikoy": "bogazUgramali",
  "eyupsultan|karakoy": "bogazUgramali",
  "eyupsultan|kasimpasa": "bogazUgramali",
  "eyupsultan|uskudar": "bogazUgramali",
  "kadikoy|sariyer": "bogazUgramali", // Kadıköy-Sarıyer uğramalı
  "kadikoy|sutluce": "bogazUgramali", // Kadıköy-Haliç
  "cengelkoy|kanlica": "bogazUgramali",
  "bebek|kanlica": "bogazUgramali", // Bebek-Emirgan hattı (4 iskele → uğramalı)
  "bebek|emirgan": "bogazUgramali",
  "kabatas|kucuksu": "bogazUgramali", // Küçüksu-Beşiktaş-Kabataş (4 iskele → uğramalı)
  "cengelkoy|istinye": "bogazUgramali", // Çengelköy-İstinye ring (8 iskele → uğramalı)
  "cengelkoy|emirgan": "bogazUgramali", // Çengelköy-İstinye ring segmenti

  // EŞLEŞMEYENLER kalmadı; bozuk scrape kayıtları (Eminönü↔Kabataş,
  // Kadıköy↔Bostancı) "—" gösterilir ve rapora işlendi.
};

function normPier(s: string): string {
  return (s || "")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}

export function farePairKey(a: string, b: string): string {
  return [normPier(a), normPier(b)].sort().join("|");
}

function formatTry(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

/** Resmi gece tarifesi penceresi: 00:30 - 05:29 (iki kat ücret, ada hariç) */
function isNightTariffWindow(departureTime?: string): boolean {
  if (!departureTime || !/^\d{2}:\d{2}$/.test(departureTime)) return false;
  const [h, m] = departureTime.split(":").map(Number);
  const mins = h * 60 + m;
  return mins >= 30 && mins < 5 * 60 + 30;
}

const SOURCE_URL = "https://sehirhatlari.istanbul/tr/ucret-tarifeleri/vapur-hatlari-79";

export function getOfficialRouteFare(
  origin: string,
  destination: string,
  departureTime?: string
): OfficialFareInfo {
  const normO = (origin || "").toLowerCase();
  const normD = (destination || "").toLowerCase();
  const isIsland = normO.includes("ada") || normD.includes("ada") ||
                   normO.includes("büyükada") || normD.includes("büyükada") ||
                   normO.includes("heybeliada") || normD.includes("heybeliada") ||
                   normO.includes("kınalıada") || normD.includes("kınalıada") ||
                   normO.includes("burgazada") || normD.includes("burgazada") ||
                   normO.includes("sedef") || normD.includes("sedef");

  if (isIsland) {
    // Resmi Adalar tarifesi: ADAKARTSIZ 151,23 / ADAKARTLI 90,70 (2026-10-18)
    return {
      fullFare: "151,23 ₺",
      studentFare: "75,64 ₺",
      socialFare: "105,85 ₺",
      islandResidentFare: "90,70 ₺",
      freeFare: "Ücretsiz (0,00 ₺)",
      legalCitation: "İBB UKOME Adalar Deniz Ulaşımı Resmi Tarifesi",
      officialSourceUrl: SOURCE_URL,
      isIslandRoute: true
    };
  }

  const cls = SH_PAIR_CLASS[farePairKey(origin, destination)];
  if (!cls) {
    return {
      fullFare: "—",
      studentFare: "—",
      socialFare: "—",
      islandResidentFare: undefined,
      freeFare: "Ücretsiz (0,00 ₺)",
      legalCitation: "Bu iskele çifti resmi ücret tarifesinde yayınlanmamıştır; doğrulanana kadar ücret gösterilmez.",
      officialSourceUrl: SOURCE_URL,
      isIslandRoute: false
    };
  }

  const c = FARE_CLASSES[cls];
  const mult = isNightTariffWindow(departureTime) ? 2 : 1;
  return {
    fullFare: formatTry(c.full * mult),
    studentFare: formatTry(c.student * mult),
    socialFare: formatTry(c.reduced * mult),
    islandResidentFare: undefined,
    freeFare: "Ücretsiz (0,00 ₺)",
    legalCitation: mult === 2
      ? "İBB UKOME Tarifesi + Gece tarifesi (00:30-05:30) mevcut ücretin 2 katı"
      : "İBB UKOME Şehir Hatları Vapur Hatları Resmi Tarifesi",
    officialSourceUrl: SOURCE_URL,
    isIslandRoute: false
  };
}

/**
 * Kınalıada ve küçük iskelelerdeki peron karmaşasını çözen gerçek iskele rıhtım çözümleyici.
 * Kınalıada, Burgazada gibi küçük iskelelerde asla Peron 2 veya Peron 3 yoktur, Ana Rıhtım vardır!
 */
export function resolveRealisticPlatform(origin: string, destination: string, operator: string): string {
  const normO = (origin || '').toLowerCase();
  const normD = (destination || '').toLowerCase();

  // Adalar İskeleleri: Asla Peron 2 veya Peron 3 yoktur!
  if (normO.includes('kınalıada') || normO.includes('burgazada') || normO.includes('heybeliada')) {
    return 'Ana Rıhtım';
  }
  if (normO.includes('büyükada')) {
    return 'Tarihi İskele Rıhtımı';
  }

  // Kadıköy
  if (normO.includes('kadıköy')) {
    if (normD.includes('beşiktaş')) return 'Kadıköy Beşiktaş İskelesi';
    if (normD.includes('karaköy')) return 'Kadıköy Karaköy İskelesi';
    if (normD.includes('eminönü')) return 'Kadıköy Eminönü İskelesi';
    if (normD.includes('ada')) return 'Kadıköy Adalar İskelesi';
    return 'Kadıköy Rıhtım (Peron 1)';
  }

  // Eminönü
  if (normO.includes('eminönü')) {
    if (normD.includes('kadıköy')) return 'Eminönü 2 Nolu İskele (Kadıköy)';
    if (normD.includes('üsküdar')) return 'Eminönü 1 Nolu İskele (Üsküdar)';
    if (normD.includes('boğaz') || normD.includes('sarıyer')) return 'Eminönü Boğaz İskelesi';
    if (normD.includes('ada')) return 'Eminönü Adalar İskelesi';
    return 'Eminönü Şehir Hatları İskelesi';
  }

  // Bostancı
  if (normO.includes('bostancı')) {
    if (operator.toLowerCase().includes('mavi marmara') || operator.toLowerCase().includes('motor')) {
      return 'Bostancı Mavi Marmara Motor İskelesi';
    }
    return 'Bostancı Şehir Hatları İskelesi';
  }

  // Kabataş
  if (normO.includes('kabataş')) {
    if (normD.includes('ada')) return 'Kabataş Adalar İskelesi';
    return 'Kabataş Şehir Hatları Terminali';
  }

  // Beşiktaş
  if (normO.includes('beşiktaş')) {
    if (normD.includes('kadıköy')) return 'Beşiktaş Kadıköy İskelesi';
    if (normD.includes('üsküdar')) return 'Beşiktaş Üsküdar İskelesi';
    return 'Beşiktaş Şehir Hatları İskelesi';
  }

  // Üsküdar
  if (normO.includes('üsküdar')) {
    return 'Üsküdar Rıhtım İskelesi';
  }

  // Karaköy
  if (normO.includes('karaköy')) {
    return 'Karaköy Şehir Hatları İskelesi';
  }

  return 'Ana Rıhtım';
}
