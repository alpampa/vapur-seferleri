"use client";

import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { Ship, Radar, X, Bell, AlarmClock, Volume2, Navigation, Compass, Radio } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { MarineAisRadarModal } from "@/components/map/MarineAisRadarModal";
import { OnboardVoyageModal } from "@/components/voyage/OnboardVoyageModal";
import { Gauge } from "lucide-react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { playHistoricalFerryHorn, requestNotificationPermission } from "@/lib/utils/sound";
import { correlateAisVessel, CorrelatedAisResult } from "@/lib/services/ais-corridor-tracker";
import { useTransitClock } from "@/hooks/useTransitClock";
import { istanbulIsoFor, nightRolloverDayOffset } from "@/lib/utils/istanbul-time";
import { SLOW_TICK_INTERVAL_MS } from "@/lib/constants";

export function LiveTripTrackerBar() {
  const { activeVoyage, clearActiveVoyage } = useActiveVoyageStore();
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const { isAlarmSet, toggleAlarm } = useAlarmStore();

  const hornBlownRef = useRef(false);
  const departureNotifiedRef = useRef(false);

  // Tek saat kaynağı: useTransitClock (aktif yolculukta 1sn tick, boştayken yavaş kademe;
  // sekme gizliyken durar — Y4)
  const { nowMs } = useTransitClock(activeVoyage ? 1000 : SLOW_TICK_INTERVAL_MS);

  // AIS korelasyonu türetilmiş değerdir: state + setInterval yerine her tick'te yeniden hesaplanır.
  const aisData = useMemo<CorrelatedAisResult | null>(() => {
    if (!activeVoyage) return null;
    return correlateAisVessel(
      activeVoyage.origin,
      activeVoyage.destination,
      activeVoyage.departureTime,
      undefined,
      nowMs
    );
  }, [activeVoyage, nowMs]);

  // Gerçek kalkış geri sayımı: tarife saati + gece yarısı geçiş kuralından türetilir.
  // (Eski kod useState(600) ile sahte bir 10 dk sayacı işletiyordu — gerçek kalkışla ilişkili değildi.)
  const secondsRemaining = useMemo(() => {
    if (!activeVoyage) return 0;
    const depIso = istanbulIsoFor(
      activeVoyage.departureTime,
      nowMs,
      nightRolloverDayOffset(activeVoyage.departureTime, nowMs) === 1
    );
    if (!depIso) return 0;
    return Math.max(0, Math.round((new Date(depIso).getTime() - nowMs) / 1000));
  }, [activeVoyage, nowMs]);

  // Yeni yolculuk başladığında ref'leri sıfırla (bildirim/horn effect'lerinden önce çalışır)
  useEffect(() => {
    hornBlownRef.current = false;
    departureNotifiedRef.current = false;
  }, [activeVoyage]);

  // AIS korelasyon yan etkileri: Kilit Ekranı / Dynamic Island güncellemesi ve kalkış bildirimi.
  // (aisData artık yukarıda useMemo ile türetiliyor; burada yalnızca yan etkiler var.)
  useEffect(() => {
    if (!activeVoyage || !aisData) return;

    const result = aisData;

    // Kilit Ekranı / Dynamic Island Canlı Güncellemesi (W3C MediaSession API)
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      try {
        const statusText = `Tahmini: ${activeVoyage.vesselName} (${result.statusLabel})`;

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

    // Kalkış saati geldiğinde tarifeye dayalı kalkış bildirimi
    if (result.status === "CASTING_OFF" && !departureNotifiedRef.current) {
      departureNotifiedRef.current = true;
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(`Kalkış saati: ${activeVoyage.origin}`, {
          body: `${activeVoyage.origin} iskelesinden ${activeVoyage.destination}'a tarifedeki seferin kalkış saati geldi. (Canlı doğrulama bağlı değil, tahmini)`,
          icon: "/favicon.ico",
          tag: `dep-${activeVoyage.id}`
        });
      }
    }
  }, [activeVoyage, aisData]);

  // Son 3 dakikada otomatik buharlı vapur düdüğü çal (gerçek kalkış saatine göre).
  // <= 180 kontrolü, tick atlamalarında (ör. sekme arka planda kaldığında) 180'in atlanmasını da karşılar.
  useEffect(() => {
    if (!activeVoyage) return;
    if (!hornBlownRef.current && secondsRemaining <= 180 && secondsRemaining > 0) {
      hornBlownRef.current = true;
      playHistoricalFerryHorn();
    }
  }, [activeVoyage, secondsRemaining]);

  if (!activeVoyage) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLast5Min = minutes < 5;
  const hasAlarm = isAlarmSet(activeVoyage.id);

  const displayVesselName = activeVoyage.vesselName;

  return (
    <>
      {/* Dynamic Island / Kilit Ekranı Canlı Takip Çubuğu */}
      <div className="fixed bottom-[74px] sm:bottom-6 left-2.5 right-2.5 sm:left-auto sm:right-6 z-40 sm:max-w-md bg-[#080d1a]/95 text-white border-2 border-emerald-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all bg-blue-600/20 text-blue-400 border-blue-500/40`}>
              <Ship size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono font-black text-sm text-white truncate">
                  {displayVesselName}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-200">
                  <span>Tahmini seyir</span>
                </span>
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
              title="Tahmini Seyir Hattı ve Harita"
            >
              <Radar size={14} />
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
              <Radio size={10} />
              <span>Tahmini hız: {aisData?.speedKnots ?? 0} kn • Rota: {aisData?.headingDeg ?? 0}°</span>
            </span>
            <span className="text-amber-300 font-black">
              {aisData?.status === "CONFIRMED_EN_ROUTE"
                ? `Tahmini kalan: ~${aisData.etaMinutes} dk (%${aisData.progressPercent})`
                : `Kalkışa ${formattedCountdown}`}
            </span>
          </div>

          {/* İlerleme Çizgisi */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 bg-blue-500`}
              style={{ width: `${aisData && aisData.status !== "WAITING_DEPARTURE" ? aisData.progressPercent : 5}%` }}
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
