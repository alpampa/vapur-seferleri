"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Footprints, Navigation, Clock, AlertTriangle, CheckCircle2, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { ISTANBUL_PIERS } from "@/lib/data/piers";
import { TURNSTILE_GANGWAY_BUFFER_MIN } from "@/lib/constants";
import { estimateWalkingMinutes } from "@/lib/utils/boarding-deadline";
import { useTransitClock } from "@/hooks/useTransitClock";

interface CatchFerryWalkingTimerProps {
  departureTime: string; // e.g. "19:45"
  originPier: string;    // e.g. "Kadıköy"
}

export function CatchFerryWalkingTimer({ departureTime, originPier }: CatchFerryWalkingTimerProps) {
  const [distanceMeters, setDistanceMeters] = useState<number>(600); // default 600m (~7-8 min walk)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isChimeEnabled, setIsChimeEnabled] = useState<boolean>(false);
  const [hasPlayedChime, setHasPlayedChime] = useState<boolean>(false);

  // Tek saat kaynağı: useTransitClock (1sn tick, sekme gizliyken durur)
  const { nowMs } = useTransitClock();

  // Find origin pier coordinates
  const pierCoords = useMemo(() => {
    const norm = (originPier || "").toLowerCase();
    const entry = Object.entries(ISTANBUL_PIERS).find(([key]) => norm.includes(key.toLowerCase()));
    return entry ? entry[1] : { lat: 40.9908, lng: 29.0225, region: "Anadolu" }; // fallback Kadıköy
  }, [originPier]);

  // Haversine formula
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        const dist = calculateDistanceMeters(coords.lat, coords.lng, pierCoords.lat, pierCoords.lng);
        setDistanceMeters(Math.max(50, Math.min(10000, dist)));
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setIsLocating(false);
        alert("Konum izni alınamadı. Manuel mesafe butonlarını kullanabilirsiniz.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Sound chime with Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  };

  // Walking calculations — tek doğruluk kaynağı: lib/constants + boarding-deadline
  const walkingMinutes = estimateWalkingMinutes(distanceMeters);
  const turnstileBufferMinutes = TURNSTILE_GANGWAY_BUFFER_MIN;
  const totalTravelNeededMinutes = walkingMinutes + turnstileBufferMinutes;

  // Minutes until departure
  const { minutesUntilDeparture, leaveThresholdMinutes, departureDate } = useMemo(() => {
    const [depH, depM] = departureTime.split(":").map(Number);
    if (isNaN(depH) || isNaN(depM)) {
      return { minutesUntilDeparture: 0, leaveThresholdMinutes: 0, departureDate: new Date(nowMs) };
    }

    const dep = new Date(nowMs);
    dep.setHours(depH, depM, 0, 0);

    // If departure time is earlier than current time by more than 2 hours, it could be past or tomorrow
    let diffMs = dep.getTime() - nowMs;
    if (diffMs < -2 * 60 * 60 * 1000) {
      dep.setDate(dep.getDate() + 1);
      diffMs = dep.getTime() - nowMs;
    }

    const diffMin = Math.round(diffMs / 60000);
    const threshold = diffMin - totalTravelNeededMinutes;

    return {
      minutesUntilDeparture: diffMin,
      leaveThresholdMinutes: threshold,
      departureDate: dep
    };
  }, [departureTime, nowMs, totalTravelNeededMinutes]);

  // Audio trigger
  useEffect(() => {
    if (isChimeEnabled && !hasPlayedChime && leaveThresholdMinutes <= 3 && leaveThresholdMinutes >= 0) {
      playChime();
      setHasPlayedChime(true);
    }
  }, [isChimeEnabled, hasPlayedChime, leaveThresholdMinutes]);

  // Visual status
  let statusBadge = {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-800/60",
    text: "text-emerald-700 dark:text-emerald-300",
    title: "Vakit Var",
    message: `En geç ${leaveThresholdMinutes} dakika içinde yola çıkmalısınız.`
  };

  if (minutesUntilDeparture <= 0) {
    statusBadge = {
      bg: "bg-slate-100 dark:bg-slate-800/60",
      border: "border-slate-300 dark:border-slate-700",
      text: "text-slate-600 dark:text-slate-400",
      title: "Vapur Ayrıldı",
      message: "Bu sefer için hareket saati geçti."
    };
  } else if (leaveThresholdMinutes < 0) {
    statusBadge = {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-300 dark:border-rose-800/60",
      text: "text-rose-700 dark:text-rose-300",
      title: "Yetişme Riski!",
      message: `Normal yürüyüşle ~${Math.abs(leaveThresholdMinutes)} dk gecikme riski. Hızlı adımlarla yetişebilirsiniz.`
    };
  } else if (leaveThresholdMinutes <= 5) {
    statusBadge = {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-300 dark:border-amber-800/60",
      text: "text-amber-700 dark:text-amber-300",
      title: "Hemen Çıkmalısınız!",
      message: `En geç ${leaveThresholdMinutes} dakika içinde evden/işten çıkmanız gerekiyor.`
    };
  }

  return (
    <div className={`rounded-2xl border ${statusBadge.border} ${statusBadge.bg} p-3.5 shadow-2xs transition-all`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Footprints size={16} />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white block">
              VAPURU KAÇIRMA ZAMANLAYICISI
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Konumunuza göre kapıdan çıkış eşiğini dinamik hesaplar
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !isChimeEnabled;
            setIsChimeEnabled(next);
            if (next) playChime();
          }}
          className={`p-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1 font-bold ${
            isChimeEnabled
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/50"
              : "bg-white/80 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
          }`}
          title={isChimeEnabled ? "Sesli Çıkış Uyarısı Açık" : "Sesli Çıkış Uyarısını Aç"}
        >
          {isChimeEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span className="text-[10px] hidden sm:inline">{isChimeEnabled ? "Alarm Açık" : "Sessiz"}</span>
        </button>
      </div>

      {/* Main Countdown Banner */}
      <div className="mt-3 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black uppercase ${statusBadge.text}`}>
              {statusBadge.title}
            </span>
            <span>•</span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              Kalkış: {departureTime}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {statusBadge.message}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Kalan Rahat Süre</span>
          <strong className={`text-base sm:text-lg font-mono font-black ${statusBadge.text}`}>
            {leaveThresholdMinutes > 0 ? `${leaveThresholdMinutes} dk` : leaveThresholdMinutes === 0 ? "0 dk" : `-${Math.abs(leaveThresholdMinutes)} dk`}
          </strong>
        </div>
      </div>

      {/* Distance & Walking Specs */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Yürüme Süresi</span>
          <strong className="font-mono font-black text-slate-800 dark:text-slate-200">
            ~{walkingMinutes} dk
          </strong>
          <span className="text-[10px] text-slate-500 block">({distanceMeters} metre @ 80m/dk)</span>
        </div>

        <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Turnike & Biniş Emniyeti</span>
          <strong className="font-mono font-black text-slate-800 dark:text-slate-200">
            +{turnstileBufferMinutes} dk Pay
          </strong>
          <span className="text-[10px] text-slate-500 block">Turnike ve rampa geçişi</span>
        </div>
      </div>

      {/* Distance Preset Selector / GPS */}
      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <span>İskeleye Mesafe:</span>
          {[300, 600, 1000, 1500].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setDistanceMeters(m);
                setUserCoords(null);
              }}
              className={`px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                distanceMeters === m && !userCoords
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              {m >= 1000 ? `${m / 1000}km` : `${m}m`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <Navigation size={11} className={isLocating ? "animate-spin" : ""} />
          <span>{isLocating ? "Konum Alınıyor..." : userCoords ? "GPS Güncellendi" : "GPS'ten Hesapla"}</span>
        </button>
      </div>
    </div>
  );
}
