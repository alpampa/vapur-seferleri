import { NextResponse } from "next/server";
import { runDailyVerificationAudit, OFFICIAL_OPERATOR_CRAWLERS } from "@/lib/agents/daily-sync-job";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auditLogs = await runDailyVerificationAudit();
    const allCompliant = auditLogs.every(log => log.isCompliant);

    return NextResponse.json({
      status: allCompliant ? "OK" : "WARNING",
      auditTimestamp: new Date().toISOString(),
      policy: "STRICT_AUTHENTIC_ZERO_FABRICATED_DATA",
      operatorsMonitoredCount: OFFICIAL_OPERATOR_CRAWLERS.length,
      auditLogs
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: error?.message || "Sync execution failed" },
      { status: 500 }
    );
  }
}
