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
    // KULLANICI KURALI: Duyuru kısmında YALNIZCA güncel İPTAL sefer duyuruları gösterilir.
    // Tarife, tur, genel bilgilendirme vb. duyurular elenir.
    const announcements = rawAnnouncements.filter((a) => {
      if (!isAnnouncementCurrent(a)) return false;
      if (a.type !== "CANCELLATION" && a.type !== "CANCELLED_TRIPS") return false;
      const text = `${a.title || ""} ${a.body || ""}`.toLocaleLowerCase("tr-TR");
      if (text.includes("bulunmamaktadır") || text.includes("bulunmamaktadir")) return false;
      return text.includes("iptal") || text.includes("yapılamamakta") || text.includes("yapilamamakta");
    });
    const disruptions = matchAnnouncementsToTrips(announcements).filter(
      (d) => d.kind === "CANCELLED"
    );

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
