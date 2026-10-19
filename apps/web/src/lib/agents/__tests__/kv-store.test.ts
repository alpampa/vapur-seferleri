import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetMemoryKv,
  isKvConfigured,
  kvBackendName,
  kvDel,
  kvGet,
  kvGetJson,
  kvSet,
  kvSetJson,
  kvSetNx,
} from "@/lib/agents/kv-store";

beforeEach(() => {
  __resetMemoryKv();
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  __resetMemoryKv();
});

describe("kv-store — in-memory yedek", () => {
  it("ortam değişkeni yokken memory yedeğe düşer", () => {
    expect(isKvConfigured()).toBe(false);
    expect(kvBackendName()).toBe("memory");
  });

  it("set/get roundtrip ve delete", async () => {
    await kvSet("vapur:test", "değer");
    expect(await kvGet("vapur:test")).toBe("değer");
    await kvDel("vapur:test");
    expect(await kvGet("vapur:test")).toBeNull();
  });

  it("TTL süresi dolunca kayıt yok sayılır", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T10:00:00Z"));
    await kvSet("vapur:ttl", "x", 60);
    expect(await kvGet("vapur:ttl")).toBe("x");
    vi.setSystemTime(new Date("2026-10-19T10:01:01Z"));
    expect(await kvGet("vapur:ttl")).toBeNull();
  });

  it("JSON roundtrip", async () => {
    const payload = { a: 1, b: ["x", "y"] };
    await kvSetJson("vapur:json", payload);
    expect(await kvGetJson("vapur:json")).toEqual(payload);
  });

  it("bozuk JSON null döner (çökmez)", async () => {
    await kvSet("vapur:bozuk", "{bozuk");
    expect(await kvGetJson("vapur:bozuk")).toBeNull();
  });

  it("SET NX: ilk alan kilidi alır, ikincisi alamaz; DEL sonrası yeniden alınır", async () => {
    expect(await kvSetNx("vapur:kilit", "a", 70)).toBe(true);
    expect(await kvSetNx("vapur:kilit", "b", 70)).toBe(false);
    await kvDel("vapur:kilit");
    expect(await kvSetNx("vapur:kilit", "c", 70)).toBe(true);
  });

  it("SET NX: TTL dolunca kilit yeniden alınabilir", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T10:00:00Z"));
    expect(await kvSetNx("vapur:kilit", "a", 60)).toBe(true);
    expect(await kvSetNx("vapur:kilit", "b", 60)).toBe(false);
    vi.setSystemTime(new Date("2026-10-19T10:01:01Z"));
    expect(await kvSetNx("vapur:kilit", "c", 60)).toBe(true);
  });
});
