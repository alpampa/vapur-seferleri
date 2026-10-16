"use client";

import { Navigation, Ship } from "lucide-react";
import type { DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { resolveGlanceStatus } from "@/lib/utils/glance-status";
import { useLanguageStore } from "@/store/useLanguageStore";

interface NextDepartureStripProps {
  dyn: DynamicTripResolution;
  youAreAt: string | null;
  onOpen: () => void;
}

const URGENCY_CHIP_CLASS: Record<string, string> = {
  CRITICAL: "bg-rose-600 text-white animate-pulse",
  SOON: "bg-amber-400 text-slate-950",
  CALM: "bg-slate-700/80 text-slate-100",
  DEPARTED: "bg-indigo-500/90 text-white",
};

export function NextDepartureStrip({ dyn, youAreAt, onOpen }: NextDepartureStripProps) {
  const { t } = useLanguageStore();
  const glance = resolveGlanceStatus(dyn);

  const countdownLabel =
    glance.urgency === "DEPARTED"
      ? t("glanceDeparted")
      : glance.liveCountdown ?? (glance.minutes != null ? `${glance.minutes} ${t("glanceMinutes")}` : null);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${t("nextDeparture")}: ${dyn.currentOrigin} ➔ ${dyn.destination} ${dyn.currentDepartureTime}`}
      className="w-full min-h-14 rounded-2xl bg-slate-900 dark:bg-[#0b1526] border border-slate-700/80 px-3 py-2 shadow-lg flex items-center gap-3 text-left cursor-pointer active:scale-[0.99] transition-transform touch-manipulation"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#FFC72C]/15 border border-[#FFC72C]/40 text-[#FFC72C] shrink-0">
        <Ship size={16} aria-hidden="true" />
      </span>

      <span className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 truncate">
          {youAreAt ? (
            <>
              <Navigation size={9} aria-hidden="true" className="text-emerald-400 shrink-0" />
              <span className="truncate">{t("glanceYouAre")}: {youAreAt}</span>
            </>
          ) : (
            <span className="truncate">{t("nextDeparture")}</span>
          )}
        </span>
        <span className="flex items-baseline gap-2 min-w-0 mt-0.5">
          <span className="text-[15px] font-black text-white truncate">{dyn.destination}</span>
          <span className="font-mono font-black text-lg text-[#FFC72C] tabular-nums shrink-0">
            {dyn.currentDepartureTime}
          </span>
        </span>
      </span>

      {countdownLabel && (
        <span
          className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-black tabular-nums font-mono ${URGENCY_CHIP_CLASS[glance.urgency]}`}
        >
          {countdownLabel}
        </span>
      )}
    </button>
  );
}
