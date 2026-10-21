/**
 * OPERATÖR KAYIT DEFTERİ (SINGLE SOURCE OF TRUTH)
 *
 * Her firmanın resmi sitesi, tarife kaynağı, duyuru kaynağı, logosu ve
 * veri durumu burada tanımlıdır. UI, ajanlar ve cron aynı kaynağa bağlanır.
 *
 * VERİ DURUMU:
 * - Şehir Hatları : REAL — resmi siteden alınmış JSON (official-scraped-schedules.json)
 * - İDO           : REAL — ido.com.tr Marmara & Adalar hızlı deniz otobüsü tarifesi
 * - Mavi Marmara  : REAL — mavimarmara.net tarife sayfalarından doğrulanmış
 * - Dentur Avrasya: REAL — denturavrasya.com hat sayfalarından parse edilmiş
 * - Turyol        : REAL — turyol.com iç arama motorundan canlı çekilmiş doğrulanmış veri
 * - Prens Tur     : REAL — prenstur.net resmi 2026-2027 kış tarifesi afişinden doğrulanmış
 */

export type OperatorDataStatus =
  | "REAL"            // resmi kaynaktan doğrulanmış gerçek veri uygulamada saklanıyor
  | "UNAVAILABLE"     // resmi site makine-okunur tarife yayınlamıyor
  | "IMAGE_ONLY"      // tarife yalnızca görsel (OCR gerekli)
  | "STANDBY";        // henüz işlenmedi

export type OperatorCategory = "ADALAR" | "BOGAZ" | "HEPSI";

export interface OperatorRecord {
  /** UI'da ve veri modelinde kullanılan sabit görünen ad (kartlarda görünür) */
  name: string;
  /** kısaltılmış görünen ad (filtre etiketi) */
  shortName: string;
  officialWebsite: string;
  /** sefer tarifesi sayfa adresleri */
  timetableEndpoints: string[];
  /** duyuru / iptal sefer sayfa adresleri */
  announcementEndpoints: string[];
  /** public/logos/ altındaki orijinal logo dosyası */
  logoPath: string;
  /** logonun beyaz zemin üzerinde okunurluğu için arka plan rengi */
  brandColor: string;
  category: OperatorCategory;
  /** veri durumu — yukarıdaki açıklamalar */
  dataStatus: OperatorDataStatus;
  /** neden / durum açıklaması (UI'da dürüst not olarak gösterilir) */
  statusNote: string;
  /** resmi ücret bilgisi varsa not */
  fareNote?: string;
  officialAnnouncementsUrl?: string;
  officialUrl?: string;
}

export const OPERATOR_REGISTRY: OperatorRecord[] = [
  {
    name: "Şehir Hatları",
    shortName: "Şehir Hatları",
    officialWebsite: "https://sehirhatlari.istanbul",
    timetableEndpoints: ["https://sehirhatlari.istanbul/tr/seferler/ic-hatlar"],
    announcementEndpoints: ["https://sehirhatlari.istanbul/tr/iptal-seferler"],
    officialAnnouncementsUrl: "https://sehirhatlari.istanbul/tr/iptal-seferler",
    officialUrl: "https://sehirhatlari.istanbul",
    logoPath: "/logos/operator-sehirhatlari.png",
    brandColor: "#C8102E",
    category: "HEPSI",
    dataStatus: "REAL",
    statusNote:
      "Resmi siteden alınmış doğrulanmış sefer tarifesi uygulamada saklanır (iç hatlar, Boğaz, Adalar).",
  },
  {
    name: "İDO",
    shortName: "İDO",
    officialWebsite: "https://www.ido.com.tr",
    timetableEndpoints: ["https://www.ido.com.tr/tr/sefer-saatleri"],
    announcementEndpoints: ["https://www.ido.com.tr/tr/iptal-seferler"],
    officialAnnouncementsUrl: "https://www.ido.com.tr/tr/iptal-seferler",
    officialUrl: "https://www.ido.com.tr",
    logoPath: "/logos/operator-ido.png",
    brandColor: "#0B4F9C",
    category: "ADALAR",
    dataStatus: "REAL",
    statusNote:
      "ido.com.tr resmi portalından doğrulanmış hızlı deniz otobüsü tarifesi (Bostancı–Adalar, Kabataş–Kadıköy–Adalar).",
  },
  {
    name: "Mavi Marmara",
    shortName: "Mavi Marmara",
    officialWebsite: "https://www.mavimarmara.net",
    timetableEndpoints: [
      "https://www.mavimarmara.net/tarifeler/bostanci-buyukada/",
      "https://www.mavimarmara.net/tarifeler/kabatas-adalar/",
    ],
    announcementEndpoints: [],
    officialUrl: "https://www.mavimarmara.net",
    logoPath: "/logos/operator-mavimarmara.png",
    brandColor: "#0284C7",
    category: "ADALAR",
    dataStatus: "REAL",
    statusNote: "mavimarmara.net tarife sayfalarından doğrulanmış gerçek seferler (Bostancı–Adalar, Kabataş–Adalar).",
  },
  {
    name: "Dentur Avrasya",
    shortName: "Dentur",
    officialWebsite: "https://www.denturavrasya.com",
    timetableEndpoints: [
      "https://www.denturavrasya.com/tr-TR/hatlarimiz/uskudar-besiktas",
      "https://www.denturavrasya.com/tr-TR/hatlarimiz/uskudar-kabatas",
      "https://www.denturavrasya.com/tr-TR/hatlarimiz/besiktaskadikoy",
      "https://www.denturavrasya.com/tr-TR/hatlarimiz/adalar",
    ],
    announcementEndpoints: ["https://www.denturavrasya.com/tr-TR/duyurular"],
    officialAnnouncementsUrl: "https://www.denturavrasya.com/tr-TR/duyurular",
    officialUrl: "https://www.denturavrasya.com",
    logoPath: "/logos/operator-dentur.png",
    brandColor: "#1E40AF",
    category: "HEPSI",
    dataStatus: "REAL",
    statusNote:
      "denturavrasya.com hat sayfalarından birebir parse edilen gerçek seferler (Üsküdar–Beşiktaş, Üsküdar–Kabataş, Beşiktaş–Kadıköy, Adalar).",
  },
  {
    name: "Prens Tur",
    shortName: "Prens Tur",
    officialWebsite: "https://www.prenstur.net",
    timetableEndpoints: [
      "https://prenstur.net/2026-2027-kis-tarifesi.jpeg",
    ],
    announcementEndpoints: [],
    officialUrl: "https://www.prenstur.net",
    logoPath: "/logos/operator-prenstur.png",
    brandColor: "#7E22CE",
    category: "ADALAR",
    dataStatus: "REAL",
    statusNote:
      "Resmi 2026-2027 Kış Tarifesi afişinden (JPEG) Multimodal Vision AI ile doğrulanmış gerçek seferler (Kartal - Büyükada - Heybeliada).",
  },
  {
    name: "Turyol",
    shortName: "Turyol",
    officialWebsite: "https://www.turyol.com",
    timetableEndpoints: ["https://www.turyol.com/Home/Tarifeler"],
    announcementEndpoints: [],
    officialUrl: "https://www.turyol.com",
    logoPath: "/logos/operator-turyol.png",
    brandColor: "#E11D48",
    category: "HEPSI",
    dataStatus: "REAL",
    statusNote:
      "turyol.com iç arama motorundan canlı çekilmiş doğrulanmış gerçek seferler (Kadıköy, Karaköy, Eminönü, Üsküdar, Adalar).",
  },
];

export function getOperatorRecord(name: string): OperatorRecord | undefined {
  const norm = name.trim().toLowerCase();
  return OPERATOR_REGISTRY.find(
    (op) => op.name.toLowerCase() === norm || op.shortName.toLowerCase() === norm
  );
}

/** Görünen ad → logo yolu (registry'de yoksa fallback) */
export function resolveOperatorLogoPath(name: string): string | null {
  return getOperatorRecord(name)?.logoPath ?? null;
}

export const OPERATORS_WITH_REAL_DATA = OPERATOR_REGISTRY.filter(
  (op) => op.dataStatus === "REAL"
).map((op) => op.name);
