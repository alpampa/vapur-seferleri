import { NextResponse } from "next/server";
import { getTelemetrySummary } from "@/lib/services/passenger-analytics-service";

export const dynamic = "force-dynamic";

export async function GET() {
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
