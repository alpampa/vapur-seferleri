"use client";

import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { Ship, Radar, X, Bell, AlarmClock, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MarineAisRadarModal } from "@/components/map/MarineAisRadarModal";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playHistoricalFerryHorn } from "@/lib/utils/sound";

export function LiveTripTrackerBar() {
  const { activeVoyage, clearActiveVoyage } = useActiveVoyageStore();
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  const hornBlownRef = useRef(false);

  // Kilit Ekranı Canlı Aktivite (W3C MediaSession & Notification API)
  useEffect(() => {
    if (!activeVoyage || typeof window === "undefined") return;

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `🚢 ${activeVoyage.vesselName} (${activeVoyage.departureTime})`,
          artist: `${activeVoyage.origin} ➔ ${activeVoyage.destination}`,
          album: `İBB Şehir Hatları • Canlı Takip`,
          artwork: [
            { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" }
          ]
        });
      } catch (e) {}
    }
  }, [activeVoyage]);

  useEffect(() => {
    if (!activeVoyage) return;
    hornBlownRef.current = false;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        // ÖNERİ 3: Son 3 dakikada (180 saniye) otomatik buharlı vapur düdüğü çal
        if (next === 180 && !hornBlownRef.current) {
          hornBlownRef.current = true;
          playHistoricalFerryHorn();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeVoyage]);

  if (!activeVoyage) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLast5Min = minutes < 5;
  const hasAlarm = isAlarmSet(activeVoyage.id);

  return (
    <>
      <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 sm:max-w-md bg-[#090e1a]/95 text-white border border-blue-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Ship size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono font-black text-xs text-white truncate">
                  🚢 {activeVoyage.vesselName}
                </span>
                <span className="text-[10px] text-blue-400 font-bold">
                  ({activeVoyage.origin} ➔ {activeVoyage.destination})
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-mono font-black px-1.5 py-0.2 rounded ${
                  isLast5Min ? "bg-amber-500/30 text-amber-300 border border-amber-400 animate-pulse" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  ⏳ KALKIŞA {formattedCountdown}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Saat: {activeVoyage.departureTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Buharlı Vapur Düdüğü Test / Çalma Butonu */}
            <button
              type="button"
              onClick={() => playHistoricalFerryHorn()}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1 shadow-sm transition-all"
              title="Tarihi Vapur Düdüğü Çal (Ses + Titreşim)"
            >
              <Volume2 size={14} className="animate-pulse" />
              <span className="hidden xs:inline">Düdük</span>
            </button>

            <button
              onClick={() => setIsRadarOpen(true)}
              className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              title="Canlı Radarda Takip Et"
            >
              <Radar size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden xs:inline">Radar</span>
            </button>

            <button
              onClick={() => toggleAlarm(activeVoyage.id)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                hasAlarm
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
              }`}
              title={hasAlarm ? "Alarmı İptal Et" : "Kalkış Alarmı Kur"}
            >
              <AlarmClock size={14} />
            </button>

            <button
              onClick={clearActiveVoyage}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      <MarineAisRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        origin={activeVoyage.origin}
        destination={activeVoyage.destination}
        vesselName={activeVoyage.vesselName}
        mmsi={activeVoyage.mmsi}
        operator={activeVoyage.operator}
        isConfirmedUnderway={true}
      />
    </>
  );
}
