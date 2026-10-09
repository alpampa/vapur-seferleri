"use client";

import React from "react";

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
}

/**
 * Massimo Vignelli & TfL Transit Standardı: Metro/Tramvay Şeması Tarzı Güzergâh Grafiği.
 * Uzun ada ve boğaz hatlarında durak sırasını şematik bir çizgi üzerinde gösterir.
 */
export function TransitRouteSchematic({
  origin,
  destination,
  departureTime,
  arrivalTime,
  stops,
  operator,
}: TransitRouteSchematicProps) {
  if (!stops || stops.length === 0) {
    return null;
  }

  // Tüm durak zinciri: Kalkış + Ara Duraklar + Varış
  const fullChain = [
    { name: origin, time: departureTime, isOrigin: true },
    ...stops.map((s) => ({ name: s.name, time: s.time, isOrigin: false })),
    { name: destination, time: arrivalTime || "", isDestination: true },
  ];

  return (
    <div className="w-full mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 animate-fadeIn">
      {/* Yatay Akıcı Şematik Çizgi */}
      <div className="overflow-x-auto hide-scrollbar py-1">
        <div className="flex items-center min-w-max px-1">
          {fullChain.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === fullChain.length - 1;

            return (
              <React.Fragment key={`${stop.name}-${index}`}>
                {/* Durak Düğümü */}
                <div className="flex flex-col items-center group/stop">
                  {/* Zaman */}
                  {stop.time && (
                    <span className="text-[9.5px] font-mono tabular-nums font-bold text-slate-500 dark:text-slate-400 leading-none mb-1">
                      {stop.time}
                    </span>
                  )}

                  {/* Düğüm Noktası */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${
                        isFirst
                          ? "bg-emerald-500 border-white dark:border-slate-900 shadow-xs ring-2 ring-emerald-500/30"
                          : isLast
                          ? "bg-blue-600 border-white dark:border-slate-900 shadow-xs ring-2 ring-blue-500/30"
                          : "bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-500"
                      }`}
                    />
                  </div>

                  {/* İskele Adı */}
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

                {/* Bağlantı Çizgisi (Duraklar arası hat segmenti) */}
                {!isLast && (
                  <div className="flex-1 min-w-8 sm:min-w-12 h-0.5 bg-linear-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 mx-1 mb-4" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
