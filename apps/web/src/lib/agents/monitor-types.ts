/**
 * İPTAL İZLEME AJANI — TİP MODELİ
 *
 * Dakikalık izleme çekirdeğinin ürettiği kalıcı veri tipleri:
 * firma sağlığı, değişiklik geçmişi, arşiv ve tur raporu.
 *
 * Bu tipler UI, API ve cron uçları arasında tek sözleşmedir.
 */

import type { OperatorAnnouncement } from "@/lib/types/announcement";

/** Bir firmanın kaynak erişim sağlığı */
export type OperatorHealthStatus =
  | "OK"            // kaynak bu turda canlı okundu
  | "DEGRADED"      // okundu ama tekrarlı gecikme/hata eğilimi
  | "UNREACHABLE"   // kaynağa erişilemedi (ağ/WAF/5xx/timeout)
  | "NO_SOURCE";    // resmî makine-okunur kaynak yok (kanıtlı)

export interface OperatorHealth {
  operator: string;
  status: OperatorHealthStatus;
  sourceUrl?: string;
  /** son tur zamanı (ISO) */
  lastCheckedAt: string;
  /** son başarılı okuma (ISO) */
  lastOkAt?: string;
  /** üst üste başarısız tur sayısı */
  consecutiveFailures: number;
  lastError?: string;
  /** backoff nedeniyle bir sonraki denemenin başlayacağı zaman (ISO) */
  backoffUntil?: string;
  /** son okunan duyuru sayısı */
  announcementCount: number;
  /** son tur gecikmesi (ms) */
  latencyMs?: number;
  note?: string;
}

/** Değişiklik geçmişi olay tipi */
export type ChangeEventType =
  | "ANNOUNCED"           // yeni iptal/duyuru yayınlandı
  | "UPDATED"             // mevcut duyuru metni değişti
  | "REMOVED"             // duyuru kaynaktan kaldırıldı
  | "CANCELLATION_REMOVED" // iptal duyurusu kaldırıldı (sefer yeniden işliyor olabilir)
  | "RECOVERED"           // kaynak yeniden erişilebilir oldu
  | "UNREACHABLE";        // kaynağa erişilemedi

export interface ChangeEvent {
  id: string;
  at: string;
  operator: string;
  type: ChangeEventType;
  announcementId?: string;
  title?: string;
  detail: string;
}

/** Tek firmanın bir turdaki tarama sonucu */
export interface OperatorTickReport {
  operator: string;
  status: OperatorHealthStatus;
  scanned: boolean;
  announcementCount: number;
  latencyMs?: number;
  error?: string;
  /** backoff aktif olduğu için bu turda taranmadı mı? */
  skipped?: boolean;
}

/** Dakikalık tur özeti (ölçülmüş istatistikler) */
export interface MonitorTickResult {
  ok: boolean;
  trigger: "cron" | "manual" | "test";
  triggeredAt: string;
  durationMs: number;
  /** kaç firma için kontrol DENENDİ (tetiklenme sayısı DEĞİL) */
  checksAttempted: number;
  /** kaç firma için kontrol BAŞARILI oldu */
  checksSucceeded: number;
  /** kaç firma için kontrol BAŞARISIZ oldu */
  checksFailed: number;
  /** kaynağı olmadığı için atlanan firma sayısı */
  noSource: number;
  /** backoff nedeniyle atlanan firma sayısı */
  skippedByBackoff: number;
  operators: OperatorTickReport[];
  changes: ChangeEvent[];
  /** kalıcı depo yazımı başarılı mı? */
  persisted: boolean;
  storage: "upstash" | "memory";
}

/** Sonraki tur diff'i için saklanan kompakt durum */
export interface MonitorPrevState {
  [operator: string]: {
    ids: string[];
    /** iptal tipi duyuru id'leri (CANCELLATION_REMOVED tespiti için) */
    cancelIds: string[];
    /** id → içerik özeti (UPDATED tespiti için) */
    hashes: Record<string, string>;
    checkedAt: string;
  };
}

/** Bir firmanın arşivlenmiş (son doğrulanmış) duyuru kümesi */
export interface OperatorArchive {
  operator: string;
  sourceUrl: string;
  fetchedAt: string;
  announcements: OperatorAnnouncement[];
}

/** Tek anahtarda tutulan kalıcı izleme durumu (KV yazımını en aza indirir) */
export interface MonitorPersistedState {
  updatedAt: string;
  health: Record<string, OperatorHealth>;
  prev: MonitorPrevState;
  history: ChangeEvent[];
  last: MonitorTickResult | null;
  /** firma → son doğrulanmış duyuru arşivi (değiştiğinde güncellenir) */
  archives: Record<string, OperatorArchive>;
}
