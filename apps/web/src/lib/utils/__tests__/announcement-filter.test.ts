import { describe, it, expect } from "vitest";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

type CurrentInput = Pick<
  OperatorAnnouncement,
  "title" | "body" | "type" | "publishedAt"
>;

/** Sabit "şimdi": 19 Ekim 2026, 00:16 (yerel). Takvim günü mantığı test edilir. */
const NOW = new Date(2026, 9, 19, 0, 16).getTime();

function ann(partial: Partial<CurrentInput>): CurrentInput {
  return {
    title: "İptal Seferler",
    body: "Kadıköy - Büyükada seferleri iptal edilmiştir.",
    type: "CANCELLED_TRIPS",
    publishedAt: undefined,
    ...partial,
  };
}

describe("isAnnouncementCurrent — iptal duyuruları yalnızca yayınlandığı GÜN geçerlidir", () => {
  it("REGRESYON: dünün iptal duyurusu bugün ELENİR (off-by-one)", () => {
    // 18.10.2026 yayını, 19.10.2026'da gösterilmemeli (eski `diffDays > 1` hatası bunu gösteriyordu).
    expect(isAnnouncementCurrent(ann({ publishedAt: "18.10.2026" }), NOW)).toBe(false);
  });

  it("aynı günün iptal duyurusu gösterilir", () => {
    expect(isAnnouncementCurrent(ann({ publishedAt: "19.10.2026" }), NOW)).toBe(true);
  });

  it("iki gün önceki iptal duyurusu gösterilmez", () => {
    expect(isAnnouncementCurrent(ann({ publishedAt: "17.10.2026" }), NOW)).toBe(false);
  });

  it("tarihsiz canlı iptal kaydı (MM/Turyol popup) gösterilir", () => {
    const a = ann({ publishedAt: undefined });
    expect(isAnnouncementCurrent(a, NOW)).toBe(true);
  });

  it("tarihsiz kayıt tarama günüyle damgalanınca ertesi gün ELENİR", () => {
    expect(isAnnouncementCurrent(ann({ publishedAt: "19.10.2026" }), NOW)).toBe(true);
    const nextDay = new Date(2026, 9, 20, 0, 16).getTime();
    expect(isAnnouncementCurrent(ann({ publishedAt: "19.10.2026" }), nextDay)).toBe(false);
  });
});

describe("isAnnouncementCurrent — genel duyurular 14 günlük pencere", () => {
  it("14 gün içindeki genel duyuru gösterilir", () => {
    expect(
      isAnnouncementCurrent(
        ann({ type: "INFO", title: "Sefer bilgilendirmesi", body: "Detaylar uygulamada.", publishedAt: "10.10.2026" }),
        NOW
      )
    ).toBe(true);
  });

  it("14 günden eski genel duyuru gösterilmez", () => {
    expect(
      isAnnouncementCurrent(
        ann({ type: "INFO", title: "Sefer bilgilendirmesi", body: "Detaylar uygulamada.", publishedAt: "01.10.2026" }),
        NOW
      )
    ).toBe(false);
  });
});
