import { scrapeAllAnnouncements, type OperatorScanReport } from "@/lib/agents/announcements-agent";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

/**
 * PAYLAŞIMLI CANLI TARAMA ÖNBELLEĞİ
 *
 * İstemci endpoint'i (/api/announcements) ve gece cron'u
 * (/api/cron/scan-announcements) AYNI önbelleği kullanır; cron zorla
 * tazeleyerek gün içindeki kullanıcı isteklerinin hızlı dönmesini sağlar.
 */

export interface LiveScanCache {
  at: number;
  snapshots: { operator: string; announcements: OperatorAnnouncement[] }[];
  failures: { operator: string; error: string }[];
  coverage: OperatorScanReport[];
}

/** Canlı tarama önbelleği — her istemci isteğinde siteleri yormamak için 10 dk */
const LIVE_SCAN_TTL_MS = 10 * 60 * 1000;
let liveScanCache: LiveScanCache | null = null;

export async function getLiveScan(opts?: { force?: boolean }): Promise<LiveScanCache | null> {
  if (!opts?.force && liveScanCache && Date.now() - liveScanCache.at < LIVE_SCAN_TTL_MS) {
    return liveScanCache;
  }
  try {
    const { snapshots, failures, coverage } = await scrapeAllAnnouncements();
    liveScanCache = { at: Date.now(), snapshots, failures, coverage };
    return liveScanCache;
  } catch {
    // Tümden başarısız: çağıran taraf snapshot'a düşer
    return null;
  }
}
