"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { useTransitClock } from "@/hooks/useTransitClock";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { useLanguageStore } from "@/store/useLanguageStore";

interface BoardTvModeProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  onExit: () => void;
}

const MAX_ROWS = 14;

/**
 * PANO TV MODU: işletmeler için tam ekran FIDS tablosu (B2B).
 * Reklam içermez; yalnızca kalkış saatleri, iskele, varış ve durum gösterilir.
 */
export function BoardTvMode({ schedules, serverTimeIso, onExit }: BoardTvModeProps) {
  const { nowMs } = useTransitClock(1000, { serverTimeIso, keepTickingWhenHidden: true });
  const { t } = useLanguageStore();

  const rows = useMemo(() => {
    const now = nowMs;
    const list: { trip: ScheduleCardDto; dyn: ReturnType<typeof resolveDynamicTrip> }[] = [];

    for (const trip of schedules) {
      const dyn = resolveDynamicTrip(
        trip.origin,
        trip.destination,
        trip.departureTime,
        trip.targetTimeIso || new Date().toISOString(),
        trip.stops,
        undefined,
        now,
        serverTimeIso
      );
      if (dyn.isExpired) continue;
      list.push({ trip, dyn });
      if (list.length >= MAX_ROWS) break;
    }

    return list;
  }, [schedules, nowMs, serverTimeIso]);

  const clockLabel = useMemo(() => {
    try {
      return new Date(nowMs).toLocaleTimeString("tr-TR", { hour12: false });
    } catch {
      return "--:--:--";
    }
  }, [nowMs]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#0b0f19] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-black tracking-widest uppercase text-amber-400">
            {t("boardTitle")}
          </span>
          <span className="text-sm font-bold text-slate-400 truncate">TV Modu — İşletme Ekranı</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-black tabular-nums text-emerald-400">{clockLabel}</span>
          <button
            type="button"
            onClick={onExit}
            aria-label={t("clear")}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-6 py-3">
        <div className="grid grid-cols-[6.5rem_1fr_1fr_8rem_10rem] gap-x-4 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">
          <span>Saat</span>
          <span>Kalkış İskelesi</span>
          <span>Varış</span>
          <span>Operatör</span>
          <span className="text-right">Durum</span>
        </div>

        {rows.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {rows.map(({ trip, dyn }, idx) => (
              <div
                key={`${trip.id}-${dyn.currentOrigin}-${idx}`}
                className={`grid grid-cols-[6.5rem_1fr_1fr_8rem_10rem] gap-x-4 items-center py-2.5 ${
                  idx % 2 === 0 ? "bg-slate-900/30" : ""
                }`}
              >
                <span className="font-mono text-2xl font-black tabular-nums text-amber-300">
                  {dyn.currentDepartureTime || trip.departureTime}
                </span>
                <span className="text-lg font-bold truncate">{dyn.currentOrigin}</span>
                <span className="text-lg font-semibold text-slate-300 truncate">{trip.destination}</span>
                <span className="text-sm font-semibold text-slate-400 truncate">{trip.operator}</span>
                <span className="text-right">
                  {dyn.isDeparted ? (
                    <span className="inline-block text-[11px] font-black bg-rose-600 px-2 py-1 rounded animate-pulse">
                      {t("underway")}
                    </span>
                  ) : dyn.countdown ? (
                    <span className="inline-block font-mono text-xl font-black text-amber-300 tabular-nums animate-pulse">
                      {dyn.countdown}
                    </span>
                  ) : (
                    <span className="inline-block text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded">
                      {t("boardOnTime")}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-slate-500 text-sm font-semibold">{t("boardEmpty")}</p>
        )}
      </div>

      <footer className="px-6 py-3 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
        {t("boardSubtitle")} · {t("fareNote")}
      </footer>
    </div>
  );
}
