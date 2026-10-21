import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  __resetMemoryKv,
  kvSetJson,
} from "@/lib/agents/kv-store";
import {
  announcementHash,
  applyHealthOutcome,
  buildPrevEntry,
  diffAnnouncementSets,
  getMonitorState,
  runMonitorTick,
} from "@/lib/agents/announcement-monitor";
import type { OperatorAnnouncement } from "@/lib/types/announcement";
import type { OperatorHealth } from "@/lib/agents/monitor-types";

function fixture(name: string): string {
  return readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf-8");
}

function ann(
  id: string,
  overrides: Partial<OperatorAnnouncement> = {}
): OperatorAnnouncement {
  return {
    id,
    operator: "Şehir Hatları",
    title: `Duyuru ${id}`,
    type: "CANCELLED_TRIPS",
    sourceUrl: "https://example.com",
    sourceVerified: true,
    ...overrides,
  };
}

beforeEach(() => {
  __resetMemoryKv();
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  __resetMemoryKv();
});

describe("diffAnnouncementSets (saf fonksiyon)", () => {
  it("önceki durum yoksa tüm duyurular ANNOUNCED olur", () => {
    const events = diffAnnouncementSets(
      "Şehir Hatları",
      undefined,
      [ann("a"), ann("b", { type: "INFO" })],
      "2026-10-19T10:00:00Z"
    );
    expect(events.filter((e) => e.type === "ANNOUNCED")).toHaveLength(2);
    expect(events.every((e) => e.operator === "Şehir Hatları")).toBe(true);
  });

  it("metin değişimi UPDATED üretir", () => {
    const prev = buildPrevEntry([ann("a", { body: "eski" })], "2026-10-19T09:00:00Z");
    const events = diffAnnouncementSets(
      "Şehir Hatları",
      prev,
      [ann("a", { body: "yeni" })],
      "2026-10-19T10:00:00Z"
    );
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("UPDATED");
  });

  it("kaldırılan iptal duyurusu CANCELLATION_REMOVED olur", () => {
    const prev = buildPrevEntry([ann("c1")], "2026-10-19T09:00:00Z");
    const events = diffAnnouncementSets("Şehir Hatları", prev, [], "2026-10-19T10:00:00Z");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("CANCELLATION_REMOVED");
    expect(events[0].announcementId).toBe("c1");
  });

  it("kaldırılan iptal-dışı duyuru REMOVED olur", () => {
    const prev = buildPrevEntry([ann("i1", { type: "INFO" })], "2026-10-19T09:00:00Z");
    const events = diffAnnouncementSets("Şehir Hatları", prev, [], "2026-10-19T10:00:00Z");
    expect(events[0].type).toBe("REMOVED");
  });

  it("değişmeyen küme boş fark üretir (idempotent)", () => {
    const set = [ann("a"), ann("b", { type: "INFO" })];
    const prev = buildPrevEntry(set, "2026-10-19T09:00:00Z");
    expect(diffAnnouncementSets("Şehir Hatları", prev, set, "2026-10-19T10:00:00Z")).toHaveLength(0);
  });

  it("aynı içerik aynı hash üretir (id fark etmez)", () => {
    expect(announcementHash({ title: "Aynı", body: "b" })).toBe(
      announcementHash({ title: "Aynı", body: "b" })
    );
    expect(announcementHash(ann("x", { body: "b" }))).not.toBe(
      announcementHash(ann("x", { body: "c" }))
    );
  });
});

describe("getMonitorState — arşiv tarihleri", () => {
  it("SCAN_DAY damgasını bugüne TAŞIMAZ (iptal 00:00'da biter)", async () => {
    const archived = ann("s", {
      publishedAt: "18.10.2026",
      publishedAtSource: "SCAN_DAY",
    });
    await kvSetJson("vapur:monitor:state", {
      updatedAt: "2026-10-18T20:00:00Z",
      health: {},
      prev: {},
      history: [],
      last: null,
      archives: {
        "Mavi Marmara": {
          operator: "Mavi Marmara",
          sourceUrl: "https://durum.mavimarmara.net/feed.json",
          fetchedAt: "2026-10-18T20:00:00Z",
          announcements: [archived],
        },
      },
    });

    const state = await getMonitorState();
    const stored = state.archives.get("Mavi Marmara")?.announcements[0];
    expect(stored?.publishedAt).toBe("18.10.2026");
    expect(stored?.publishedAtSource).toBe("SCAN_DAY");
  });
});

describe("applyHealthOutcome (saf fonksiyon)", () => {
  const now = new Date("2026-10-19T10:00:00Z");

  it("başarı sağlığı sıfırlar ve backoff'u kaldırır", () => {
    const prev: OperatorHealth = {
      operator: "Şehir Hatları",
      status: "UNREACHABLE",
      lastCheckedAt: "2026-10-19T09:59:00Z",
      consecutiveFailures: 3,
      backoffUntil: "2026-10-19T10:15:00Z",
      announcementCount: 0,
    };
    const next = applyHealthOutcome(prev, {
      operator: "Şehir Hatları",
      status: "OK",
      now,
      announcementCount: 5,
      latencyMs: 120,
    });
    expect(next.status).toBe("OK");
    expect(next.consecutiveFailures).toBe(0);
    expect(next.backoffUntil).toBeUndefined();
    expect(next.lastOkAt).toBe(now.toISOString());
    expect(next.announcementCount).toBe(5);
  });

  it("başarısızlık üstel backoff üretir (1dk → 2dk)", () => {
    const first = applyHealthOutcome(undefined, {
      operator: "Turyol",
      status: "UNREACHABLE",
      now,
      error: "HTTP 503",
    });
    expect(first.consecutiveFailures).toBe(1);
    const backoff1 = Date.parse(first.backoffUntil!) - now.getTime();
    expect(backoff1).toBe(60_000);

    const second = applyHealthOutcome(first, {
      operator: "Turyol",
      status: "UNREACHABLE",
      now,
      error: "HTTP 503",
    });
    expect(second.consecutiveFailures).toBe(2);
    const backoff2 = Date.parse(second.backoffUntil!) - now.getTime();
    expect(backoff2).toBe(120_000);
  });

  it("NO_SOURCE sağlığı başarısızlık saymaz", () => {
    const next = applyHealthOutcome(undefined, {
      operator: "Prens Tur",
      status: "NO_SOURCE",
      now,
      note: "kaynak yok",
    });
    expect(next.status).toBe("NO_SOURCE");
    expect(next.consecutiveFailures).toBe(0);
    expect(next.backoffUntil).toBeUndefined();
  });
});

describe("runMonitorTick (uçtan uca, sahte kaynaklar)", () => {
  const shHtml = fixture("sehirhatlari-iptal-seferler-17102026.html");
  const denturHtml = fixture("dentur-duyurular.html");
  const mmFeed = fixture("mavi-marmara-durum-feed.json");
  const turyolHtml = fixture("turyol-aktif-popup.html");

  function okFetch() {
    return vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sehirhatlari.istanbul")) return new Response(shHtml, { status: 200 });
      if (url.includes("denturavrasya.com")) return new Response(denturHtml, { status: 200 });
      if (url.includes("durum.mavimarmara.net")) return new Response(mmFeed, { status: 200 });
      if (url.includes("turyol.com")) return new Response(turyolHtml, { status: 200 });
      throw new Error(`beklenmeyen URL: ${url}`);
    });
  }

  it("ilk tur: 4 firma kontrol edilir, sağlık OK, değişiklikler kalıcı yazılır", async () => {
    vi.stubGlobal("fetch", okFetch());
    const result = await runMonitorTick({
      trigger: "test",
      now: new Date("2026-10-19T10:00:00Z"),
    });

    expect(result.checksAttempted).toBe(4);
    expect(result.checksSucceeded).toBe(4);
    expect(result.checksFailed).toBe(0);
    expect(result.noSource).toBe(2);
    expect(result.skippedByBackoff).toBe(0);
    expect(result.persisted).toBe(true);
    expect(result.storage).toBe("memory");
    expect(result.ok).toBe(true);
    expect(result.operators.find((o) => o.operator === "Şehir Hatları")?.status).toBe("OK");

    const state = await getMonitorState();
    expect(state.health.find((h) => h.operator === "Şehir Hatları")?.status).toBe("OK");
    expect(state.health.find((h) => h.operator === "Prens Tur")?.status).toBe("NO_SOURCE");
    expect(state.recentChanges.length).toBeGreaterThan(0);
    expect(state.lastTick?.persisted).toBe(true);
    expect(state.archives.size).toBe(4);
  });

  it("ikinci tur (aynı kaynak): yeni ANNOUNCED üretmez (idempotent)", async () => {
    vi.stubGlobal("fetch", okFetch());
    await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:00:00Z") });
    const second = await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:01:00Z") });
    expect(second.changes.filter((c) => c.type === "ANNOUNCED")).toHaveLength(0);
    expect(second.changes.filter((c) => c.type === "UPDATED")).toHaveLength(0);
  });

  it("kaynak çökerse UNREACHABLE + backoff; sonraki tur atlanır (tetiklenme ≠ başarı)", async () => {
    const failing = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("sehirhatlari.istanbul")) return new Response("bakım", { status: 503 });
      if (url.includes("denturavrasya.com")) return new Response(denturHtml, { status: 200 });
      if (url.includes("durum.mavimarmara.net")) return new Response(mmFeed, { status: 200 });
      if (url.includes("turyol.com")) return new Response(turyolHtml, { status: 200 });
      throw new Error(`beklenmeyen URL: ${url}`);
    });
    vi.stubGlobal("fetch", failing);

    const first = await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:00:00Z") });
    expect(first.checksAttempted).toBe(4);
    expect(first.checksSucceeded).toBe(3);
    expect(first.checksFailed).toBe(1);
    const shHealth = (await getMonitorState()).health.find((h) => h.operator === "Şehir Hatları");
    expect(shHealth?.status).toBe("UNREACHABLE");
    expect(shHealth?.consecutiveFailures).toBe(1);
    expect(shHealth?.backoffUntil).toBeTruthy();
    expect(first.changes.some((c) => c.type === "UNREACHABLE")).toBe(true);

    const second = await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:00:30Z") });
    expect(second.skippedByBackoff).toBe(1);
    expect(second.checksAttempted).toBe(3);
    expect(second.operators.find((o) => o.operator === "Şehir Hatları")?.skipped).toBe(true);
  });

  it("operatör filtresi yalnızca istenen firmayı tarar", async () => {
    vi.stubGlobal("fetch", okFetch());
    const result = await runMonitorTick({
      trigger: "test",
      now: new Date("2026-10-19T10:00:00Z"),
      operators: ["Turyol"],
    });
    expect(result.checksAttempted).toBe(1);
    expect(result.operators.find((o) => o.operator === "Turyol")?.scanned).toBe(true);
  });

  it("kaynak sonradan çökse de arşiv KORUNUR (veri sessizce kaybolmaz)", async () => {
    vi.stubGlobal("fetch", okFetch());
    await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:00:00Z") });

    const failing = vi.fn(async () => new Response("bakım", { status: 503 }));
    vi.stubGlobal("fetch", failing);
    const second = await runMonitorTick({ trigger: "test", now: new Date("2026-10-19T10:02:00Z") });
    expect(second.checksSucceeded).toBe(0);
    expect(second.checksFailed).toBe(4);

    const state = await getMonitorState();
    expect(state.archives.size).toBe(4);
    expect(state.archives.get("Mavi Marmara")?.announcements.length).toBeGreaterThan(0);
    expect(state.health.find((h) => h.operator === "Şehir Hatları")?.status).toBe("UNREACHABLE");
  });
});
