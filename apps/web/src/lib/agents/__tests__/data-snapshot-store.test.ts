import { describe, expect, it } from "vitest";
import {
  getStoredAnnouncements,
  getStoredAnnouncementsMeta,
} from "@/lib/agents/data-snapshot-store";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";

const ON_19_OCT = Date.parse("2026-10-19T12:00:00Z");
const ON_17_OCT = Date.parse("2026-10-17T15:00:00Z");

describe("getStoredAnnouncements — bayat snapshot güncellik", () => {
  it("tarihsiz kayıtlar snapshot üretim günüyle damgalanır (17.10.2026)", () => {
    const meta = getStoredAnnouncementsMeta();
    expect(meta.generatedAt).toBe("2026-10-17T14:52:49.987Z");

    const all = getStoredAnnouncements();
    const mm = all.find((a) => a.operator === "Mavi Marmara");
    const turyol = all.find((a) => a.operator === "Turyol");
    expect(mm?.publishedAt).toBe("17.10.2026");
    expect(mm?.publishedAtSource).toBe("SCAN_DAY");
    expect(turyol?.publishedAt).toBe("17.10.2026");
  });

  it("17.10 iptalleri 19.10'da GÖSTERİLMEZ (bayat iptal sızmaz)", () => {
    const all = getStoredAnnouncements();
    const stale = all.filter(
      (a) =>
        (a.type === "CANCELLATION" || a.type === "CANCELLED_TRIPS") &&
        !isAnnouncementCurrent(a, ON_19_OCT)
    );
    expect(stale.length).toBeGreaterThan(0);

    const sh = all.find((a) => a.id === "sh-status-17.10.2026");
    expect(sh).toBeTruthy();
    expect(isAnnouncementCurrent(sh!, ON_19_OCT)).toBe(false);
  });

  it("aynı snapshot 17.10'da geçerlidir (regresyon: gününde gösterilir)", () => {
    const all = getStoredAnnouncements();
    const sh = all.find((a) => a.id === "sh-status-17.10.2026");
    expect(isAnnouncementCurrent(sh!, ON_17_OCT)).toBe(true);
  });
});
