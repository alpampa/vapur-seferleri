import { describe, expect, it } from "vitest";
import { getIstanbulDateParts, toTrDate } from "@/lib/utils/istanbul-date";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";

describe("İstanbul takvim günü (00:00 sınırı)", () => {
  it("20:59Z = 23:59 İstanbul (18.10)", () => {
    expect(getIstanbulDateParts(Date.parse("2026-10-18T20:59:00Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 18,
    });
    expect(toTrDate(Date.parse("2026-10-18T20:59:00Z"))).toBe("18.10.2026");
  });

  it("21:00Z = 00:00 İstanbul (ertesi gün)", () => {
    expect(getIstanbulDateParts(Date.parse("2026-10-18T21:00:00Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 19,
    });
    expect(toTrDate(Date.parse("2026-10-18T21:00:00Z"))).toBe("19.10.2026");
  });

  it("KULLANICI KURALI: 00:00'da iptal duyurusu anında ELENİR", () => {
    const a = {
      title: "İptal Seferler",
      body: "Kadıköy-Büyükada seferleri iptal edilmiştir.",
      type: "CANCELLED_TRIPS" as const,
      publishedAt: "18.10.2026",
    };

    expect(isAnnouncementCurrent(a, Date.parse("2026-10-18T20:59:00Z"))).toBe(true);
    expect(isAnnouncementCurrent(a, Date.parse("2026-10-18T21:00:00Z"))).toBe(false);
  });
});
