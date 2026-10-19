import type { OperatorAnnouncement } from "@/lib/types/announcement";
import {
  dateKeyToDayIndex,
  getIstanbulDateParts,
  parseIsoDateKey,
  parseTrDateKey,
  toDateKey,
} from "@/lib/utils/istanbul-date";

const TR_MONTHS: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  agustos: 8,
  eylül: 9,
  eylul: 9,
  ekim: 10,
  kasım: 11,
  kasim: 11,
  aralık: 12,
  aralik: 12,
};

/**
 * Duyurunun güncel olup olmadığını belirler.
 * Eski, süresi dolmuş veya geçmiş tarihlere ait iptal/tarife/ek sefer duyurularını eler.
 */
export function isAnnouncementCurrent(
  announcement: Pick<OperatorAnnouncement, "title" | "body" | "type" | "publishedAt">,
  nowMs: number = Date.now()
): boolean {
  const text = `${announcement.title || ""} ${announcement.body || ""}`.toLowerCase();
  // KULLANICI KURALI: gün 00:00'da İSTANBUL saatine göre biter. Sunucu UTC
  // çalıştığı için takvim günü Europe/Istanbul üzerinden hesaplanır.
  const nowParts = getIstanbulDateParts(nowMs);
  const currentYear = nowParts.year;
  const currentMonth = nowParts.month;
  const curKey = toDateKey(nowParts);
  const curDayIndex = dateKeyToDayIndex(curKey);

  // 1. Doğrudan yayın tarihi kontrolü (DD.MM.YYYY veya ISO format)
  if (announcement.publishedAt) {
    const pubKey = announcement.publishedAt.includes(".")
      ? parseTrDateKey(announcement.publishedAt)
      : parseIsoDateKey(announcement.publishedAt);

    if (pubKey) {
      const diffDays = curDayIndex - dateKeyToDayIndex(pubKey);
      // KULLANICI KURALI: İptal duyuruları YALNIZCA yayınlandığı GÜN geçerlidir.
      // Yayın günü dışındaki tüm iptal duyuruları elenir — bir gün öncesi dahil.
      if (
        announcement.type === "CANCELLATION" ||
        announcement.type === "CANCELLED_TRIPS"
      ) {
        if (pubKey < curKey) return false;
      } else {
        // Genel duyurular için makul güncellik penceresi (14 gün)
        if (diffDays > 14) return false;
      }
    }
  }

  // 2. Başlık veya gövdede geçen açık tarih tespiti (Örn: '12-13 Eylül 2026', '23 Ağustos', '8 Ocak')
  const dateRegex =
    /(?:(\d{1,2})[-–\s]+)?(\d{1,2})\s*(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s*(\d{4}))?/i;
  const match = text.match(dateRegex);
  if (match) {
    const endDay = parseInt(match[2] || "0", 10);
    const month = TR_MONTHS[match[3]?.toLowerCase() || ""];
    const year = match[4] ? parseInt(match[4], 10) : currentYear;

    if (month && year && endDay) {
      const targetKey = year * 10000 + month * 100 + endDay;
      const diffDays = curDayIndex - dateKeyToDayIndex(targetKey);

      // İptal veya ek sefer duyurularında belirtilen gün geçmişse kesinlikle eskidir
      if (
        announcement.type === "CANCELLATION" ||
        announcement.type === "CANCELLED_TRIPS" ||
        announcement.type === "EXTRA_SERVICE"
      ) {
        if (targetKey < curKey) return false;
      } else {
        // Diğer düzenleme/tarife duyuruları için belirtilen tarihin üzerinden 3 günden fazla geçmişse eskidir
        if (diffDays > 3) return false;
      }
    }
  }

  // 3. Geçmiş yıllar (2023, 2024, 2025 gibi geride kalmış arşiv duyuruları)
  if (text.includes("2023") || text.includes("2024") || text.includes("2025")) {
    return false;
  }

  // 4. Özel dönem/gün duyuruları (Sevgililer Günü, Yılbaşı gecesi vb.)
  if (
    text.includes("sevgililer gunu") ||
    text.includes("sevgililer günü") ||
    text.includes("yılbaşı") ||
    text.includes("yilbasi")
  ) {
    if (match) {
      const month = TR_MONTHS[match[3]?.toLowerCase() || ""];
      if (month && Math.abs(currentMonth - month) > 1) return false;
    } else {
      return false;
    }
  }

  // 5. İçinde bulunulan ayın çok gerisinde kalmış eski aylık duyurular (Ocak-Eylül arası duyurular)
  if (
    text.includes("haziran") ||
    text.includes("temmuz") ||
    text.includes("ağustos") ||
    text.includes("agustos") ||
    text.includes("eylül") ||
    text.includes("eylul") ||
    text.includes("yaz tarifesine")
  ) {
    return false;
  }

  // 6. KULLANICI KURALI: Sadece İPTAL SEFERLER ve doğrudan operasyonel sefer duyuruları gösterilir.
  // Pazarlama, tur tanıtımı, proje ve genel idari PR haberleri duyuru bandından ayıklanır.
  if (
    text.includes("projesi") ||
    text.includes("sunset tur") ||
    text.includes("türk gecesi") ||
    text.includes("turk gecesi") ||
    text.includes("mehtap turu") ||
    text.includes("ücretsiz geçiş hakkı") ||
    text.includes("kart kullanıcılarının") ||
    text.includes("otonom elektrikli")
  ) {
    return false;
  }

  return true;
}
