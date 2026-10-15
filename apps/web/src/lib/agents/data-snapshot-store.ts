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

export interface AnnouncementsSnapshotFile {
  generatedAt: string;
  failures?: { operator: string; error: string }[];
  sources: {
    operator: string;
    fetchedAt: string;
    sourceUrl: string;
    announcements: OperatorAnnouncement[];
  }[];
}

// Next.js JSON import — tip güvenli cast
 
const announcementsRaw = require("./data-snapshots/announcements.json") as AnnouncementsSnapshotFile;

export function getStoredAnnouncements(): OperatorAnnouncement[] {
  const out: OperatorAnnouncement[] = [];
  for (const s of announcementsRaw?.sources ?? []) {
    for (const a of s.announcements ?? []) {
      out.push(a);
    }
  }
  return out;
}

export function getStoredAnnouncementsMeta() {
  return {
    generatedAt: announcementsRaw?.generatedAt,
    sourceCount: (announcementsRaw?.sources ?? []).length,
  };
}

export function getStoredAnnouncementCountByOperator(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of announcementsRaw?.sources ?? []) {
    counts[s.operator] = (s.announcements ?? []).length;
  }
  return counts;
}
