import type { TripStatus } from "@/lib/types/schedule";

/**
 * Firma SAYFALARINDAN canlı çekilen tarife verisi (ucret alanı).
 * Kaynak: her firmanın kendi resmi web sitesi — tarife/ucret sayfaları.
 *
 * KULLANICI KURALI: Fiyat ASLA tahmin edilmez. Bir firmanın ücreti resmi
 * kaynaktan doğrulanamıyorsa "—" gösterilir. Sahte rakam kesinlikle yasak
 * (sahada "90 TL yazıyor ama 230 TL aldılar" şikayeti olmaması için).
 */

export interface OperatorTariff {
  operator: string;
  from: string;
  to: string;
  category: "ADALAR" | "BOGAZ" | "DIS_HAT";
  price: number; // TL — yalnız resmi kaynaktan
  sourceUrl: string;
  verifiedAt: string; // ISO tarih
}

/** Bilinen operatörler ve resmi tarife sayfaları */
export const TARIFF_SOURCES: Record<string, { name: string; url: string; note: string }> = {
  SEHIR_HATLARI: {
    name: "Şehir Hatları",
    url: "https://sehirhatlari.istanbul/tr/tarifeler",
    note: "Tam bilet + İstanbulkart ücretleri",
  },
  TURYOL: {
    name: "Turyol",
    url: "https://www.turyol.com.tr/",
    note: "Adalar ve Boğaz hatları",
  },
  DENTUR: {
    name: "Dentur Avrasya",
    url: "https://denturavrasya.com/",
    note: "Adalar hattı",
  },
  MAVI_MARMARA: {
    name: "Mavi Marmara",
    url: "https://www.mavimarmara.com.tr/",
    note: "Adalar hattı",
  },
  PRENS_TUR: {
    name: "Prens Tur",
    url: "https://www.prenstur.com.tr/",
    note: "Adalar hattı",
  },
};

export function getTariffSource(operator: string) {
  const key = operator.toUpperCase().replace(/[^A-Z_]/g, "_");
  return TARIFF_SOURCES[key] ?? null;
}
