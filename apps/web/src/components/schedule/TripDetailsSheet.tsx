"use client";

import { calculateDeckRecommendation } from "@/lib/utils/deck-guide";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, MapPin, Clock, X, ChevronRight, Anchor, ShieldCheck, Ticket, Users, Train, Star, Bell, BellRing, Navigation, Radar, Camera, Footprints, Pin, Compass, Radio, AlertTriangle } from "lucide-react";
import { MarineAisRadarModal } from "@/components/map/MarineAisRadarModal";
import { PierLiveCameraModal } from "@/components/map/PierLiveCameraModal";
import { IstanbulkartWalletModal } from "@/components/wallet/IstanbulkartWalletModal";
import { BosphorusAudioGuideModal } from "@/components/guide/BosphorusAudioGuideModal";
import { OnboardVoyageModal } from "@/components/voyage/OnboardVoyageModal";
import { MissedFerryAssistantModal } from "@/components/planner/MissedFerryAssistantModal";
import { getPierMobility } from "@/lib/data/pier-parking-bicycle";
import { getPierGroundTransit } from "@/lib/data/pier-taxi-transit";
import { calculateSeagullSimitDeck } from "@/lib/utils/seagull-simit-guide";
import { FERRY_LIBRARY_BOOKS } from "@/lib/data/ferry-library-catalog";
import { Phone, Bus, BookOpen, Feather } from "lucide-react";
import { Car, Bike, AlertOctagon } from "lucide-react";
import { CreditCard, Headphones, Gauge } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { resolveLiveVesselName } from "@/lib/agents/fleet-registry";
import { TripStatusBadge } from "./ScheduleCard";
import type { ScheduleCardDto } from "@/app/page";
import { predictTripOccupancy, getTripAmenities } from "@/lib/utils/occupancy";
import { playHistoricalFerryHorn } from "@/lib/utils/sound";
import { Volume2 } from "lucide-react";
import { getPierTransit } from "@/lib/data/pier-transit-connections";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useEffect, useState } from "react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { useWalkingCatchStore } from "@/store/useWalkingCatchStore";
import { MooringTelemetryCard } from "@/components/schedule/MooringTelemetryCard";
import { TurnstileCheckBanner } from "@/components/turnstile/TurnstileCheckBanner";
import { getOfficialRouteFare } from "@/lib/data/official-fares";
import { VesselVisualCard } from "@/components/vessel/VesselVisualCard";
import { BerthTurnaroundIndicator } from "@/components/schedule/BerthTurnaroundIndicator";
import { SharedSeaTaxiModal } from "@/components/taxishare/SharedSeaTaxiModal";
import { PierLiveAisRadarModal } from "@/components/map/PierLiveAisRadarModal";
import { IslandStrandedAlertModal } from "@/components/schedule/IslandStrandedAlertModal";

interface TripDetailsSheetProps {
  schedule: ScheduleCardDto | null;
  isOpen: boolean;
  onClose: () => void;
  serverTimeIso?: string;
}

export function TripDetailsSheet({ schedule, isOpen, onClose, serverTimeIso }: TripDetailsSheetProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { setActiveVoyage } = useActiveVoyageStore();

  const [dynState, setDynState] = useState<DynamicTripResolution | null>(null);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isPierAisRadarOpen, setIsPierAisRadarOpen] = useState(false);
  const [isIslandAlertOpen, setIsIslandAlertOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAudioGuideOpen, setIsAudioGuideOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isMissedOpen, setIsMissedOpen] = useState(false);
  const [isSeaTaxiOpen, setIsSeaTaxiOpen] = useState(false);

  useEffect(() => {
    if (!schedule) {
      setDynState(null);
      return;
    }

    const update = () => {
      const resolved = resolveDynamicTrip(
        schedule.origin,
        schedule.destination,
        schedule.departureTime,
        schedule.targetTimeIso || new Date().toISOString(),
        schedule.stops,
        schedule.arrivalTime,
        Date.now(),
        serverTimeIso
      );
      setDynState(resolved);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [schedule, serverTimeIso]);

  if (!schedule) return null;

  const routeKey = `${schedule.origin} ➔ ${schedule.destination}`;
  const isFav = isFavorite(routeKey);
  const hasAlarm = isAlarmSet(schedule.id);

  const occupancy = predictTripOccupancy(schedule.origin, schedule.destination, schedule.departureTime);
  const deckAdvice = calculateDeckRecommendation(schedule.origin, schedule.destination, schedule.departureTime);
  const amenities = getTripAmenities(schedule.operator);
  const liveVessel = resolveLiveVesselName(
    schedule.origin,
    schedule.destination,
    schedule.operator,
    dynState?.isDeparted || false,
    dynState?.status || schedule.status,
    schedule.id
  );
  const originTransit = getPierTransit(schedule.origin);
  const destTransit = getPierTransit(schedule.destination);
  const isDirect = !schedule.stops || schedule.stops.length === 0;

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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0d1424] border-t border-slate-200 dark:border-slate-700/80 rounded-t-[28px] z-50 p-5 sm:p-7 text-slate-900 dark:text-white shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto transition-colors"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header: Status, Title, Actions & Close */}
            <div className="flex justify-between items-start gap-3 mb-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {dynState && (
                    <TripStatusBadge status={dynState.status} delayText={schedule.delayText} />
                  )}
                  <OperatorLogo operator={schedule.operator} size="md" showName={true} />
                  {dynState?.countdown && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      ⏳ KALKIŞA {dynState.countdown}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>{dynState?.currentOrigin || schedule.origin}</span>
                  <span className="text-blue-400 font-extrabold">➔</span>
                  <span className="text-amber-300">{dynState?.destination || schedule.destination}</span>
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">{schedule.routeTitle}</p>
              </div>

              {/* Action Buttons: Star, Bell, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(routeKey)}
                  title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                  className={`p-2 rounded-xl border transition-all ${
                    isFav
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-amber-300"
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
                  title={hasAlarm ? "Alarmı Kaldır" : "5 Dk Kala Hatırlat"}
                  className={`p-2 rounded-xl border transition-all ${
                    hasAlarm
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {hasAlarm ? (
                    <BellRing size={16} className="text-amber-400 animate-bounce" />
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
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/40 transition-all"
                >
                  <Pin size={16} />
                </button>

                <button 
                  onClick={onClose}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Kalkış Saati */}
              <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-blue-400 mb-0.5">
                  <Clock size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Kalkış</span>
                </div>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                  {dynState?.currentDepartureTime || schedule.departureTime}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {dynState?.currentDepartureTime12 || schedule.departureTime12}
                </div>
              </div>

              {/* İskele / Peron */}
              <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                  <MapPin size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">İskele / Peron</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white truncate">{schedule.platform}</div>
                <div className="text-[10px] text-emerald-400 font-bold truncate">{schedule.origin} Rıhtım</div>
              </div>

              {/* Ücret */}
              <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
                  <Ticket size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tarife</span>
                </div>
                <div className="text-xl font-mono font-black text-emerald-400">{schedule.price}</div>
                <div className="text-[10px] text-slate-400 font-medium">İstanbulkart</div>
              </div>
            </div>

            {/* Turnike Geçiş & İstanbulkart Bakiye Erken Uyarısı */}
            <div className="mb-3">
              <TurnstileCheckBanner
                tripPrice={schedule.price}
                originPier={dynState?.currentOrigin || schedule.origin}
                isAdalar={schedule.origin.includes("Ada") || schedule.destination.includes("Ada")}
              />
            </div>

            {/* İskelede Kalacak Süre & Biniş Vakti Sayacı */}
            <div className="mb-3">
              <BerthTurnaroundIndicator
                originPier={dynState?.currentOrigin || schedule.origin}
                destinationPier={dynState?.destination || schedule.destination}
                vesselName={liveVessel.vesselName}
                status={dynState?.status || schedule.status}
                countdown={dynState?.countdown}
                isDeparted={dynState?.isDeparted}
              />
            </div>

            {/* Resmi UKOME Yasal Ücret Doğrulama Kartı */}
            {(() => {
              const fareInfo = getOfficialRouteFare(schedule.origin, schedule.destination);
              return (
                <div className="mb-3 p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-300">
                      <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span>RESMİ İBB UKOME ÜCRET TARİFESİ</span>
                    </div>
                    <a
                      href={fareInfo.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                      title="Şehir Hatları Resmi Ücret Tebliği Sayfası"
                    >
                      <span>Resmi Tebliğ ↗</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">Tam Bilet</span>
                      <strong className="text-xs sm:text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">{fareInfo.fullFare}</strong>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">İndirimli Öğrenci</span>
                      <strong className="text-xs sm:text-sm font-mono font-black text-blue-600 dark:text-blue-400">{fareInfo.studentFare}</strong>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">{fareInfo.isIslandRoute ? "Adakart Mukim" : "Sosyal / 60+"}</span>
                      <strong className="text-xs sm:text-sm font-mono font-black text-amber-600 dark:text-amber-400">{fareInfo.islandResidentFare || fareInfo.socialFare}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-0.5">
                    <span>Yasal Dayanak: <strong>{fareInfo.legalCitation}</strong></span>
                    <span>65+ Yaş: <strong>Ücretsiz</strong></span>
                  </div>
                </div>
              );
            })()}

            {/* Hızlı Eylemler: QR Cüzdan & Vapuru Kaçırdım */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsWalletOpen(true)}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/60 text-left flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={15} className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-900 dark:text-white block">İSTANBULKART QR CÜZDAN</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Dijital barkod ile turnikeden hızlı geç</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">Aç ➔</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMissedOpen(true)}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/50 flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <AlertOctagon size={15} className="text-amber-500 animate-pulse shrink-0" />
                  <div>
                    <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 block">VAPURU KAÇIRDIM ASİSTANI</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">En yakın Marmaray / motor alternatifleri</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Gör ➔</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSeaTaxiOpen(true)}
                className="col-span-1 sm:col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent hover:from-amber-500/25 border border-amber-500/40 text-left flex items-center justify-between transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Anchor size={14} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-300 block">
                        GECE & PAYLAŞIMLI İBB DENİZ TAKSİ
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        10 Kişiye Bölüş
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">
                      Tarifeli vapur bittiyse masrafı bölüşerek tekne çağırın
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">Hesapla & Çağır ➔</span>
              </button>
            </div>

            {/* Gemi & AIS Canlı Durumu Kartı */}
            <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  liveVessel.isConfirmedUnderway
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                }`}>
                  <Ship size={16} className={liveVessel.isConfirmedUnderway ? "animate-pulse" : ""} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      🚢 Vapur: {liveVessel.vesselName}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                      liveVessel.isConfirmedUnderway
                        ? "bg-emerald-500 text-white border-emerald-600 animate-pulse"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}>
                      {liveVessel.isConfirmedUnderway ? "Seyirde (Boğazda)" : "Rıhtımda Bağlı"}
                    </span>
                    {liveVessel.mmsi && (
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800">
                        MMSI: {liveVessel.mmsi}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {liveVessel.statusText} • Kapasite: {liveVessel.capacityPax} Yolcu ({liveVessel.builtYear})
                  </p>
                </div>
              </div>
            </div>

            {/* Vapur Tipi Silueti, Ölçekli Profil ve Gerçek Fotoğraf Önizlemesi */}
            <div className="mb-3">
              <VesselVisualCard
                vesselName={liveVessel.vesselName}
                operator={schedule.operator}
                builtYear={liveVessel.builtYear}
                capacityPax={liveVessel.capacityPax}
                callSign={liveVessel.callSign}
                mmsi={liveVessel.mmsi}
              />
            </div>

            {/* Rıhtım Palamar & Canlı Rampa Operasyon Telemetrisi */}
            <div className="mb-3">
              <MooringTelemetryCard
                vesselName={liveVessel.vesselName}
                originPier={dynState?.currentOrigin || schedule.origin}
                destinationPier={dynState?.destination || schedule.destination}
                status={dynState?.status || schedule.status}
                countdown={dynState?.countdown}
                isDeparted={dynState?.isDeparted}
              />
            </div>

            {/* Canlı Deniz Radarı (AIS) ve İBB Canlı Kamera Butonları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {/* AIS Radar Button */}
              <button
                type="button"
                onClick={() => setIsRadarOpen(true)}
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-left flex items-center justify-between gap-2.5 shadow-md group transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Radar size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white tracking-tight">
                        CANLI RADAR (AIS)
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-emerald-500/30 text-emerald-300 px-1 py-0.1 rounded">
                        GEMİ ADLARI
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">
                      Vapurların anlık telsiz ve rota takibi
                    </p>
                  </div>
                </div>
                <div className="text-emerald-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold shrink-0">
                  ↗
                </div>
              </button>

              {/* İBB Live Camera Button */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/40 hover:border-blue-400 text-left flex items-center justify-between gap-2.5 shadow-md group transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Camera size={16} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white tracking-tight">
                        İBB CANLI KAMERA
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-blue-500/30 text-blue-300 px-1 py-0.1 rounded">
                        RIHTIM YAYINI
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">
                      İskele yoğunluğu ve deniz canlı yayını
                    </p>
                  </div>
                </div>
                <div className="text-blue-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold shrink-0">
                  ↗
                </div>
              </button>

              {/* İskele 500m Çevresi Canlı AIS Radarı Butonu */}
              <button
                type="button"
                onClick={() => setIsPierAisRadarOpen(true)}
                className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left flex items-center justify-between gap-2.5 shadow-md group transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Radio size={16} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white tracking-tight">
                        {dynState?.currentOrigin || schedule.origin} İSKELESİ 500M CANLI RADARI
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-cyan-500/30 text-cyan-300 px-1 py-0.1 rounded">
                        CANLI SEKTÖR
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">
                      İskele etrafındaki 500 metrede sinyal veren tüm gerçek deniz araçları
                    </p>
                  </div>
                </div>
                <div className="text-cyan-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold shrink-0">
                  ↗
                </div>
              </button>
            </div>

            {/* Adalar Mahsur Kalma Erken Uyarısı (Adalar Çıkışlı Seferler İçin) */}
            {(schedule.origin.includes("Ada") || (dynState?.currentOrigin && dynState.currentOrigin.includes("Ada"))) && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-rose-900 dark:text-rose-200 block truncate">
                      ADADA MAHSUR KALMA ERKEN UYARISI
                    </span>
                    <span className="text-[10px] text-rose-700 dark:text-rose-300 block truncate">
                      Adadan anakaraya son vapur 15 dk sesli alarmı ve sireni
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIslandAlertOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all cursor-pointer shadow-md shrink-0"
                >
                  Alarmı Kur ➔
                </button>
              </div>
            )}

            {/* Metro / Marmaray Progressive Route Timeline */}
            {!isDirect && dynState?.waypoints && dynState.waypoints.length > 1 ? (
              <div className="mb-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider text-[11px]">
                    <Navigation size={13} className="text-amber-400" />
                    <span>MARMARAY / METRO STİLİ GÜZERGAH İLERLEMESİ</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {dynState.waypoints.filter(w => w.state === "COMPLETED").length} / {dynState.waypoints.length} Durak Geçildi
                  </span>
                </div>

                {/* Progressive Track */}
                <div className="flex items-center gap-1 overflow-x-auto py-2 hide-scrollbar">
                  {dynState.waypoints.map((wp, wIdx) => {
                    const isCompleted = wp.state === "COMPLETED";
                    const isCurrent = wp.state === "CURRENT";
                    const isLast = wIdx === (dynState.waypoints?.length ?? 1) - 1;

                    return (
                      <div key={wIdx} className="flex items-center shrink-0">
                        {/* Station Pill */}
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all shadow-sm ${
                            isCompleted
                              ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold"
                              : isCurrent
                              ? "bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300/80 shadow-md scale-[1.03]"
                              : "bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                          }`}
                        >
                          {isCompleted ? (
                            <span className="text-emerald-400 text-xs font-black">✓</span>
                          ) : isCurrent ? (
                            <span className="text-[11px] font-black animate-pulse flex items-center gap-0.5 text-slate-950">
                              ➔ 🚢
                            </span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          )}

                          <span className="tracking-tight">{wp.name}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              isCompleted
                                ? "text-emerald-400/90 font-bold"
                                : isCurrent
                                ? "text-slate-950 underline font-black"
                                : "text-slate-400 font-semibold"
                            }`}
                          >
                            ({wp.time})
                          </span>
                        </div>

                        {/* Connecting Track Segment */}
                        {!isLast && (
                          <div
                            className={`w-4 sm:w-6 h-[3px] mx-1 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500"
                                : isCurrent
                                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-slate-700"
                                : "bg-slate-700"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl mb-4">
                <ShieldCheck size={18} />
                <span>Bu sefer direkt seferdir, ara duraklara uğramadan doğrudan {schedule.destination} iskelesine gider.</span>
              </div>
            )}

            {/* Canlı Doluluk ve Yolcu Yoğunluğu Isı Endeksi */}
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/80 shadow-inner">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Users size={13} className="text-blue-500 dark:text-cyan-400" />
                  RIHTIM & VAPUR DOLULUK ENDEKSİ
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${occupancy.badgeClass} ${occupancy.glowClass}`}>
                  {occupancy.label}
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    occupancy.level === 'RUSH' || occupancy.level === 'HIGH'
                      ? 'bg-rose-500 shadow-sm shadow-rose-500'
                      : occupancy.level === 'MEDIUM'
                      ? 'bg-amber-400 shadow-sm shadow-amber-400'
                      : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  }`}
                  style={{ width: `${occupancy.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{occupancy.description}</p>
            </div>

                        {/* ÖNERİ 2 (EK): VAPUR GÜVERTE VE OTURMA YERİ REHBERİ (Güneş / Rüzgar / Boğaz Manzarası) */}
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#0f172a] dark:to-[#070d1a] shadow-sm">
              <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Compass size={14} className="text-amber-500" />
                  <span>GÜVERTE KONUMLANDIRMA & MANZARA ASİSTANI</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ROTA AÇISI: {deckAdvice.headingDeg}°
                </span>
              </div>

              {/* Tavsiye Edilen Taraf Kartı */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 mb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>🌟 Tavsiye Edilen Taraf:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                      {deckAdvice.recommendedSideLabel}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    📸 En İyi Fotoğraf Yönü
                  </span>
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                  {deckAdvice.summary}
                </p>
              </div>

              {/* İskele (Sol) vs Sancak (Sağ) Manzara Karşılaştırması */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                {/* Sancak (Sağ) Taraf */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                    <span>👉 SANCAK (SAĞ TARAF)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                    {deckAdvice.starboardScenery}
                  </p>
                </div>

                {/* İskele (Sol) Taraf */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                    <span>👈 İSKELE (SOL TARAF)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                    {deckAdvice.portScenery}
                  </p>
                </div>
              </div>

              {/* Güneş ve Rüzgar Notları */}
              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-500">☀️</span>
                  <span><strong>Güneş Açısı:</strong> {deckAdvice.sunSceneryNote}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-500">💨</span>
                  <span><strong>Rüzgar Durumu:</strong> {deckAdvice.windProtectionNote}</span>
                </div>
              </div>
            </div>

            {/* ÖNERİ 2: Vapur İçi Konfor, Büfe ve Hizmet Rozetleri */}
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/80 shadow-inner">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span>☕</span>
                  <span>VAPUR İÇİ İKRAM & KONFOR HİZMETLERİ</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  UKOME STANDARDI
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {amenities.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-2xs flex flex-col items-start gap-1"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ÖNERİ 3: Tarihi Buharlı Vapur Düdüğü Butonu */}
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Volume2 size={18} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>TARİHİ VAPUR DÜDÜĞÜ BİLDİRİMİ</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono font-black">
                      SES + TİTREŞİM
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-300 truncate mt-0.5">
                    Vapur iskeleye son 3 dakika yanaşırken buharlı düdük çalar ve telefonunuzu titretir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playHistoricalFerryHorn()}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>🔊</span>
                <span>Düdüğü Çal</span>
              </button>
            </div>

                        {/* MARTILARA SİMİT ATMA RÜZGARALTI GÜVERTE REHBERİ */}
            {(() => {
              const seagull = calculateSeagullSimitDeck(deckAdvice?.headingDeg || 315, 45, 12);
              return (
                <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:to-slate-900/40 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>🕊️</span>
                      <span>MARTILARA SİMİT ATMA GÜVERTE REHBERİ</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full">
                      RÜZGARALTI (LEEWARD)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60 mb-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                      <span>📍 Tavsiye Edilen Simit Atma Noktası:</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-black">{seagull.recommendedDeckLabel}</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {seagull.throwAngleAdvice} {seagull.physicsReason}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>💡 {seagull.seagullBehaviorNote}</span>
                    <span className="italic">{seagull.safetyTip}</span>
                  </div>
                </div>
              );
            })()}

            {/* İSKELE ÇEVRESİ CANLI TAKSİ DURAĞI & İETT OTOBÜS PERONLARI REHBERİ */}
            {(() => {
              const ground = getPierGroundTransit(schedule.origin);
              if (!ground) return null;
              return (
                <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/80 shadow-inner">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Bus size={14} className="text-emerald-500" />
                      <span>İSKELE ÇIKIŞI TAKSİ DURAĞI & İETT OTOBÜS PERONLARI</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded">
                      {schedule.origin} RIHTIM
                    </span>
                  </div>

                  {/* Taksi Durağı */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between mb-2.5">
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block flex items-center gap-1.5">
                        <span>🚕</span>
                        <span>{ground.taxi.standName}</span>
                      </strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {ground.taxi.locationDescription} • {ground.taxi.walkMinutes} dk yürüme
                      </span>
                    </div>

                    <a
                      href={`tel:${ground.taxi.phone}`}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xs flex items-center gap-1 shadow-sm shrink-0 transition-transform active:scale-95"
                    >
                      <Phone size={12} />
                      <span>{ground.taxi.phoneDisplay}</span>
                    </a>
                  </div>

                  {/* İETT Peronları */}
                  <div className="space-y-1.5">
                    {ground.buses.map((bus, bIdx) => (
                      <div key={bIdx} className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">{bus.platformName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">➔ {bus.destinations}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {bus.keyLines.map(line => (
                            <span key={line} className="px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[9px] font-black font-mono">
                              {line}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* İBB VAPUR KÜTÜPHANESİ VE DENİZCİLİK KİTAPLIĞI */}
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/80 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-amber-500" />
                  <span>ŞEHİR HATLARI VAPUR KÜTÜPHANESİ KİTAPLIĞI</span>
                </span>
                <span className="text-[9px] font-mono text-amber-500 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  PAŞABAHÇE & MODA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Vapurlarımızda bulunan İBB Vapur Kütüphanelerinde yolculuk süresince okuyabileceğiniz seçkin eserler:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FERRY_LIBRARY_BOOKS.slice(0, 4).map((book, bkIdx) => (
                  <div key={bkIdx} className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <strong className="text-slate-900 dark:text-white truncate font-bold">{book.title}</strong>
                      <span className="text-[8px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 rounded shrink-0">{book.category}</span>
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">{book.author}</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{book.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* İskelelerden Raylı Sistem & Metro / Marmaray Aktarmaları */}
            {/* ÖNERİ 1: İskele Çevresi Canlı İSPARK & İSBİKE Kapasitesi */}
            {(() => {
              const mob = getPierMobility(schedule.origin);
              if (!mob) return null;
              return (
                <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/80 shadow-inner">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Car size={14} className="text-blue-500" />
                      <span>İSKELE ÇEVRESİ İSPARK & İSBİKE BİSİKLET DURUMU</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded">
                      {schedule.origin} İSKELESİ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* İSPARK Kartı */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0 font-bold text-xs">
                          P
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 dark:text-white block">{mob.parking.isparkName}</strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{mob.parking.pricingPerHour} • {mob.parking.walkMinutes} dk yürüme</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        {mob.parking.availableSpots} Boş
                      </span>
                    </div>

                    {/* İSBİKE Kartı */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">
                          🚲
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 dark:text-white block">{mob.bicycle.isbikeStationName}</strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Vapurla ücretsiz bisiklet geçişi</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
                        {mob.bicycle.availableBikes} Bisiklet
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {(originTransit.length > 0 || destTransit.length > 0) && (
              <div className="p-3.5 border border-slate-800 rounded-xl mb-4 bg-slate-900/80 shadow-inner">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Train size={13} className="text-cyan-400" />
                  İSKELELERDEN RAYLI SİSTEM & ŞEHİR İÇİ AKTARMALARI
                </h3>

                <div className="space-y-2.5">
                  {originTransit.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 block mb-1">
                        📍 {schedule.origin} İskelesi:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {originTransit.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                            <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                            <span className="text-slate-300 font-medium">{t.name}</span>
                            <span className="text-cyan-400 font-bold">({t.walkMinutes} dk)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {destTransit.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">
                        🏁 {schedule.destination} İskelesi:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {destTransit.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                            <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                            <span className="text-slate-300 font-medium">{t.name}</span>
                            <span className="text-amber-400 font-bold">({t.walkMinutes} dk)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black rounded-xl border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs uppercase tracking-wider mt-1"
            >
              Kapat
            </button>
          </motion.div>
        </>
      )}
      <MarineAisRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        origin={dynState?.currentOrigin || schedule?.origin}
        destination={dynState?.destination || schedule?.destination}
        vesselName={liveVessel.vesselName}
        mmsi={liveVessel.mmsi}
        operator={schedule?.operator}
        isConfirmedUnderway={liveVessel.isConfirmedUnderway}
        statusText={liveVessel.statusText}
        capacityPax={liveVessel.capacityPax}
        builtYear={liveVessel.builtYear}
        callSign={liveVessel.callSign}
      />
      <PierLiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        origin={dynState?.currentOrigin || schedule?.origin}
        destination={dynState?.destination || schedule?.destination}
      />
      <SharedSeaTaxiModal
        isOpen={isSeaTaxiOpen}
        onClose={() => setIsSeaTaxiOpen(false)}
        defaultOrigin={dynState?.currentOrigin || schedule?.origin || "Kadıköy"}
        defaultDestination={dynState?.destination || schedule?.destination || "Karaköy"}
      />
      <PierLiveAisRadarModal
        isOpen={isPierAisRadarOpen}
        onClose={() => setIsPierAisRadarOpen(false)}
        pierName={dynState?.currentOrigin || schedule?.origin || "Kadıköy"}
      />
      <IslandStrandedAlertModal
        isOpen={isIslandAlertOpen}
        onClose={() => setIsIslandAlertOpen(false)}
        originPier={dynState?.currentOrigin || schedule?.origin || "Büyükada"}
        destinationPier={dynState?.destination || schedule?.destination || "Bostancı"}
        departureTime={dynState?.currentDepartureTime || schedule?.departureTime || "21:00"}
        countdown={dynState?.countdown}
      />
    </AnimatePresence>
  );
}
