"use client";

import { Bell, BellRing, ChevronRight, Star } from "lucide-react";

export interface ScheduleCardActionsProps {
  isFav: boolean;
  hasAlarm: boolean;
  onToggleFavorite: () => void;
  onToggleAlarm: () => void;
  variant: "compact" | "full";
}

/**
 * Sefer kartı hızlı eylemleri: favori, alarm (hatırlatıcı) ve detay oku.
 * Kompakt ve tam görünümde aynı davranış, farklı ölçek.
 */
export function ScheduleCardActions({
  isFav,
  hasAlarm,
  onToggleFavorite,
  onToggleAlarm,
  variant,
}: ScheduleCardActionsProps) {
  const isCompact = variant === "compact";
  const iconSize = isCompact ? 14 : 15;
  const chevronSize = isCompact ? 15 : 16;
  const activeScale = isCompact ? "active:scale-95" : "active:scale-90";

  const favClass = isFav
    ? `text-amber-500${isCompact ? "" : " dark:text-amber-400"} bg-amber-100 dark:bg-amber-400/20 ring-1 ring-amber-400/30`
    : `text-slate-400 hover:text-amber-500${
        isCompact ? "" : " dark:hover:text-amber-300"
      } hover:bg-slate-100 dark:hover:bg-slate-800`;

  const alarmClass = hasAlarm
    ? `text-blue-600${isCompact ? "" : " dark:text-blue-400"} bg-blue-100 dark:bg-blue-500/20 ring-1 ring-blue-500/30`
    : `text-slate-400 hover:text-blue-600${
        isCompact ? "" : " dark:hover:text-blue-300"
      } hover:bg-slate-100 dark:hover:bg-slate-800`;

  const chevronClass = isCompact
    ? "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all shrink-0 ml-0.5"
    : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5";

  return (
    <div className={`flex items-center gap-1 shrink-0${isCompact ? " text-right" : ""}`}>
      {/* Favori */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
        aria-pressed={isFav}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeScale} touch-manipulation cursor-pointer ${favClass}`}
      >
        <Star size={iconSize} className={isFav ? "fill-amber-500 text-amber-500" : ""} />
      </button>

      {/* Alarm / Hatırlatıcı */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleAlarm();
        }}
        title={hasAlarm ? "Hatırlatıcıyı Kaldır" : "15 Dk Önce Hatırlat"}
        aria-label={hasAlarm ? "Hatırlatıcıyı kaldır" : "15 dakika önce hatırlat"}
        aria-pressed={hasAlarm}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeScale} touch-manipulation cursor-pointer ${alarmClass}`}
      >
        {hasAlarm ? (
          <BellRing
            size={iconSize}
            className={`text-blue-600${isCompact ? "" : " dark:text-blue-400"} animate-bounce`}
          />
        ) : (
          <Bell size={iconSize} />
        )}
      </button>

      {/* Detay oku */}
      <ChevronRight size={chevronSize} className={chevronClass} />
    </div>
  );
}
