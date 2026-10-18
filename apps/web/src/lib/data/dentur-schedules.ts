/**
 * DENTUR AVRASYA — GERÇEK TARİFE VERİSİ YÜKLEYİCİSİ
 *
 * Veri kaynağı: dentur-schedules.json (denturavrasya.com/tr-TR/hatlarimiz/*
 * sayfalarından canlı parse edilmiş, birebir saatler — Erişim 2026-10-04).
 * Bu dosya tarifeyi deprecated `RawOfficialTrip` modeline map eder.
 *
 * DÜRÜSTLÜK: 'Sürekli Sefer' pencereleri `isContinuous: true` ile taşınır;
 * sahte dakika üretilmez.
 */

import type { RawOfficialTrip } from "./official-schedules";
import { OPERATOR_REGISTRY, getOperatorRecord } from "./operator-registry";
import type { DenturLineRecord, DenturDayType } from "@/lib/agents/dentur-scraper";

interface DenturScheduleFile {
  generatedAt: string;
  failures: { line: string; error: string }[];
  lines: DenturLineRecord[];
}

// Next.js JSON import'u tip güvenli değildir; bilinçli cast.
 
const denturRaw = require("./dentur-schedules.json") as DenturScheduleFile;

const DAY_TYPE_RUNS: Record<
  DenturDayType,
  { runsWeekday: boolean; runsSaturday: boolean; runsSunday: boolean }
> = {
  WEEKDAY: { runsWeekday: true, runsSaturday: false, runsSunday: false },
  WEEKDAY_SAT: { runsWeekday: true, runsSaturday: true, runsSunday: false },
  SATURDAY: { runsWeekday: false, runsSaturday: true, runsSunday: false },
  SUNDAY: { runsWeekday: false, runsSaturday: false, runsSunday: true },
  WEEKEND: { runsWeekday: false, runsSaturday: true, runsSunday: true },
};

// Resmi doğrulama 2026-10-18: denturavrasya.com/api/Tour/7/routes (Heybeli Ada
// Büyük Ada turu) → 200 ₺. Şehir içi hatların (Üsküdar-Beşiktaş/Kabataş,
// Beşiktaş-Kadıköy) ücreti resmi sitede YAYINLANMIYOR → "—" (uydurma yasak).
const ADA_FARE = "200 ₺";
const CITY_FARE_UNVERIFIED = "—";

function slug(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCategory(line: string): "ADALAR" | "BOGAZ" {
  return line === "Adalar" ? "ADALAR" : "BOGAZ";
}

export function getDenturSchedules(): RawOfficialTrip[] {
  const records = denturRaw.lines ?? [];
  const trips: RawOfficialTrip[] = [];

  for (const r of records) {
    const runs = DAY_TYPE_RUNS[r.dayType];
    const isContinues = Boolean(r.isContinuous);
    const lineKey = r.line;

    const id = [
      "den",
      slug(r.line),
      slug(r.origin),
      slug(r.destination),
      slug(r.dayType),
      slug(r.departureTime),
      r.continuousUntil ? "-" + slug(r.continuousUntil) : "",
    ].join("-");

    trips.push({
      id,
      origin: r.origin,
      destination: r.destination,
      operator: "Dentur Avrasya",
      category: toCategory(lineKey),
      departureTime: r.departureTime,
      // Sürekli sefer: arrivalTime pencere bitişi değil (gece yarısını aşabilir),
      // selfHeal gerçekçi seyir süresiyle doldurur. Gerçek pencere continuousUntil'da.
      arrivalTime: isContinues ? undefined : r.arrivalTime,
      platform: `${r.origin} Dentur İskelesi`,
      price: toCategory(lineKey) === "ADALAR" ? ADA_FARE : CITY_FARE_UNVERIFIED,
      stops: r.stops && r.stops.length > 0 ? r.stops : undefined,
      runsWeekday: runs.runsWeekday,
      runsSaturday: runs.runsSaturday,
      runsSunday: runs.runsSunday,
      isContinuous: isContinues || undefined,
      continuousUntil: r.continuousUntil,
      lineName: r.line,
    });
  }

  return trips;
}

export function getDenturSyncMetadata(): {
  generatedAt: string;
  recordCount: number;
  failures: { line: string; error: string }[];
} {
  return {
    generatedAt: denturRaw.generatedAt,
    recordCount: (denturRaw.lines ?? []).length,
    failures: denturRaw.failures ?? [],
  };
}

export const DENTUR_OPERATOR = getOperatorRecord("Dentur Avrasya");
export const DENTUR_LOGO_PATH =
  OPERATOR_REGISTRY.find((o) => o.name === "Dentur Avrasya")?.logoPath ?? null;

/** UI empty-state metinleri için registry yardımcısı */
export function getOperatorDataStatusNote(name: string): string | undefined {
  return getOperatorRecord(name)?.statusNote;
}
