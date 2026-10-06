"use client";

import type { DynamicWaypointView } from "@/lib/utils/dynamic-trip";

interface DepartureTimelineProps {
  waypoints: DynamicWaypointView[];
}

/**
 * G4 — Dikey yolculuk timeline'ı (metro/havalimanı bilgi ekranı hissi).
 * "Bir liste gibi değil, yolculuk timeline'ı gibi" tasarım hedefi.
 *
 * Durum bilgisi renk + dolgu + metin ağırlığıyla taşınır (renk dışında da
 * bilgi verilir — WCAG). Animasyon yok; bilgi hareket etmez, sadece değişir.
 */
export function DepartureTimeline({ waypoints }: DepartureTimelineProps) {
  if (waypoints.length === 0) return null;

  return (
    <ol className="mt-1" aria-label="Güzergah durakları ve saatleri">
      {waypoints.map((wp, idx) => {
        const isCompleted = wp.state === "COMPLETED";
        const isCurrent = wp.state === "CURRENT";
        const isLast = idx === waypoints.length - 1;
        const isDestination = wp.isDestination || isLast;

        return (
          <li key={`${wp.name}-${idx}`} className="flex gap-3">
            {/* Durak noktası ve bağlantı rayı */}
            <div className="flex flex-col items-center shrink-0 w-4 self-stretch">
              <span
                aria-hidden="true"
                className={[
                  "mt-1 shrink-0",
                  isDestination ? "w-3.5 h-3.5 rounded-[4px]" : "w-3 h-3 rounded-full",
                  isCompleted
                    ? "bg-slate-300 dark:bg-slate-600"
                    : isCurrent
                    ? "bg-amber-400 ring-4 ring-amber-400/20"
                    : isDestination
                    ? "border-[3px] border-slate-400 dark:border-slate-500"
                    : "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900",
                ].join(" ")}
              />
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`w-0.5 flex-1 my-1 rounded-full ${
                    isCompleted
                      ? "bg-slate-300 dark:bg-slate-600"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>

            {/* Durak adı + saat (saat tabular-nums ile hızlı taranabilir) */}
            <div
              className={`flex items-baseline justify-between gap-3 min-w-0 flex-1 ${
                isLast ? "pb-0.5" : "pb-3"
              }`}
            >
              <span
                className={`text-xs truncate ${
                  isCurrent
                    ? "font-black text-slate-900 dark:text-white"
                    : isCompleted
                    ? "font-medium text-slate-400 dark:text-slate-500"
                    : "font-bold text-slate-700 dark:text-slate-200"
                }`}
              >
                {wp.name}
              </span>
              <span
                className={`font-mono text-xs tabular-nums shrink-0 ${
                  isCurrent
                    ? "font-black text-amber-600 dark:text-amber-400"
                    : isCompleted
                    ? "text-slate-400 dark:text-slate-500"
                    : "font-bold text-slate-600 dark:text-slate-300"
                }`}
              >
                {wp.time}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
