"use client";

import React, { useEffect, useRef } from "react";
import type { UnderwaySegment } from "@/lib/utils/dynamic-trip";
import { AdaVapuruIcon } from "@/components/ui/AdaVapuruIcon";

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
 * `underway` verilirse ada vapuru ikonu zamana göre ilerler: seyir mavi, iskeleye
 * yaklaşırken (≤ 3 dk) amber yanıp söner, varışta yeşile döner (metro mantığı).
 *
 * KULLANICI KURALI (mobil): Şeritteki durak adları HER ZAMAN TAM yazılır —
 * kısaltma yok. Vapur bir duraktan hareket ettiğinde o durak şeridin SOL
 * kenarına yaslanır: geçmiş duraklar ekrandan tamamen çıkar, yalnız
 * "şu an + ileri" görünür (elle kaydırma her zaman önceliklidir; dokunuş
 * sonrası otomatik kaydırma 6 sn duraklar). Otomatik kaydırma asla sola
 * (geçmişe) yapılmaz.
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shipRef = useRef<HTMLDivElement | null>(null);
  const pausedUntilRef = useRef(0);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const alignedIndexRef = useRef<number | null>(null);

  const live = underway ?? null;

  // Kullanıcı dokunuşu/kaydırması otomatik kaydırmayı 6 sn duraklatır
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const pause = () => {
      pausedUntilRef.current = Date.now() + 6000;
    };
    scroller.addEventListener("pointerdown", pause);
    scroller.addEventListener("wheel", pause, { passive: true });
    return () => {
      scroller.removeEventListener("pointerdown", pause);
      scroller.removeEventListener("wheel", pause);
    };
  }, []);

  // KULLANICI KURALI: Sefer her duraktan hareket ettiğinde o durak şeridin SOL
  // kenarına yaslanır — "şu andan itibaren ilk kalkış" görünümü. Geçmiş duraklar
  // ekrandan tamamen çıkar; isim asla kenarda kesilmez (elle kaydırma hariç).
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || live == null) return;
    if (Date.now() < pausedUntilRef.current) return;
    if (alignedIndexRef.current === live.fromIndex) return;
    const node = nodeRefs.current[live.fromIndex];
    if (!node) return;
    alignedIndexRef.current = live.fromIndex;
    scroller.scrollTo({ left: Math.max(0, node.offsetLeft - 8), behavior: "smooth" });
  }, [live?.fromIndex, live]);

  // Seyir ortasında gemi sağ banda yaklaşırsa şerit sağa kaydırılır (gemi hep
  // görünür kalır). Otomatik kaydırma ASLA sola yapılmaz → geçmiş duraklar
  // kendiliğinden geri gelmez, yalnız "şu an + ileri" görünür.
  useEffect(() => {
    const scroller = scrollRef.current;
    const ship = shipRef.current;
    if (!scroller || !ship || live == null) return;
    if (Date.now() < pausedUntilRef.current) return;
    const scRect = scroller.getBoundingClientRect();
    const shRect = ship.getBoundingClientRect();
    const shipCenter = shRect.left + shRect.width / 2;
    if (shipCenter > scRect.left + scRect.width * 0.72) {
      const delta = shipCenter - (scRect.left + scRect.width * 0.55);
      scroller.scrollBy({ left: delta, behavior: "smooth" });
    }
  }, [live?.fromIndex, live?.ratio, live?.hasArrived, live]);

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

  return (
    <div className="w-full mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 animate-fadeIn">
      <div ref={scrollRef} className="overflow-x-auto hide-scrollbar py-1">
        <div className="relative flex items-center min-w-max px-1">
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
                <div
                  ref={(el) => {
                    nodeRefs.current[index] = el;
                  }}
                  className="flex flex-col items-center group/stop"
                >
                  {stop.time && (
                    <span className="text-[9px] sm:text-[9.5px] font-mono tabular-nums font-bold text-slate-500 dark:text-slate-400 leading-none mb-2">
                      {stop.time}
                    </span>
                  )}

                  <div className="relative flex items-center justify-center">
                    <span className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${dotClass}`} />
                  </div>

                  {/* KULLANICI KURALI: durak adları ALTTA her zaman TAM yazılır —
                      kısaltma yalnızca ÜST rota satırındadır. */}
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
                    <div className="relative flex-1 min-w-7 sm:min-w-14 h-0.5 mx-1 mb-4 rounded-full bg-slate-200 dark:bg-slate-700">
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
                        ref={shipRef}
                        className="absolute bottom-0 z-10 -translate-x-1/2 translate-y-[2px] transition-[left] duration-1000 ease-linear"
                        style={{ left: `${live.ratio * 100}%` }}
                      >
                        <AdaVapuruIcon
                          className={`w-6 h-4 sm:w-7 sm:h-4.5 transition-[filter,opacity] duration-700 ${
                            live.hasArrived
                              ? "drop-shadow-[0_0_2.5px_rgba(16,185,129,0.9)]"
                              : live.isApproaching
                              ? "drop-shadow-[0_0_2.5px_rgba(245,158,11,0.9)]"
                              : "drop-shadow-[0_0_2px_rgba(59,130,246,0.7)]"
                          }`}
                        />
                      </div>
                    </div>
                  ) : isDoneSegment ? (
                    <div className="flex-1 min-w-7 sm:min-w-14 h-0.5 rounded-full bg-emerald-500 mx-1 mb-4" />
                  ) : (
                    <div className="flex-1 min-w-7 sm:min-w-14 h-0.5 bg-linear-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 mx-1 mb-4" />
                  ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
