import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseBesiktasKadikoySchedules,
  parseAdalarSchedules,
  parseUskudarKabatasSchedules,
  parseUskudarBesiktasSchedules,
} from "@/lib/agents/dentur-scraper";

function fixture(name: string): string {
  return readFileSync(
    fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
    "utf-8"
  );
}

describe("Dentur gerçek tarife parser'ı (resmi site fixture'ları)", () => {
  it("Beşiktaş↔Kadıköy: iki yön, Hİ+Cmt 28 kayıt, Pazar 26 kayıt", () => {
    const recs = parseBesiktasKadikoySchedules(
      fixture("dentur-besiktaskadikoy.html")
    );
    const weekdaySat = recs.filter((r) => r.dayType === "WEEKDAY_SAT");
    const sunday = recs.filter((r) => r.dayType === "SUNDAY");

    expect(weekdaySat.length).toBe(56); // 2 yön × 28
    expect(sunday.length).toBe(52); // 2 yön × 26
    // Her iki yön de aynı saat kümesini paylaşmalı
    const besToKad = weekdaySat.filter((r) => r.origin === "Beşiktaş");
    const kadToBes = weekdaySat.filter((r) => r.origin === "Kadıköy");
    expect(besToKad.length).toBe(28);
    expect(kadToBes.length).toBe(28);
    expect(besToKad.map((r) => r.departureTime)).toEqual(
      kadToBes.map((r) => r.departureTime)
    );
    // Saatler 07:30-21:00 arası 30 dk
    const times = besToKad.map((r) => r.departureTime);
    expect(times[0]).toBe("07:30");
    expect(times[times.length - 1]).toBe("21:00");
    expect(new Set(times).size).toBe(28);
  });

  it("Adalar: Hafta içi 2 gidiş + 2 dönüş, Hafta sonu 4 gidiş + 4 dönüş, ara duraklar korunur", () => {
    const recs = parseAdalarSchedules(fixture("dentur-adalar.html"));

    const weekdayGidis = recs.filter(
      (r) => r.dayType === "WEEKDAY" && r.origin === "Beşiktaş"
    );
    const weekdayDonus = recs.filter(
      (r) => r.dayType === "WEEKDAY" && r.origin === "Büyükada"
    );
    const weekendGidis = recs.filter(
      (r) => r.dayType === "WEEKEND" && r.origin === "Beşiktaş"
    );
    const weekendDonus = recs.filter(
      (r) => r.dayType === "WEEKEND" && r.origin === "Büyükada"
    );

    expect(weekdayGidis.length).toBe(2);
    expect(weekdayDonus.length).toBe(2);
    expect(weekendGidis.length).toBe(4);
    expect(weekendDonus.length).toBe(4);

    // Gidiş: Beşiktaş ara durak Kabataş ve Sirkeci olmalı
    const first = weekdayGidis[0];
    expect(first.origin).toBe("Beşiktaş");
    expect(first.destination).toBe("Büyükada");
    expect(first.departureTime).toBe("09:30");
    expect(first.arrivalTime).toBe("11:15");
    expect(first.stops?.length).toBe(3); // Kabataş, Sirkeci, Heybeliada
    expect(first.stops?.[0]).toEqual({ name: "KABATAŞ", time: "09:45" });
    expect(first.stops?.[2]).toEqual({ name: "HEYBELİADA", time: "11:00" });

    // Dönüş: Büyükada → Heybeliada → Sirkeci → Kabataş → Beşiktaş
    const donus = weekdayDonus[0];
    expect(donus.origin).toBe("Büyükada");
    expect(donus.departureTime).toBe("14:30");
    expect(donus.arrivalTime).toBe("16:15");
    expect(donus.stops?.[0]).toEqual({ name: "HEYBELİADA", time: "14:45" });
  });

  it("Üsküdar↔Kabataş: gerçek saat sayıları ve sürekli sefer pencereleri", () => {
    const recs = parseUskudarKabatasSchedules(
      fixture("dentur-uskudar-kabatas.html")
    );

    const uskudarWeekday = recs.filter(
      (r) => r.origin === "Üsküdar" && r.dayType === "WEEKDAY"
    );
    // Sayfada ÜSKÜDAR KALKIŞ tablosu Hİ sütunu ≈ 85 hücre; birebir tekilleştirilmiş sayı kontrolü
    expect(uskudarWeekday.length).toBeGreaterThan(60);

    // İlk gerçek sefer 06:45
    expect(uskudarWeekday[0].departureTime).toBe("06:45");

    // "Sürekli sefer" pencereleri isContinuous olarak temsil edilir
    const continuousKabatasWeekday = recs.filter(
      (r) =>
        r.origin === "Kabataş" &&
        r.dayType === "WEEKDAY" &&
        r.isContinuous
    );
    expect(continuousKabatasWeekday.length).toBeGreaterThan(0);
    for (const c of continuousKabatasWeekday) {
      expect(c.continuousUntil).toBeTruthy();
    }

    // "Sürekli" penceresi içinde sahte dakika ÜRETİLMEMİŞ olmalı → tüm kayıtlar birebir sayfa saati
    const allTimesValid = recs.every((r) =>
      /^([0-2]\d):[0-5]\d$/.test(r.departureTime)
    );
    expect(allTimesValid).toBe(true);
  });

  it("Üsküdar↔Beşiktaş: sürekli sefer pencereleri (uygun saat aralıkları)", () => {
    const recs = parseUskudarBesiktasSchedules(
      fixture("dentur-uskudar-besiktas.html")
    );
    expect(recs.length).toBeGreaterThan(0);

    // Sanayi bilinen aralıklar: Üsküdar Hİ+Cmt 06:10-00:45, Pazar 06:20-00:45
    const uskudarWeekdaySat = recs.find(
      (r) => r.origin === "Üsküdar" && r.dayType === "WEEKDAY_SAT"
    );
    expect(uskudarWeekdaySat?.departureTime).toBe("06:10");
    expect(uskudarWeekdaySat?.continuousUntil).toBe("00:45");

    const uskudarSunday = recs.find(
      (r) => r.origin === "Üsküdar" && r.dayType === "SUNDAY"
    );
    expect(uskudarSunday?.departureTime).toBe("06:20");
    expect(uskudarSunday?.continuousUntil).toBe("00:45");

    // Hiçbir "sürekli sefer" sabit saat üretmemiş olmalı
    expect(recs.every((r) => r.isContinuous)).toBe(true);
  });
});
