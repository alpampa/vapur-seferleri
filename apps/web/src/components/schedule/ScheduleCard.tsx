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
import { correlateAisVessel } from "@/lib/services/ais-corridor-tracker";
import type { ScheduleCardDto } from "@/app/page";

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
  onSelectHop?: (schedule: ScheduleCardDto) => void;
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

  const aisCorrelation = correlateAisVessel(
    props.origin,
    props.destination,
    props.departureTime,
    props.targetTimeIso,
    Date.now()
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

  // Gece Seferi Tespiti (00:00 - 05:59 arası seferler UKOME Çift Tarife)
  const departureHour = parseInt(dynState.currentDepartureTime.split(":")[0], 10);
  const isNightTrip = !isNaN(departureHour) && departureHour >= 0 && departureHour < 6;

  // Çok duraklı veya ada ring seferi tespiti
  const hasMultiStops = Boolean(
    (props.stops && props.stops.length > 0) ||
    props.destination.includes("Ring") ||
    (props.routeTitle && props.routeTitle.includes("Ring"))
  );

  const scheduleDto: ScheduleCardDto = {
    id: props.id,
    origin: props.origin,
    destination: props.destination,
    operator: props.operator,
    routeTitle: props.routeTitle,
    departureTime: props.departureTime,
    departureTime12: props.departureTime12,
    status: props.status,
    targetTimeIso: props.targetTimeIso,
    delayText: props.delayText,
    vessel: aisCorrelation.isVerified ? aisCorrelation.vesselName : liveVessel.vesselName,
    platform: props.platform,
    price: props.price,
    progress: props.progress,
    stops: props.stops,
    arrivalTime: props.arrivalTime,
  };

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

  // KOMPAKT LİSTE GÖRÜNÜMÜ (Yüksek Yoğunluklu İsviçre Tipografisi - Swiss Transit Density)
  if (props.isCompact) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={`rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer border group shadow-2xs ${
            isCancelled
              ? "border-rose-500/70 bg-rose-50/50 dark:bg-rose-950/20 text-slate-800 dark:text-slate-200"
              : isNightTrip
              ? "border-indigo-500/70 bg-gradient-to-r from-[#090d1f] via-[#0d1430] to-[#090d1f] text-slate-100 shadow-indigo-950/40"
              : isLast3Minutes
              ? "border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white"
              : isLast5Minutes
              ? "border-amber-400/80 bg-amber-50/30 dark:bg-amber-950/20 text-slate-900 dark:text-white"
              : "border-slate-200 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500/50 bg-white dark:bg-[#111726] text-slate-900 dark:text-white"
          }`}
        >
          {/* Sol: Saat + Kalan Süre */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-[72px]">
            <span
              className={`font-mono font-black text-sm sm:text-base tabular-nums leading-none ${
                isCancelled
                  ? "line-through text-rose-500"
                  : isLast3Minutes
                  ? "text-rose-600 dark:text-rose-400 animate-pulse font-extrabold"
                  : isNightTrip
                  ? "text-amber-400 font-extrabold"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {dynState.currentDepartureTime}
            </span>

            {dynState.countdown && !isCancelled && (
              <span className="text-[9px] font-mono font-black px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30 tabular-nums">
                {dynState.countdown}
              </span>
            )}
          </div>

          {/* Orta: Güzergah + Operatör + Durak & Gece Rozetleri */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate text-xs">
            <OperatorLogo operator={props.operator} size="sm" showName={false} />
            <span className={`font-bold truncate ${isCancelled ? "line-through text-slate-400" : ""}`}>
              {dynState.currentOrigin}
            </span>
            <span className="text-blue-500 dark:text-blue-400 font-black text-[10px] shrink-0">➔</span>
            <span className={`font-bold truncate ${isCancelled ? "line-through text-slate-400" : "text-blue-700 dark:text-amber-300"}`}>
              {dynState.destination}
            </span>

            {isNightTrip && (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 shrink-0">
                🌙 GECE
              </span>
            )}

            {hasMultiStops && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onSelectHop?.(scheduleDto);
                }}
                title="Ada İskeleleri Arası Biniş Seç"
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 shrink-0 cursor-pointer active:scale-95"
              >
                🔄 Seç
              </button>
            )}
          </div>

          {/* Sağ: Ücret & Eylemler */}
          <div className="flex items-center gap-1 shrink-0 text-right">
            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums hidden xs:inline">
              {props.price}
            </span>

            {/* Favori Butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(routeKey);
              }}
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                isFav
                  ? "text-amber-500 bg-amber-100 dark:bg-amber-400/20"
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Star size={13} className={isFav ? "fill-amber-500 text-amber-500" : ""} />
            </button>

            {/* Alarm Butonu */}
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                await requestNotificationPermission();
                toggleAlarm(props.id);
              }}
              title={hasAlarm ? "Hatırlatıcıyı Kaldır" : "15 Dk Önce Hatırlat"}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                hasAlarm
                  ? "text-blue-600 bg-blue-100 dark:bg-blue-500/20"
                  : "text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {hasAlarm ? <BellRing size={13} className="text-blue-600 animate-bounce" /> : <Bell size={13} />}
            </button>

            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all shrink-0" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`theme-card rounded-xl px-3 py-2.5 flex flex-col gap-1.5 text-slate-900 dark:text-white shadow-xs dark:shadow-none transition-all duration-150 cursor-pointer group border active:scale-[0.99] touch-manipulation ${
        isCancelled
          ? "border-rose-500/90 bg-rose-50/50 dark:bg-rose-950/25 ring-1 ring-rose-500/40 shadow-xs shadow-rose-500/10"
          : isNightTrip
          ? "border-indigo-500/70 bg-gradient-to-r from-slate-950 via-[#0b1029] to-[#0f173a] text-slate-100 ring-1 ring-indigo-500/30 shadow-indigo-950/50 shadow-md"
          : isLast5Minutes
          ? "border-amber-400 dark:border-amber-500/60 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/30 bg-white dark:bg-[#141d2e]"
          : "border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40 bg-white dark:bg-[#141d2e]"
      }`}
    >
      {/* 1. ANA SATIR: Kalkış Zamanı, Rota, Operatör ve Eylemler */}
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* 1. Sol: Kalkış Saati & Dairesel Geri Sayım Progress Halkası */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Son 3 Dakika Kalan Saniye Dairesel Progress Halkası */}
          {isLast3Minutes && (
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0" title={`Kalkışa ${remainingSec} saniye kaldı!`}>
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
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

          <div className="flex flex-col items-start justify-center shrink-0 min-w-[62px]">
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

        {/* 2. Orta: Dinamik Güzergah & Hafif Temel Bilgiler */}
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          {/* Güzergah */}
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base leading-tight truncate">
            <span className={`truncate ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
              {dynState.currentOrigin}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm shrink-0">➔</span>
            <span className={`truncate ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-blue-700 dark:text-amber-300 font-bold"}`}>
              {dynState.destination}
            </span>

            {/* Gece Seferi Rozeti */}
            {isNightTrip && !isCancelled && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-indigo-500/25 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-indigo-500/50 shrink-0">
                🌙 GECE
              </span>
            )}

            {/* İptal Rozeti */}
            {isCancelled && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                ⚠️ İPTAL
              </span>
            )}
          </div>

          {/* İptal Nedeni Varsa */}
          {isCancelled && props.delayText && (
            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              ⚠️ {props.delayText}
            </div>
          )}

          {/* Sadeleştirilmiş Temel Bilgi Satırı */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <OperatorLogo operator={props.operator} size="sm" showName={true} />

            <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>

            {/* Direkt veya Durak Sayısı */}
            <span className="text-slate-600 dark:text-slate-300 text-[10px] font-semibold shrink-0">
              {isDirect ? t("direct") : `${props.stops?.length} ara durak`}
            </span>

            {/* Doğrulanmış Gemi Adı Rozeti */}
            {aisCorrelation.isVerified && (
              <>
                <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 truncate">
                  <Ship size={10} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{aisCorrelation.vesselName}</span>
                </span>
              </>
            )}

            {/* Doluluk Durumu */}
            <span className="text-slate-300 dark:text-slate-600 font-bold hidden xs:inline">•</span>
            <span className="items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hidden xs:inline-flex">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  occupancy.level === "RUSH" || occupancy.level === "HIGH"
                    ? "bg-rose-500"
                    : occupancy.level === "MEDIUM"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span>{occupancy.label}</span>
            </span>
          </div>
        </div>

        {/* 3. Sağ: Fiyat & Hızlı Eylemler (Favori, Alarm, Detay Oku) */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right flex flex-col items-end pr-0.5">
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
              {props.price}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 hidden xs:block">
              {props.platform}
            </span>
          </div>

          {/* Favori Yıldızı */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(routeKey);
            }}
            title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 touch-manipulation cursor-pointer ${
              isFav
                ? "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/20 ring-1 ring-amber-400/30"
                : "text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Star size={15} className={isFav ? "fill-amber-500 text-amber-500" : ""} />
          </button>

          {/* Alarm Zili */}
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              await requestNotificationPermission();
              toggleAlarm(props.id);
            }}
            title={hasAlarm ? "Hatırlatıcıyı Kaldır" : "15 Dk Önce Hatırlat"}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 touch-manipulation cursor-pointer ${
              hasAlarm
                ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 ring-1 ring-blue-500/30"
                : "text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {hasAlarm ? (
              <BellRing size={15} className="text-blue-600 dark:text-blue-400 animate-bounce" />
            ) : (
              <Bell size={15} />
            )}
          </button>

          {/* Detay Gösterge Oku */}
          <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
        </div>
      </div>
    </div>
  );
}
