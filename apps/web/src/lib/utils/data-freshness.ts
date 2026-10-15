/**
 * Veri tazeliği (data freshness) hesabı.
 *
 * NEDEN: Uygulama, resmî kaynaklardan en son ne zaman doğrulandığını hiçbir
 * yerde söylemiyordu; kullanıcı 10 gün önce çekilmiş duyuruları "canlı" sanabilirdi.
 * Bu modül yaşı ölçer ve dürüstçe etiketler. Doğrulama tarihi bilinmiyorsa
 * tazelik İDDİA EDİLMEZ (level: UNKNOWN).
 *
 * EŞİKLER: Aşağıdaki değerler arayüz uyarı eşikleridir; resmî bir SLA değildir.
 * Senkronizasyon ajanı günde bir kez çalışır (Vercel cron: 0 22 * * *).
 */

export type FreshnessLevel = "FRESH" | "AGING" | "STALE" | "UNKNOWN";

export interface DataFreshness {
  /** Doğrulama tarihinden bu yana geçen tam gün; bilinmiyorsa null */
  ageDays: number | null;
  level: FreshnessLevel;
  /** "4 Ekim 2026" — bilinmiyorsa null */
  verifiedOnLabel: string | null;
  /** "bugün" / "dün" / "11 gün önce" / "bilinmiyor" */
  ageLabel: string;
  /** Uyarı gösterilmeli mi? (STALE veya UNKNOWN) */
  isStale: boolean;
}

/** 2 güne kadar taze (günlük cron + 1 gün tolerans) */
export const FRESH_MAX_AGE_DAYS = 2;
/** 7 güne kadar "eskimekte"; üzeri "bayat" */
export const AGING_MAX_AGE_DAYS = 7;

const MS_PER_DAY = 86_400_000;

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function resolveDataFreshness(
  generatedAtIso?: string | null,
  nowMs: number = Date.now(),
): DataFreshness {
  const parsed = generatedAtIso ? Date.parse(generatedAtIso) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return {
      ageDays: null,
      level: "UNKNOWN",
      verifiedOnLabel: null,
      ageLabel: "doğrulama tarihi yok",
      isStale: true,
    };
  }

  const ageMs = Math.max(0, nowMs - parsed);
  const ageDays = Math.floor(ageMs / MS_PER_DAY);

  const level: FreshnessLevel =
    ageDays <= FRESH_MAX_AGE_DAYS
      ? "FRESH"
      : ageDays <= AGING_MAX_AGE_DAYS
      ? "AGING"
      : "STALE";

  const ageLabel =
    ageDays === 0 ? "bugün" : ageDays === 1 ? "dün" : `${ageDays} gün önce`;

  return {
    ageDays,
    level,
    verifiedOnLabel: DATE_FORMATTER.format(parsed),
    ageLabel,
    isStale: level === "STALE",
  };
}
