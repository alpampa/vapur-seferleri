import { RawOfficialTrip } from "./official-schedules";

/**
 * TAMAMLAYICI TARİFE VERİSİ — KALDIRILDI (2026-10-04)
 *
 * Bu dosya daha önce Prens Tur, Turyol ve Dentur Avrasya için TEMSİLİ
 * (sabit aralıklı, matematiksel üretilmiş) sefer kayıtları içeriyordu.
 *
 * KULLANICI KURALI: "ASLA uydurma veri kullanma, hep gerçek veri."
 * → Bu tür üretilmiş kayıtlar gerçek veri değildir ve canlı sefer gibi
 *   gösterilememez. Bu yüzden dosya TAMAMEN boşaltılmıştır.
 *
 * Gerçek veri hangi kaynaktan geliyor (operator-registry.ts):
 * - Şehir Hatları  → official-scraped-schedules.json
 * - Mavi Marmara   → mavi-marmara-schedules.ts (resmi tarife sayfaları)
 * - Dentur Avrasya → dentur-schedules.ts (resmi hat sayfalarından birebir parse)
 * - Turyol         → kaynak yok (site makine-okunur tarife yayınlamıyor)
 * - Prens Tur      → kaynak görsel tabanlı (JPEG, OCR gerekli)
 */
export function generateSupplementarySchedules(): RawOfficialTrip[] {
  return [];
}
