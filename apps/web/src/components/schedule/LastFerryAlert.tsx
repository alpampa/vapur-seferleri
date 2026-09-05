"use client";

import { useEffect, useState, useMemo } from "react";
import { Moon, ShieldAlert, Clock, Bell, BellRing } from "lucide-react";
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

    const isSpecificFilter = (selectedRoute && selectedRoute !== "ALL") || (selectedOrigin && selectedOrigin !== "ALL");

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

    // Visibility rules to avoid cluttering screen:
    // 1) If ALL routes selected, only show if diff is <= 45 mins (strictly urgent last ferry)
    // 2) If specific route/origin selected, show if diff is <= 90 mins or already departed
    if (!isSpecificFilter && diff > 45 * 60 * 1000) {
      return null;
    }
    if (isSpecificFilter && diff > 90 * 60 * 1000) {
      return null;
    }

    return {
      trip: latest,
      diff,
      targetMs
    };
  }, [schedules, selectedRoute, selectedOrigin, now]);

  if (!lastTripInfo) return null;

  const { trip, diff } = lastTripInfo;

  // If already departed within the last 30 mins
  if (diff <= 0 && diff > -1800000) {
    return (
      <div className="px-3 pt-1">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5">
            <Moon size={13} className="text-slate-500" />
            <span className="text-[11px]">Bugünkü son sefer hareket etti. İlk sefer yarın sabah.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">SONA ERDİ</span>
        </div>
      </div>
    );
  }

  if (diff <= -1800000) {
    return null;
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
        className={`rounded-xl p-2 transition-all text-xs border shadow-sm flex items-center justify-between gap-2 ${
          isUrgent
            ? "bg-rose-950/90 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/40"
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isUrgent ? "bg-rose-600/30 text-rose-400 animate-pulse" : "bg-purple-500/20 text-purple-300"
            }`}
          >
            {isUrgent ? <ShieldAlert size={14} /> : <Moon size={14} />}
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

            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>Kalkış: <strong className="text-white font-mono">{trip.departureTime}</strong></span>
              <span>•</span>
              <span className="font-semibold text-amber-300">
                {isUrgent ? "Kalkışa Kalan:" : "Kalan Süre:"} {countdownText}
              </span>
            </div>
          </div>
        </div>

        {/* Alarm Button */}
        <button
          onClick={() => {
            requestNotificationPermission();
            toggleAlarm(trip.id);
          }}
          title={hasAlarm ? "Alarm Kurulu" : "Son vapur için alarm kur"}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0 ${
            hasAlarm
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : isUrgent
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {hasAlarm ? (
            <>
              <BellRing size={12} className="animate-bounce" />
              <span>Alarm Açık</span>
            </>
          ) : (
            <>
              <Bell size={12} />
              <span>Alarm Kur</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
