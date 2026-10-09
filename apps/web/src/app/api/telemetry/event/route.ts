import { NextRequest, NextResponse } from "next/server";
import { recordTelemetryEvent } from "@/lib/services/passenger-analytics-service";
import { TelemetryEventPayload } from "@/lib/types/analytics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TelemetryEventPayload;

    if (!body || !body.eventType) {
      return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
    }

    const summary = recordTelemetryEvent(body);

    return NextResponse.json(
      {
        success: true,
        eventType: body.eventType,
        totalConfirmedOnboard: summary.totalConfirmedOnboard,
        totalGpsUnderway: summary.totalGpsUnderway
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    console.error("Telemetry event record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
