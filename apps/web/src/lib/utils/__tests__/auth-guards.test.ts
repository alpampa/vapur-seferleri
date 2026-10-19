import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/utils/cron-auth";
import { verifyAdminAuth } from "@/lib/utils/admin-auth";

function makeRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"), { headers });
}

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.ADMIN_SECRET;
  delete process.env.ADMIN_PIN;
});

describe("verifyCronAuth — yalnızca CRON_SECRET bearer", () => {
  it("sır tanımsızken yetkisiz erişim REDDEDİLİR", () => {
    expect(verifyCronAuth(makeRequest("/api/cron/scan-announcements"))).toBe(false);
  });

  it("REGRESYON: User-Agent 'vercel-cron' taklidi yetki VERMEZ", () => {
    // Eski kontrol: user-agent.includes("vercel-cron") → 401 atlanıyordu (bypass).
    const spoof = makeRequest("/api/cron/sync-tariffs", { "user-agent": "vercel-cron" });
    expect(verifyCronAuth(spoof)).toBe(false);
    process.env.CRON_SECRET = "gercek-sir";
    expect(verifyCronAuth(spoof)).toBe(false); // sır olsa bile yalnız UA yetmez
  });

  it("doğru bearer jetonu kabul edilir", () => {
    process.env.CRON_SECRET = "gercek-sir";
    const ok = makeRequest("/api/cron/scan-announcements", { authorization: "Bearer gercek-sir" });
    expect(verifyCronAuth(ok)).toBe(true);
  });

  it("yanlış bearer reddedilir", () => {
    process.env.CRON_SECRET = "gercek-sir";
    const bad = makeRequest("/api/cron/scan-announcements", { authorization: "Bearer yanlis" });
    expect(verifyCronAuth(bad)).toBe(false);
  });
});

describe("verifyAdminAuth — gömülü varsayılan anahtar YOK", () => {
  it("REGRESYON: sır tanımsızken 'ZKIO-2026' ile erişim REDDEDİLİR", () => {
    const req = makeRequest("/api/audit", { "x-admin-key": "ZKIO-2026" });
    expect(verifyAdminAuth(req)).toBe(false);
  });

  it("env sırrı + doğru header kabul edilir", () => {
    process.env.ADMIN_SECRET = "guvenli-anahtar";
    const req = makeRequest("/api/audit", { "x-admin-key": "guvenli-anahtar" });
    expect(verifyAdminAuth(req)).toBe(true);
  });

  it("yanlış header reddedilir", () => {
    process.env.ADMIN_SECRET = "guvenli-anahtar";
    const req = makeRequest("/api/audit", { "x-admin-key": "yanlis" });
    expect(verifyAdminAuth(req)).toBe(false);
  });

  it("cookie ile yetkilendirme çalışır (x-admin-key olmadan)", () => {
    process.env.ADMIN_SECRET = "guvenli-anahtar";
    const req = makeRequest("/api/audit", { cookie: "vapur_admin_key=guvenli-anahtar" });
    expect(verifyAdminAuth(req)).toBe(true);
  });

  it("REGRESYON: ?key= sorgu parametresi ARTIK kabul edilmez", () => {
    process.env.ADMIN_SECRET = "guvenli-anahtar";
    const req = makeRequest("/api/audit?key=guvenli-anahtar");
    expect(verifyAdminAuth(req)).toBe(false);
  });
});
