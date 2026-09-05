"use client";

import { useEffect, useState, useMemo } from "react";
import { Moon, AlertTriangle, Clock, Bell, BellRing, ShieldAlert } from "lucide-react";
import type { ScheduleCardDto } from "@/app/page";
import { useAlarmStore } from "@/store/useAlarmStore";
import { requestNotificationPermission } from "@/lib/utils/sound";

interface LastFerryAlertProps {
  schedules: ScheduleCardDto[];
  selectedRoute?: string;
  selectedOrigin?: string;
  selectedCategory?: string;
}

export function LastFerryAlert({
  schedules,
  selectedRoute,
  selectedOrigin,
  selectedCategory
}: LastFerryAlertProps) {
  const [now, setNow] = useState(Date.now());
  const { isAlarmSet, toggleAlarm } = useAlarmStore();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the chronologically latest trip for today
  const lastTripInfo = useMemo(() => {
    if (!schedules || schedules.length === 0) return null;

    // Filter relevant trips
    let pool = schedules;
    if (selectedRoute && selectedRoute !== "ALL") {
      pool = pool.filter(s => `${s.origin} ➔ ${s.destination}` === selectedRoute);
    } else if (selectedOrigin && selectedOrigin !== "ALL") {
      pool = pool.filter(s => s.origin === selectedOrigin);
    }

    if (pool.length === 0) return null;

    // Sort by departure time descending
    const sorted = [...pool].sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    const latest = sorted[0];

    const targetMs = latest.targetTimeIso ? new Date(latest.targetTimeIso).getTime() : 0;
    const diff = targetMs - now;

    return {
      trip: latest,
      diff,
      targetMs
    };
  }, [schedules, selectedRoute, selectedOrigin, now]);

  if (!lastTripInfo) return null;

  const { trip, diff } = lastTripInfo;

  // If already departed
  if (diff <= -30000) {
    return (
      <div className="px-3 pt-1">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-slate-500" />
            <span>Bu güzergahta bugünkü tüm tarifeli seferler sona erdi. İlk sefer yarın sabah.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">TAMAMLANDI</span>
        </div>
      </div>
    );
  }

  const isUrgent = diff > 0 && diff <= 45 * 60 * 1000;
  const hasAlarm = isAlarmSet(trip.id);

  // Format remaining time
  const totalMins = Math.max(0, Math.floor(diff / 60000));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const secs = Math.floor((Math.max(0, diff) % 60000) / 1000);

  const countdownText = isUrgent
    ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : hrs > 0
    ? `${hrs} sa ${mins} dk`
    : `${mins} dk`;

  return (
    <div className="px-3 pt-1">
      <div
        className={`rounded-xl p-2.5 transition-all text-xs border shadow-md flex items-center justify-between gap-2 ${
          isUrgent
            ? "bg-rose-950/90 border-rose-500/60 text-rose-100 ring-2 ring-rose-500/30"
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isUrgent ? "bg-rose-600/30 text-rose-400 animate-pulse" : "bg-purple-500/20 text-purple-300"
            }`}
          >
            {isUrgent ? <ShieldAlert size={15} /> : <Moon size={15} />}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-black text-xs ${isUrgent ? "text-rose-300" : "text-white"}`}>
                {isUrgent ? "🚨 DİKKAT: GÜNÜN SON VAPURU!" : "Günün Son Vapuru"}
              </span>
              <span className="font-bold text-slate-300 text-[11px] truncate">
                ({trip.origin} ➔ {trip.destination})
              </span>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Kalkış: <strong className="font-mono text-white">{trip.departureTime}</strong> ({trip.operator})</span>
              <span>•</span>
              <span className={isUrgent ? "text-rose-300 font-bold" : "text-amber-400 font-semibold"}>
                Kalan Süre: {countdownText}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Alarm Button */}
        <button
          type="button"
          onClick={() => {
            requestNotificationPermission();
            toggleAlarm(trip.id);
          }}
          title={hasAlarm ? "Son vapur alarmı kurulu" : "Son vapur için alarm kur"}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all border ${
            hasAlarm
              ? "bg-amber-500/20 border-amber-400 text-amber-300"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          {hasAlarm ? <BellRing size={12} className="text-amber-400 animate-bounce" /> : <Bell size={12} />}
          <span className="hidden sm:inline">{hasAlarm ? "Alarm Açık" : "Beni Uyar"}</span>
        </button>
      </div>
    </div>
  );
}
