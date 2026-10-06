"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  MapPin,
  Clock,
  X,
  Star,
  Bell,
  BellRing,
  Pin,
  Radar,
  Camera,
  Train,
  Bus,
  Phone,
  Car,
  Compass,
  AlertOctagon,
  Anchor,
  ShieldCheck,
  Ticket,
  Timer,
  Sparkles,
  Volume2,
  Landmark,
  Tag,
  Gift
} from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { TripStatusBadge } from "./ScheduleCard";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { getTripAmenities } from "@/lib/utils/occupancy";
import { calculateDeckRecommendation } from "@/lib/utils/deck-guide";
import { getPierTransit } from "@/lib/data/pier-transit-connections";
import { getPierGroundTransit } from "@/lib/data/pier-taxi-transit";
import { getPierMobility } from "@/lib/data/pier-parking-bicycle";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { DepartureTimeline } from "@/components/schedule/DepartureTimeline";
import { SLOW_TICK_INTERVAL_MS } from "@/lib/constants";
import { resolveLiveVesselName } from "@/lib/agents/fleet-registry";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { correlateAisVessel } from "@/lib/services/ais-corridor-tracker";
import { useTransitClock } from "@/hooks/useTransitClock";
import { getIslandGuidePackage } from "@/lib/services/island-recommendation-engine";
import { transitAnnouncer } from "@/lib/services/tts-announcer";

import { PierLiveCameraModal } from "@/components/map/PierLiveCameraModal";
import { MissedFerryAssistantModal } from "@/components/planner/MissedFerryAssistantModal";
import { SharedSeaTaxiModal } from "@/components/taxishare/SharedSeaTaxiModal";

interface TripDetailsSheetProps {
  schedule: ScheduleCardDto | null;
  isOpen: boolean;
  onClose: () => void;
  serverTimeIso?: string;
}

export function TripDetailsSheet({
  schedule,
  isOpen,
  onClose,
  serverTimeIso
}: TripDetailsSheetProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { setActiveVoyage } = useActiveVoyageStore();

  // Tek saat kaynağı: useTransitClock (açıkken 1sn tick, kapalıyken yavaş kademe — Y4;
  // sekme gizliyken durur)
  const { nowMs } = useTransitClock(isOpen ? 1000 : SLOW_TICK_INTERVAL_MS);

  // Dinamik sefer durumu türetilmiş değerdir: her tick'te nowMs ile yeniden hesaplanır.
  // (state + setInterval + setState-in-effect deseninin yerine geçer)
  const dynState = useMemo<DynamicTripResolution | null>(() => {
    if (!schedule) return null;
    return resolveDynamicTrip(
      schedule.origin,
      schedule.destination,
      schedule.departureTime,
      schedule.targetTimeIso || new Date(nowMs).toISOString(),
      schedule.stops,
      schedule.arrivalTime,
      nowMs,
      serverTimeIso
    );
  }, [schedule, nowMs, serverTimeIso]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMissedOpen, setIsMissedOpen] = useState(false);
  const [isSeaTaxiOpen, setIsSeaTaxiOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"TICKET" | "RADAR" | "TRANSIT" | "GUIDE">("TICKET");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Escape tuşu ile kapatma (klavye erişilebilirliği)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!schedule) return null;

  const routeKey = `${schedule.origin} ➔ ${schedule.destination}`;
  const isFav = isFavorite(routeKey);
  const hasAlarm = isAlarmSet(schedule.id);

  const amenities = getTripAmenities(schedule.operator);
  const liveVessel = resolveLiveVesselName(
    schedule.origin,
    schedule.destination,
    schedule.operator,
    dynState?.isDeparted || false,
    dynState?.status || schedule.status,
    schedule.id
  );

  const aisData = correlateAisVessel(
    schedule.origin,
    schedule.destination,
    schedule.departureTime,
    schedule.targetTimeIso,
    nowMs
  );

  const originTransit = getPierTransit(schedule.origin);
  const destTransit = getPierTransit(schedule.destination);
  const groundTransit = getPierGroundTransit(schedule.origin);
  const pierMobility = getPierMobility(schedule.origin);
  const deckAdvice = calculateDeckRecommendation(
    schedule.origin,
    schedule.destination,
    schedule.departureTime
  );
  const isDirect = !schedule.stops || schedule.stops.length === 0;

  // AI 4: ADA TURİZM, KÜLTÜR VE SPONSORLU FIRSATLAR
  const islandGuide = useMemo(() => {
    return getIslandGuidePackage(schedule.destination) || getIslandGuidePackage(schedule.origin);
  }, [schedule.destination, schedule.origin]);

  const handleSpeakAnnouncement = () => {
    if (isSpeaking) {
      transitAnnouncer.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentOrigin = dynState?.currentOrigin || schedule.origin;
    const dest = dynState?.destination || schedule.destination;
    const depTime = dynState?.currentDepartureTime || schedule.departureTime;
    const minutesLeft = dynState?.minutesUntilDeparture;

    setIsSpeaking(true);
    transitAnnouncer.announceFerryDeparture(
      currentOrigin,
      dest,
      schedule.operator,
      depTime,
      minutesLeft
    );

    setTimeout(() => {
      setIsSpeaking(false);
    }, 6000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Clean Ergonomic Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Sefer detayı: ${schedule.origin}'den ${schedule.destination}'na ${schedule.departureTime}`}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0c1322] border-t border-slate-200 dark:border-slate-800 rounded-t-[28px] z-50 p-5 sm:p-7 text-slate-900 dark:text-white shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

            {/* 1. ÜST BAŞLIK VE HIZLI EYLEMLER */}
            <div className="flex justify-between items-start gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {dynState && (
                    <TripStatusBadge
                      status={dynState.status}
                      delayText={schedule.delayText}
                    />
                  )}
                  <OperatorLogo operator={schedule.operator} size="md" showName={true} />
                  {dynState?.countdown && !dynState.isDeparted && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse inline-flex items-center gap-1">
                      <Timer size={11} aria-hidden="true" /> Kalkışa {dynState.countdown}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>{dynState?.currentOrigin || schedule.origin}</span>
                  <span className="text-blue-500 font-extrabold">➔</span>
                  <span className="text-amber-500 dark:text-amber-400">
                    {dynState?.destination || schedule.destination}
                  </span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
                  {schedule.routeTitle || `${schedule.origin} - ${schedule.destination} Seferi`}
                </p>
              </div>

              {/* Action Buttons: Star, Bell, Pin, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(routeKey)}
                  title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                  aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                  aria-pressed={isFav}
                  className={`p-2 rounded-xl border transition-all ${
                    isFav
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-400"
                  }`}
                >
                  <Star size={16} className={isFav ? "fill-slate-950 text-slate-950" : ""} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    requestNotificationPermission();
                    toggleAlarm(schedule.id);
                  }}
                  title={hasAlarm ? "Hatırlatmayı Kaldır" : "5 Dk Kala Hatırlat"}
                  aria-label={hasAlarm ? "Hatırlatmayı kaldır" : "5 dakika kala hatırlat"}
                  aria-pressed={hasAlarm}
                  className={`p-2 rounded-xl border transition-all ${
                    hasAlarm
                      ? "bg-amber-500/20 border-amber-400 text-amber-500 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {hasAlarm ? (
                    <BellRing size={16} className="text-amber-500 animate-bounce" />
                  ) : (
                    <Bell size={16} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveVoyage({
                      id: schedule.id,
                      origin: dynState?.currentOrigin || schedule.origin,
                      destination: dynState?.destination || schedule.destination,
                      operator: schedule.operator,
                      vesselName: liveVessel.vesselName,
                      mmsi: liveVessel.mmsi,
                      departureTime: dynState?.currentDepartureTime || schedule.departureTime,
                      arrivalTime: schedule.arrivalTime || "",
                      price: schedule.price
                    });
                  }}
                  title="Canlı Takip Çubuğuna Sabitle"
                  aria-label="Seferi canlı takip çubuğuna sabitle"
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/60 transition-all"
                >
                  <Pin size={16} />
                </button>

                <button
                  onClick={onClose}
                  aria-label="Kapat"
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 2. ERGONOMİK 3 SEKME ÇUBUĞU (Apple Transit & Wallet Tarzı) */}
            <div
              role="tablist"
              aria-label="Sefer detayı sekmeleri"
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 border border-slate-200 dark:border-slate-800 shrink-0"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "TICKET"}
                onClick={() => setActiveDetailTab("TICKET")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "TICKET"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Ticket size={14} aria-hidden="true" />
                <span>Sefer & Bilet</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "RADAR"}
                onClick={() => setActiveDetailTab("RADAR")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "RADAR"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Radar size={14} aria-hidden="true" />
                <span>Gemi & Seyir</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "TRANSIT"}
                onClick={() => setActiveDetailTab("TRANSIT")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "TRANSIT"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Train size={14} aria-hidden="true" />
                <span>Aktarma</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "GUIDE"}
                onClick={() => setActiveDetailTab("GUIDE")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "GUIDE"
                    ? "bg-amber-400 text-slate-950 shadow-xs scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
                }`}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>Ada & Fırsat</span>
              </button>
            </div>

            {/* SEKME 1: SEFER & BİLET (Varsayılan Özet) */}
            {activeDetailTab === "TICKET" && (
              <div className="space-y-4 animate-fadeIn">
                {/* 3'LÜ GRID: Kalkış, İskele, Tarife */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 mb-1">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Kalkış</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
                      {dynState?.currentDepartureTime || schedule.departureTime}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 truncate">
                      {schedule.arrivalTime ? `Varış ~${schedule.arrivalTime}` : "Planlı Sefer"}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 mb-1">
                      <MapPin size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">İskele</span>
                    </div>
                    <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate">
                      {dynState?.currentOrigin || schedule.origin}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate mt-0.5">
                      {schedule.platform || "Yolcu Rıhtımı"}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 mb-1">
                      <Ticket size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Tarife</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {schedule.price}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      İstanbulkart
                    </div>
                  </div>
                </div>

                {/* GÜZERGAH VE DURAK AKIŞI */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Ship size={13} className="text-blue-500" />
                      <span>Güzergah ve Durak Durumu</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {isDirect ? "Direkt Sefer" : `${schedule.stops?.length} Ara Durak`}
                    </span>
                  </div>

                  {/* G4 — DİKEY YOLCULUK TIMELINE'I: direkt (2 düğüm) ve çok duraklı tüm seferlerde */}
                  {dynState?.waypoints && dynState.waypoints.length > 1 ? (
                    <DepartureTimeline waypoints={dynState.waypoints} />
                  ) : isDirect ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
                      <span>Bu sefer direkt seferdir; ara duraklara uğramadan doğrudan {schedule.destination} iskelesine ulaşır.</span>
                    </div>
                  ) : null}
                </div>

                {/* VAPUR İÇİ OLANAKLAR VE GÜVERTE TAVSİYESİ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Vapur İçi İkram & Hizmetler</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {amenities.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {deckAdvice && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] font-black uppercase text-amber-500 mb-1 flex items-center gap-1">
                        <Compass size={11} />
                        <span>Güverte & Manzara Tavsiyesi</span>
                      </span>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        <strong>{deckAdvice.recommendedSideLabel}:</strong> {deckAdvice.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI 3: SESLİ İSKELE ANONSU (Neural Text-to-Speech / Accessibility) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSpeakAnnouncement}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSpeaking
                        ? "bg-amber-400 text-slate-950 border-amber-300 animate-pulse font-black shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <Volume2 size={15} className={isSpeaking ? "animate-bounce text-slate-950" : "text-blue-500"} />
                    <span>{isSpeaking ? "İskele Anonsu Yapılıyor (Durdurmak için tıkla)..." : "🔊 Sesli İskele Anonsu Dinle (AI Sesli Asistan)"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 2: GEMİ & SEYİR (Tahmini Seyir Durumu & Harita) */}
            {activeDetailTab === "RADAR" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Tahmini Gemi Durumu Kartı */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <Ship size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {liveVessel.vesselName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {aisData.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {aisData.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Tahmini Seyir Bilgileri */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Hız (tahmini)</span>
                      <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {aisData.speedKnots} Kn
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Rota (tahmini)</span>
                      <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                        {aisData.headingDeg}°
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">İlerleme</span>
                      <span className="text-xs font-mono font-black text-amber-500">
                        %{aisData.progressPercent}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Tahmini varış</span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                        ~{aisData.etaMinutes} dk
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2 Seyir Aksiyon Butonu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="https://www.marinetraffic.com/en/ais/home/centerx:29.02/centery:41.01/zoom:13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-linear-to-r from-emerald-600/15 via-teal-600/10 to-transparent hover:from-emerald-600/25 border border-emerald-500/40 text-left flex items-center justify-between transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Radar size={18} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">CANLI GEMİ HARİTASI</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Boğaz&apos;ı MarineTraffic haritasında canlı izleyin</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Dış site ➔</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="p-3.5 rounded-2xl bg-linear-to-r from-blue-600/15 via-indigo-600/10 to-transparent hover:from-blue-600/25 border border-blue-500/40 text-left flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Camera size={18} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">İSKELE CANLI KAMERA</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Rıhtım ve yolcu yoğunluğu canlı yayını</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">İzle ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 3: İSKELE AKTARMA & ULAŞIM */}
            {activeDetailTab === "TRANSIT" && (
              <div className="space-y-3.5 animate-fadeIn text-xs">
                {/* Metro & Raylı Sistem Aktarmaları */}
                {(originTransit.length > 0 || destTransit.length > 0) && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Train size={13} className="text-blue-500" />
                      <span>Raylı Sistem & Metro Aktarmaları</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {originTransit.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className={`text-[10px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">({t.walkMinutes} dk)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Taksi & İETT */}
                {groundTransit && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Bus size={13} className="text-emerald-500" />
                      <span>İskele Çıkışı Taksi Durağı</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <strong className="text-xs text-slate-900 dark:text-white block">🚕 {groundTransit.taxi.standName}</strong>
                        <span className="text-[10px] text-slate-500">{groundTransit.taxi.locationDescription} • {groundTransit.taxi.walkMinutes} dk yürüme</span>
                      </div>
                      <a href={`tel:${groundTransit.taxi.phone}`} className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1">
                        <Phone size={12} />
                        <span>Ara</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* İSPARK & İSBİKE */}
                {pierMobility && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Car size={13} className="text-blue-500" />
                      <span>İSPARK Otopark & İSBİKE Bisiklet</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="truncate">🅿️ {pierMobility.parking.isparkName}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{pierMobility.parking.availableSpots} Boş</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="truncate">🚲 {pierMobility.bicycle.isbikeStationName}</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">{pierMobility.bicycle.availableBikes} Bisiklet</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vapuru Kaçırdım & Deniz Taksi Alternatifi */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMissedOpen(true)}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <AlertOctagon size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">Kaçırdım Asistanı</span>
                    </span>
                    <span>➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSeaTaxiOpen(true)}
                    className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-500/40 text-cyan-900 dark:text-cyan-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Anchor size={13} className="text-cyan-500 shrink-0" />
                      <span className="truncate">İBB Deniz Taksi</span>
                    </span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 4: ADA REHBERİ, KÜLTÜR VE SPONSORLU FIRSATLAR */}
            {activeDetailTab === "GUIDE" && (
              <div className="space-y-4 animate-fadeIn">
                {islandGuide ? (
                  <>
                    {/* Ada Hikayesi / Başlık Kartı */}
                    <div className="p-3.5 rounded-2xl bg-linear-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300 dark:border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider mb-1">
                        <Sparkles size={14} />
                        <span>{islandGuide.islandName}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {islandGuide.heroStory}
                      </p>
                    </div>

                    {/* Sponsorlu Fırsatlar & İndirim Kuponları (Ticari Altyapı) */}
                    {islandGuide.deals.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Gift size={13} />
                            <span>Özel Yolcu Fırsatları & Kuponlar</span>
                          </span>
                          <span className="text-[9px] bg-amber-400/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            Sponsorlu
                          </span>
                        </div>
                        <div className="space-y-2">
                          {islandGuide.deals.map((deal) => (
                            <div key={deal.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-xs text-slate-900 dark:text-white">{deal.businessName}</span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500 text-white">
                                  {deal.discountBadge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">{deal.dealTitle}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{deal.description}</p>
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                                  <Tag size={11} />
                                  <span>Kod: {deal.couponCode}</span>
                                </div>
                                {deal.whatsappBookingUrl && (
                                  <a
                                    href={deal.whatsappBookingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-black text-emerald-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>WhatsApp Rezervasyon ➔</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gezilecek Tarihi & Kültürel Yerler */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <Landmark size={13} className="text-blue-500" />
                        <span>Kültür, Tarih ve Seyir Noktaları</span>
                      </div>
                      <div className="space-y-2">
                        {islandGuide.attractions.map((att) => (
                          <div key={att.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">{att.title}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                🚶 ~{att.walkMinutesFromPier} dk
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{att.description}</p>
                            <span className="inline-block mt-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                              ★ {att.highlightTag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ada Gastronomisi & Lezzet Durakları */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <span>🍽️</span>
                        <span>Ada Gastronomisi & Klasik Lezzetler</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {islandGuide.gastronomy.map((g) => (
                          <div key={g.id} className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900 dark:text-white truncate">{g.name}</strong>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">{g.priceLevel}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{g.specialty}</div>
                            <div className="text-[9px] text-amber-600 font-bold mt-1">📍 {g.badge}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                    <Sparkles size={24} className="mx-auto text-amber-500 mb-2" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Şehir İçi Boğaz Hattı</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Özel Ada Rehberi ve sponsorlu kuponlar Adalar (Büyükada, Heybeliada, Burgazada, Kınalıada) varışlı veya kalkışlı seferlerde otomatik olarak görüntülenir.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 4. KAPAT BUTONU */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black rounded-2xl border border-slate-300 dark:border-slate-700 transition-colors uppercase tracking-wider shrink-0 cursor-pointer active:scale-98"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* MODALLAR */}
      <PierLiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        origin={dynState?.currentOrigin || schedule?.origin}
        destination={dynState?.destination || schedule?.destination}
      />

      <MissedFerryAssistantModal
        isOpen={isMissedOpen}
        onClose={() => setIsMissedOpen(false)}
        origin={dynState?.currentOrigin || schedule?.origin || "Kadıköy"}
        destination={dynState?.destination || schedule?.destination || "Eminönü"}
        missedDepartureTime={dynState?.currentDepartureTime || schedule?.departureTime || "21:00"}
      />

      <SharedSeaTaxiModal
        isOpen={isSeaTaxiOpen}
        onClose={() => setIsSeaTaxiOpen(false)}
        defaultOrigin={dynState?.currentOrigin || schedule?.origin || "Kadıköy"}
        defaultDestination={dynState?.destination || schedule?.destination || "Karaköy"}
      />
    </AnimatePresence>
  );
}
