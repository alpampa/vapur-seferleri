"use client";

import { Ship, Bell, BellRing, Star, ChevronRight, Radio, Footprints } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { resolveLiveVesselName } from "@/lib/agents/fleet-registry";
import { useEffect, useState } from "react";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { predictTripOccupancy, getTripAmenities } from "@/lib/utils/occupancy";
import { useWalkingCatchStore } from "@/store/useWalkingCatchStore";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { ISTANBUL_PIERS } from "@/lib/services/route-planner";

import { matchesTurkishSearch } from "@/lib/utils/search-normalizer";

export type TripStatus = "ON_TIME" | "DEPARTING_SOON" | "BOARDING" | "DELAYED" | "CANCELLED" | "IN_TRANSIT" | "ARRIVING" | "COMPLETED";

export interface ScheduleCardProps {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  targetTimeIso?: string;
  serverTimeIso?: string;
  delayText?: string;
  vessel?: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
  arrivalTime?: string;
  onClick?: () => void;
  isCompact?: boolean;
  highlightStopName?: string;
}

export function TripStatusBadge({ status, delayText }: { status: TripStatus; delayText?: string }) {
  let bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  let label = status.replace("_", " ");
  
  switch (status) {
    case "ON_TIME": 
      // Kullanıcı kuralı: "Zamanında" yazısı kaldırıldı, yalın görünür
      return null;
    case "DEPARTING_SOON": 
      bgColor = "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-black animate-pulse"; 
      label = "AZ KALDI"; 
      break;
    case "BOARDING": 
      bgColor = "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 font-bold animate-pulse"; 
      label = "YOLCU ALINIYOR"; 
      break;
    case "IN_TRANSIT": 
      bgColor = "bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-bold"; 
      label = "SEYİRDE"; 
      break;
    case "ARRIVING": 
      bgColor = "bg-cyan-100 dark:bg-cyan-600/30 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold"; 
      label = "YANAŞIYOR"; 
      break;
    case "DELAYED": 
      bgColor = "bg-rose-100 dark:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold"; 
      label = "GECİKMELİ"; 
      break;
    case "CANCELLED": 
      bgColor = "bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 font-black border border-rose-400 dark:border-rose-500/60 animate-pulse"; 
      label = "❌ İPTAL EDİLDİ"; 
      break;
    case "COMPLETED": 
      bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"; 
      label = "TAMAMLANDI"; 
      break;
  }

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-tight text-center whitespace-nowrap leading-none ${bgColor}`}>
      {label} {delayText && `(${delayText})`}
    </span>
  );
}

export function ScheduleCard(props: ScheduleCardProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { t, language } = useLanguageStore();

  const hasAlarm = isAlarmSet(props.id);
  const routeKey = `${props.origin} ➔ ${props.destination}`;
  const isFav = isFavorite(routeKey);

  const occupancy = predictTripOccupancy(props.origin, props.destination, props.departureTime);

  const [dynState, setDynState] = useState<DynamicTripResolution>(() => {
    return resolveDynamicTrip(
      props.origin,
      props.destination,
      props.departureTime,
      props.targetTimeIso || new Date().toISOString(),
      props.stops,
      props.arrivalTime,
      Date.now(),
      props.serverTimeIso
    );
  });

  const liveVessel = resolveLiveVesselName(
    props.origin,
    props.destination,
    props.operator,
    dynState.isDeparted,
    dynState.status,
    props.id,
    props.departureTime
  );

  useEffect(() => {
    const update = () => {
      const resolved = resolveDynamicTrip(
        props.origin,
        props.destination,
        props.departureTime,
        props.targetTimeIso || new Date().toISOString(),
        props.stops,
        props.arrivalTime,
        Date.now(),
        props.serverTimeIso
      );
      setDynState(resolved);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [props.origin, props.destination, props.departureTime, props.targetTimeIso, props.stops, props.arrivalTime, props.serverTimeIso]);

  // If the trip has completely expired (30 seconds after its final departure leg), do not render
  if (dynState.isExpired) {
    return null;
  }

  const isDirect = !props.stops || props.stops.length === 0;

  // KULLANICI KURALI: Son 5 dakikada sefer saati de yanıp sönsün
  const isLast5Minutes = !!dynState.countdown && !dynState.isDeparted;

  // KULLANICI KURALI: İptal Sefer Tespiti (/ İPTAL Kırmızı Yanıp Sönen Rozet)
  const isCancelled = props.status === "CANCELLED" || dynState.status === "CANCELLED" || (Boolean(props.delayText) && props.delayText!.toLowerCase().includes("iptal"));

  // Kalan Saniyeyi Hesapla
  let remainingSec = 0;
  if (dynState.countdown) {
    const parts = dynState.countdown.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      remainingSec = parts[0] * 60 + parts[1];
    }
  }

  // KULLANICI KURALI: Son 3 Dakika Dairesel Kalan Saniye Progress Göstergesi
  const isLast3Minutes = !isCancelled && !dynState.isDeparted && remainingSec > 0 && remainingSec <= 180;
  const ringRatio = isLast3Minutes ? Math.max(0, Math.min(1, remainingSec / 180)) : 1;
  const ringCircumference = 94.2; // 2 * PI * 15
  const ringOffset = ringCircumference * (1 - ringRatio);
  let ringColor = "#f59e0b";
  if (remainingSec <= 60) ringColor = "#ef4444";
  else if (remainingSec <= 120) ringColor = "#f97316";

  // Profesyonel Yetişme Asistanı Entegrasyonu
  const { isEnabled: isCatchEnabled, getWalkingMinutesToPier } = useWalkingCatchStore();
  const { setActiveVoyage } = useActiveVoyageStore();

  const pierEntry = Object.entries(ISTANBUL_PIERS).find(([key]) => dynState.currentOrigin.toLowerCase().includes(key.toLowerCase()));
  const walkingMinutes = isCatchEnabled ? getWalkingMinutesToPier(pierEntry?.[1].lat, pierEntry?.[1].lng) : 0;

  let catchStatus: "CAN_CATCH" | "HURRY" | "MISS" | null = null;
  let catchStatusText = "";
  if (isCatchEnabled && !dynState.isDeparted) {
    let remainingMins = 999;
    if (dynState.countdown) {
      const parts = dynState.countdown.split(':').map(Number);
      if (parts.length === 2) remainingMins = parts[0] + parts[1] / 60;
    }
    if (remainingMins >= walkingMinutes + 2) {
      catchStatus = "CAN_CATCH";
      catchStatusText = `Yetişirsiniz (~${walkingMinutes} dk)`;
    } else if (remainingMins >= walkingMinutes - 1) {
      catchStatus = "HURRY";
      catchStatusText = `Hızlı yürüyün! (~${walkingMinutes} dk)`;
    } else {
      catchStatus = "MISS";
      catchStatusText = `Kaçırabilirsiniz`;
    }
  }

  const handleCardClick = () => {
    setActiveVoyage({
      id: props.id,
      origin: dynState.currentOrigin,
      destination: dynState.destination,
      operator: props.operator,
      vesselName: liveVessel.vesselName,
      mmsi: liveVessel.mmsi,
      departureTime: dynState.currentDepartureTime,
      arrivalTime: props.arrivalTime || "",
      price: props.price
    });
    if (props.onClick) props.onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`theme-card rounded-xl px-3 py-2.5 flex flex-col gap-2 text-slate-900 dark:text-white shadow-xs dark:shadow-none transition-all duration-150 cursor-pointer group border ${
        isCancelled
          ? "border-rose-500/90 bg-rose-50/50 dark:bg-rose-950/25 ring-1 ring-rose-500/40 shadow-xs shadow-rose-500/10"
          : isLast5Minutes
          ? "border-amber-400 dark:border-amber-500/60 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/30 bg-white dark:bg-[#141d2e]"
          : "border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40 bg-white dark:bg-[#141d2e]"
      }`}
    >
      {/* 1. ÜST SATIR: Kalkış Zamanı, Rota, Gemi Bilgisi ve Eylemler */}
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* 1. Left Column: Departure Time & Dairesel Geri Sayım Progress Ring */}
        <div className="flex items-center gap-2 shrink-0">
        {/* KULLANICI KURALI: Son 3 Dakika Kalan Saniye Dairesel Progress Halkası */}
        {isLast3Minutes && (
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0" title={`Kalkışa ${remainingSec} saniye kaldı!`}>
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-200 dark:text-slate-800"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className={`text-[10px] font-mono font-black tabular-nums ${remainingSec <= 60 ? "text-rose-600 dark:text-rose-400 animate-pulse font-extrabold" : "text-amber-600 dark:text-amber-400"}`}>
                {remainingSec}s
              </span>
              <span className="text-[7px] font-bold text-slate-400">KALDI</span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start justify-center shrink-0 min-w-[64px]">
          <span
            className={`font-mono font-black text-xl sm:text-2xl leading-none tabular-nums tracking-tight transition-all ${
              isCancelled
                ? "line-through text-rose-500 dark:text-rose-400 font-bold opacity-80"
                : isLast3Minutes
                ? "text-rose-600 dark:text-rose-400 font-extrabold scale-105 animate-pulse"
                : isLast5Minutes
                ? "text-amber-500 dark:text-amber-400 animate-pulse font-extrabold"
                : "text-blue-600 dark:text-blue-400"
            }`}
          >
            {dynState.currentDepartureTime}
          </span>
          <div className="mt-1">
            {isCancelled ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-0.5 shadow-xs">
                <span>🚫 İPTAL</span>
              </span>
            ) : dynState.isDeparted ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-0.5">
                <Ship size={10} />
                <span>{t("departed")}</span>
              </span>
            ) : isLast3Minutes ? (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-0.5 shadow-xs animate-pulse ${
                remainingSec <= 60 ? "bg-rose-600 text-white" : "bg-amber-500 text-slate-950 font-extrabold"
              }`}>
                <span>{remainingSec <= 60 ? "🚨 SON ÇAĞRI" : "🏃 KAPI KAPANIYOR"}</span>
              </span>
            ) : dynState.countdown ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 animate-pulse whitespace-nowrap">
                ⏳ {dynState.countdown}
              </span>
            ) : (
              <TripStatusBadge status={dynState.status} delayText={props.delayText} />
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Column: Dynamic Route & Operator / Occupancy Meta */}
      <div className="flex flex-col min-w-0 flex-1 pr-1">
        {/* Route Line with Cancellation Slash Badge */}
        <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-tight truncate">
          <span className={`truncate ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
            {dynState.currentOrigin}
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm shrink-0">➔</span>
          <span className={`truncate ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-blue-700 dark:text-amber-300 font-bold"}`}>
            {dynState.destination}
          </span>

          {/* KULLANICI KURALI: Slash ve kırmızı yanıp sönen İPTAL rozeti */}
          {isCancelled && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider animate-pulse shrink-0 shadow-xs border border-rose-400">
              <span className="text-white font-bold">/</span>
              <span>⚠️ İPTAL</span>
            </span>
          )}
        </div>

        {/* Cancellation Reason Notification */}
        {isCancelled && (
          <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
            ⚠️ {props.delayText || "Hava muhalefeti (Lodos / Sert Dalga) nedeniyle sefer iptal edilmiştir."}
          </div>
        )}

        {/* Meta Line: Operator, Occupancy dot, and Direct/Stops */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap truncate">
          <OperatorLogo operator={props.operator} size="sm" showName={true} />

          {/* Assigned Vessel Name & Real Status Badge */}
          <span 
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
              liveVessel.isConfirmedUnderway
                ? "text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/50 shadow-xs"
                : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
            }`}
            title={liveVessel.statusText}
          >
            <Ship size={11} className={liveVessel.isConfirmedUnderway ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-slate-500 dark:text-slate-400"} />
            <span className="font-mono tracking-tight font-black">{liveVessel.vesselName}</span>
            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none ${
              liveVessel.isConfirmedUnderway
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {liveVessel.isConfirmedUnderway ? "Seyirde" : "Rıhtımda"}
            </span>
          </span>

          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

          {/* Occupancy Indicator & Real Passenger Density */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded border transition-colors ${
              occupancy.level === "RUSH" || occupancy.level === "HIGH"
                ? "text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-600/50 animate-pulse"
                : occupancy.level === "MEDIUM"
                ? "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-600/40"
                : "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/40"
            }`}
            title={occupancy.description}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                occupancy.level === "RUSH" || occupancy.level === "HIGH"
                  ? "bg-rose-500 shadow-xs shadow-rose-500"
                  : occupancy.level === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span>{occupancy.label}</span>
          </span>

          {/* Vapur İçi Konfor & İkram Rozetleri (Büfe, Bisiklet, Evcil Hayvan) */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60" title="Vapur İçi İkram & Hizmetler">
            <span title="Taze Çay & Büfe Servisi" className="cursor-help hover:scale-110 transition-transform">☕</span>
            <span title="Bisiklet Taşımaya Uygun" className="cursor-help hover:scale-110 transition-transform">🚲</span>
            <span title="Evcil Hayvan Dostu (Açık Güverte)" className="cursor-help hover:scale-110 transition-transform">🐾</span>
            <span title="Engelli & Puset Rampası" className="cursor-help hover:scale-110 transition-transform">♿</span>
          </span>

          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

          {/* Direct or Stops badge */}
          <span className="text-slate-500 dark:text-slate-400 text-[10px]">
            {isDirect ? t("direct") : `${props.stops?.length} ${t("stops")}`}
          </span>

          {/* Walking Catch Status Badge */}
          {catchStatus && (
            <>
              <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.2 rounded border ${
                catchStatus === "CAN_CATCH"
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/40"
                  : catchStatus === "HURRY"
                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/40 animate-pulse"
                  : "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600/40"
              }`}>
                <Footprints size={9} />
                <span>{catchStatusText}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Right Column: Price & Quick Action (Alarm, Fav, Arrow) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="text-right hidden xs:flex flex-col items-end">
          <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
            {props.price}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
            {props.platform}
          </span>
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(routeKey);
          }}
          title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 touch-manipulation ${
            isFav
              ? "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/20 ring-1 ring-amber-400/30"
              : "text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Star size={16} className={isFav ? "fill-amber-500 text-amber-500" : ""} />
        </button>

        {/* Alarm Bell Button */}
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            await requestNotificationPermission();
            toggleAlarm(props.id);
          }}
          title={hasAlarm ? "Hatırlatıcıyı Kaldır" : "15 Dk Önce Hatırlat"}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 touch-manipulation ${
            hasAlarm
              ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 ring-1 ring-blue-500/30"
              : "text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {hasAlarm ? (
            <BellRing size={16} className="text-blue-600 dark:text-blue-400 animate-bounce" />
          ) : (
            <Bell size={16} />
          )}
        </button>

        {/* Details Chevron */}
        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>

    {/* 2. ALT SATIR: TEK SATIR DİNAMİK ROTA VE İSTASYON ZİNCİRİ (Unified Station Chain) */}
    {!props.isCompact && dynState.activeChain && dynState.activeChain.length > 0 && (
      <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {/* Vapur geride kalan iskelelerden kalktıysa kök iskeleyi zarifçe belirt */}
          {dynState.initialOrigin && dynState.initialOrigin !== dynState.currentOrigin && (
            <span
              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1"
              title={`${dynState.initialOrigin} iskelesinden hareket etti`}
            >
              <Ship size={10} className="text-blue-500 shrink-0" />
              <span>{dynState.initialOrigin} kalkışlı</span>
            </span>
          )}

          {dynState.activeChain.map((wp, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === dynState.activeChain.length - 1;
            const isHighlighted = Boolean(
              props.highlightStopName &&
              props.highlightStopName.trim().length > 0 &&
              matchesTurkishSearch(wp.name, props.highlightStopName)
            );

            return (
              <div key={`${wp.name}-${idx}`} className="flex items-center gap-1 shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                    isHighlighted
                      ? "bg-amber-100 dark:bg-amber-400/25 text-amber-950 dark:text-amber-200 border border-amber-400 ring-2 ring-amber-400/40 font-black shadow-xs"
                      : isFirst
                      ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50"
                      : isLast
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                  }`}
                >
                  {isFirst ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  ) : isLast ? (
                    <span className="text-[10px] leading-none shrink-0">🏁</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                  )}

                  <span className="truncate max-w-[85px] sm:max-w-[120px]">{wp.name}</span>

                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded font-black tabular-nums ${
                      isFirst
                        ? "bg-emerald-600 text-white"
                        : isLast
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {wp.time}
                  </span>
                </div>

                {!isLast && (
                  <span className="text-slate-300 dark:text-slate-600 font-extrabold text-[11px] shrink-0 px-0.5">
                    ➔
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
}
