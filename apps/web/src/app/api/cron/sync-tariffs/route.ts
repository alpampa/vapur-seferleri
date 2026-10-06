import { NextRequest, NextResponse } from "next/server";
import { runNightlyTariffSync } from "@/lib/agents/daily-sync-job";
import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";

export const dynamic = "force-dynamic";

/**
 * GECESİ 23:00 SENKRON ENDPOINT'İ (İstanbul saati).
 * GitHub Actions workflow'u (nightly-tariff-sync.yml) 20:00 UTC = 23:00 İstanbul'da tetikler.
 * Dentur tarifesini + tüm duyuruları canlı çeker, diff yapar, değişikliği raporlar.
 */
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get("user-agent")?.includes("vercel-cron");

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
      isVercelCron: Boolean(isVercelCron),
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
