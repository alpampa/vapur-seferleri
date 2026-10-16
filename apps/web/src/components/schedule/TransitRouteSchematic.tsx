"use client";

import React from "react";
import { Ship } from "lucide-react";
import type { UnderwaySegment } from "@/lib/utils/dynamic-trip";

interface Stop {
  name: string;
  time: string;
}

interface TransitRouteSchematicProps {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  stops?: Stop[];
  operator?: string;
  underway?: UnderwaySegment | null;
}

/**
 * Massimo Vignelli & TfL Transit Standardı: Metro/Tramvay Şeması Tarzı Güzergâh Grafiği.
 * Uzun ada ve boğaz hatlarında durak sırasını şematik bir çizgi üzerinde gösterir.
 * `underway` verilirse gemi ikonu zamana göre ilerler: seyir mavi, iskeleye
 * yaklaşırken (≤ 3 dk) amber yanıp söner, varışta yeşile döner (metro mantığı).
 */
export function TransitRouteSchematic({
  origin,
  destination,
  departureTime,
  arrivalTime,
  stops,
  operator,
  underway,
}: TransitRouteSchematicProps) {
  if (!stops || stops.length === 0 || origin.trim() === destination.trim()) {
    return null;
  }

  const filteredStops = stops.filter(
    (s) => s.name.trim() !== origin.trim() && s.name.trim() !== destination.trim()
  );

  const rawChain = [
    { name: origin.trim(), time: departureTime, isOrigin: true },
    ...filteredStops.map((s) => ({ name: s.name.trim(), time: s.time, isOrigin: false })),
    { name: destination.trim(), time: arrivalTime || "", isDestination: true },
  ];

  const fullChain = rawChain.filter((item, idx, arr) => {
    if (idx === 0) return true;
    return item.name !== arr[idx - 1].name;
  });

  const live = underway ?? null;

  return (
    <div className="w-full mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 animate-fadeIn">
      <div className="overflow-x-auto hide-scrollbar py-1">
        <div className="flex items-center min-w-max px-1">
          {fullChain.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === fullChain.length - 1;

            const isDoneNode =
              isFirst ||
              (live != null &&
                (index <= live.fromIndex ||
                  (isLast && live.toIndex === index && live.hasArrived)));

            const dotClass = isDoneNode
              ? "bg-emerald-500 border-white dark:border-slate-900 shadow-xs ring-2 ring-emerald-500/30"
              : isLast
              ? "bg-blue-600 border-white dark:border-slate-900 shadow-xs ring-2 ring-blue-500/30"
              : "bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-500";

            const isActiveSegment = live != null && index === live.fromIndex;
            const isDoneSegment = live != null && index < live.fromIndex;

            return (
              <React.Fragment key={`${stop.name}-${index}`}>
                <div className="flex flex-col items-center group/stop">
                  {stop.time && (
                    <span className="text-[9.5px] font-mono tabular-nums font-bold text-slate-500 dark:text-slate-400 leading-none mb-1">
                      {stop.time}
                    </span>
                  )}

                  <div className="relative flex items-center justify-center">
                    <span className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${dotClass}`} />
                  </div>

                  <span
                    className={`text-[10px] mt-1 font-bold whitespace-nowrap leading-none ${
                      isFirst || isLast
                        ? "text-slate-900 dark:text-white font-extrabold"
                        : "text-slate-600 dark:text-slate-400 font-medium"
                    }`}
                  >
                    {stop.name}
                  </span>
                </div>

                {!isLast &&
                  (isActiveSegment && live ? (
                    <div className="relative flex-1 min-w-10 sm:min-w-14 h-0.5 mx-1 mb-4 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`absolute left-0 top-0 h-0.5 rounded-full transition-[width] duration-1000 ease-linear ${
                          live.hasArrived
                            ? "bg-emerald-500"
                            : live.isApproaching
                            ? "bg-amber-500 animate-pulse"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.round(live.ratio * 100)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-[left] duration-1000 ease-linear"
                        style={{ left: `${live.ratio * 100}%` }}
                      >
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md ring-2 ${
                            live.hasArrived
                              ? "ring-emerald-500"
                              : live.isApproaching
                              ? "ring-amber-500 animate-pulse"
                              : "ring-blue-500"
                          }`}
                        >
                          <Ship
                            size={11}
                            className={
                              live.hasArrived
                                ? "text-emerald-600 dark:text-emerald-400"
                                : live.isApproaching
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            }
                          />
                        </span>
                      </div>
                    </div>
                  ) : isDoneSegment ? (
                    <div className="flex-1 min-w-10 sm:min-w-14 h-0.5 rounded-full bg-emerald-500 mx-1 mb-4" />
                  ) : (
                    <div className="flex-1 min-w-10 sm:min-w-14 h-0.5 bg-linear-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 mx-1 mb-4" />
                  ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
