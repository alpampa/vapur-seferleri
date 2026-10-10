import { describe, it, expect } from "vitest";
import { isIslandPier, isIslandRoute } from "@/lib/data/piers";

describe("isIslandPier and isIslandRoute", () => {
  it("Ada iskelelerini doğru tespit eder", () => {
    expect(isIslandPier("Büyükada")).toBe(true);
    expect(isIslandPier("Heybeliada")).toBe(true);
    expect(isIslandPier("Burgazada")).toBe(true);
    expect(isIslandPier("Kınalıada")).toBe(true);
    expect(isIslandPier("Sedef Adası")).toBe(true);
  });

  it("Anakara iskelelerini doğru tespit eder (ada değil)", () => {
    expect(isIslandPier("Kabataş")).toBe(false);
    expect(isIslandPier("Kadıköy")).toBe(false);
    expect(isIslandPier("Bostancı")).toBe(false);
    expect(isIslandPier("Eminönü")).toBe(false);
    expect(isIslandPier("Beşiktaş")).toBe(false);
    expect(isIslandPier("Üsküdar")).toBe(false);
    expect(isIslandPier("Karaköy")).toBe(false);
  });

  it("isIslandRoute: En az bir ucu ada olan rotaları ada rotası kabul eder", () => {
    expect(isIslandRoute("Büyükada", "Kabataş")).toBe(true);
    expect(isIslandRoute("Kabataş", "Heybeliada")).toBe(true);
    expect(isIslandRoute("Bostancı", "Büyükada")).toBe(true);
    expect(isIslandRoute("Heybeliada", "Burgazada")).toBe(true);
  });

  it("isIslandRoute: İki ucu da anakara olan (örn: Kadıköy -> Kabataş) rotaları ada rotası SAYMAZ", () => {
    // Vapur Adalar'dan gelip Kadıköy'e ulaştığında Kadıköy -> Kabataş bacağı anakaradan anakarayadır!
    expect(isIslandRoute("Kadıköy", "Kabataş")).toBe(false);
    expect(isIslandRoute("Eminönü", "Kadıköy")).toBe(false);
    expect(isIslandRoute("Beşiktaş", "Kadıköy")).toBe(false);
    expect(isIslandRoute("Bostancı", "Kadıköy")).toBe(false);
  });
});
