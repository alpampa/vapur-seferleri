import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseSehirHatlariCancellationStatus,
  parseSehirHatlariAnnouncements,
  parseDenturAnnouncements,
  classifyAnnouncement,
} from "@/lib/agents/announcements-agent";
import {
  matchAnnouncementToTrips,
  matchAnnouncementsToTrips,
  indexDisruptionsByTrip,
} from "@/lib/agents/announcement-trip-matcher";
import { compareSnapshots, computeFingerprint, buildSnapshotState } from "@/lib/agents/scraper-agent";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

function fixture(name: string): string {
  return readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf-8");
}

describe("Şehir Hatları duyuru ajanı (fixture)", () => {
  const html = fixture("sehirhatlari-iptal-seferler.html");

  it("iptal durumunu doğru çözer (04.10.2026)", () => {
    const status = parseSehirHatlariCancellationStatus(html);
    expect(status.date).toBe("04.10.2026");
    // Ham HTML'deki birebir metin: "İptal seferimiz bulunmamaktadır."
    expect(status.statement).toContain("İptal seferimiz bulunmamaktadır");
    expect(status.hasCancellations).toBe(false);
  });

  it("\"Diğer Duyurular\" listesini çıkarır", () => {
    const announcements = parseSehirHatlariAnnouncements(html);
    expect(announcements.length).toBeGreaterThan(5);
    // İlk kayıt bugünkü durum, ardından gerçek duyurular gelir
    expect(announcements[0].id).toContain("sh-status");
    expect(announcements[0].body).toContain("İptal seferimiz bulunmamaktadır");
    // Duyuru (Haliç Hattı) listede mevcut olmalı
    const halic = announcements.find((a) => a.title.includes("Haliç Hattı"));
    expect(halic).toBeTruthy();
    expect(halic?.sourceUrl).toContain("/tr/duyurular/");
    expect(halic?.sourceVerified).toBe(true);
  });
});

describe("Dentur duyuru ajanı (fixture)", () => {
  it("gerçek duyuru sayfalarını çıkarır", () => {
    const announcements = parseDenturAnnouncements(fixture("dentur-duyurular.html"));
    expect(announcements.length).toBeGreaterThan(3);
    expect(announcements.every((a) => a.operator === "Dentur Avrasya")).toBe(true);
    // URL'ler resmi
    expect(announcements.every((a) => a.sourceUrl.includes("/tr-TR/duyurular/"))).toBe(true);
  });
});

describe("classifyAnnouncement", () => {
  it("kelimeye göre tip atar", () => {
    expect(classifyAnnouncement("23 Ağustos İptal Seferler Duyurusu")).toBe("CANCELLED_TRIPS");
    expect(classifyAnnouncement("26 Temmuz 2026 Adalar-Bostancı Ek Seferi")).toBe("EXTRA_SERVICE");
    expect(classifyAnnouncement("Sefer Düzenlemeleri Duyurusu")).toBe("SCHEDULE_CHANGE");
    expect(classifyAnnouncement("Mehtap Turu Bilgilendirme")).toBe("INFO");
  });
});

describe("duyuru → sefer eşleştirici", () => {
  it("iptal duyurusunu ilgili seferlere bağlar", () => {
    const ann: OperatorAnnouncement = {
      id: "test-1",
      operator: "Dentur Avrasya",
      title: "26 Temmuz 2026 Adalar Ek Seferi",
      type: "EXTRA_SERVICE",
      sourceUrl: "https://example.com",
      sourceVerified: true,
    };
    const dis = matchAnnouncementToTrips(ann);
    // Adalar kelimesi Dentur'un Adalar hattıyla eşleşmeli
    const adaMatches = dis.filter((d) => d.tripId.includes("den-adalar") || d.operator === "Dentur Avrasya");
    expect(adaMatches.length).toBeGreaterThan(0);
    expect(adaMatches[0].kind).toBe("EXTRA");
  });

  it("boş/kaynak ipucu olmayan duyuruda sefer işaretlemez (uydurma yok)", () => {
    const ann: OperatorAnnouncement = {
      id: "test-2",
      operator: "Şehir Hatları",
      title: "Mehtap Turu Bilgilendirme Duyurusu",
      type: "INFO",
      sourceUrl: "https://example.com",
      sourceVerified: true,
    };
    const dis = matchAnnouncementToTrips(ann);
    expect(dis).toHaveLength(0);
  });

  it("küme eşleştirme + index haritası tutarlıdır", () => {
    const anns: OperatorAnnouncement[] = [
      {
        id: "a1",
        operator: "Dentur Avrasya",
        title: "Beşiktaş-Kadıköy sefer düzenlemeleri",
        type: "SCHEDULE_CHANGE",
        sourceUrl: "x",
        sourceVerified: true,
      },
    ];
    const dis = matchAnnouncementsToTrips(anns);
    expect(dis.length).toBeGreaterThan(0);
    const map = indexDisruptionsByTrip(dis);
    expect(map.size).toBe(new Set(dis.map((d) => d.tripId)).size);
  });
});

describe("scraper-agent diff motoru", () => {
  it("aynı içerikte değişiklik yok der", () => {
    const content = computeFingerprint("<html><body>aynı</body></html>", 10);
    const prev = buildSnapshotState(content);
    const report = compareSnapshots("X", prev, content);
    expect(report.changed).toBe(false);
    expect(report.detail).toContain("Değişiklik yok");
  });

  it("içerik farkında değişiklik bildirir", () => {
    const prevContent = computeFingerprint("<html><body>eski tarife</body></html>", 10);
    const prev = buildSnapshotState(prevContent);
    const next = computeFingerprint("<html><body>yeni tarife 06:00</body></html>", 12);
    const report = compareSnapshots("X", prev, next);
    expect(report.changed).toBe(true);
    expect(report.currentRecordCount).toBe(12);
  });

  it("kayıt sayısı değişimi tek başına değişikliktir", () => {
    const content = computeFingerprint("<p>içerik</p>", 10);
    const prev = buildSnapshotState(content);
    const next = computeFingerprint("<p>içerik</p>", 11);
    expect(compareSnapshots("X", prev, next).changed).toBe(true);
  });
});
