import { describe, expect, it } from "vitest";
import { getTuryolSchedules } from "../turyol-schedules";

describe("Turyol çoklu kart birleştirme (aynı iskele + saat = tek gemi)", () => {
  const trips = getTuryolSchedules();

  it("gidiş yönünde Eminönü 10:40 tek karttır: Büyükada hedef, ara adalar durak", () => {
    const t = trips.find(
      (x) => x.origin === "Eminönü" && x.destination === "Büyükada" && x.departureTime === "10:40"
    );
    expect(t).toBeDefined();
    expect(t?.stops?.map((s) => s.name)).toEqual(["Kınalıada", "Heybeliada"]);
    expect(t?.price).toBe("230 ₺");
    expect(t?.lineName).toContain("uğramalı");
    const separate = trips.filter(
      (x) => x.origin === "Eminönü" && x.departureTime === "10:40" && x.category === "ADALAR" && x.destination !== "Büyükada"
    );
    expect(separate.length).toBe(0);
  });

  it("dönüş yönünde Büyükada 15:15 tek karttır: Eminönü hedef, Kadıköy durak", () => {
    const t = trips.find(
      (x) => x.origin === "Büyükada" && x.destination === "Eminönü" && x.departureTime === "15:15"
    );
    expect(t).toBeDefined();
    expect(t?.stops?.map((s) => s.name)).toEqual(["Kadıköy"]);
    const separate = trips.filter(
      (x) => x.origin === "Büyükada" && x.departureTime === "15:15" && x.destination === "Kadıköy"
    );
    expect(separate.length).toBe(0);
  });

  it("hiçbir Ada grubunda aynı iskele+saat+bayrak kombinasyonu ikinci kez kart olmaz", () => {
    const seen = new Set<string>();
    for (const t of trips) {
      if (t.category !== "ADALAR") continue;
      const k = `${t.origin}|${t.departureTime}|${t.runsWeekday}|${t.runsSaturday}|${t.runsSunday}`;
      expect(seen.has(k)).toBe(false);
      seen.add(k);
    }
  });
});
