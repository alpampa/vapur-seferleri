/**
 * GÜNLÜK SENKRON AJANI — ORKESTRASYON
 *
 * 23:00 İstanbul senkronunda çalışır (cron route) ve şunları yapar:
 *   1. Tüm operatör kaynaklarına erişim denetimi (HEAD)
 *   2. Dentur tarifesini CANLI çeker ve önceki snaphsotla karşılaştırır
 *      (tarife değişikliği algılama + hash diff)
 *   3. Duyuru sayfalarını canlı çeker, değişikliği raporlar
 *   4. Sonuçları raporlar (uygulama / yönetici tarafından okunur)
 *
 * ÖNEMLİ: Ajan veri ÜRETMEZ; yalnızca resmi kaynaklardan alıp doğrular.
 * Tarife/duyuru değişikliği algılandığında `changed: true` raporlanır ve
 * yeni snapshot repo'ya işlenir (commit edildiğinde uygulamaya yansır).
 */

import { OFFICIAL_SCHEDULES_DATA } from "@/lib/data/official-schedules";
import { OPERATOR_REGISTRY } from "@/lib/data/operator-registry";
import {
  scrapeAllDenturSchedules,
  DENTUR_LINE_ENDPOINTS,
} from "@/lib/agents/dentur-scraper";
import { scrapeAllAnnouncements } from "@/lib/agents/announcements-agent";
import { computeFingerprint, compareSnapshots, buildSnapshotState } from "@/lib/agents/scraper-agent";
import type { OperatorScraperConfig } from "./daily-sync-job-types";

export type { OperatorScraperConfig, ScraperAgentLog } from "./daily-sync-job-types";

export interface SyncChangeReport {
  operator: string;
  kind: "TARIFE" | "DUYURU" | "ERISIM";
  changed: boolean;
  detail: string;
  recordCounts?: { previous?: number; current?: number };
  checkedAt: string;
}

export async function runDailyVerificationAudit(): Promise<import("./daily-sync-job-types").ScraperAgentLog[]> {
  const nowStr = new Date().toISOString();
  const logs: import("./daily-sync-job-types").ScraperAgentLog[] = [];
  const totalVerifiedInDb = OFFICIAL_SCHEDULES_DATA.length;

  // Bu uygulamada gerçekten saklanan operatörler (resmi veriye dayalı)
  const storedByOperator: Record<string, number> = {};
  for (const t of OFFICIAL_SCHEDULES_DATA) {
    storedByOperator[t.operator] = (storedByOperator[t.operator] || 0) + 1;
  }

  for (const crawler of _crawlers()) {
    try {
      let isLive = false;
      try {
        const res = await fetch(crawler.officialWebsite, {
          method: "HEAD",
          next: { revalidate: 300 },
          headers: { "User-Agent": "Vapur-Sync-Agent/3.0" },
        });
        isLive = res.status >= 200 && res.status < 400;
      } catch {
        isLive = false;
      }

      const verifiedCount = storedByOperator[crawler.operatorName] ?? 0;

      logs.push({
        operator: crawler.operatorName,
        url: crawler.timetableEndpoint,
        lastChecked: nowStr,
        recordsVerified: verifiedCount,
        isCompliant: isLive,
        message: isLive
          ? verifiedCount > 0
            ? `Erişim OK (HTTP 2xx). Uygulamada ${verifiedCount} doğrulanmış sefer kayıtlı.`
            : `Erişim OK (HTTP 2xx). Ancak bu operatörün tarife verisi uygulamada saklanmıyor (${crawler.operatorName} veri durumu: kaynak yayınlanmıyor/görsel).`
          : `Erişim sağlanamadı (ağ hatası). Önbellekteki son veri korundu.`,
      });
    } catch (err: any) {
      logs.push({
        operator: crawler.operatorName,
        url: crawler.timetableEndpoint,
        lastChecked: nowStr,
        recordsVerified: 0,
        isCompliant: false,
        message: `Erişim hatası: ${err?.message ?? err}`,
      });
    }
  }

  return logs;
}

/**
 * 23:00 SENKRON: tarife + duyuru taraması + değişiklik tespiti.
 * Değişiklik algılanırsa yeni snapshot üretip lokalde saklar ve raporlar.
 */
export async function runNightlyTariffSync(): Promise<{
  success: boolean;
  executedAt: string;
  reports: SyncChangeReport[];
  summary: string;
}> {
  const reports: SyncChangeReport[] = [];
  const executedAt = new Date().toISOString();

  // 1. DENTUR TARİFE TARAMASI + DIFF
  try {
    const { records, failures } = await scrapeAllDenturSchedules();
    const fingerprint = computeFingerprint(
      records.map((r) => `${r.line}|${r.origin}|${r.destination}|${r.dayType}|${r.departureTime}|${r.continuousUntil ?? ""}`).join("\n"),
      records.length
    );
    const prev = await readFingerprint("Dentur Avrasya");
    const report = compareSnapshots("Dentur Avrasya", prev, fingerprint);
    reports.push({
      operator: "Dentur Avrasya",
      kind: "TARIFE",
      changed: report.changed,
      detail:
        report.changed
          ? `${records.length} sefer canlı çekildi. Değişiklik algılandı → yeni tarife uygulanabilir. ${failures.length} satır hatalı: ${JSON.stringify(failures)}`
          : `${records.length} sefer canlı çekildi. Tarife önceki ile birebir aynı (değişiklik yok).`,
      recordCounts: { previous: prev?.recordCount, current: records.length },
      checkedAt: report.checkedAt,
    });
    if (report.changed) await writeFingerprint("Dentur Avrasya", buildSnapshotState(fingerprint));
  } catch (err: any) {
    reports.push({
      operator: "Dentur Avrasya",
      kind: "TARIFE",
      changed: false,
      detail: `Dentur tarife taraması başarısız: ${err?.message ?? err}`,
      checkedAt: executedAt,
    });
  }

  // 2. DUYURU TARAMASI
  try {
    const { snapshots, failures } = await scrapeAllAnnouncements();
    const fingerprint = computeFingerprint(
      snapshots.map((s) => `${s.operator}:${s.announcements.map((a) => a.id).join(",")}`).join("\n"),
      snapshots.reduce((n, s) => n + s.announcements.length, 0)
    );
    const prev = await readFingerprint("ANNOUNCEMENTS");
    const report = compareSnapshots("TÜM DUYURULAR", prev, fingerprint);
    reports.push({
      operator: "TÜM (Duyurular)",
      kind: "DUYURU",
      changed: report.changed,
      detail: report.changed
        ? `Duyuru seti değişti (canlı çekim). ${failures.length ? `Hatalar: ${JSON.stringify(failures)}` : "Hata yok."}`
        : `Duyuru seti öncekiyle aynı (değişiklik yok).`,
      recordCounts: { previous: prev?.recordCount, current: fingerprint.recordCount },
      checkedAt: report.checkedAt,
    });
    if (report.changed) await writeFingerprint("ANNOUNCEMENTS", buildSnapshotState(fingerprint));
  } catch (err: any) {
    reports.push({
      operator: "TÜM (Duyurular)",
      kind: "DUYURU",
      changed: false,
      detail: `Duyuru taraması başarısız: ${err?.message ?? err}`,
      checkedAt: executedAt,
    });
  }

  const changedAny = reports.some((r) => r.changed);
  const summary = changedAny
    ? "Tarife/duyuru değişikliği algılandı. Yeni snapshot üretildi (repo commit'i ile uygulamaya yansır)."
    : "Tarife ve duyurularda değişiklik yok. Tüm veriler son senkronla uyumlu.";

  return { success: true, executedAt, reports, summary };
}

/* ---------- fingerprint kalıcılığı (git-managed JSON) ---------- */

interface FingerprintFile {
  [operator: string]: { fingerprint: string; recordCount?: number; updatedAt: string };
}

async function readFingerprint(operator: string): Promise<import("./scraper-agent").SnapshotState | undefined> {
  try {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const raw = readFileSync(join(process.cwd(), "src/lib/agents/data-snapshots/fingerprints.json"), "utf-8");
    const data = JSON.parse(raw) as FingerprintFile;
    const entry = data[operator];
    if (!entry) return undefined;
    return { fingerprint: entry.fingerprint, recordCount: entry.recordCount, updatedAt: entry.updatedAt };
  } catch {
    return undefined;
  }
}

async function writeFingerprint(
  operator: string,
  state: import("./scraper-agent").SnapshotState
): Promise<void> {
  const { readFileSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const path = join(process.cwd(), "src/lib/agents/data-snapshots/fingerprints.json");
  let data: FingerprintFile = {};
  try {
    data = JSON.parse(readFileSync(path, "utf-8")) as FingerprintFile;
  } catch {
    data = {};
  }
  data[operator] = state;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/* Dışa açık crawler listesi registry'den türetilir (tek kaynak) */
function _crawlers(): OperatorScraperConfig[] {
  return OPERATOR_REGISTRY.map((op, i) => ({
    operatorName: op.name,
    officialWebsite: op.officialWebsite,
    timetableEndpoint: op.timetableEndpoints[0] ?? op.officialWebsite,
    category: (op.category === "HEPSI" ? "HEPSİ" : op.category) as OperatorScraperConfig["category"],
    updateFrequency: "Günlük 23:00 (İstanbul) + Gecelik 00:01",
    status: op.dataStatus === "REAL" ? "VERIFIED" : op.dataStatus === "STANDBY" ? "STANDBY" : "ACTIVE",
  }));
}

export const OFFICIAL_OPERATOR_CRAWLERS = _crawlers();
export const DENTUR_LINE_URLS = DENTUR_LINE_ENDPOINTS;
