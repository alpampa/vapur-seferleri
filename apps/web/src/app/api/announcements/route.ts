import { NextResponse } from "next/server";
import { getStoredAnnouncements, getStoredAnnouncementsMeta } from "@/lib/agents/data-snapshot-store";
import { OPERATOR_SCAN_COVERAGE, type OperatorScanReport } from "@/lib/agents/announcements-agent";
import { getLiveScan } from "@/lib/agents/live-scan-cache";
import { matchAnnouncementsToTrips } from "@/lib/agents/announcement-trip-matcher";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * İSTEMCİ DUYURU ENDPOINT'İ — ANLIK ÇOK-FİRMALI İPTAL TARAMASI
 *
 * KULLANICI KURALI: İptal duyuruları tüm firmaların resmi ekranlarında yayınlanır;
 * bu yüzden uç nokta HER firmayı anlık tarar. Canlı tarama başarılıysa firmanın
 * GÜNCEL duyuruları kullanılır; bir firma alınamazsa o firma için son doğrulanmış
 * snapshot korunur (veri asla sessizce kaybolmaz, uydurma üretilmez).
 * Tarama önbelleği paylaşımlıdır (bkz. live-scan-cache): gece cron'u da aynı
 * önbelleği tazeler.
 */

export async function GET() {
  try {
    const live = await getLiveScan();

    // Firma bazlı birleştirme: canlı taranan firma → canlı veri;
    // taranamayan firma → son doğrulanmış snapshot (varsa).
    const storedByOperator = new Map<string, OperatorAnnouncement[]>();
    for (const a of getStoredAnnouncements()) {
      const list = storedByOperator.get(a.operator) ?? [];
      list.push(a);
      storedByOperator.set(a.operator, list);
    }

    const useLive = new Map<string, OperatorAnnouncement[]>();
    for (const s of live?.snapshots ?? []) {
      useLive.set(s.operator, s.announcements);
    }

    const coverage: (OperatorScanReport & { usedFallback?: boolean })[] = [];
    const rawAnnouncements: OperatorAnnouncement[] = [];

    for (const entry of OPERATOR_SCAN_COVERAGE) {
      if (!entry.hasSource) {
        coverage.push({ operator: entry.operator, status: "NO_SOURCE", note: entry.note });
        continue;
      }
      const liveReport = live?.coverage.find((c) => c.operator === entry.operator);
      const liveAnnouncements = useLive.get(entry.operator);
      if (liveReport?.status === "SCANNED" && liveAnnouncements) {
        coverage.push(liveReport);
        rawAnnouncements.push(...liveAnnouncements);
        continue;
      }
      // Canlı tarama başarısız → son doğrulanmış snapshot korunur
      const stored = storedByOperator.get(entry.operator);
      if (stored && stored.length > 0) {
        coverage.push({
          operator: entry.operator,
          status: liveReport?.status === "FAILED" ? "FAILED" : "SCANNED",
          url: entry.url,
          error: liveReport?.error,
          announcementCount: stored.length,
          usedFallback: true,
          note: "Canlı tarama alınamadı; son doğrulanmış snapshot kullanıldı.",
        });
        rawAnnouncements.push(...stored);
      } else {
        coverage.push(
          liveReport ?? {
            operator: entry.operator,
            status: "FAILED",
            url: entry.url,
            error: "Canlı tarama alınamadı ve snapshot bulunamadı.",
          }
        );
      }
    }

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

    const storedMeta = getStoredAnnouncementsMeta();

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      announcements,
      disruptions,
      meta: {
        announcementCount: announcements.length,
        disruptionCount: disruptions.length,
        liveScanAt: live ? new Date(live.at).toISOString() : null,
        storedSnapshotGeneratedAt: storedMeta.generatedAt ?? null,
        coverage,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Duyuru verisi okunamadı" },
      { status: 500 }
    );
  }
}
