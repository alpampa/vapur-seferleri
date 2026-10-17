import { NextResponse } from "next/server";
import { getLiveScan } from "@/lib/agents/live-scan-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GECE CRON TARAMASI — KULLANICI KURALI: ajanlar hiç uyumaz.
 *
 * Firmalar iptal duyurularını genelde 00:00 civarı yayınlar; Vercel cron
 * (vercel.json → crons) bu uç noktayı her gece 00:05 TR'de (21:05 UTC)
 * çağırır ve ÇOK-FİRMALI canlı taramayı ZORLA tazeler. Tarama önbelleği
 * /api/announcements ile PAYLAŞILIR; gündüz kullanıcı istekleri taze
 * veriyle hızlı yanıtlanır. Kaynağı engellenen firmalar (ör. WAF) için
 * /api/announcements son doğrulanmış snapshot'a düşer — bu rota yalnızca
 * taramayı tetikler ve özet rapor döner.
 */
export async function GET() {
  const scan = await getLiveScan({ force: true });
  if (!scan) {
    return NextResponse.json(
      { ok: false, error: "Canlı tarama başarısız (tüm firmalar)" },
      { status: 502 }
    );
  }
  const scanned = scan.coverage.filter((c) => c.status === "SCANNED").map((c) => c.operator);
  const failed = scan.coverage.filter((c) => c.status === "FAILED").map((c) => c.operator);
  const noSource = scan.coverage.filter((c) => c.status === "NO_SOURCE").map((c) => c.operator);
  return NextResponse.json({
    ok: true,
    scannedAt: new Date(scan.at).toISOString(),
    scanned,
    failed,
    noSource,
    announcementCount: scan.snapshots.reduce((n, s) => n + s.announcements.length, 0),
  });
}
