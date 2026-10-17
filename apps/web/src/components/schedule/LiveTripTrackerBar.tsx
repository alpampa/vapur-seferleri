"use client";

import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { Ship, X, AlarmClock, Clock } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playHistoricalFerryHorn, requestNotificationPermission } from "@/lib/utils/sound";
import { useTransitClock } from "@/hooks/useTransitClock";
import { istanbulIsoFor, nightRolloverDayOffset } from "@/lib/utils/istanbul-time";
import { SLOW_TICK_INTERVAL_MS } from "@/lib/constants";

export function LiveTripTrackerBar() {
  const { activeVoyage, clearActiveVoyage } = useActiveVoyageStore();
  const { isAlarmSet, toggleAlarm } = useAlarmStore();

  const hornBlownRef = useRef(false);

  const { nowMs } = useTransitClock(activeVoyage ? 1000 : SLOW_TICK_INTERVAL_MS);

  const secondsRemaining = useMemo(() => {
    if (!activeVoyage) return 0;
    const depIso = istanbulIsoFor(
      activeVoyage.departureTime,
      nowMs,
      nightRolloverDayOffset(activeVoyage.departureTime, nowMs) === 1
    );
    if (!depIso) return 0;
    return Math.max(0, Math.round((new Date(depIso).getTime() - nowMs) / 1000));
  }, [activeVoyage, nowMs]);

  useEffect(() => {
    hornBlownRef.current = false;
  }, [activeVoyage]);

  useEffect(() => {
    if (!activeVoyage) return;
    if (!hornBlownRef.current && secondsRemaining <= 180 && secondsRemaining > 0) {
      hornBlownRef.current = true;
      playHistoricalFerryHorn();
    }
  }, [activeVoyage, secondsRemaining]);

  if (!activeVoyage) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const hasAlarm = isAlarmSet(activeVoyage.id);

  return (
    <div className="fixed bottom-[74px] sm:bottom-6 left-2.5 right-2.5 sm:left-auto sm:right-6 z-40 sm:max-w-md bg-[#080d1a]/95 text-white border-2 border-blue-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border bg-blue-600/20 text-blue-400 border-blue-500/40">
            <Ship size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-black text-sm text-white truncate">
                {activeVoyage.departureTime} • {activeVoyage.operator}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock size={10} />
                <span>{secondsRemaining > 0 ? `Kalkışa ${formattedCountdown}` : "Kalkış Saati"}</span>
              </span>
            </div>
            {/* KULLANICI KURALI: rota satırı ASLA kırpılmaz — "nereye gidiyor" her zaman okunur */}
            <div className="text-[11px] text-blue-300 font-semibold mt-0.5 leading-snug">
              {activeVoyage.origin} ➔ {activeVoyage.destination}
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları: Sadece Gerçek Kalkış Alarmı ve Kapat */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              requestNotificationPermission();
              toggleAlarm(activeVoyage.id);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              hasAlarm
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
            }`}
            title={hasAlarm ? "Alarmı İptal Et" : "Kalkış Alarmı Kur"}
          >
            <AlarmClock size={15} />
          </button>

          <button
            onClick={clearActiveVoyage}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Takibi Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
