"use client";

import { CalendarDays, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { resolveServiceDayInfo, tariffBadgeLabel } from "@/lib/utils/service-day-info";
import { resolveDataFreshness } from "@/lib/utils/data-freshness";
import { useLanguageStore } from "@/store/useLanguageStore";

/** Ajan snapshot'ının üst verisi — sunucudan prop olarak gelir (client bundle'a JSON sokmamak için). */
export interface SourceFreshnessMeta {
  generatedAt?: string;
  sourceCount: number;
}

interface ServiceDataTrustBarProps {
  /** Sunucudan gelen kesin an — istemci saatine güvenilmez. */
  serverTimeIso: string;
  /** Resmî kaynakların en son doğrulanma üst verisi. */
  freshness: SourceFreshnessMeta;
}

/**
 * GÜVEN KATMANI — "Hangi tarife geçerli?" ve "Veri ne kadar taze?"
 *
 * NEDEN: Motor tatil/Pazar günlerinde sessizce farklı tarifeye geçiyor ve
 * ajanların en son ne zaman doğruladığı hiçbir yerde yazmıyordu. Kullanıcı
 * yanlış saatte iskeleye gidebilirdi. Bu şerit ikisini de açıkça söyler.
 *
 * DÜRÜSTLÜK: Doğrulama tarihi yoksa tazelik iddia edilmez (uyarı gösterilir).
 */
export function ServiceDataTrustBar({ serverTimeIso, freshness }: ServiceDataTrustBarProps) {
  const { t } = useLanguageStore();
  // Saf render kuralı: Date.now() burada yasak. Sunucu her zaman geçerli ISO verir;
  // parse edilemezse 0 (epoch) kullanılır — yani "tarih bilinmiyorsa veriyi bayat say",
  // asla taze göstermeye çalışma (güvenli varsayılan).
  const parsedMs = Date.parse(serverTimeIso);
  const serverMs = Number.isNaN(parsedMs) ? 0 : parsedMs;
  const day = resolveServiceDayInfo(serverMs);
  const fresh = resolveDataFreshness(freshness.generatedAt, serverMs);

  const tariffTone = day.isHoliday
    ? "bg-rose-600 text-white border-rose-500"
    : day.tariffDay === "SUNDAY" || day.tariffDay === "SATURDAY"
    ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/40"
    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <div className="px-3 pt-1.5">
      <div
        className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-x-3 gap-y-1 flex-wrap shadow-2xs ${
          day.isHoliday
            ? "border-rose-400/70 bg-rose-50/60 dark:bg-rose-950/25"
            : "border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#111726]"
        }`}
      >
        {/* Sol: gün + geçerli tarife */}
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarDays
            size={12}
            className={day.isHoliday ? "text-rose-500 shrink-0" : "text-slate-400 shrink-0"}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {day.dateLabel}
          </span>
          <span
            className={`text-[9.5px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${tariffTone}`}
          >
            {tariffBadgeLabel(day)}
          </span>
          {day.holidayName && (
            <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 truncate">
              {day.holidayName} — tatil tarifesi uygulanıyor
            </span>
          )}
          {!day.holidayName && day.halfDayName && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate inline-flex items-center gap-0.5">
              <Info size={9} aria-hidden="true" />
              {day.halfDayName} (yarım gün) — normal tarife
            </span>
          )}
        </div>

        {/* Sağ: veri tazeliği — dürüst etiket, rozet değil */}
        <div
          className={`flex items-center gap-1 min-w-0 ${
            fresh.isStale ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
          }`}
          title="Canlı duyurular resmî operatör kaynaklarından en son bu tarihte çekildi. Tarife saatleri ise gömülü doğrulanmış kaynaktan gelir."
        >
          {fresh.isStale ? (
            <ShieldAlert size={11} className="shrink-0" aria-hidden="true" />
          ) : (
            <ShieldCheck size={11} className="shrink-0 text-emerald-500" aria-hidden="true" />
          )}
          <span className="text-[9.5px] font-bold tabular-nums whitespace-nowrap">
            {fresh.verifiedOnLabel
              ? `${t("trustAnnouncement")}: ${fresh.verifiedOnLabel} (${fresh.ageLabel})`
              : t("trustMissing")}
          </span>
          <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            · {freshness.sourceCount} {t("sources")}
          </span>
        </div>
      </div>
    </div>
  );
}
