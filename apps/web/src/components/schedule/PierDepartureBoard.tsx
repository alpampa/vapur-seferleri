"use client";

import { useState, useMemo } from "react";
import { Ship, Clock, MapPin, Navigation, ChevronRight, Bell, BellRing, Sparkles } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import { useAlarmStore } from "@/store/useAlarmStore";
import { requestNotificationPermission } from "@/lib/utils/sound";

interface PierDepartureBoardProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  selectedOrigin: string;
  onSelectOrigin: (pier: string) => void;
  onSelectTrip?: (trip: ScheduleCardDto) => void;
}

const POPULAR_PIERS = [
  "Kadıköy",
  "Kabataş",
  "Bostancı",
  "Büyükada",
  "Kartal",
  "Heybeliada",
  "Burgazada",
  "Kınalıada"
];

export function PierDepartureBoard({
  schedules,
  serverTimeIso,
  selectedOrigin,
  onSelectOrigin,
  onSelectTrip
}: PierDepartureBoardProps) {
  const activePier = selectedOrigin !== "ALL" ? selectedOrigin : "Kadıköy";
  const { isAlarmSet, toggleAlarm } = useAlarmStore();

  // Find next 3 departures from activePier
  const nextDepartures = useMemo(() => {
    const now = Date.now();
    const matches: { schedule: ScheduleCardDto; dyn: ReturnType<typeof resolveDynamicTrip> }[] = [];

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

      // Check if activePier is currentOrigin or initial origin or in stops
      const isCurrentPier = dyn.currentOrigin === activePier;
      const isInitialPier = trip.origin === activePier;

      if (isCurrentPier || isInitialPier) {
        matches.push({ schedule: trip, dyn });
      }
    }

    // Sort by chronological departure time of current active leg
    matches.sort((a, b) => a.dyn.currentDepartureTime.localeCompare(b.dyn.currentDepartureTime));

    return matches.slice(0, 3);
  }, [schedules, activePier, serverTimeIso]);

  return (
    <div className="px-3 pt-2">
      <div className="bg-gradient-to-b from-[#0e172a] to-[#090d16] border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Title & Pier Quick Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Ship size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1">
                  <Sparkles size={11} />
                  İSKELE KALKIŞ PANOSU
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-none mt-0.5 flex items-center gap-1.5">
                <span>{activePier} İskelesi</span>
                <span className="text-xs font-semibold text-slate-400">(Sıradaki Vapurlar)</span>
              </h3>
            </div>
          </div>

          {/* Quick Pier Selector Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar">
            {POPULAR_PIERS.map((p) => (
              <button
                key={p}
                onClick={() => onSelectOrigin(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activePier === p
                    ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Departure Slots (Next 3 Ferries) */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {nextDepartures.length > 0 ? (
            nextDepartures.map(({ schedule, dyn }, idx) => {
              const hasAlarm = isAlarmSet(schedule.id);

              return (
                <div
                  key={schedule.id}
                  onClick={() => onSelectTrip?.(schedule)}
                  className="bg-slate-900/90 hover:bg-[#162032] border border-slate-700/70 hover:border-amber-400/50 rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer shadow-md group relative overflow-hidden"
                >
                  {/* Slot Top: Badge & Time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {schedule.operator}
                      </span>
                    </div>

                    {/* Alarm Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestNotificationPermission();
                        toggleAlarm(schedule.id);
                      }}
                      className={`p-1 rounded-md border transition-all ${
                        hasAlarm
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                      title="Kalkış alarmı kur"
                    >
                      {hasAlarm ? <BellRing size={12} className="animate-bounce text-amber-400" /> : <Bell size={12} />}
                    </button>
                  </div>

                  {/* Slot Center: Destination & Big Time */}
                  <div className="my-2">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-mono font-black text-amber-300 tracking-tight">
                        {dyn.currentDepartureTime}
                      </div>

                      {dyn.isDeparted ? (
                        <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded animate-pulse">
                          HAREKET ETTİ
                        </span>
                      ) : dyn.countdown ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-extrabold text-amber-400">KALKIŞA</span>
                          <span className="font-mono text-sm font-black text-amber-300 animate-pulse">
                            {dyn.countdown}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded">
                          ZAMANINDA
                        </span>
                      )}
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-1.5 mt-1 font-black text-sm text-white group-hover:text-blue-300 transition-colors">
                      <span className="text-blue-400 font-extrabold">➔</span>
                      <span className="truncate">{schedule.destination}</span>
                    </div>
                  </div>

                  {/* Slot Footer: Platform & Price */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-300 truncate">
                      <MapPin size={11} className="text-amber-400 shrink-0" />
                      <span>{schedule.platform || "Ana Rıhtım"}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      {schedule.price}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-6 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
              {activePier} iskelesinden bugün için kalan aktif sefer bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
