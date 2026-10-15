import { describe, it, expect } from "vitest";
import {
  estimateWalkingMinutes,
  findNextDepartureAfter,
  minutesBetweenHhmm,
  recommendedLeaveMs,
  resolveBoardingDeadline,
} from "@/lib/utils/boarding-deadline";
import {
  MS_PER_MINUTE,
  TURNSTILE_GANGWAY_BUFFER_MIN,
} from "@/lib/constants";

/** İstanbul sabit UTC+3 (yaz saati uygulaması yok). 10:00 İstanbul = 07:00Z */
const DEP_1000_IST = Date.parse("2026-10-15T10:00:00+03:00");
const at = (hhmm: string, day = "2026-10-15") =>
  Date.parse(`${day}T${hhmm}:00+03:00`);

describe("resolveBoardingDeadline", () => {
  it("kalkıştan turnike/rampa payı kadar önce son giriş verir", () => {
    const d = resolveBoardingDeadline(DEP_1000_IST, at("09:50"));
    expect(d).not.toBeNull();
    expect(d!.lastEntryHhmm).toBe("09:57");
    expect(d!.lastEntryMs).toBe(
      DEP_1000_IST - TURNSTILE_GANGWAY_BUFFER_MIN * MS_PER_MINUTE,
    );
  });

  it("son girişe kalan dakikayı yukarı yuvarlar", () => {
    // 09:50:30 → son girişe 6 dk 30 sn → 7 dk
    const d = resolveBoardingDeadline(DEP_1000_IST, at("09:50") + 30_000);
    expect(d!.minutesUntilLastEntry).toBe(7);
  });

  it("uyarı penceresi içinde işaretler (son 10 dk)", () => {
    expect(resolveBoardingDeadline(DEP_1000_IST, at("09:50"))!.isWithinWarningWindow).toBe(true);
    // 09:40 → son giriş 09:57, 17 dk kaldı → pencere dışı
    expect(resolveBoardingDeadline(DEP_1000_IST, at("09:40"))!.isWithinWarningWindow).toBe(false);
  });

  it("son giriş anı geçtiğinde 'geçti' der ve dakika vermez", () => {
    const d = resolveBoardingDeadline(DEP_1000_IST, at("09:58"));
    expect(d!.isPastLastEntry).toBe(true);
    expect(d!.minutesUntilLastEntry).toBeNull();
    expect(d!.isWithinWarningWindow).toBe(false);
  });

  it("tam sınırda (şimdi === son giriş) geçmiş sayar", () => {
    const lastEntry = DEP_1000_IST - TURNSTILE_GANGWAY_BUFFER_MIN * MS_PER_MINUTE;
    expect(resolveBoardingDeadline(DEP_1000_IST, lastEntry)!.isPastLastEntry).toBe(true);
  });

  it("hesabın tavsiye olduğunu açıkça işaretler", () => {
    expect(resolveBoardingDeadline(DEP_1000_IST, at("09:00"))!.isAdvisory).toBe(true);
  });

  it("geçersiz kalkış zamanında null döner (uydurmaz)", () => {
    expect(resolveBoardingDeadline(Number.NaN)).toBeNull();
    expect(resolveBoardingDeadline(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("gece yarısını aşan kalkışı doğru biçimlendirir", () => {
    const dep = Date.parse("2026-10-16T00:05:00+03:00");
    const d = resolveBoardingDeadline(dep, at("23:55"));
    expect(d!.lastEntryHhmm).toBe("00:02");
  });
});

describe("estimateWalkingMinutes", () => {
  it("80 m/dk hızını kullanır ve yukarı yuvarlar", () => {
    expect(estimateWalkingMinutes(80)).toBe(1);
    expect(estimateWalkingMinutes(81)).toBe(2);
    expect(estimateWalkingMinutes(400)).toBe(5);
  });

  it("geçersiz/negatif mesafede 0 verir", () => {
    expect(estimateWalkingMinutes(0)).toBe(0);
    expect(estimateWalkingMinutes(-50)).toBe(0);
    expect(estimateWalkingMinutes(Number.NaN)).toBe(0);
  });
});

describe("recommendedLeaveMs", () => {
  it("yürüme + turnike payını kalkıştan düşer", () => {
    const leave = recommendedLeaveMs(DEP_1000_IST, 5);
    expect(leave).toBe(DEP_1000_IST - 8 * MS_PER_MINUTE);
  });

  it("yürüme yoksa yalnızca turnike payını düşer", () => {
    expect(recommendedLeaveMs(DEP_1000_IST, 0)).toBe(
      DEP_1000_IST - TURNSTILE_GANGWAY_BUFFER_MIN * MS_PER_MINUTE,
    );
  });

  it("geçersiz kalkışta null döner", () => {
    expect(recommendedLeaveMs(Number.NaN, 5)).toBeNull();
  });
});

describe("findNextDepartureAfter (kaçırma maliyeti)", () => {
  const trips = [
    { id: "a", departureTime: "09:00" },
    { id: "b", departureTime: "10:20" },
    { id: "c", departureTime: "09:40" },
  ];

  it("sırasız listede en yakın ileri kalkışı bulur", () => {
    expect(findNextDepartureAfter(trips, "09:40")?.id).toBe("b");
  });

  it("sonraki sefer yoksa null döner", () => {
    expect(findNextDepartureAfter(trips, "23:00")).toBeNull();
  });

  it("aynı saati 'sonraki' saymaz", () => {
    expect(findNextDepartureAfter(trips, "10:20")).toBeNull();
  });

  it("filtre uygular (ör. yalnızca aynı hat)", () => {
    expect(
      findNextDepartureAfter(trips, "09:00", (t) => t.id !== "c")?.id,
    ).toBe("b");
  });

  it("geçersiz saatte null döner", () => {
    expect(findNextDepartureAfter(trips, "gecersiz")).toBeNull();
  });
});

describe("minutesBetweenHhmm", () => {
  it("ileri farkı dakika olarak verir", () => {
    expect(minutesBetweenHhmm("09:40", "10:20")).toBe(40);
  });

  it("geriye farkta null döner", () => {
    expect(minutesBetweenHhmm("10:20", "09:40")).toBeNull();
  });

  it("geçersiz girdide null döner", () => {
    expect(minutesBetweenHhmm("ab", "10:20")).toBeNull();
  });
});
