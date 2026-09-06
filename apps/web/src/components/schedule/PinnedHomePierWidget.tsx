"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Ship, ChevronRight, Settings2, Clock } from "lucide-react";
import type { ScheduleCardDto } from "@/app/page";
import { OperatorLogo } from "@/components/ui/OperatorLogo";

interface PinnedHomePierWidgetProps {
  schedules: ScheduleCardDto[];
  onSelectPier: (pierName: string) => void;
  onTripClick: (schedule: ScheduleCardDto) => void;
}

const POPULAR_PIERS = [
  "Kadıköy",
  "Bostancı",
  "Büyükada",
  "Eminönü",
  "Karaköy",
  "Beşiktaş",
  "Üsküdar",
  "Kabataş"
];

export function PinnedHomePierWidget({ schedules, onSelectPier, onTripClick }: PinnedHomePierWidgetProps) {
  const [homePier, setHomePier] = useState<string>("Kadıköy");
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vapur_pinned_home_pier");
    if (saved) setHomePier(saved);
  }, []);

  const handleSelectPier = (pier: string) => {
    setHomePier(pier);
    setIsChanging(false);
    localStorage.setItem("vapur_pinned_home_pier", pier);
  };

  if (!mounted) return null;

  // Filter next 3 departures from this pier
  const pierTrips = schedules
    .filter(s => s.origin.toLowerCase().includes(homePier.toLowerCase()))
    .slice(0, 3);

  return (
    <div className="px-3 pt-1.5">
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-transparent border border-amber-500/30 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
            <span className="text-[10px] font-mono font-black uppercase text-amber-700 dark:text-amber-300 tracking-wider">
              SABİT İSKELEM
            </span>
            <span className="font-black text-xs text-slate-900 dark:text-white">
              {homePier} Rıhtımı
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsChanging(!isChanging)}
              className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 cursor-pointer"
              title="Sabit İskelemi Değiştir"
            >
              <Settings2 size={10} />
              <span>{isChanging ? "Kapat" : "Değiştir"}</span>
            </button>

            <button
              onClick={() => onSelectPier(homePier)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 pl-1 cursor-pointer"
            >
              <span>Tümünü Gör</span>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>

        {/* Change Pier Dropdown Pills */}
        {isChanging && (
          <div className="mb-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 animate-fadeIn">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Her gün bindiğiniz ana iskeleyi seçin:
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {POPULAR_PIERS.map((pier) => (
                <button
                  key={pier}
                  onClick={() => handleSelectPier(pier)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    homePier === pier
                      ? "bg-amber-500 text-slate-950 font-black border-amber-500 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pier}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next 3 Upcoming Trips from Home Pier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {pierTrips.length > 0 ? (
            pierTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onTripClick(trip)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-black text-slate-900 dark:text-white truncate">
                    <span>➔</span>
                    <span className="truncate">{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                    <OperatorLogo operator={trip.operator} size="sm" showName={false} />
                    <span className="truncate">{trip.operator}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 block">
                    {trip.departureTime}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {trip.price}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center col-span-3 text-[11px] text-slate-400 py-1">
              {homePier} iskelesinden yaklaşan sefer bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
