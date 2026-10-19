import { NextRequest, NextResponse } from "next/server";
import { runNightlyTariffSync } from "@/lib/agents/daily-sync-job";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import { verifyCronAuth } from "@/lib/utils/cron-auth";

export const dynamic = "force-dynamic";

/**
 * GECESİ 23:00 SENKRON ENDPOINT'İ (İstanbul saati).
 * GitHub Actions workflow'u (nightly-tariff-sync.yml) senkronu kendi içinde çalıştırır;
 * bu uç nokta el ile/otomasyon tetiklemesi içindir.
 * GÜVENLİK: `CRON_SECRET` bearer jetonu zorunlu (User-Agent taklidiyle atlatma yok).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid authorization token" },
      { status: 401 }
    );
  }

  const authenticatedBySecret = Boolean(
    process.env.CRON_SECRET && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );

  const now = new Date();
  const istanbulTimeStr = now.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour12: false });
  const istanbulDateStr = now.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });

  try {
    const result = await runNightlyTariffSync();
    const verifiedTripCount = OFFICIAL_SCHEDULES_DATA.length;

    return NextResponse.json({
      success: true,
      job: "GECELIK_23_00_RESMI_TARIFE_VE_DUYURU_SENKRON_AJANI",
      executionTimestamp: now.toISOString(),
      istanbulTime: `${istanbulDateStr} ${istanbulTimeStr}`,
      isVercelCron: authenticatedBySecret,
      verifiedOfficialTrips: verifiedTripCount,
      summary: result.summary,
      reports: result.reports,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        job: "GECELIK_23_00_RESMI_TARIFE_VE_DUYURU_SENKRON_AJANI",
        error: error?.message || "Sync failed",
        timestamp: now.toISOString(),
      },
      { status: 500 }
    );
  }
}
