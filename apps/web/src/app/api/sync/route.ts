import { NextRequest, NextResponse } from "next/server";
import { runDailyVerificationAudit, runNightlyTariffSync } from "@/lib/agents/daily-sync-job";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import { verifyCronAuth } from "@/lib/utils/cron-auth";

export const dynamic = "force-dynamic";

/**
 * SENKRON ENDPOINTİ (el ile / otomasyon tetiklemeli)
 * Tarife + duyuru senkronunu çalıştırır; ayrıca erişim denetim raporu üretir.
 * GÜVENLİK: `CRON_SECRET` bearer jetonu zorunlu (User-Agent taklidiyle atlatma yok).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid authorization token" },
      { status: 401 }
    );
  }
  try {
    const syncResult = await runNightlyTariffSync();
    const auditLogs = await runDailyVerificationAudit();

    return NextResponse.json({
      status: syncResult.success ? "OK" : "PARTIAL",
      auditTimestamp: new Date().toISOString(),
      policy: "SADECE_RESMI_KAYNAKTAN_DOGRULANMIS_VERI",
      storedTripCount: OFFICIAL_SCHEDULES_DATA.length,
      changedAny: syncResult.reports.some((r) => r.changed),
      syncResult,
      auditLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: error?.message || "Sync execution failed" },
      { status: 500 }
    );
  }
}
