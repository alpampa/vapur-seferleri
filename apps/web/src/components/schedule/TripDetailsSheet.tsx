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
  Gift,
  CheckCircle2,
  Radio,
  Navigation,
  Loader2,
  ExternalLink
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
import { getDynamicMarineTrafficUrl, getDynamicVesselFinderUrl } from "@/lib/radar-links";
import { verifyOnboardTelemetry, type OnboardVerificationResult } from "@/lib/agents/passenger-telemetry-agent";
import {
  trackLocationGranted,
  trackPierProximity,
  trackGpsUnderway,
  trackOnboardConfirmed,
  trackRadarClicked
} from "@/lib/utils/analytics-tracker";
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
  const { nowMs } = useTransitClock(isOpen ? 1000 : SLOW_TICK_INTERVAL_MS, { serverTimeIso });

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

  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState<OnboardVerificationResult | null>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Load existing onboard verification from localStorage if available
  useEffect(() => {
    if (!isOpen || !schedule) return;
    try {
      const stored = localStorage.getItem("vapur_active_verified_trip");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.tripId === schedule.id && Date.now() - parsed.verifiedAt < 75 * 60 * 1000) {
          setTelemetryResult(parsed.result);
        }
      }
    } catch (e) {}
  }, [isOpen, schedule]);

  const originPierName = dynState?.currentOrigin || schedule?.origin || "";
  const destPierName = dynState?.destination || schedule?.destination || "";

  const marineTrafficPierUrl = getDynamicMarineTrafficUrl({ origin: originPierName, zoom: 15 });
  const marineTrafficRouteUrl = getDynamicMarineTrafficUrl({ origin: originPierName, destination: destPierName, zoom: 13 });
  const vesselFinderPierUrl = getDynamicVesselFinderUrl({ origin: originPierName, zoom: 15 });

  const handleVerifyOnboard = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setTelemetryError("Cihazınızda GPS/Konum desteği bulunamadı.");
      return;
    }
    setIsVerifyingGps(true);
    setTelemetryError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsVerifyingGps(false);
        const res = verifyOnboardTelemetry(
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speedMps: pos.coords.speed,
            headingDeg: pos.coords.heading,
            accuracyMeters: pos.coords.accuracy,
            timestamp: pos.timestamp
          },
          {
            origin: originPierName,
            destination: destPierName,
            operator: schedule?.operator,
            departureTime: dynState?.currentDepartureTime || schedule?.departureTime
          }
        );
        setTelemetryResult(res);
        try {
          trackLocationGranted();
          const lineKey = `${originPierName} - ${destPierName}`;
          if (res.status === "CONFIRMED_ONBOARD") {
            trackOnboardConfirmed(
              lineKey,
              schedule?.operator,
              res.currentSpeedKnots,
              res.matchedVessel?.name,
              res.matchedVessel?.mmsi
            );
          } else if (res.status === "AT_PIER") {
            trackPierProximity(originPierName, lineKey);
          } else if (res.currentSpeedKnots > 3.0) {
            trackGpsUnderway(lineKey, schedule?.operator, res.currentSpeedKnots);
          }
        } catch (e) {}
        try {
          localStorage.setItem("vapur_active_verified_trip", JSON.stringify({
            tripId: schedule?.id,
            origin: originPierName,
            destination: destPierName,
            result: res,
            verifiedAt: Date.now()
          }));
        } catch (e) {}
      },
      (err) => {
        setIsVerifyingGps(false);
        if (err.code === 1) {
          setTelemetryError("Konum erişim izni reddedildi. Tarayıcı ayarlarından konuma izin vermelisiniz.");
        } else {
          setTelemetryError("GPS uydusu veya hücresel konum sinyali alınamadı.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Escape tuşu ile kapatma (klavye erişilebilirliği)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // AI 4: ADA TURİZM, KÜLTÜR VE SPONSORLU FIRSATLAR (Hook kuralı: Erken return'den ÖNCE çağrılmalı)
  const islandGuide = useMemo(() => {
    if (!schedule) return null;
    return getIslandGuidePackage(schedule.destination) || getIslandGuidePackage(schedule.origin);
  }, [schedule?.destination, schedule?.origin]);

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
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-[#0c1322] border-t border-slate-200 dark:border-slate-800 rounded-t-[28px] z-50 p-4 sm:p-6 text-slate-900 dark:text-white shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

            {/* 1. ÜST BAŞLIK VE HIZLI EYLEMLER */}
            <div className="flex justify-between items-start gap-2 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {dynState && (
                    <TripStatusBadge
                      status={dynState.status}
                      delayText={schedule.delayText}
                    />
                  )}
                  <OperatorLogo operator={schedule.operator} size="md" showName={true} />
                  {dynState?.countdown && !dynState.isDeparted && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse inline-flex items-center gap-1">
                      <Timer size={11} aria-hidden="true" /> Kalkışa {dynState.countdown}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">{dynState?.currentOrigin || schedule.origin}</span>
                  <span className="text-blue-500 font-extrabold shrink-0">➔</span>
                  <span className="text-amber-500 dark:text-amber-400 truncate">
                    {dynState?.destination || schedule.destination}
                  </span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5 truncate">
                  {schedule.routeTitle || `${schedule.origin} - ${schedule.destination} Seferi`}
                </p>
              </div>

              {/* Action Buttons: Star, Bell, Pin, Close */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(routeKey)}
                  title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                  aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                  aria-pressed={isFav}
                  className={`p-2 rounded-xl border transition-all touch-manipulation cursor-pointer ${
                    isFav
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-400"
                  }`}
                >
                  <Star size={15} className={isFav ? "fill-slate-950 text-slate-950" : ""} />
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
                  className={`p-2 rounded-xl border transition-all touch-manipulation cursor-pointer ${
                    hasAlarm
                      ? "bg-amber-500/20 border-amber-400 text-amber-500 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {hasAlarm ? (
                    <BellRing size={15} className="text-amber-500 animate-bounce" />
                  ) : (
                    <Bell size={15} />
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
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/60 transition-all touch-manipulation cursor-pointer"
                >
                  <Pin size={15} />
                </button>

                <button
                  onClick={onClose}
                  aria-label="Kapat"
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer touch-manipulation"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* 2. ERGONOMİK 4 SEKME ÇUBUĞU (Apple Transit & Wallet Tarzı) */}
            <div
              role="tablist"
              aria-label="Sefer detayı sekmeleri"
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4 border border-slate-200 dark:border-slate-800 shrink-0 w-full overflow-x-auto hide-scrollbar"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "TICKET"}
                onClick={() => setActiveDetailTab("TICKET")}
                className={`flex-1 min-w-0 py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                  activeDetailTab === "TICKET"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Ticket size={13} aria-hidden="true" className="shrink-0" />
                <span className="truncate">Tarife</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "RADAR"}
                onClick={() => setActiveDetailTab("RADAR")}
                className={`flex-1 min-w-0 py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                  activeDetailTab === "RADAR"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Radar size={13} aria-hidden="true" className="shrink-0" />
                <span className="truncate">Radar</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "TRANSIT"}
                onClick={() => setActiveDetailTab("TRANSIT")}
                className={`flex-1 min-w-0 py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                  activeDetailTab === "TRANSIT"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Train size={13} aria-hidden="true" className="shrink-0" />
                <span className="truncate">Aktarma</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeDetailTab === "GUIDE"}
                onClick={() => setActiveDetailTab("GUIDE")}
                className={`flex-1 min-w-0 py-2 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                  activeDetailTab === "GUIDE"
                    ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
                }`}
              >
                <Sparkles size={13} aria-hidden="true" className="shrink-0" />
                <span className="truncate">Ada</span>
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
                    <span>{isSpeaking ? "İskele Anonsu Yapılıyor (Durdurmak için tıkla)..." : "🔊 Resmi İskele Anonsunu Dinle (Sesli Bilgilendirme)"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 2: GEMİ & SEYİR (Resmi Bilgi & Canlı Radar) */}
            {activeDetailTab === "RADAR" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Resmi Filo Bilgilendirme Kartı */}
                <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <Ship size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {schedule.operator} Seferi
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                          {aisData.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {aisData.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Sıfır Halüsinasyon Bilgilendirmesi */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-medium mb-3">
                    <strong>Resmi Denizcilik Bilgilendirmesi:</strong> İBB Şehir Hatları ve yolcu motorları sefer tarifelerinde fiziksel gemi adları peşinen yayımlanmaz; seferler iskele amirliği nöbetçi filosu tarafından sevk edilir. Doğrulanmamış hiçbir tahminî vapur adı gösterilmez.
                  </div>

                  {/* Seyir Bilgileri */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Kalkış İskelesi</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {dynState?.currentOrigin || schedule.origin}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Varış İskelesi</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate block">
                        {dynState?.destination || schedule.destination}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Tahmini Varış Süresi</span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                        ~{aisData.etaMinutes} dk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Canlı Radar ve Kamera Butonları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={marineTrafficPierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-linear-to-r from-emerald-600/15 via-teal-600/10 to-transparent hover:from-emerald-600/25 border border-emerald-500/40 text-left flex items-center justify-between transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Radar size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 truncate">
                          CANLI {originPierName.toUpperCase()} RADARI
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {originPierName} rıhtımındaki tüm canlı gemiler (MarineTraffic)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">Rıhtımı Aç ➔</span>
                  </a>

                  <a
                    href={marineTrafficRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-linear-to-r from-cyan-600/15 via-blue-600/10 to-transparent hover:from-cyan-600/25 border border-cyan-500/40 text-left flex items-center justify-between transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Navigation size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 truncate">
                          TÜM ROTA DENİZ RADARI
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {originPierName} ➔ {destPierName} seyir koridoru canlı trafiği
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0 ml-1">Rotayı Aç ➔</span>
                  </a>
                </div>

                {/* İskele Canlı Kamera Butonu */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full p-3 rounded-2xl bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-transparent hover:from-blue-600/20 border border-blue-500/30 text-left flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Camera size={16} className="animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                          {originPierName} İSKELESİ CANLI KAMERA
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                          Rıhtım ve yolcu yoğunluğu canlı yayını
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">İzle ➔</span>
                  </button>
                </div>

                {/* İkinci Doğrulama: Yolcu GPS Telemetri ve Çapraz Sağlama Paneli */}
                <div className="p-3.5 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 text-white space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Navigation size={17} className={isVerifyingGps ? "animate-spin" : ""} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black block text-white truncate">
                          📍 İKİNCİ DOĞRULAMA: YOLCU GPS TELEMETRİSİ
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Fiziksel konum, hız ve rota ile gemi eşleştirmesi
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOnboard}
                      disabled={isVerifyingGps}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {isVerifyingGps ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Taranıyor...</span>
                        </>
                      ) : (
                        <>
                          <Radio size={13} className="text-cyan-300 animate-pulse" />
                          <span>Vapurdayım Doğrula</span>
                        </>
                      )}
                    </button>
                  </div>

                  {telemetryError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-medium">
                      ⚠️ {telemetryError}
                    </div>
                  )}

                  {telemetryResult && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-black flex items-center gap-1.5 ${
                          telemetryResult.status === "CONFIRMED_ONBOARD"
                            ? "text-emerald-400"
                            : telemetryResult.status === "AT_PIER"
                            ? "text-amber-400"
                            : "text-slate-300"
                        }`}>
                          {telemetryResult.status === "CONFIRMED_ONBOARD" && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                          {telemetryResult.summaryText}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                          %{telemetryResult.confidenceScore} Güven
                        </span>
                      </div>

                      {/* Kanıt Verileri */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block uppercase text-[9px]">Anlık Hız</span>
                          <strong className="text-emerald-400">{telemetryResult.proofDetails.speedProof}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block uppercase text-[9px]">Pruva Yönü</span>
                          <strong className="text-cyan-300">{telemetryResult.proofDetails.headingProof}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block uppercase text-[9px]">Hat Sapması</span>
                          <strong className="text-slate-200">{telemetryResult.proofDetails.corridorProof}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block uppercase text-[9px]">Kalan Süre</span>
                          <strong className="text-amber-300">~{telemetryResult.etaMinutes} dk</strong>
                        </div>
                      </div>

                      {/* Eşleşen Gemi */}
                      {telemetryResult.matchedVessel && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                          <div className="text-[11px] min-w-0">
                            <span className="text-emerald-300 font-bold">🚢 Çapraz Eşleşen Filo Gemisi: </span>
                            <strong className="text-white">{telemetryResult.matchedVessel.name}</strong>
                            <span className="text-slate-400 text-[10px] ml-1.5">
                              (MMSI: {telemetryResult.matchedVessel.mmsi} • {telemetryResult.matchedVessel.operator})
                            </span>
                          </div>
                          <a
                            href={telemetryResult.matchedVessel.marineTrafficAisUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] inline-flex items-center gap-1 shrink-0"
                          >
                            <span>AIS Görüntüle</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEKME 3: İSKELE AKTARMA & ULAŞIM */}
            {activeDetailTab === "TRANSIT" && (
              <div className="space-y-3.5 animate-fadeIn text-xs">
                {/* 1. Varış Noktasında Aktarma & Ulaşım (Kabataş, Kadıköy, Bostancı, Adalar) */}
                {destTransit.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                    <div className="text-[11px] font-black uppercase text-blue-700 dark:text-blue-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Train size={13} className="text-blue-600 dark:text-blue-400" />
                        <span>{schedule.destination} Varışında Ulaşım & Aktarmalar</span>
                      </span>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">Varış Noktası</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {destTransit.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                          <span className={`text-[10px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">({t.walkMinutes} dk yürüme)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Kalkış İskelesine Raylı Sistem Ulaşımı */}
                {originTransit.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Train size={13} className="text-slate-500" />
                      <span>{schedule.origin} Kalkış İskelesine Ulaşım</span>
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
