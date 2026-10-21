import { NextResponse } from "next/server";
import { getLiveOrOfficialSchedules } from "@/lib/agents/timetable-engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/schedules?date=YYYY-MM-DD
 * Seçili İstanbul takvim gününün tarifesini döner.
 * Tarih verilmezse bugün; geçersiz/geçmiş tarih bugüne düşer.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateIso = searchParams.get("date") ?? undefined;

  try {
    const data = await getLiveOrOfficialSchedules({ dateIso });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("Schedules API error:", error);
    return NextResponse.json(
      { error: "Tarife verisi alınamadı." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
