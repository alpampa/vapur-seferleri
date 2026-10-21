import { describe, it, expect } from "vitest";
import { getDayTypeForDate, getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";
import { addDaysToIso, nextWeekdayIso, toIsoDate } from "@/lib/utils/istanbul-date";

describe("tarife günü seçimi", () => {
  it("hafta içi / cumartesi / pazar gün tiplerini doğru ayırır", () => {
    expect(getDayTypeForDate("2026-10-21")).toBe("WEEKDAY");
    expect(getDayTypeForDate("2026-10-24")).toBe("SATURDAY");
    expect(getDayTypeForDate("2026-10-25")).toBe("SUNDAY");
  });

  it("resmî tatili Pazar tarifesine eşler", () => {
    // 29 Ekim 2026 Perşembe — Cumhuriyet Bayramı
    expect(getDayTypeForDate("2026-10-29")).toBe("SUNDAY");
  });

  it("gelecek cumartesi için canlı olmayan tarife döner", async () => {
    const today = toIsoDate();
    const upcomingSaturday = nextWeekdayIso(today, 6);
    const saturday = upcomingSaturday === today ? addDaysToIso(today, 7) : upcomingSaturday;
    const data = await getLiveOrOfficialSchedules({ dateIso: saturday });

    expect(data.selectedDateIso).toBe(saturday);
    expect(data.dayType).toBe("SATURDAY");
    expect(data.isToday).toBe(false);
    expect(data.schedules.length).toBeGreaterThan(0);
    expect(data.schedules.every((s) => s.status === "ON_TIME")).toBe(true);
    expect(data.schedules.every((s) => s.targetTimeIso?.startsWith(saturday))).toBe(true);
  });

  it("geçmiş tarihi bugüne düşürür", async () => {
    const today = toIsoDate();
    const past = addDaysToIso(today, -3);
    const data = await getLiveOrOfficialSchedules({ dateIso: past });

    expect(data.selectedDateIso).toBe(today);
    expect(data.isToday).toBe(true);
  });
});
