import type { OperatorAnnouncement } from "@/lib/types/announcement";

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
  const dateObj = new Date(nowMs);
  const currentYear = dateObj.getFullYear();
  const currentMonth = dateObj.getMonth() + 1;
  const currentDay = dateObj.getDate();
  const curDate = new Date(currentYear, currentMonth - 1, currentDay);

  // 1. Doğrudan yayın tarihi kontrolü (DD.MM.YYYY veya ISO format)
  if (announcement.publishedAt) {
    let pubDate: Date | null = null;
    if (announcement.publishedAt.includes(".")) {
      const parts = announcement.publishedAt.split(".").map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        pubDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } else {
      const parsed = Date.parse(announcement.publishedAt);
      if (!isNaN(parsed)) pubDate = new Date(parsed);
    }

    if (pubDate) {
      const diffDays = (curDate.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
      // İptal duyuruları anlıktır: 24 saatten eski ise gösterilmez
      if (
        announcement.type === "CANCELLATION" ||
        announcement.type === "CANCELLED_TRIPS"
      ) {
        if (diffDays > 1) return false;
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
      const targetDate = new Date(year, month - 1, endDay);
      const diffDays = (curDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);

      // İptal veya ek sefer duyurularında belirtilen gün geçmişse (veya 1 günden eski ise) kesinlikle eskidir
      if (
        announcement.type === "CANCELLATION" ||
        announcement.type === "CANCELLED_TRIPS" ||
        announcement.type === "EXTRA_SERVICE"
      ) {
        if (curDate.getTime() > targetDate.getTime() || diffDays > 1) return false;
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

  return true;
}
