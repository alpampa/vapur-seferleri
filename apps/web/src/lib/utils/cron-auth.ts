import { NextRequest } from "next/server";

/**
 * Cron / senkron uç noktaları için yetkilendirme.
 *
 * GÜVENLİK: Yalnızca `CRON_SECRET` bearer jetonu kabul edilir.
 * - Vercel Cron, `CRON_SECRET` ortam değişkeni tanımlıyken isteğe
 *   `Authorization: Bearer <CRON_SECRET>` başlığını otomatik ekler.
 * - ÖNEMLİ: `User-Agent` içinde "vercel-cron" arayan eski kontrol KALDIRILDI;
 *   istemci `User-Agent` başlığını serbestçe taklit edebildiği için bu bir
 *   kimlik doğrulama atlatma açığıydı (401 → 200).
 * - Geliştirme ortamında kolaylık için serbest bırakılır.
 */
export function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader === `Bearer ${secret}`) {
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}
