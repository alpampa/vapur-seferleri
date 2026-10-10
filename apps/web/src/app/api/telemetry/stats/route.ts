import { NextRequest, NextResponse } from "next/server";
import { getTelemetrySummary } from "@/lib/services/passenger-analytics-service";
import { verifyAdminAuth } from "@/lib/utils/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access key required" },
      { status: 401 }
    );
  }

  try {
    const stats = getTelemetrySummary();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Telemetry stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
