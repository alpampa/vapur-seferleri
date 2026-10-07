import { NextResponse } from "next/server";
import { getStoredAnnouncements } from "@/lib/agents/data-snapshot-store";
import { matchAnnouncementsToTrips } from "@/lib/agents/announcement-trip-matcher";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";

export const dynamic = "force-dynamic";
export const revalidate = 300;

/**
 * İstemci duyuru endpoint'i:
 * Uygulamada saklanan (resmi kaynaktan canlı çekilmiş) duyuruları ve bunların
 * sefer kartlarıyla eşleşmiş bozulma (iptal/gecikme/ek sefer) durumunu döner.
 * Eski/tarihi geçmiş duyurular elenerek sadece güncel duyurular sunulur.
 */
export async function GET() {
  try {
    const rawAnnouncements = getStoredAnnouncements();
    // Eski veya süresi dolmuş duyuruları filtrele
    const announcements = rawAnnouncements.filter((a) => isAnnouncementCurrent(a));
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
