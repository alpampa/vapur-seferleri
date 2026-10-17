import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseSehirHatlariCancellationStatus,
  parseSehirHatlariAnnouncements,
  parseDenturAnnouncements,
  classifyAnnouncement,
  extractArticleBodyText,
  scrapeAllAnnouncements,
  ANNOUNCEMENT_SOURCES,
  OPERATOR_SCAN_COVERAGE,
} from "@/lib/agents/announcements-agent";
import {
  matchAnnouncementToTrips,
  matchAnnouncementsToTrips,
  indexDisruptionsByTrip,
  extractCancelledRouteChains,
} from "@/lib/agents/announcement-trip-matcher";
import { compareSnapshots, computeFingerprint, buildSnapshotState } from "@/lib/agents/scraper-agent";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import { OPERATOR_REGISTRY } from "@/lib/data/operator-registry";
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

describe("Şehir Hatları YENİ iptal formatı (17.10.2026 fixture — gerçek sayfa)", () => {
  const html = fixture("sehirhatlari-iptal-seferler-17102026.html");

  it("sayfa içine gömülü iptal duyurusunu (yeni format) durum olarak çözer", () => {
    const status = parseSehirHatlariCancellationStatus(html);
    expect(status.date).toBe("17.10.2026");
    expect(status.hasCancellations).toBe(true);
    expect(status.statement).toContain("gerçekleştirilemeyecektir");
    expect(status.statement).toContain("Tuzla-Pendik-Büyükada");
    // Tablo (düzenleme çizelgesi) gövdeye karışmamalı
    expect(status.statement).not.toContain("Tarihi Yapılır");
    expect(status.statement).not.toContain("<");
  });

  it("gövde çıkarıcı HTML kurdelelerini ve entity'leri temizler", () => {
    const body = extractArticleBodyText(html);
    expect(body.startsWith("17.10.2026")).toBe(true);
    expect(body).toContain("Değerli yolcularımız");
    expect(body).toContain("İptal Seferler:");
    expect(body).toContain("Adalar-Beşiktaş");
    expect(body).not.toMatch(/<[a-z]/i);
    expect(body).not.toContain("&uuml;");
    expect(body).not.toContain("news-detail-content");
    expect(body).not.toContain('class="');
  });

  it("durum kaydı CANCELLED_TRIPS olur; aynı günün liste kopyası MÜKERRER gösterilmez", () => {
    const announcements = parseSehirHatlariAnnouncements(html);
    const statusItem = announcements[0];
    expect(statusItem.type).toBe("CANCELLED_TRIPS");
    expect(statusItem.title).toContain("17.10.2026");
    expect(statusItem.body).toContain("Adalar-Beşiktaş");
    const duplicate = announcements.find(
      (a) => a.title === "17.10.2026 Cumartesi Sefer İptal ve Düzenlemeleri"
    );
    expect(duplicate).toBeUndefined();
  });

  it("iptal hat listesi zincirlere ayrılır", () => {
    const body = extractArticleBodyText(html);
    const chains = extractCancelledRouteChains(body);
    expect(chains.length).toBeGreaterThan(15);
    expect(chains).toContainEqual(["adalar", "besiktas"]);
    expect(chains).toContainEqual(["tuzla", "pendik", "buyukada"]);
  });

  it("KULLANICI KURALI: iptal edilen ADALAR hatları kartlarda CANCELLED olur, çalışan hat olmaz", () => {
    const statusItem = parseSehirHatlariAnnouncements(html)[0];
    const disruptions = matchAnnouncementToTrips(statusItem);
    expect(disruptions.length).toBeGreaterThan(20);
    expect(disruptions.every((d) => d.kind === "CANCELLED")).toBe(true);
    expect(disruptions.every((d) => d.operator === "Şehir Hatları")).toBe(true);

    // Maltepe-Büyükada-Heybeliada-Burgazada-Kınalıada hattı iptal → eşleşir
    const maltepe = OFFICIAL_SCHEDULES_DATA.find(
      (t) => t.operator === "Şehir Hatları" && t.origin === "Maltepe" && t.destination === "Heybeliada"
    );
    expect(maltepe).toBeTruthy();
    expect(disruptions.some((d) => d.tripId === maltepe!.id)).toBe(true);

    // Tuzla-Pendik-Büyükada hattı iptal → eşleşir
    const tuzla = OFFICIAL_SCHEDULES_DATA.find(
      (t) => t.operator === "Şehir Hatları" && t.origin === "Tuzla" && t.destination === "Büyükada"
    );
    expect(tuzla).toBeTruthy();
    expect(disruptions.some((d) => d.tripId === tuzla!.id)).toBe(true);

    // Kabataş-Büyükada hattı iptal LİSTESİNDE DEĞİL → işaretlenmemeli (yanlış iptal yok)
    const kabatas = OFFICIAL_SCHEDULES_DATA.find(
      (t) => t.operator === "Şehir Hatları" && t.origin === "Kabataş" && t.destination === "Büyükada"
    );
    expect(kabatas).toBeTruthy();
    expect(disruptions.some((d) => d.tripId === kabatas!.id)).toBe(false);
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

describe("KULLANICI KURALI: TÜM firmalar taranır (çok-firmalı tarama)", () => {
  it("kapsam kaydı her operatörü içerir; kaynaklı/kaynaksız ayrımı kanıtlıdır", () => {
    expect(OPERATOR_SCAN_COVERAGE.length).toBe(OPERATOR_REGISTRY.length);
    for (const op of OPERATOR_REGISTRY) {
      const entry = OPERATOR_SCAN_COVERAGE.find((c) => c.operator === op.name);
      expect(entry, `${op.name} kapsam kaydında yok`).toBeTruthy();
      if (entry!.hasSource) {
        expect(entry!.url).toBeTruthy();
      } else {
        // Kaynağı olmayan firma sessizce atlanmaz → kanıtlı not zorunlu
        expect(entry!.note).toBeTruthy();
      }
    }
    const withSource = OPERATOR_SCAN_COVERAGE.filter((c) => c.hasSource)
      .map((c) => c.operator)
      .sort();
    expect(withSource).toEqual(ANNOUNCEMENT_SOURCES.map((s) => s.operator).sort());
  });

  it("scrapeAllAnnouncements firmaları paralel tarar; kaynaksızlar NO_SOURCE raporlanır", async () => {
    const shHtml = fixture("sehirhatlari-iptal-seferler-17102026.html");
    const denturHtml = fixture("dentur-duyurular.html");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sehirhatlari.istanbul")) return new Response(shHtml, { status: 200 });
      if (url.includes("denturavrasya.com")) return new Response(denturHtml, { status: 200 });
      throw new Error(`beklenmeyen URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const { snapshots, failures, coverage } = await scrapeAllAnnouncements();
      expect(failures).toHaveLength(0);
      expect(snapshots.map((s) => s.operator).sort()).toEqual([
        "Dentur Avrasya",
        "Şehir Hatları",
      ]);
      const scanned = coverage
        .filter((c) => c.status === "SCANNED")
        .map((c) => c.operator)
        .sort();
      expect(scanned).toEqual(["Dentur Avrasya", "Şehir Hatları"]);
      const noSource = coverage.filter((c) => c.status === "NO_SOURCE");
      expect(noSource.map((c) => c.operator).sort()).toEqual(
        ["Mavi Marmara", "Prens Tur", "Turyol"].sort()
      );
      expect(noSource.every((c) => !!c.note)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("bir firma kaynağı çökerse yalnız o firma FAILED olur; diğerleri taranmaya devam eder", async () => {
    const denturHtml = fixture("dentur-duyurular.html");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sehirhatlari.istanbul")) return new Response("bakım", { status: 503 });
      if (url.includes("denturavrasya.com")) return new Response(denturHtml, { status: 200 });
      throw new Error(`beklenmeyen URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const { snapshots, failures, coverage } = await scrapeAllAnnouncements();
      expect(failures.some((f) => f.operator === "Şehir Hatları")).toBe(true);
      expect(coverage.find((c) => c.operator === "Şehir Hatları")?.status).toBe("FAILED");
      expect(coverage.find((c) => c.operator === "Dentur Avrasya")?.status).toBe("SCANNED");
      expect(snapshots).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
    }
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
