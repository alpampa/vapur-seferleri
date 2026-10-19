import { NextRequest, NextResponse } from "next/server";
import { runMonitorTick } from "@/lib/agents/announcement-monitor";
import { verifyCronAuth } from "@/lib/utils/cron-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/**
 * DAKİKALIK İPTAL İZLEME CRON'U
 *
 * vercel.json → `* * * * *` (her dakika) bu uç noktayı çağırır.
 * - Türlü firma kaynakları canlı taranır, önceki turla diff alınır.
 * - Değişiklik geçmişi + firma sağlığı + arşiv kalıcı KV'ye yazılır.
 * - Tetiklenme sayısı ile başarılı kontrol sayısı AYRI raporlanır.
 *
 * GÜVENLİK: CRON_SECRET bearer zorunlu (verifyCronAuth).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMonitorTick({ trigger: "cron" });
  const status = result.checksAttempted > 0 && result.checksSucceeded === 0 ? 502 : 200;
  return NextResponse.json(result, { status });
}
