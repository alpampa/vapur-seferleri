import { NextRequest } from "next/server";

/**
 * Admin ve telemetri korumalı endpoint'ler için yetkilendirme denetleyicisi.
 *
 * GÜVENLİK: Sır YALNIZCA ortam değişkeninden gelir (ADMIN_SECRET / ADMIN_PIN).
 * - Gömülü varsayılan anahtar ("ZKIO-2026") KALDIRILDI; sır tanımlı değilse
 *   erişim REDDEDİLİR. Üretimde ADMIN_SECRET ortam değişkeni tanımlanmalıdır.
 * - `?key=` sorgu parametresi KALDIRILDI (log/referer sızıntısı riski).
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET || process.env.ADMIN_PIN;
  if (!adminKey) return false;

  const headerKey = request.headers.get("x-admin-key") || request.headers.get("x-admin-pin");
  const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookieKey = request.cookies.get("vapur_admin_key")?.value;

  const providedKey = headerKey || authHeader || cookieKey;
  if (!providedKey) return false;

  const cronSecret = process.env.CRON_SECRET;
  return providedKey === adminKey || (!!cronSecret && providedKey === cronSecret);
}
