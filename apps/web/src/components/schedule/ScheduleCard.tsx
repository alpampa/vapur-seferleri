"use client";

import { Ship, Moon, Ban, Siren, Timer, AlertTriangle, Calendar } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { resolveDynamicTrip, isTripCancelled, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { formatRemainingShort } from "@/lib/utils/istanbul-time";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { predictTripOccupancy } from "@/lib/utils/occupancy";
import { getPierTransit } from "@/lib/data/pier-transit-connections";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { triggerHaptic } from "@/lib/utils/haptics";
import { TransitRouteSchematic } from "@/components/schedule/TransitRouteSchematic";
import { ScheduleCardActions } from "@/components/schedule/card/ScheduleCardActions";
import { TripStatusBadge } from "@/components/schedule/card/TripStatusBadge";
import type { ScheduleCardDto, TripStatus } from "@/lib/types/schedule";

// Geriye dönük uyumluluk: eski import yolları çalışmaya devam eder.
export { TripStatusBadge };

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
  nowMs?: number;
  delayText?: string;
  vessel?: string;
  platform: string;
  price: string;
  progress: number;
  stops?: { name: string; time: string }[];
  arrivalTime?: string;
  isContinuous?: boolean;
  continuousUntil?: string;
  onClick?: () => void;
  isCompact?: boolean;
  isFeaturedHero?: boolean;
  highlightStopName?: string;
  onSelectHop?: (schedule: ScheduleCardDto) => void;
  /** Tüm gün görünümü veya farklı gün tipi (Hafta İçi / Cumartesi / Pazar) önizlemesi */
  isTimetablePreview?: boolean;
  /** Farklı gün tipi seçildiğinde gösterilecek etiket (ör. "Cumartesi Tarifesi") */
  dayPreviewLabel?: string;
}

export function ScheduleCard(props: ScheduleCardProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { t } = useLanguageStore();
  // Hook'lar erken return'den ÖNCE çağrılmalı (React hook sırası kuralı)
  const { setActiveVoyage } = useActiveVoyageStore();

  const hasAlarm = isAlarmSet(props.id);
  const routeKey = `${props.origin} ➔ ${props.destination}`;
  const isFav = isFavorite(routeKey);

  const occupancy = predictTripOccupancy(props.origin, props.destination, props.departureTime);

  const accurateNow = props.nowMs || Date.now();
  const isOtherDayPreview = Boolean(props.dayPreviewLabel);

  const rawDynState: DynamicTripResolution = resolveDynamicTrip(
    props.origin,
    props.destination,
    props.departureTime,
    props.targetTimeIso || new Date().toISOString(),
    props.stops,
    props.arrivalTime,
    accurateNow,
    props.serverTimeIso
  );

  // Eğer kullanıcı başka bir günün tarifesini (ör. Cumartesi veya Pazar) inceliyorsa,
  // o seferi "Hareket Etti" veya "6 dk kaldı" gibi canlı göstermek yanıltıcı olur.
  const dynState: DynamicTripResolution = isOtherDayPreview
    ? {
        ...rawDynState,
        currentOrigin: props.origin,
        destination: props.destination,
        currentDepartureTime: props.departureTime,
        status: "ON_TIME",
        countdown: null,
        minutesUntilDeparture: null,
        isDeparted: false,
        isExpired: false,
        underway: null,
        boardingDeadline: null,
      }
    : rawDynState;

  // KULLANICI KURALI & SIFIR TOLERANS (SIFIR HALÜSİNASYON / MÜKERRER ENGELİ):
  // 1. Süresi dolan seferler normal canlı modda render edilmez (ancak Tüm Gün / Gün Tipi önizlemesinde gösterilir).
  // 2. Kalkış ve varış noktası aynı olan (örn: Büyükada ➔ Büyükada) anlamsız/hatalı seferler ASLA render edilemez!
  if (
    (!props.isTimetablePreview && dynState.isExpired) ||
    !props.origin ||
    !props.destination ||
    props.origin.trim() === props.destination.trim() ||
    dynState.currentOrigin.trim() === dynState.destination.trim()
  ) {
    return null;
  }

  const ringOriginMatch = props.destination.match(/ring\s*\(([^)]+)\)/i);
  const ringOrigin = ringOriginMatch ? ringOriginMatch[1].trim() : null;
  const isUnderway = dynState.currentOrigin.trim() !== props.origin.trim();
  const routeDestinationDisplay =
    isUnderway && ringOrigin
      ? ringOrigin
      : !isUnderway && ringOrigin
      ? `${props.origin} (Ring)`
      : dynState.destination;

  const destTransit = getPierTransit(dynState.destination);
  const primaryTransit = destTransit[0];

  const isDirect = !props.stops || props.stops.length === 0;

  // KULLANICI KURALI: Son 5 dakikada sefer saati de yanıp sönsün
  const isLast5Minutes = !isOtherDayPreview && !!dynState.countdown && !dynState.isDeparted;

  // KULLANICI KURALI: İptal Sefer Tespiti (/ İPTAL Kırmızı Yanıp Sönen Rozet) — ortak tek doğruluk kaynağı
  const isCancelled = !isOtherDayPreview && isTripCancelled({ status: props.status, delayText: props.delayText }, dynState);

  // YETİŞME MODU: Tahmini son giriş penceresi (turnike + rampa güvenlik payı).
  const boarding = !isOtherDayPreview ? (dynState.boardingDeadline ?? null) : null;
  const canBoard = !isOtherDayPreview && !isCancelled && !dynState.isDeparted;
  const showLastEntrySoon = canBoard && boarding?.isWithinWarningWindow === true;
  const showLastEntryPassed = canBoard && boarding?.isPastLastEntry === true;

  // Kalan Saniyeyi Hesapla
  let remainingSec = 0;
  if (dynState.countdown) {
    const parts = dynState.countdown.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      remainingSec = parts[0] * 60 + parts[1];
    }
  }

  // KULLANICI KURALI: Son 60 Saniye Dairesel Kalan Saniye Geri Sayım Göstergesi
  const isLastMinute = !isOtherDayPreview && !isCancelled && !dynState.isDeparted && remainingSec > 0 && remainingSec <= 60;
  const ringRatio = isLastMinute ? Math.max(0, Math.min(1, remainingSec / 60)) : 1;
  const ringCircumference = 94.2; // 2 * PI * 15
  const ringOffset = ringCircumference * (1 - ringRatio);
  let ringColor = "#f59e0b";
  if (remainingSec <= 20) ringColor = "#ef4444";
  else if (remainingSec <= 40) ringColor = "#f97316";

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
    platform: props.platform,
    price: props.price,
    progress: props.progress,
    stops: props.stops,
    arrivalTime: props.arrivalTime,
  };

  const handleToggleFavorite = () => {
    triggerHaptic(isFav ? "light" : "success");
    toggleFavorite(routeKey);
  };

  const handleToggleAlarm = async () => {
    triggerHaptic(hasAlarm ? "light" : "medium");
    await requestNotificationPermission();
    toggleAlarm(props.id);
  };

  const handleShareTrip = () => {
    triggerHaptic("light");
    const org = dynState.currentOrigin || props.origin;
    const dst = routeDestinationDisplay || props.destination;
    const dep = dynState.currentDepartureTime || props.departureTime;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/?from=${encodeURIComponent(org)}&to=${encodeURIComponent(props.destination)}`
        : "https://adalar-sefer-asistani.vercel.app";
    const shareText = `⛴️ ${dep} ${org} ➔ ${dst} (${props.operator}) vapur seferi · ${shareUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${dep} ${org} ➔ ${dst} Vapuru`,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
  };

  const handleCardClick = () => {
    setActiveVoyage({
      id: props.id,
      origin: dynState.currentOrigin,
      destination: dynState.destination,
      operator: props.operator,
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
          role="button"
          tabIndex={0}
          aria-label={`${dynState.currentOrigin}'den ${routeDestinationDisplay}'na ${dynState.currentDepartureTime} seferi, detay için açın`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCardClick();
            }
          }}
          className={`rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer border group shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isCancelled
              ? "border-rose-500/70 bg-rose-50/50 dark:bg-rose-950/20 text-slate-800 dark:text-slate-200"
              : dynState.isDeparted
              ? "border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 opacity-65"
              : isNightTrip
              ? "border-indigo-400/70 dark:border-indigo-500/50 bg-white dark:bg-[#111726] text-slate-900 dark:text-white"
              : isLastMinute
              ? "border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white"
              : isLast5Minutes
              ? "border-amber-400/80 bg-amber-50/30 dark:bg-amber-950/20 text-slate-900 dark:text-white"
              : "border-slate-200 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500/50 bg-white dark:bg-[#111726] text-slate-900 dark:text-white"
          }`}
        >
          {/* Sol: Saat + Kalan Süre */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-18">
            <span
              className={`font-mono font-black text-sm sm:text-base tabular-nums leading-none ${
                isCancelled
                  ? "line-through text-rose-500"
                  : dynState.isDeparted
                  ? "text-slate-400 dark:text-slate-500"
                  : isLastMinute
                  ? "text-rose-600 dark:text-rose-400 animate-pulse font-extrabold"
                  : isNightTrip
                  ? "text-indigo-600 dark:text-indigo-300 font-extrabold"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {dynState.currentDepartureTime}
            </span>

            {isOtherDayPreview ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {props.dayPreviewLabel}
              </span>
            ) : dynState.isDeparted ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {t("departed")}
              </span>
            ) : dynState.countdown && !isCancelled ? (
              <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded tabular-nums border ${
                remainingSec > 0 && remainingSec <= 60
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse font-extrabold shadow-2xs"
                  : remainingSec > 0 && remainingSec <= 180
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-2xs"
                  : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-500/30"
              }`}>
                {remainingSec > 0 && remainingSec <= 60 ? remainingSec + "s" : dynState.countdown}
              </span>
            ) : dynState.minutesUntilDeparture != null && dynState.status === "ON_TIME" && !isCancelled ? (
              <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tabular-nums whitespace-nowrap">
                {formatRemainingShort(dynState.minutesUntilDeparture)}
              </span>
            ) : null}

            {/* YETİŞME MODU: son giriş penceresi */}
            {showLastEntryPassed ? (
              <span
                title="Tahmini: turnike + rampa geçiş payı. Resmî kapı kapanış saati değildir."
                className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white border border-rose-500 whitespace-nowrap"
              >
                {t("lastEntryPassed")}
              </span>
            ) : showLastEntrySoon ? (
              <span
                title="Tahmini: turnike + rampa geçiş payı. Resmî kapı kapanış saati değildir."
                className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 border border-amber-400 tabular-nums whitespace-nowrap"
              >
                {t("lastEntrySoon")} ~{boarding?.lastEntryHhmm}
              </span>
            ) : null}
          </div>

          {/* Orta: Güzergah + Operatör + Durak & Gece Rozetleri */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 text-xs">
            <OperatorLogo operator={props.operator} size="sm" showName={false} />
            <span title={dynState.currentOrigin} className={`font-bold truncate min-w-0 ${isCancelled ? "line-through text-slate-400" : ""}`}>
              {dynState.currentOrigin}
            </span>
            <span className="text-blue-500 dark:text-blue-400 font-black text-[10px] shrink-0">➔</span>
            <span title={dynState.destination} className={`font-bold truncate min-w-0 ${isCancelled ? "line-through text-slate-400" : "text-blue-700 dark:text-blue-300"}`}>
              {routeDestinationDisplay}
            </span>

            {isNightTrip && (
              <span
                title="Gece seferi"
                aria-label="Gece seferi"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-300 shrink-0"
              >
                <Moon size={11} aria-hidden="true" />
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
                aria-label="Ada iskeleleri arası biniş iniş seç"
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 shrink-0 cursor-pointer active:scale-95"
              >
                Seç
              </button>
            )}

            {/* Hızlı Aktarma (Metro / Marmaray / Tramvay) */}
            {primaryTransit && !isCancelled && (
              <span
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shrink-0"
                title={`${dynState.destination} aktarma: ${primaryTransit.name} (${primaryTransit.walkMinutes} dk yürüme)`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${primaryTransit.badgeBg}`} />
                <span>{primaryTransit.line}</span>
                <span className="text-[8px] opacity-75 font-mono">{primaryTransit.walkMinutes}dk</span>
              </span>
            )}

            {/* İskele / Sefer Yoğunluk Rozeti */}
            {!isCancelled && !dynState.isDeparted && (
              <span
                className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                  occupancy.level === "RUSH" || occupancy.level === "HIGH"
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                    : occupancy.level === "MEDIUM"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                }`}
                title={`İskele & Sefer Yoğunluk Tahmini: %${occupancy.percentage} (${occupancy.label})`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    occupancy.level === "RUSH" || occupancy.level === "HIGH"
                      ? "bg-rose-500 animate-pulse"
                      : occupancy.level === "MEDIUM"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                <span>{occupancy.label}</span>
              </span>
            )}
          </div>

          {/* Sağ: Eylemler */}
          <ScheduleCardActions
            variant="compact"
            isFav={isFav}
            hasAlarm={hasAlarm}
            onToggleFavorite={handleToggleFavorite}
            onToggleAlarm={handleToggleAlarm}
            onShareTrip={handleShareTrip}
          />
        </div>
      </>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${dynState.currentOrigin}'den ${routeDestinationDisplay}'na ${dynState.currentDepartureTime} seferi, detay için açın`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`theme-card rounded-xl px-3 py-2.5 flex flex-col gap-1.5 text-slate-900 dark:text-white shadow-xs dark:shadow-none transition-all duration-150 cursor-pointer group border active:scale-[0.99] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        props.isFeaturedHero
          ? "border-blue-500/90 dark:border-blue-400 ring-2 ring-blue-500/25 bg-linear-to-b from-blue-50/60 via-white to-white dark:from-blue-950/40 dark:via-[#141d2e] dark:to-[#141d2e] shadow-sm"
          : isCancelled
          ? "border-rose-500/90 bg-rose-50/50 dark:bg-rose-950/25 ring-1 ring-rose-500/40 shadow-xs shadow-rose-500/10"
          : dynState.isDeparted
          ? "border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 opacity-65"
          : isNightTrip
          ? "border-indigo-400/70 dark:border-indigo-500/50 bg-white dark:bg-[#141d2e]"
          : isLast5Minutes
          ? "border-amber-400 dark:border-amber-500/60 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/30 bg-white dark:bg-[#141d2e]"
          : "border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500/40 bg-white dark:bg-[#141d2e]"
      }`}
    >
      {/* 1. ANA SATIR: Kalkış Zamanı, Rota, Operatör ve Eylemler */}
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* 1. Sol: Kalkış Saati & Dairesel Geri Sayım Progress Halkası */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Son 60 Saniye Kalan Saniye Dairesel Progress Halkası */}
          {isLastMinute && (
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
                <span className="text-[10px] font-mono font-black tabular-nums text-rose-600 dark:text-rose-400 animate-pulse font-extrabold">
                  {remainingSec}s
                </span>
                <span className="text-[8px] font-bold text-slate-400">KALDI</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-start justify-center shrink-0 min-w-16">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`font-mono font-black text-xl sm:text-2xl leading-none tabular-nums tracking-tight transition-all ${
                  isCancelled
                    ? "line-through text-rose-500 dark:text-rose-400 font-bold opacity-80"
                    : dynState.isDeparted
                    ? "text-slate-400 dark:text-slate-500"
                    : isLastMinute
                    ? "text-rose-600 dark:text-rose-400 font-extrabold scale-105 animate-time-blink"
                    : isLast5Minutes
                    ? "text-amber-500 dark:text-amber-400 font-extrabold animate-time-blink"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {dynState.currentDepartureTime}
              </span>
            </div>
            {props.isContinuous && !isCancelled && (
              <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300/60 dark:border-cyan-500/30 shrink-0 whitespace-nowrap">
                <Timer size={9} aria-hidden="true" /> SÜREKLİ{props.continuousUntil ? ` ${props.continuousUntil}` : ""}
              </span>
            )}
            <div className="mt-1">
              {isOtherDayPreview ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 inline-flex items-center gap-0.5 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                  <Calendar size={9} aria-hidden="true" />
                  <span>{props.dayPreviewLabel}</span>
                </span>
              ) : isCancelled ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse inline-flex items-center gap-0.5 shadow-xs">
                  <Ban size={10} aria-hidden="true" /> İPTAL
                </span>
              ) : dynState.isDeparted ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 inline-flex items-center gap-0.5 border border-slate-300 dark:border-slate-700">
                  <Ship size={10} />
                  <span>{t("departed")}</span>
                </span>
              ) : isLastMinute ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-0.5 shadow-xs animate-pulse bg-rose-600 text-white">
                  <Siren size={10} aria-hidden="true" /> SON ÇAĞRI
                </span>
              ) : dynState.countdown ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 animate-pulse whitespace-nowrap inline-flex items-center gap-0.5">
                  <Timer size={10} aria-hidden="true" /> {dynState.countdown}
                </span>
              ) : dynState.minutesUntilDeparture != null && dynState.status === "ON_TIME" ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tabular-nums whitespace-nowrap inline-flex items-center gap-0.5">
                  {formatRemainingShort(dynState.minutesUntilDeparture)}
                </span>
              ) : (
                <TripStatusBadge status={dynState.status} delayText={props.delayText} />
              )}
            </div>
          </div>
        </div>

        {/* 2. Orta: Dinamik Güzergah & Hafif Temel Bilgiler */}
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-0.5 font-black text-[13px] sm:text-base leading-tight min-w-0">
            <span
              title={dynState.currentOrigin}
              className={`min-w-0 ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
            >
              {dynState.currentOrigin}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm shrink-0">➔</span>
            <span
              title={dynState.destination}
              className={`min-w-0 ${isCancelled ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-blue-700 dark:text-blue-300 font-bold"}`}
            >
              {routeDestinationDisplay}
            </span>

            {isCancelled && (
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                <AlertTriangle size={9} aria-hidden="true" /> İPTAL
              </span>
            )}
          </div>

          {isCancelled && props.delayText && (
            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              <AlertTriangle size={10} className="inline mr-0.5" aria-hidden="true" /> {props.delayText}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
            <OperatorLogo operator={props.operator} size="sm" showName={false} />

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600 font-bold">•</span>

            <span className="text-slate-600 dark:text-slate-300 text-[10px] font-semibold shrink-0">
              {isDirect ? t("direct") : `${props.stops?.length} ${t("stops")}`}
            </span>

            {isNightTrip && !isCancelled && (
              <span
                title="Gece seferi"
                aria-label="Gece seferi"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-300 shrink-0"
              >
                <Moon size={11} aria-hidden="true" />
              </span>
            )}

            <span className="text-slate-300 dark:text-slate-600 font-bold hidden xs:inline">•</span>
            <span
              className={`items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded border hidden xs:inline-flex shrink-0 ${
                occupancy.level === "RUSH" || occupancy.level === "HIGH"
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                  : occupancy.level === "MEDIUM"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
              }`}
              title={`İskele ve Sefer Yoğunluk Tahmini: %${occupancy.percentage} (${occupancy.label})`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  occupancy.level === "RUSH" || occupancy.level === "HIGH"
                    ? "bg-rose-500 animate-pulse"
                    : occupancy.level === "MEDIUM"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span>{occupancy.label}</span>
            </span>
          </div>
        </div>

        {/* 3. Sağ: Hızlı Eylemler (Paylaş, Favori, Alarm, Detay Oku) */}
        <ScheduleCardActions
          variant="full"
          isFav={isFav}
          hasAlarm={hasAlarm}
          onToggleFavorite={handleToggleFavorite}
          onToggleAlarm={handleToggleAlarm}
          onShareTrip={handleShareTrip}
        />
      </div>

      {/* YETİŞME MODU: son giriş penceresi — TAM GENİŞLİK şerit */}
      {canBoard && boarding && (showLastEntryPassed || showLastEntrySoon) && (
        <div className="hidden sm:block w-full">
          {showLastEntryPassed ? (
            <span
              title="Tahmini: turnike + rampa geçiş payı. Resmî kapı kapanış saati değildir."
              className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white border border-rose-500 inline-flex items-center gap-1 whitespace-nowrap"
            >
              <Siren size={10} aria-hidden="true" /> {t("lastEntryPassed")} ~{boarding.lastEntryHhmm}
            </span>
          ) : (
            <span
              title="Tahmini: turnike + rampa geçiş payı. Resmî kapı kapanış saati değildir."
              className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-400 tabular-nums inline-flex items-center gap-1 whitespace-nowrap"
            >
              <Timer size={10} aria-hidden="true" /> {t("lastEntrySoon")} ~{boarding.lastEntryHhmm}
            </span>
          )}
        </div>
      )}

      {/* 2. YEDEK GÜZERGAH ŞERİDİ */}
      {!props.isCompact && (!props.stops || props.stops.length === 0) && dynState.activeChain && dynState.activeChain.length > 1 && (
        <div className="w-full pt-1.5 mt-0.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-0.5">
              Duraklar:
            </span>
            {dynState.activeChain.map((wp, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === dynState.activeChain.length - 1;
              return (
                <div key={`${wp.name}-${idx}`} className="inline-flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors max-w-full min-w-0 ${
                      isFirst
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/50"
                        : isLast
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700/60 font-black"
                        : "bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="truncate">{wp.name}</span>
                    <span className="font-mono text-[9px] opacity-80 tabular-nums shrink-0">({wp.time})</span>
                  </span>
                  {!isLast && (
                    <span className="text-slate-300 dark:text-slate-600 font-extrabold text-[9px]">
                      ➔
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TRANSIT ROTA ÇİZGİSİ ŞEMASI */}
      {!props.isCompact && props.stops && props.stops.length > 0 && (
        <TransitRouteSchematic
          origin={props.origin}
          destination={props.destination}
          departureTime={props.departureTime}
          arrivalTime={props.arrivalTime}
          stops={props.stops}
          operator={props.operator}
          underway={dynState.underway}
          soonDeparturePier={!isOtherDayPreview && dynState.countdown && !dynState.isDeparted ? dynState.currentOrigin : null}
        />
      )}
    </div>
  );
}
