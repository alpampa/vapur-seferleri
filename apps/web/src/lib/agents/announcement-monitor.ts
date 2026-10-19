/**
 * İPTAL İZLEME AJANI — DAKİKALIK ÇEKİRDEK
 *
 * Her turda (cron: her dakika) tüm firmaların resmî kaynaklarını tarar,
 * önceki turla FARKI çıkarır, değişiklik geçmişini ve firma sağlığını
 * kalıcı depoya yazar.
 *
 * GÜVENİLİRLİK İLKELERİ:
 *  - Tetiklenme sayısı ≠ başarılı kontrol sayısı → ikisi ayrı ölçülür.
 *  - Kaynağa erişilemezse önceki arşiv KORUNUR; sağlık UNREACHABLE olur ve
 *    kullanıcıya "doğrulanamadı" bilgisi taşınır. Sessizce iptal gösterilmez.
 *  - Başarısız kaynak için üstel backoff uygulanır (resmî siteleri yormamak).
 *  - Hiçbir veri üretilmez; yalnızca gerçek kaynak çıktısı işlenir.
 *
 * DEPOLAMA VERİMLİLİĞİ (Upstash/Vercel KV):
 *  - Sağlık + önceki durum + geçmiş + son tur TEK anahtarda tutulur → tur
 *    başına 1 yazma.
 *  - Duyuru arşivi yalnızca içerik DEĞİŞTİĞİNDE yazılır → gereksiz yazma yok.
 */

import {
  ANNOUNCEMENT_SOURCES,
  OPERATOR_SCAN_COVERAGE,
  scrapeAllAnnouncements,
  type OperatorScanReport,
} from "@/lib/agents/announcements-agent";
import { isKvConfigured, kvBackendName, kvGetJson, kvSetJson } from "@/lib/agents/kv-store";
import type { OperatorAnnouncement } from "@/lib/types/announcement";
import type {
  ChangeEvent,
  MonitorPersistedState,
  MonitorPrevState,
  MonitorTickResult,
  OperatorArchive,
  OperatorHealth,
  OperatorHealthStatus,
  OperatorTickReport,
} from "@/lib/agents/monitor-types";

export const MONITOR_INTERVAL_MS = 60_000;
const HISTORY_LIMIT = 200;
const BACKOFF_BASE_MS = 60_000;
const BACKOFF_MAX_MS = 15 * 60_000;

const KEYS = {
  state: "vapur:monitor:state",
};

function toTrDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function emptyState(): MonitorPersistedState {
  return { updatedAt: "", health: {}, prev: {}, history: [], last: null, archives: {} };
}

/** Duyuru içeriğinin deterministik özeti (UPDATED tespiti için) */
export function announcementHash(a: Pick<OperatorAnnouncement, "title" | "body">): string {
  const text = `${a.title ?? ""}|${a.body ?? ""}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function isCancellationType(type: OperatorAnnouncement["type"]): boolean {
  return type === "CANCELLATION" || type === "CANCELLED_TRIPS";
}

/**
 * Tarama günü damgalanan duyuruların tarihini bugüne taşır.
 * (Arşiv yeniden kullanıldığında geçerli iptalin "dün" sayılıp kaybolmasını
 * önler; kaynaktan gerçek tarih gelenlere DOKUNMAZ.)
 */
export function restampSyntheticDates(
  announcements: OperatorAnnouncement[],
  today: string = toTrDate(new Date())
): OperatorAnnouncement[] {
  return announcements.map((a) =>
    a.publishedAtSource === "SCAN_DAY" ? { ...a, publishedAt: today } : a
  );
}

/**
 * Önceki tur ile mevcut duyuru kümesinin farkını çıkarır (saf fonksiyon).
 * Yeni → ANNOUNCED, metin değişimi → UPDATED, kalkan → REMOVED,
 * kalkan iptal duyurusu → CANCELLATION_REMOVED.
 */
export function diffAnnouncementSets(
  operator: string,
  prev: MonitorPrevState[string] | undefined,
  current: OperatorAnnouncement[],
  at: string
): ChangeEvent[] {
  const events: ChangeEvent[] = [];
  const prevHashes = prev?.hashes ?? {};
  const prevIds = new Set(Object.keys(prevHashes));
  const currentIds = new Set(current.map((a) => a.id));
  const prevCancelIds = new Set(prev?.cancelIds ?? []);

  for (const a of current) {
    const hash = announcementHash(a);
    if (!prevIds.has(a.id)) {
      events.push({
        id: `${operator}-${a.id}-announced-${at}`,
        at,
        operator,
        type: "ANNOUNCED",
        announcementId: a.id,
        title: a.title,
        detail: isCancellationType(a.type)
          ? "Yeni iptal duyurusu yayınlandı."
          : "Yeni duyuru yayınlandı.",
      });
    } else if (prevHashes[a.id] !== hash) {
      events.push({
        id: `${operator}-${a.id}-updated-${at}`,
        at,
        operator,
        type: "UPDATED",
        announcementId: a.id,
        title: a.title,
        detail: "Duyuru metni güncellendi.",
      });
    }
  }

  for (const id of prevIds) {
    if (currentIds.has(id)) continue;
    const wasCancellation = prevCancelIds.has(id);
    events.push({
      id: `${operator}-${id}-removed-${at}`,
      at,
      operator,
      type: wasCancellation ? "CANCELLATION_REMOVED" : "REMOVED",
      announcementId: id,
      detail: wasCancellation
        ? "İptal duyurusu kaynaktan kaldırıldı (sefer yeniden işliyor olabilir)."
        : "Duyuru kaynaktan kaldırıldı.",
    });
  }

  return events;
}

export function buildPrevEntry(
  current: OperatorAnnouncement[],
  at: string
): MonitorPrevState[string] {
  const hashes: Record<string, string> = {};
  const cancelIds: string[] = [];
  for (const a of current) {
    hashes[a.id] = announcementHash(a);
    if (isCancellationType(a.type)) cancelIds.push(a.id);
  }
  return { ids: current.map((a) => a.id), cancelIds, hashes, checkedAt: at };
}

interface HealthOutcomeInput {
  operator: string;
  status: OperatorHealthStatus;
  now: Date;
  sourceUrl?: string;
  announcementCount?: number;
  latencyMs?: number;
  error?: string;
  note?: string;
}

/** Health kaydını tur sonucuna göre günceller (saf fonksiyon). */
export function applyHealthOutcome(
  prev: OperatorHealth | undefined,
  input: HealthOutcomeInput
): OperatorHealth {
  const at = input.now.toISOString();
  const base: OperatorHealth = {
    operator: input.operator,
    status: input.status,
    sourceUrl: input.sourceUrl ?? prev?.sourceUrl,
    lastCheckedAt: at,
    lastOkAt: prev?.lastOkAt,
    consecutiveFailures: prev?.consecutiveFailures ?? 0,
    lastError: prev?.lastError,
    backoffUntil: prev?.backoffUntil,
    announcementCount: prev?.announcementCount ?? 0,
    latencyMs: input.latencyMs ?? prev?.latencyMs,
    note: input.note ?? prev?.note,
  };

  if (input.status === "OK" || input.status === "NO_SOURCE") {
    return {
      ...base,
      status: input.status,
      lastOkAt: input.status === "OK" ? at : prev?.lastOkAt,
      consecutiveFailures: 0,
      lastError: undefined,
      backoffUntil: undefined,
      announcementCount: input.announcementCount ?? prev?.announcementCount ?? 0,
      latencyMs: input.latencyMs ?? prev?.latencyMs,
      note: input.note ?? prev?.note,
    };
  }

  const failures = (prev?.consecutiveFailures ?? 0) + 1;
  const backoffMs = Math.min(BACKOFF_BASE_MS * 2 ** (failures - 1), BACKOFF_MAX_MS);
  return {
    ...base,
    status: input.status,
    consecutiveFailures: failures,
    lastError: input.error,
    backoffUntil: new Date(input.now.getTime() + backoffMs).toISOString(),
    announcementCount: input.announcementCount ?? prev?.announcementCount ?? 0,
    note: input.note ?? prev?.note,
  };
}

function statusTransitionEvents(
  operator: string,
  prev: OperatorHealth | undefined,
  next: OperatorHealth,
  at: string
): ChangeEvent[] {
  const events: ChangeEvent[] = [];
  const wasDown = prev?.status === "UNREACHABLE";
  if (next.status === "UNREACHABLE" && !wasDown) {
    events.push({
      id: `${operator}-unreachable-${at}`,
      at,
      operator,
      type: "UNREACHABLE",
      detail: "Kaynağa erişilemedi; son doğrulanmış veri korunuyor.",
    });
  }
  if (next.status === "OK" && wasDown) {
    events.push({
      id: `${operator}-recovered-${at}`,
      at,
      operator,
      type: "RECOVERED",
      detail: "Kaynak yeniden erişilebilir; canlı doğrulama sürüyor.",
    });
  }
  return events;
}

function isBackoffActive(health: OperatorHealth | undefined, now: Date): boolean {
  if (!health?.backoffUntil) return false;
  return Date.parse(health.backoffUntil) > now.getTime();
}

async function readState(): Promise<MonitorPersistedState> {
  return (await kvGetJson<MonitorPersistedState>(KEYS.state)) ?? emptyState();
}

/**
 * TEK TUR: canlı tarama → diff → sağlık → kalıcı yazım.
 * `operators` verilirse yalnız o firmalar taranır (backoff uygulaması için).
 */
export async function runMonitorTick(opts: {
  trigger?: "cron" | "manual" | "test";
  now?: Date;
  operators?: string[];
} = {}): Promise<MonitorTickResult> {
  const trigger = opts.trigger ?? "manual";
  const now = opts.now ?? new Date();
  const at = now.toISOString();
  const started = Date.now();

  const state = await readState();
  const healthMap = state.health;

  const sourceOperators = ANNOUNCEMENT_SOURCES.map((s) => s.operator);
  const requested = opts.operators ?? sourceOperators;
  const requestedSet = new Set(requested);

  const dueOperators: string[] = [];
  const skipped: OperatorTickReport[] = [];
  for (const op of sourceOperators) {
    if (!requestedSet.has(op)) continue;
    if (isBackoffActive(healthMap[op], now)) {
      skipped.push({
        operator: op,
        status: healthMap[op].status,
        scanned: false,
        announcementCount: healthMap[op].announcementCount,
        skipped: true,
      });
      continue;
    }
    dueOperators.push(op);
  }

  let coverage: OperatorScanReport[] = [];
  let snapshots: { operator: string; announcements: OperatorAnnouncement[] }[] = [];
  let scanFailed = false;
  if (dueOperators.length > 0) {
    try {
      const result = await scrapeAllAnnouncements({ operators: dueOperators });
      coverage = result.coverage;
      snapshots = result.snapshots;
    } catch {
      scanFailed = true;
    }
  }

  const announcementsByOperator = new Map<string, OperatorAnnouncement[]>();
  for (const s of snapshots) announcementsByOperator.set(s.operator, s.announcements);
  const coverageByOperator = new Map(coverage.map((c) => [c.operator, c]));

  const nextHealth: Record<string, OperatorHealth> = { ...healthMap };
  const nextPrev: MonitorPrevState = { ...(state.prev ?? {}) };
  const nextArchives: Record<string, OperatorArchive> = { ...(state.archives ?? {}) };
  const changes: ChangeEvent[] = [];
  const operatorReports: OperatorTickReport[] = [];

  for (const op of dueOperators) {
    const report = coverageByOperator.get(op);
    const announcements = announcementsByOperator.get(op) ?? [];

    if (!report || report.status === "FAILED" || scanFailed) {
      const status: OperatorHealthStatus = "UNREACHABLE";
      const error =
        report?.error ?? (scanFailed ? "Tarama çalıştırılamadı" : "Tarama sonucu yok");
      const next = applyHealthOutcome(healthMap[op], {
        operator: op,
        status,
        now,
        sourceUrl: ANNOUNCEMENT_SOURCES.find((s) => s.operator === op)?.url,
        error,
      });
      nextHealth[op] = next;
      changes.push(...statusTransitionEvents(op, healthMap[op], next, at));
      operatorReports.push({
        operator: op,
        status,
        scanned: false,
        announcementCount: next.announcementCount,
        error,
      });
      continue;
    }

    const next = applyHealthOutcome(healthMap[op], {
      operator: op,
      status: "OK",
      now,
      sourceUrl: report.url,
      announcementCount: announcements.length,
      latencyMs: report.latencyMs,
    });
    nextHealth[op] = next;
    changes.push(...statusTransitionEvents(op, healthMap[op], next, at));

    const diff = diffAnnouncementSets(op, state.prev?.[op], announcements, at);
    changes.push(...diff);
    nextPrev[op] = buildPrevEntry(announcements, at);

    // Arşiv yalnızca ilk turda veya içerik değiştiğinde güncellenir.
    if (diff.length > 0 || !state.archives?.[op]) {
      nextArchives[op] = {
        operator: op,
        sourceUrl: report.url ?? "",
        fetchedAt: at,
        announcements,
      };
    }

    operatorReports.push({
      operator: op,
      status: "OK",
      scanned: true,
      announcementCount: announcements.length,
      latencyMs: report.latencyMs,
    });
  }

  for (const sk of skipped) operatorReports.push(sk);

  for (const entry of OPERATOR_SCAN_COVERAGE) {
    if (entry.hasSource) continue;
    const next = applyHealthOutcome(healthMap[entry.operator], {
      operator: entry.operator,
      status: "NO_SOURCE",
      now,
      note: entry.note,
    });
    nextHealth[entry.operator] = next;
    if (opts.operators && !requestedSet.has(entry.operator)) continue;
    operatorReports.push({
      operator: entry.operator,
      status: "NO_SOURCE",
      scanned: false,
      announcementCount: next.announcementCount,
    });
  }

  const attempted = dueOperators.length;
  const succeeded = operatorReports.filter((r) => r.status === "OK").length;
  const failed = operatorReports.filter((r) => r.status === "UNREACHABLE").length;
  const noSource = operatorReports.filter((r) => r.status === "NO_SOURCE").length;

  const result: MonitorTickResult = {
    ok: attempted === 0 ? true : succeeded > 0,
    trigger,
    triggeredAt: at,
    durationMs: Date.now() - started,
    checksAttempted: attempted,
    checksSucceeded: succeeded,
    checksFailed: failed,
    noSource,
    skippedByBackoff: skipped.length,
    operators: operatorReports,
    changes,
    persisted: false,
    storage: kvBackendName(),
  };

  const mergedHistory = [...changes, ...(state.history ?? [])].slice(0, HISTORY_LIMIT);
  // `last` aynı anahtarda saklandığı için bayrak YAZMADAN ÖNCE işaretlenir;
  // yazma başarısız olursa catch içinde false'a çekilir.
  result.persisted = true;
  const persistedState: MonitorPersistedState = {
    updatedAt: at,
    health: nextHealth,
    prev: nextPrev,
    history: mergedHistory,
    last: result,
    archives: nextArchives,
  };

  try {
    await kvSetJson(KEYS.state, persistedState);
  } catch {
    result.persisted = false;
  }

  return result;
}

export interface MonitorState {
  storage: "upstash" | "memory";
  health: OperatorHealth[];
  recentChanges: ChangeEvent[];
  lastTick: MonitorTickResult | null;
  archives: Map<string, OperatorArchive>;
}

/** API/UI için kalıcı izleme durumu (tek KV okuması) */
export async function getMonitorState(): Promise<MonitorState> {
  const state = await readState();
  const today = toTrDate(new Date());
  const archives = new Map<string, OperatorArchive>();
  for (const [op, archive] of Object.entries(state.archives ?? {})) {
    archives.set(op, {
      ...archive,
      announcements: restampSyntheticDates(archive.announcements ?? [], today),
    });
  }
  return {
    storage: kvBackendName(),
    health: Object.values(state.health ?? {}),
    recentChanges: state.history ?? [],
    lastTick: state.last ?? null,
    archives,
  };
}

/** Operatör adına göre sağlık kaydı */
export async function getOperatorHealthMap(): Promise<Record<string, OperatorHealth>> {
  return (await readState()).health ?? {};
}

/**
 * Son doğrulanmış duyuru arşivi (firma → arşiv).
 * Tarama günü damgalı duyuruların tarihi bugüne taşınır.
 */
export async function getArchivedAnnouncements(): Promise<Map<string, OperatorArchive>> {
  return (await getMonitorState()).archives;
}

export function isMonitorPersistent(): boolean {
  return isKvConfigured();
}
