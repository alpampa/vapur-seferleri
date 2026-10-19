import { NextRequest, NextResponse } from "next/server";
import { runMonitorTick } from "@/lib/agents/announcement-monitor";
import { kvDel, kvSetNx } from "@/lib/agents/kv-store";
import { verifyCronAuth } from "@/lib/utils/cron-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const LOCK_KEY = "vapur:monitor:lock";
/** maxDuration (60 sn) + pay: tur sürerken kilit dolmaz; çökmede en fazla 1 tur atlanır. */
const LOCK_TTL_SECONDS = 70;

/**
 * DAKİKALIK İPTAL İZLEME CRON'U
 *
 * vercel.json → `* * * * *` (her dakika) bu uç noktayı çağırır.
 * - Türlü firma kaynakları canlı taranır, önceki turla diff alınır.
 * - Değişiklik geçmişi + firma sağlığı + arşiv kalıcı KV'ye yazılır.
 * - Tetiklenme sayısı ile başarılı kontrol sayısı AYRI raporlanır.
 * - Dağıtık kilit: üst üste binen turlar ikinci kez çalışmaz.
 *
 * GÜVENLİK: CRON_SECRET bearer zorunlu (verifyCronAuth).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const acquired = await kvSetNx(LOCK_KEY, lockValue, LOCK_TTL_SECONDS);
  if (!acquired) {
    return NextResponse.json({ ok: true, skipped: "locked" }, { status: 200 });
  }

  try {
    const result = await runMonitorTick({ trigger: "cron" });
    const status = result.checksAttempted > 0 && result.checksSucceeded === 0 ? 502 : 200;
    return NextResponse.json(result, { status });
  } finally {
    await kvDel(LOCK_KEY);
  }
}
