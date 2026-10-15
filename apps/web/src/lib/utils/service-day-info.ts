import { getIstanbulParts } from "@/lib/utils/istanbul-time";
import { checkTurkishHoliday } from "@/lib/utils/holiday-calendar";

/**
 * "Bugün hangi tarife geçerli?" sorusunun tek doğruluk kaynağı.
 *
 * NEDEN: `timetable-engine.getLiveOrOfficialSchedules` tatil/Pazar günlerinde
 * sessizce Pazar tarifesine geçiyordu; kullanıcı hangi tarifenin uygulandığını
 * hiçbir yerde göremiyordu. Bu modül o kuralı GÖRÜNÜR kılar ve motorla aynı
 * mantığı paylaşır (bkz. aşağıdaki not).
 *
 * MOTORLA UYUM KURALI (değiştirilmemeli):
 *   engine: `if (ist.isSunday || ist.isHoliday) → Pazar/tatil filtreleri`
 *   Arefe (yarım gün) günlerinde `isHoliday` FALSE döner (holiday-calendar:76),
 *   bu yüzden arefe günü tatil tarifesi UYGULANMAZ; yalnızca bilgi notu gösterilir.
 */

export type TariffDay = "WEEKDAY" | "SATURDAY" | "SUNDAY" | "HOLIDAY";

export interface ServiceDayInfo {
  /** "15 Ekim 2026, Çarşamba" */
  dateLabel: string;
  tariffDay: TariffDay;
  /** "Hafta içi tarifesi" / "Cumartesi tarifesi" / "Pazar tarifesi" / "Tatil tarifesi" */
  tariffLabel: string;
  isHoliday: boolean;
  /** Resmi tatil adı (varsa) */
  holidayName: string | null;
  /** Arefe (yarım gün) adı — tatil tarifesi UYGULANMAZ, yalnızca bilgi */
  halfDayName: string | null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

const TARIFF_LABELS: Record<TariffDay, string> = {
  WEEKDAY: "Hafta içi tarifesi",
  SATURDAY: "Cumartesi tarifesi",
  SUNDAY: "Pazar tarifesi",
  HOLIDAY: "Tatil tarifesi",
};

export function resolveServiceDayInfo(nowMs: number = Date.now()): ServiceDayInfo {
  const p = getIstanbulParts(nowMs);
  const holiday = checkTurkishHoliday(p.year, p.month, p.day);

  const tariffDay: TariffDay = holiday.isHoliday
    ? "HOLIDAY"
    : p.dayOfWeek === 0
    ? "SUNDAY"
    : p.dayOfWeek === 6
    ? "SATURDAY"
    : "WEEKDAY";

  return {
    dateLabel: DATE_FORMATTER.format(nowMs),
    tariffDay,
    tariffLabel: TARIFF_LABELS[tariffDay],
    isHoliday: holiday.isHoliday,
    holidayName: holiday.isHoliday ? holiday.name ?? null : null,
    halfDayName: holiday.isHalfDay ? holiday.name ?? null : null,
  };
}

/** Tarife etiketi için kısa biçim: "Hafta içi" / "Tatil" */
export function tariffBadgeLabel(info: ServiceDayInfo): string {
  return info.tariffLabel.replace(/\s*tarifesi$/i, "");
}
