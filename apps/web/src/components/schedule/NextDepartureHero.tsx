"use client";

import { ChevronRight } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import type { DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { formatRemainingShort } from "@/lib/utils/istanbul-time";
import { useLanguageStore } from "@/store/useLanguageStore";

interface NextDepartureHeroProps {
  schedule: ScheduleCardDto;
  dyn: DynamicTripResolution;
  onClick: () => void;
}

/**
 * Ana ekranın temel sorusunu yanıtlar: "Şu anda hangi vapura binebilirim?"
 * Kronolojik ilk yaklaşan seferi ÖLÇEK ve KONUMLA öne çıkarır (renk dekorasyonuyla değil).
 * Kartlarla aynı semantik eşikleri kullanır: amber ≤5 dk, rose ≤3 dk (son çağrı).
 */
export function NextDepartureHero({ schedule, dyn, onClick }: NextDepartureHeroProps) {
  const { t } = useLanguageStore();

  const minutes = dyn.minutesUntilDeparture;
  const isLastCall = minutes != null && minutes <= 3;
  const isImminent = minutes != null && minutes <= 5;

  // MM:SS geri sayım son 5 dakikada; öncesinde kısa "N dk" formatı
  const countdownLabel =
    dyn.countdown ?? (minutes != null ? formatRemainingShort(minutes) : null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${t("nextDeparture")}: ${dyn.currentOrigin} → ${dyn.destination}, ${dyn.currentDepartureTime}`}
      className={`rounded-xl border shadow-2xs px-3 py-2.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group animate-fadeIn ${
        isLastCall
          ? "border-rose-400 bg-rose-50/30 dark:bg-rose-950/20"
          : isImminent
          ? "border-amber-400/80 bg-amber-50/30 dark:bg-amber-950/20"
          : "border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111726] hover:border-blue-400 dark:hover:border-blue-500/50"
      }`}
    >
      {/* Etiket satırı: SONRAKİ SEFER + kalan süre */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLastCall ? "bg-rose-500" : isImminent ? "bg-amber-400" : "bg-blue-500"
            }`}
            aria-hidden="true"
          />
          {t("nextDeparture")}
        </span>
        {countdownLabel && (
          <span
            className={`text-xs font-mono font-black tabular-nums px-2 py-0.5 rounded-lg border whitespace-nowrap ${
              isLastCall
                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-500/30"
                : isImminent
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {countdownLabel}
          </span>
        )}
      </div>

      {/* Ana bilgi: saat + güzergah (saat görsel olarak en güçlü unsur) */}
      <div className="flex items-center gap-3 mt-1.5">
        <span
          className={`font-mono font-black text-3xl leading-none tabular-nums shrink-0 ${
            isLastCall ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {dyn.currentDepartureTime}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {dyn.currentOrigin}
            <span className="text-blue-500 dark:text-blue-400 font-black mx-1">➔</span>
            <span className="text-blue-700 dark:text-blue-300">{dyn.destination}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <OperatorLogo operator={schedule.operator} size="sm" showName={false} />
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-blue-400 transition-colors"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
