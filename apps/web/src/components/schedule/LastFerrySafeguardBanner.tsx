"use client";

import { Moon, ShieldAlert, ChevronRight } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { getIstanbulParts, hhmmToMinutes } from "@/lib/utils/istanbul-time";

interface LastFerrySafeguardBannerProps {
  schedules: ScheduleCardDto[];
  /** Ekranda hâlihazırda görünen seferler — mükerrer duyuru engeli için. */
  visibleSchedules?: ScheduleCardDto[];
  serverTimeIso: string;
  onOpenNightTransit?: () => void;
}

/**
 * Son Vapuru Kaçırma Asistanı (Last Ferry Safeguard)
 * Yalnızca gece 23:45 ile 02:00 arasında aktif olur; gündüz ve akşam saatlerinde
 * boşuna satır kaplamaz. 03:45 gibi 24 saatlik nöbetçi seferleri değil, gece yarısı
 * kapanan hatların son seferlerini baz alır ve tıklandığında Gece Ulaşım Rehberini açar.
 */
export function LastFerrySafeguardBanner({
  schedules,
  visibleSchedules,
  serverTimeIso,
  onOpenNightTransit,
}: LastFerrySafeguardBannerProps) {
  const serverMs = Date.parse(serverTimeIso) || Date.now();
  const { hour, minute } = getIstanbulParts(serverMs);

  // KULLANICI KURALI: Yalnızca gece 23:45 sonrasında (23:45 – 01:59 arası) gösterilir.
  // Normal akşam saatlerinde (21:00, 22:00 vb.) boşuna satır kaplamaz.
  const isLateNightWindow = (hour === 23 && minute >= 45) || hour === 0 || hour === 1;
  if (!isLateNightWindow || schedules.length === 0) {
    return null;
  }

  const nowTotalMins = hour < 4 ? (hour + 24) * 60 + minute : hour * 60 + minute;

  // Gece 23:45 - 02:00 arasındaki gerçek son seferleri bul (03:45 gibi 24 saatlik sabaha karşı seferleri hariç tut)
  const lateTrips = schedules.filter((s) => {
    const mins = hhmmToMinutes(s.departureTime);
    if (mins == null) return false;
    const normMins = mins < 4 * 60 ? mins + 24 * 60 : mins;
    // Yalnızca henüz kalkmamış ve 23:45 (1425) ile 02:00 (1560) arasındaki kapanış seferleri
    return normMins >= nowTotalMins && normMins >= 23 * 60 + 45 && normMins <= 26 * 60;
  });

  if (lateTrips.length === 0) {
    return null;
  }

  // En yakın/son gece seferi
  const finalTrip = lateTrips.reduce((earliest, current) => {
    let mEarliest = hhmmToMinutes(earliest.departureTime) ?? 0;
    let mCurrent = hhmmToMinutes(current.departureTime) ?? 0;
    if (mEarliest < 4 * 60) mEarliest += 24 * 60;
    if (mCurrent < 4 * 60) mCurrent += 24 * 60;
    return mCurrent < mEarliest ? current : earliest;
  }, lateTrips[0]);

  // MÜKERRER BİLGİ YASAĞI: Bu sefer listede zaten görünüyorsa bandı gösterme.
  if (
    visibleSchedules &&
    visibleSchedules.some(
      (v) =>
        v.origin === finalTrip.origin &&
        v.destination === finalTrip.destination &&
        v.departureTime === finalTrip.departureTime
    )
  ) {
    return null;
  }

  return (
    <div className="w-full px-3 pt-1.5">
      <button
        type="button"
        onClick={onOpenNightTransit}
        className="w-full text-left rounded-xl border border-indigo-400/50 bg-linear-to-r from-indigo-950/80 via-slate-900/90 to-blue-950/80 hover:from-indigo-900/80 hover:to-blue-900/80 p-2.5 text-white shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 text-indigo-300">
            <Moon size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                <ShieldAlert size={10} className="text-amber-400" />
                Gece Son Sefer Uyarısı
              </span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
                23:45+
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-200 truncate mt-0.5">
              Yaklaşan Gece Seferi: <strong className="text-[#FFC72C] font-mono text-xs">{finalTrip.departureTime}</strong> • {finalTrip.origin} ➔ {finalTrip.destination}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
          <span>Gece Rehberi</span>
          <ChevronRight size={12} />
        </span>
      </button>
    </div>
  );
}

