import { NextResponse } from "next/server";
import { getStoredAnnouncements } from "@/lib/agents/data-snapshot-store";
import { matchAnnouncementsToTrips } from "@/lib/agents/announcement-trip-matcher";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * İstemci duyuru endpoint'i:
 * Uygulamada saklanan (resmi kaynaktan canlı çekilmiş) duyuruları ve bunların
 * sefer kartlarıyla eşleşmiş bozulma (iptal/gecikme/ek sefer) durumunu döner.
 */
export async function GET() {
  try {
    const announcements = getStoredAnnouncements();
    const disruptions = matchAnnouncementsToTrips(announcements);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      announcements,
      disruptions,
      meta: {
        announcementCount: announcements.length,
        disruptionCount: disruptions.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Duyuru verisi okunamadı" },
      { status: 500 }
    );
  }
}
