import { describe, expect, it } from "vitest";
import {
  buildCancellationBulletin,
  extractBulletinDate,
  extractCancellationItems,
} from "@/lib/utils/announcement-bulletin";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

const NOW = Date.parse("2026-10-19T12:00:00Z");

function ann(partial: Partial<OperatorAnnouncement>): OperatorAnnouncement {
  return {
    id: "a1",
    operator: "Şehir Hatları",
    title: "İptal Seferler",
    type: "CANCELLED_TRIPS",
    sourceUrl: "https://example.com",
    sourceVerified: true,
    ...partial,
  };
}

describe("buildCancellationBulletin — tarih başta + iptal maddeleri", () => {
  it("Şehir Hatları 19.10.2026: tarih ve Moda uğraması maddesi", () => {
    const a = ann({
      id: "sh-status-19.10.2026",
      title: "İptal Seferler — 19.10.2026",
      publishedAt: "19.10.2026",
      body: [
        "19.10.2026",
        "Değerli yolcularımız,",
        "Elverişsiz hava koşulları nedeniyle aşağıda belirtilen hatlardaki seferlerimiz ikinci bir duyuruya kadar gerçekleştirilemeyecektir.",
        "Bilgilerinize sunarız.",
        "Bostancı-Moda-Karaköy-Kabataş Hattı'nın Moda uğraması",
      ].join("\n"),
    });

    const b = buildCancellationBulletin(a, NOW);
    expect(b.date).toBe("19.10.2026");
    expect(b.reason).toContain("Elverişsiz hava koşulları");
    expect(b.items).toEqual(["Bostancı-Moda-Karaköy-Kabataş Hattı'nın Moda uğraması"]);
    expect(b.text.startsWith("19.10.2026 · Şehir Hatları")).toBe(true);
    expect(b.text).toContain("• Bostancı-Moda-Karaköy-Kabataş Hattı'nın Moda uğraması");
    expect(b.text).not.toContain("Bilgilerinize");
    expect(b.oneLine).toContain("19.10.2026 · Şehir Hatları");
    expect(b.oneLine).toContain("İptal:");
  });

  it("Şehir Hatları 17.10.2026: 'İptal Seferler:' sonrası saatli hatlar madde olur", () => {
    const a = ann({
      publishedAt: "17.10.2026",
      body: [
        "17.10.2026",
        "Değerli yolcularımız,",
        "İptal Seferler:",
        "07:30 Bostancı-Moda-Karaköy-Kabataş",
        "09:00 Kadıköy-Karaköy-Eminönü",
        "11:15 Üsküdar-Beşiktaş",
        "Bilgilerinize sunarız.",
        "Kadıköy-Karaköy-Eminönü hattında uygulanacak sefer tarifeleri aşağıdaki gibidir.",
      ].join("\n"),
    });

    const b = buildCancellationBulletin(a, NOW);
    expect(b.date).toBe("17.10.2026");
    expect(b.items).toEqual([
      "07:30 Bostancı-Moda-Karaköy-Kabataş",
      "09:00 Kadıköy-Karaköy-Eminönü",
      "11:15 Üsküdar-Beşiktaş",
    ]);
    expect(b.items.some((i) => i.includes("tarifeleri"))).toBe(false);
  });

  it("Mavi Marmara: tarihsiz kayıt bülten tarihi olarak o günü kullanır", () => {
    const a = ann({
      operator: "Mavi Marmara",
      title: "İptal Seferler",
      body: ["İptal Seferler:", "Bostancı-Adalar", "Beşiktaş-Kabataş"].join("\n"),
      publishedAt: undefined,
    });

    const b = buildCancellationBulletin(a, NOW);
    expect(b.date).toBe("19.10.2026");
    expect(b.items).toEqual(["Bostancı-Adalar", "Beşiktaş-Kabataş"]);
  });

  it("Dentur: gövde boşsa başlık madde olarak korunur (uydurma yok)", () => {
    const a = ann({
      operator: "Dentur Avrasya",
      title: "Ekim Heybeli Ada Buyuk Ada Sefer İptali",
      body: undefined,
      publishedAt: "19.10.2026",
    });

    const b = buildCancellationBulletin(a, NOW);
    expect(b.items).toEqual(["Ekim Heybeli Ada Buyuk Ada Sefer İptali"]);
    expect(b.text).toContain("• Ekim Heybeli Ada Buyuk Ada Sefer İptali");
  });
});

describe("extractBulletinDate — İstanbul gece yarısı", () => {
  it("ISO 18.10 21:30Z → İstanbul'da 19.10", () => {
    const a = ann({ publishedAt: "2026-10-18T21:30:00.000Z" });
    expect(extractBulletinDate(a, NOW).short).toBe("19.10.2026");
  });

  it("yayın tarihi yoksa başlıktaki tarihi kullanır", () => {
    const a = ann({ publishedAt: undefined, title: "19.10.2026 İptal Seferler" });
    expect(extractBulletinDate(a, NOW).short).toBe("19.10.2026");
  });
});

describe("extractCancellationItems — gürültü temizliği", () => {
  it("tarih, selamlama ve kapanış satırlarını madde saymaz", () => {
    const a = ann({
      body: [
        "19.10.2026",
        "Değerli yolcularımız,",
        "Bilgilerinize sunarız.",
        "Kadıköy-Büyükada seferleri iptal edilmiştir.",
      ].join("\n"),
    });
    expect(extractCancellationItems(a)).toEqual(["Kadıköy-Büyükada seferleri iptal edilmiştir."]);
  });
});
