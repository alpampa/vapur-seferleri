/**
 * AJAN SNAPSHOT DEPOSU
 *
 * Ajanların ürettiği "son doğrulanmış" veri ve ayak izlerini saklar.
 * - `announcements.json`        → canlı çekilen duyurular (resmi kaynak)
 * - `dentur-fingerprint.json`   → Dentur tarife değişikliği tespiti için ayak izi
 * - `sehirhatlari-fingerprint.json` → Şehir Hatları duyuru sayfası ayak izi
 *
 * Bu katman veri üretmez; dosyalar yalnızca ajan senkronu tarafından
 * yazılır (canlı sayfa + git commit). Runtime bunları okur.
 */

import type { OperatorAnnouncement } from "@/lib/types/announcement";
import type { OperatorScanReport } from "@/lib/agents/announcements-agent";
import { toTrDate } from "@/lib/utils/istanbul-date";

export interface AnnouncementSourceStatus {
  operator: string;
  status: "SCANNED" | "NO_SOURCE" | "FAILED";
  url?: string;
  fetchedAt?: string;
  announcementCount?: number;
  note?: string;
  error?: string;
}

export interface AnnouncementsSnapshotFile {
  generatedAt: string;
  failures?: { operator: string; error: string }[];
  /** Son senkronun firma-bazlı tarama raporu (kaynağı olmayanlar dahil) */
  coverage?: OperatorScanReport[];
  sources: {
    operator: string;
    fetchedAt: string;
    sourceUrl: string;
    announcements: OperatorAnnouncement[];
  }[];
}

// Next.js JSON import — tip güvenli cast
 
const announcementsRaw = require("./data-snapshots/announcements.json") as AnnouncementsSnapshotFile;

/**
 * Commit'li snapshot'ın ÜRETİM GÜNÜ (GG.AA.YYYY). Tarihsiz kayıtlar bu güne
 * damgalanır; böylece snapshot eskiyse iptaller ertesi gün kendiliğinden
 * elenir (KULLANICI KURALI: iptal yalnızca yayınlandığı gün geçerlidir).
 * Eskiden tarihsiz kayıtlar "güncel" sayılıyordu → bayat iptal gösteriliyordu.
 */
function snapshotDate(): string | undefined {
  const generatedAt = announcementsRaw?.generatedAt;
  if (!generatedAt) return undefined;
  const ms = Date.parse(generatedAt);
  return Number.isNaN(ms) ? undefined : toTrDate(ms);
}

export function getStoredAnnouncements(): OperatorAnnouncement[] {
  const fallbackDate = snapshotDate();
  const out: OperatorAnnouncement[] = [];
  for (const s of announcementsRaw?.sources ?? []) {
    for (const a of s.announcements ?? []) {
      if (a.publishedAt || !fallbackDate) {
        out.push(a);
      } else {
        out.push({ ...a, publishedAt: fallbackDate, publishedAtSource: "SCAN_DAY" });
      }
    }
  }
  return out;
}

/**
 * Kaynak bazlı son kontrol durumu.
 *
 * `coverage` firma bazlı tarama sonucunu (SCANNED / NO_SOURCE / FAILED) taşır.
 * `sources` ise yalnızca okunabilen kaynakların gerçek `fetchedAt` damgasını
 * taşır. İkisi birleştirilir; bilinmeyen zaman uydurulmaz (undefined kalır).
 */
export function getStoredAnnouncementsSourceStatus(): AnnouncementSourceStatus[] {
  const fetchedAtByOperator = new Map<string, string>();
  const announcementCountByOperator = new Map<string, number>();
  for (const s of announcementsRaw?.sources ?? []) {
    fetchedAtByOperator.set(s.operator, s.fetchedAt);
    announcementCountByOperator.set(s.operator, (s.announcements ?? []).length);
  }

  const coverage = announcementsRaw?.coverage ?? [];
  if (coverage.length === 0) {
    return Array.from(fetchedAtByOperator.entries()).map(([operator, fetchedAt]) => ({
      operator,
      status: "SCANNED" as const,
      fetchedAt,
      announcementCount: announcementCountByOperator.get(operator) ?? 0,
    }));
  }

  return coverage.map((item) => ({
    operator: item.operator,
    status: item.status,
    url: item.url,
    fetchedAt: item.status === "SCANNED" ? fetchedAtByOperator.get(item.operator) : undefined,
    announcementCount:
      item.announcementCount ?? announcementCountByOperator.get(item.operator),
    note: item.note,
    error: item.error,
  }));
}

export function getStoredAnnouncementsMeta() {
  return {
    generatedAt: announcementsRaw?.generatedAt,
    sourceCount: (announcementsRaw?.sources ?? []).length,
    sourceStatus: getStoredAnnouncementsSourceStatus(),
  };
}

export function getStoredAnnouncementCountByOperator(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of announcementsRaw?.sources ?? []) {
    counts[s.operator] = (s.announcements ?? []).length;
  }
  return counts;
}
