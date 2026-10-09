"use client";

import { Moon, ShieldAlert } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { hhmmToMinutes } from "@/lib/utils/istanbul-time";

interface LastFerrySafeguardBannerProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
}

/**
 * Son Vapuru Kaçırma Asistanı (Last Ferry Safeguard)
 * Akşam ve gece saatlerinde (20:00 sonrası) adada veya karşı yakada kalan yolcular için
 * o günkü son dönüş seferlerini ve kalan süreyi emniyet rozetiyle vurgular.
 */
export function LastFerrySafeguardBanner({
  schedules,
  serverTimeIso,
}: LastFerrySafeguardBannerProps) {
  const now = new Date(serverTimeIso);
  const hour = now.getHours();

  // Yalnızca akşam 19:30 ile gece 04:00 arasında tetiklenir
  const isEveningOrNight = hour >= 19 || hour < 4;
  if (!isEveningOrNight || schedules.length === 0) {
    return null;
  }

  // Akşam 22:00 sonrasına ait son seferleri bul
  const lateTrips = schedules.filter((s) => {
    const mins = hhmmToMinutes(s.departureTime);
    return mins != null && (mins >= 22 * 60 || mins < 4 * 60);
  });

  if (lateTrips.length === 0) {
    return null;
  }

  // En geç kalkan son sefer
  const finalTrip = lateTrips.reduce((latest, current) => {
    let mLatest = hhmmToMinutes(latest.departureTime) ?? 0;
    let mCurrent = hhmmToMinutes(current.departureTime) ?? 0;
    if (mLatest < 4 * 60) mLatest += 24 * 60;
    if (mCurrent < 4 * 60) mCurrent += 24 * 60;
    return mCurrent > mLatest ? current : latest;
  }, lateTrips[0]);

  return (
    <div className="w-full px-3 pt-1.5 animate-fadeIn">
      <div className="rounded-xl border border-indigo-400/50 bg-linear-to-r from-indigo-950/80 via-slate-900/90 to-blue-950/80 p-2.5 text-white shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 text-indigo-300">
            <Moon size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                <ShieldAlert size={10} className="text-amber-400" />
                Son Vapur Asistanı
              </span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
                Gece Güvencesi
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-200 truncate mt-0.5">
              Son Sefer: <strong className="text-[#FFC72C] font-mono text-xs">{finalTrip.departureTime}</strong> • {finalTrip.origin} ➔ {finalTrip.destination}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg shrink-0">
          {finalTrip.operator}
        </span>
      </div>
    </div>
  );
}
