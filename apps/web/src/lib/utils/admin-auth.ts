import { NextRequest } from "next/server";

/**
 * Admin ve telemetri korumalı endpoint'ler için yetkilendirme denetleyicisi.
 * Geliştirici PIN'i veya ADMIN_SECRET ile yetkilendirme sağlar.
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET || process.env.ADMIN_PIN || "ZKIO-2026";
  
  const headerKey = request.headers.get("x-admin-key") || request.headers.get("x-admin-pin");
  const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookieKey = request.cookies.get("vapur_admin_key")?.value;
  const queryKey = new URL(request.url).searchParams.get("key");

  const providedKey = headerKey || authHeader || cookieKey || queryKey;

  if (providedKey && (providedKey === adminKey || (process.env.CRON_SECRET && providedKey === process.env.CRON_SECRET))) {
    return true;
  }

  return false;
}
