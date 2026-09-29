"use client";

import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { Ship, Radar, X, Bell, AlarmClock, Volume2, Navigation, Compass, Radio, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MarineAisRadarModal } from "@/components/map/MarineAisRadarModal";
import { OnboardVoyageModal } from "@/components/voyage/OnboardVoyageModal";
import { Gauge } from "lucide-react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playHistoricalFerryHorn, requestNotificationPermission } from "@/lib/utils/sound";
import { correlateAisVessel, CorrelatedAisResult } from "@/lib/services/ais-corridor-tracker";

export function LiveTripTrackerBar() {
  const { activeVoyage, clearActiveVoyage } = useActiveVoyageStore();
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const [aisData, setAisData] = useState<CorrelatedAisResult | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  const hornBlownRef = useRef(false);
  const departureNotifiedRef = useRef(false);

  // AIS Departure & Corridor Correlation Loop (Runs every second)
  useEffect(() => {
    if (!activeVoyage) {
      setAisData(null);
      return;
    }

    const checkAis = () => {
      const result = correlateAisVessel(
        activeVoyage.origin,
        activeVoyage.destination,
        activeVoyage.departureTime,
        undefined,
        Date.now()
      );
      setAisData(result);

      // Kilit Ekranı / Dynamic Island Canlı Güncellemesi (W3C MediaSession API)
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          const statusText = result.isVerified 
            ? `🟢 ${result.vesselName} (${result.speedKnots} kn)`
            : `⏳ ${activeVoyage.vesselName} (Kalkış Bekleniyor)`;

          navigator.mediaSession.metadata = new MediaMetadata({
            title: statusText,
            artist: `${activeVoyage.origin} ➔ ${activeVoyage.destination} (ETA: ~${result.etaMinutes} dk)`,
            album: `İBB Canlı AIS Koridor Takibi • %${result.progressPercent} Yol Alındı`,
            artwork: [
              { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" }
            ]
          });
        } catch (e) {}
      }

      // Vapur Hareket Ettiğinde Web Push / Tarayıcı Bildirimi Tetikle
      if (result.status === "CASTING_OFF" && !departureNotifiedRef.current) {
        departureNotifiedRef.current = true;
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(`🌊 Vapur Hareket Etti: ${result.vesselName}`, {
            body: `${activeVoyage.origin} iskelesinden ${activeVoyage.destination}'a doğru hareket başladı. Rota açısı: ${result.headingDeg}°, Hız: ${result.speedKnots} knot.`,
            icon: "/favicon.ico",
            tag: `dep-${activeVoyage.id}`
          });
        }
      }
    };

    checkAis();
    const interval = setInterval(checkAis, 1000);
    return () => clearInterval(interval);
  }, [activeVoyage]);

  useEffect(() => {
    if (!activeVoyage) return;
    hornBlownRef.current = false;
    departureNotifiedRef.current = false;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        // Son 3 dakikada (180 saniye) otomatik buharlı vapur düdüğü çal
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
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLast5Min = minutes < 5;
  const hasAlarm = isAlarmSet(activeVoyage.id);

  const displayVesselName = aisData?.isVerified ? aisData.vesselName : activeVoyage.vesselName;

  return (
    <>
      {/* Dynamic Island / Kilit Ekranı Canlı Takip Çubuğu */}
      <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 sm:max-w-lg bg-[#080d1a]/95 text-white border-2 border-emerald-500/40 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              aisData?.isVerified
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/20"
                : "bg-blue-600/20 text-blue-400 border-blue-500/40"
            }`}>
              <Ship size={20} className={aisData?.isVerified ? "animate-pulse" : ""} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono font-black text-sm text-white truncate">
                  🚢 {displayVesselName}
                </span>
                {aisData?.isVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                    <CheckCircle2 size={10} />
                    <span>AIS DOĞRULANDI</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-blue-300 font-semibold truncate">
                {activeVoyage.origin} ➔ {activeVoyage.destination}
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bildirim İzni & Alarm */}
            <button
              onClick={() => {
                requestNotificationPermission();
                toggleAlarm(activeVoyage.id);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                hasAlarm
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
              }`}
              title={hasAlarm ? "Alarmı İptal Et" : "Kalkış Alarmı & Kilit Ekranı Bildirimi"}
            >
              <AlarmClock size={14} />
            </button>

            {/* Seyir Kokpiti */}
            <button
              type="button"
              onClick={() => setIsOnboardOpen(true)}
              className="p-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-300 text-xs font-black flex items-center gap-1 shadow-sm transition-all"
              title="Canlı Gemi İçi Seyir Kokpiti"
            >
              <Gauge size={14} className="text-blue-400" />
            </button>

            {/* Radar */}
            <button
              onClick={() => setIsRadarOpen(true)}
              className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              title="Canlı Radarda Takip Et"
            >
              <Radar size={14} className="animate-spin" style={{ animationDuration: "5s" }} />
            </button>

            {/* Kapat */}
            <button
              onClick={clearActiveVoyage}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Takibi Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Canlı Telemetri ve Koridor İlerleme Çubuğu */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Radio size={10} className="animate-pulse" />
              <span>Hız: {aisData?.speedKnots ?? 0} kn • Rota: {aisData?.headingDeg ?? 0}°</span>
            </span>
            <span className="text-amber-300 font-black">
              {aisData?.status === "CONFIRMED_EN_ROUTE"
                ? `⏳ Kalan: ~${aisData.etaMinutes} dk (%${aisData.progressPercent})`
                : `⏳ Kalkışa ${formattedCountdown}`}
            </span>
          </div>

          {/* İlerleme Çizgisi */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                aisData?.isVerified
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-sm shadow-emerald-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${aisData?.isVerified ? aisData.progressPercent : 5}%` }}
            />
          </div>
        </div>
      </div>

      <OnboardVoyageModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        vesselName={displayVesselName}
        origin={activeVoyage.origin}
        destination={activeVoyage.destination}
        departureTime={activeVoyage.departureTime}
        operator={activeVoyage.operator}
      />

      <MarineAisRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        origin={activeVoyage.origin}
        destination={activeVoyage.destination}
        vesselName={displayVesselName}
        mmsi={activeVoyage.mmsi}
        operator={activeVoyage.operator}
        isConfirmedUnderway={aisData?.isVerified ?? false}
      />
    </>
  );
}
