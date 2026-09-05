"use client";

import { useMemo } from "react";
import { Star, ArrowRight, Sparkles, Navigation } from "lucide-react";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import type { ScheduleCardDto } from "@/app/page";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";

interface FavoritesWidgetProps {
  schedules: ScheduleCardDto[];
  selectedRoute: string;
  onSelectRoute: (routeKey: string) => void;
}

export function FavoritesWidget({
  schedules,
  selectedRoute,
  onSelectRoute
}: FavoritesWidgetProps) {
  const { favorites } = useFavoritesStore();

  // For each favorite route, find the next upcoming departure
  const favoritesWithNext = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];

    const now = Date.now();

    return favorites.map((routeKey) => {
      const parts = routeKey.split(" ➔ ");
      if (parts.length !== 2) return null;
      const [orig, dest] = parts;

      // Find trips matching this route
      const matchingTrips = schedules.filter(
        s => (s.origin === orig || s.stops?.some(st => st.name === orig)) && s.destination === dest
      );

      // Resolve dynamics to find next non-expired trip
      const valid = matchingTrips
        .map(t => ({
          trip: t,
          dyn: resolveDynamicTrip(
            t.origin,
            t.destination,
            t.departureTime,
            t.targetTimeIso || new Date().toISOString(),
            t.stops,
            undefined,
            now
          )
        }))
        .filter(({ dyn }) => !dyn.isExpired)
        .sort((a, b) => a.dyn.currentDepartureTime.localeCompare(b.dyn.currentDepartureTime));

      const next = valid[0] || null;

      return {
        routeKey,
        orig,
        dest,
        nextTrip: next?.trip || null,
        dyn: next?.dyn || null
      };
    }).filter(Boolean);
  }, [favorites, schedules]);

  if (favoritesWithNext.length === 0) return null;

  return (
    <div className="px-3 pt-2">
      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1.5 px-0.5">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        <span>FAVORİ VE İŞE/EVE DÖNÜŞ HATLARI:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {favoritesWithNext.map((fav: any) => {
          const isSelected = selectedRoute === fav.routeKey;

          return (
            <button
              key={fav.routeKey}
              onClick={() => onSelectRoute(isSelected ? "ALL" : fav.routeKey)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 shadow-sm ${
                isSelected
                  ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-[1.02]"
                  : "bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-white"
              }`}
            >
              <Star size={13} className={isSelected ? "fill-slate-950 text-slate-950" : "fill-amber-400 text-amber-400"} />

              <span className="font-extrabold">{fav.routeKey}</span>

              {fav.dyn ? (
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span className={isSelected ? "text-slate-900 font-black" : "text-amber-300 font-bold"}>
                    {fav.dyn.currentDepartureTime}
                  </span>
                  {fav.dyn.countdown && (
                    <span className={`text-[9px] px-1 py-0.2 rounded ${
                      isSelected ? "bg-black/30 text-slate-950 font-black" : "bg-amber-950 border border-amber-500/50 text-amber-300 animate-pulse"
                    }`}>
                      {fav.dyn.countdown}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-normal">Sefer Yok</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
