import { describe, expect, it } from "vitest";
import { GLANCE_CRITICAL_MIN, GLANCE_SOON_MIN, resolveGlanceStatus } from "../glance-status";

describe("resolveGlanceStatus", () => {
  it("kalkmış sefer DEPARTED döner", () => {
    const s = resolveGlanceStatus({ isDeparted: true, minutesUntilDeparture: null, countdown: null });
    expect(s.urgency).toBe("DEPARTED");
    expect(s.minutes).toBeNull();
  });

  it("tam kritik eşikte (5 dk) CRITICAL döner", () => {
    const s = resolveGlanceStatus({ isDeparted: false, minutesUntilDeparture: GLANCE_CRITICAL_MIN, countdown: null });
    expect(s.urgency).toBe("CRITICAL");
  });

  it("tam yakın eşikte (15 dk) SOON döner", () => {
    const s = resolveGlanceStatus({ isDeparted: false, minutesUntilDeparture: GLANCE_SOON_MIN, countdown: "14:59" });
    expect(s.urgency).toBe("SOON");
  });

  it("eşiğin üzerinde (16 dk) CALM döner ve dakikayı korur", () => {
    const s = resolveGlanceStatus({ isDeparted: false, minutesUntilDeparture: 16, countdown: null });
    expect(s.urgency).toBe("CALM");
    expect(s.minutes).toBe(16);
  });

  it("canlı geri sayım penceresinde countdown iletilir ve CRITICAL olur", () => {
    const s = resolveGlanceStatus({ isDeparted: false, minutesUntilDeparture: 4, countdown: "03:59" });
    expect(s.urgency).toBe("CRITICAL");
    expect(s.liveCountdown).toBe("03:59");
  });

  it("dakika bilgisi yoksa güvenli CALM döner", () => {
    const s = resolveGlanceStatus({ isDeparted: false, minutesUntilDeparture: null, countdown: null });
    expect(s).toEqual({ urgency: "CALM", minutes: null, liveCountdown: null });
  });
});
