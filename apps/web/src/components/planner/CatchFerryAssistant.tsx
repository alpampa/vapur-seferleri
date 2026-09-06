"use client";

import { useState } from "react";
import { Footprints, Navigation, ChevronDown, ChevronUp } from "lucide-react";
import { useWalkingCatchStore } from "@/store/useWalkingCatchStore";

export function CatchFerryAssistant({ currentPier = "Kadıköy" }: { currentPier?: string }) {
  const { isEnabled, toggleEnabled, userDistanceMeters, setDistanceMeters, setUserLocation, userLocation } = useWalkingCatchStore();
  const [isLocating, setIsLocating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const walkingMinutes = Math.max(1, Math.round(userDistanceMeters / 80));

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Konum izni alınamadı. Manuel mesafe seçebilirsiniz.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs mb-3 text-slate-900 dark:text-white transition-all">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isEnabled ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}>
            <Footprints size={18} className={isEnabled ? "animate-pulse" : ""} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white">
                VAPURA YETİŞME ASİSTANI
              </h4>
              {isEnabled && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  AKTİF • ~{walkingMinutes} DK YÜRÜME
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              İskeleye yürüme mesafenize göre hangi vapura yetişebileceğinizi renkli rozetlerle hesaplar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleEnabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isEnabled
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {isEnabled ? "Açık" : "Etkinleştir"}
          </button>
          {isEnabled && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {isEnabled && isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500">İskeleye Uzaklığınız:</span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => setDistanceMeters(300)}
                className={`py-1 px-2 rounded-lg border font-bold transition-all ${
                  userDistanceMeters === 300 ? "bg-blue-600 text-white border-blue-400" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                300m (~4 dk)
              </button>
              <button
                onClick={() => setDistanceMeters(600)}
                className={`py-1 px-2 rounded-lg border font-bold transition-all ${
                  userDistanceMeters === 600 ? "bg-blue-600 text-white border-blue-400" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                600m (~8 dk)
              </button>
              <button
                onClick={() => setDistanceMeters(1000)}
                className={`py-1 px-2 rounded-lg border font-bold transition-all ${
                  userDistanceMeters === 1000 ? "bg-blue-600 text-white border-blue-400" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                1 km (~13 dk)
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all"
            >
              <Navigation size={13} className={isLocating ? "animate-spin text-blue-500" : "text-blue-500"} />
              <span>{isLocating ? "Konum Hesaplanıyor..." : userLocation ? "Canlı Konum Doğrulandı" : "GPS Konumumu Algıla"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
