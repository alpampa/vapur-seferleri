import { NextResponse } from "next/server";
import { getStoredAnnouncements, getStoredAnnouncementsMeta } from "@/lib/agents/data-snapshot-store";
import { OPERATOR_SCAN_COVERAGE, type OperatorScanReport } from "@/lib/agents/announcements-agent";
import { getLiveScan } from "@/lib/agents/live-scan-cache";
import { matchAnnouncementsToTrips } from "@/lib/agents/announcement-trip-matcher";
import { getMonitorState } from "@/lib/agents/announcement-monitor";
import { isAnnouncementCurrent } from "@/lib/utils/announcement-filter";
import type {
  DisruptionFreshness,
  OperatorAnnouncement,
} from "@/lib/types/announcement";

export const dynamic = "force-dynamic";
export const revalidate = 0;
/** Yedek canlı tarama (WAF/proxy denemeleri) 10 sn'lik varsayılanı aşabilir. */
export const maxDuration = 60;

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
    const monitor = await getMonitorState();
    const archive = monitor.archives;
    const healthByOperator = new Map(monitor.health.map((h) => [h.operator, h]));

    // Tüm kaynaklı firmalar için SON 2 DAKİKA içinde doğrulanmış arşiv varsa
    // canlı tarama ATLANIR (dakikalık cron zaten tazeliyor). Arşiv eskiyse
    // (Hobby'de dakikalık cron yok) canlı tarama yapılır: yeni iptal en geç
    // birkaç dakika içinde ekrana yansır.
    const isHealthFresh = (operator: string): boolean => {
      const h = healthByOperator.get(operator);
      if (h?.status !== "OK") return false;
      const checked = Date.parse(h.lastCheckedAt);
      return !Number.isNaN(checked) && Date.now() - checked < 2 * 60 * 1000;
    };
    const sourceEntries = OPERATOR_SCAN_COVERAGE.filter((e) => e.hasSource);
    const archiveCoversAll =
      sourceEntries.length > 0 &&
      sourceEntries.every((e) => archive.has(e.operator) && isHealthFresh(e.operator));
    const live = archiveCoversAll ? null : await getLiveScan();

    // Firma bazlı birleştirme önceliği:
    //   1) Dakikalık izlemenin kalıcı arşivi (kaynak son turda OK ise)
    //   2) Bu örnekteki canlı tarama (in-memory, 10 dk önbellek)
    //   3) Son doğrulanmış git snapshot'ı (bayat olabilir)
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
      const health = healthByOperator.get(entry.operator);
      const archived = archive.get(entry.operator);
      const liveReport = live?.coverage.find((c) => c.operator === entry.operator);
      const liveAnnouncements = useLive.get(entry.operator);

      // 1) İzleme arşivi + kaynak sağlığı OK; canlı tarama yoksa veya arşiv
      //    tazeyse → paylaşımlı, dakikalık veri.
      if (archived && health?.status === "OK" && (!live || isHealthFresh(entry.operator))) {
        coverage.push({
          operator: entry.operator,
          status: "SCANNED",
          url: archived.sourceUrl,
          announcementCount: archived.announcements.length,
          note: `Dakikalık izleme arşivi (son doğrulama: ${archived.fetchedAt}).`,
        });
        rawAnnouncements.push(...archived.announcements);
        continue;
      }

      // 2) Bu örnekteki canlı tarama
      if (liveReport?.status === "SCANNED" && liveAnnouncements) {
        coverage.push(liveReport);
        rawAnnouncements.push(...liveAnnouncements);
        continue;
      }

      // 3) Son doğrulanmış veri (arşiv bayat olabilir → usedFallback)
      const fallbackList = archived?.announcements ?? storedByOperator.get(entry.operator);
      if (fallbackList && fallbackList.length > 0) {
        coverage.push({
          operator: entry.operator,
          status: liveReport?.status === "FAILED" ? "FAILED" : "SCANNED",
          url: entry.url,
          error: liveReport?.error,
          announcementCount: fallbackList.length,
          usedFallback: true,
          note: archived
            ? "Kaynak bu turda doğrulanamadı; dakikalık izleme arşivi (son bilinen) kullanıldı."
            : "Canlı tarama alınamadı; son doğrulanmış snapshot kullanıldı.",
        });
        rawAnnouncements.push(...fallbackList);
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

    // Kaynak sağlığı (kalıcı izleme turundan) + tazelik.
    // Kaynağı bu turda doğrulanamayan firmanın iptali "STALE" olarak işaretlenir;
    // yolcuya kesin güncel bilgi gibi sunulmaz.
    const fallbackOperators = new Set(
      coverage.filter((c) => c.usedFallback).map((c) => c.operator)
    );
    const freshnessFor = (operator: string): DisruptionFreshness => {
      const health = healthByOperator.get(operator);
      if (fallbackOperators.has(operator) || health?.status === "UNREACHABLE") return "STALE";
      if (health?.status === "OK") return "FRESH";
      return "UNKNOWN";
    };

    const disruptions = matchAnnouncementsToTrips(announcements)
      .filter((d) => d.kind === "CANCELLED")
      .map((d) => ({ ...d, freshness: freshnessFor(d.operator) }));

    const storedMeta = getStoredAnnouncementsMeta();

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      announcements,
      disruptions,
      sourceHealth: monitor.health,
      recentChanges: monitor.recentChanges.slice(0, 50),
      meta: {
        announcementCount: announcements.length,
        disruptionCount: disruptions.length,
        liveScanAt: live ? new Date(live.at).toISOString() : null,
        storedSnapshotGeneratedAt: storedMeta.generatedAt ?? null,
        coverage,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Duyuru verisi okunamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
