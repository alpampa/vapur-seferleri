import { NextRequest, NextResponse } from "next/server";
import { runDailyVerificationAudit, runNightlyTariffSync } from "@/lib/agents/daily-sync-job";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";

export const dynamic = "force-dynamic";

function verifySyncAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const isVercelCron = request.headers.get("user-agent")?.includes("vercel-cron");
  if (isVercelCron) {
    return true;
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

/**
 * SENKRON ENDPOINTİ (el ile / otomasyon tetiklemeli)
 * Tarife + duyuru senkronunu çalıştırır; ayrıca erişim denetim raporu üretir.
 */
export async function GET(request: NextRequest) {
  if (!verifySyncAuth(request)) {
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
