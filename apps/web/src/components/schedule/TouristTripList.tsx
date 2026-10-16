"use client";

import { Compass, MapPin, X } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import type { DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useLanguageStore } from "@/store/useLanguageStore";

interface TouristTripListProps {
  items: { schedule: ScheduleCardDto; dyn: DynamicTripResolution }[];
  onExitTouristMode: () => void;
}

const MAX_VISIBLE_TRIPS = 16;

function buildMapsUrl(pierName: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pierName} İskelesi, İstanbul`)}`;
}

export function TouristTripList({ items, onExitTouristMode }: TouristTripListProps) {
  const { t } = useLanguageStore();

  const visibleTrips = items.filter(({ dyn }) => !dyn.isDeparted && !dyn.isExpired).slice(0, MAX_VISIBLE_TRIPS);

  return (
    <div className="px-3 pt-2 pb-36 sm:pb-28 animate-fadeIn">
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-3 py-2.5 flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
        <Compass size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight">{t("touristMode")}</p>
          <p className="text-[11px] mt-0.5 leading-tight opacity-90">{t("touristModeHint")}</p>
          <p className="text-[11px] mt-1 font-bold">💳 {t("fareNote")}</p>
        </div>
        <button
          type="button"
          onClick={onExitTouristMode}
          aria-label={t("clear")}
          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
        >
          <X size={16} />
        </button>
      </div>

      {visibleTrips.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2">
          {visibleTrips.map(({ schedule, dyn }) => (
            <div
              key={`tourist-${schedule.id}-${dyn.currentOrigin}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex items-center gap-3 shadow-sm"
            >
              <div className="w-20 shrink-0 text-center">
                <div className="text-3xl font-black tabular-nums text-slate-900 dark:text-white leading-none">
                  {schedule.departureTime12 || schedule.departureTime}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1.5 truncate">{schedule.operator}</div>
                {dyn.countdown && (
                  <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black tabular-nums">
                    {t("boardCountdownTo")} {dyn.countdown}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">{dyn.currentOrigin}</div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">➔ {schedule.destination}</div>
                {schedule.price && (
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">💳 {schedule.price}</div>
                )}
              </div>

              <a
                href={buildMapsUrl(dyn.currentOrigin)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("openInMaps")}
                className="shrink-0 min-h-[44px] min-w-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5"
              >
                <MapPin size={17} aria-hidden="true" />
                <span className="text-[9px] font-bold leading-none">{t("openInMaps")}</span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">{t("boardEmpty")}</p>
      )}
    </div>
  );
}
