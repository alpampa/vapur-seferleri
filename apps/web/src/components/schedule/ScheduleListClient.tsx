"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const InteractiveMarineMap = dynamic(
  () => import("@/components/map/InteractiveMarineMap").then((m) => m.InteractiveMarineMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[210px] bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-bold">
        Harita Yükleniyor...
      </div>
    ),
  }
);
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import {
  Search,
  Navigation,
  ArrowLeftRight,
  RotateCcw,
  ChevronDown,
  Sparkles,
  Wind,
  X,
  AlertOctagon,
  SlidersHorizontal,
  Calendar,
  Clock,
  Share2,
  Compass,
  ArrowRight,
} from "lucide-react";
import { matchesTurkishSearch } from "@/lib/utils/search-normalizer";
import { LateNightTransitModal } from "@/components/night/LateNightTransitModal";
import { MissedFerryAssistantModal } from "@/components/planner/MissedFerryAssistantModal";
import { resolveDynamicTrip, isTripCancelled, type DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { AlarmManager } from "@/components/schedule/AlarmManager";
import { TripPlannerWithMap } from "@/components/planner/TripPlannerWithMap";
import { useLanguageStore } from "@/store/useLanguageStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { TouristTripList } from "@/components/schedule/TouristTripList";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTransitClock } from "@/hooks/useTransitClock";
import { LiveTripTrackerBar } from "@/components/schedule/LiveTripTrackerBar";
import { IslandHopPickerModal } from "@/components/schedule/IslandHopPickerModal";
import { PIER_GEO_COORDINATES, calculateDistanceKm, isIslandRoute } from "@/lib/data/piers";
import { IMMINENT_DEPARTURE_MS, FAST_TICK_THRESHOLD_MIN, SLOW_TICK_INTERVAL_MS } from "@/lib/constants";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { CancellationBoard } from "@/components/announcements/CancellationBoard";
import { ScheduleToolsSheet } from "@/components/schedule/ScheduleToolsSheet";
import { MarqueeTicker } from "@/components/ui/MarqueeTicker";
import { LastFerrySafeguardBanner } from "@/components/schedule/LastFerrySafeguardBanner";
import { ServiceDataTrustBar, type SourceFreshnessMeta, type SelectedDayFilter } from "@/components/trust/ServiceDataTrustBar";
import { getOperatorRecord, OPERATOR_REGISTRY } from "@/lib/data/operator-registry";
import { triggerHaptic } from "@/lib/utils/haptics";
import { chipBase, chipOff, chipOn, chipSuccess } from "@/lib/ui/button-styles";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";
import { parseNaturalTransitQuery } from "@/lib/services/ai-transit-assistant";
import { predictFerryDisruption } from "@/lib/services/predictive-disruption-model";
import { saveSchedulesOffline, loadSchedulesOffline } from "@/lib/services/offline-db";
import { trackAppOpenOnce } from "@/lib/utils/analytics-tracker";
import { SponsoredTripRow } from "@/components/schedule/SponsoredTripRow";
import { AdSlot } from "@/components/commercial/AdSlot";
import {
  getSponsoredAdsStore,
  selectContextualSponsoredAd,
  type SponsoredAdOffer,
} from "@/lib/data/sponsored-ads";
import { planJourney, type RouteOption } from "@/lib/services/route-planner";

interface ScheduleListClientProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  initialOrigin?: string;
  marineWeather?: MarineWeatherStatus | null;
  /** GÜVEN KATMANI: resmî kaynakların son doğrulanma üst verisi (sunucudan gelir). */
  sourceFreshness: SourceFreshnessMeta;
}

const DAY_PREVIEW_LABELS: Record<SelectedDayFilter, string | undefined> = {
  TODAY: undefined,
  WEEKDAY: "Hafta İçi",
  SATURDAY: "Cumartesi",
  SUNDAY: "Pazar / Tatil",
};

export function ScheduleListClient({
  schedules,
  serverTimeIso,
  initialOrigin,
  marineWeather,
  sourceFreshness,
}: ScheduleListClientProps) {
  const { t, language } = useLanguageStore();
  const { touristMode, setTouristMode, proUnlocked, scheduleCategory, setScheduleCategory } = usePreferencesStore();
  const [tickMs, setTickMs] = useState(1000);
  const { nowMs } = useTransitClock(tickMs, { serverTimeIso });
  const now = nowMs;

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ADALAR" | "BOGAZ" | "ALL">(scheduleCategory);
  const [selectedOrigin, setSelectedOrigin] = useState<string>(initialOrigin || "ALL");
  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [selectedOperator, setSelectedOperator] = useState<string>("ALL");
  const [selectedDayType, setSelectedDayType] = useState<SelectedDayFilter>("TODAY");
  const [showAllDay, setShowAllDay] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPlanner, setShowPlanner] = useState<boolean>(false);
  const [onlyImminent, setOnlyImminent] = useState<boolean>(false);
  const [isCompactDensity, setIsCompactDensity] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [copiedRouteLink, setCopiedRouteLink] = useState<boolean>(false);

  const toolFilterCount =
    (selectedOperator !== "ALL" ? 1 : 0) +
    (showPlanner ? 1 : 0) +
    (isCompactDensity ? 1 : 0);

  const updateCategory = (category: "ADALAR" | "BOGAZ" | "ALL") => {
    setSelectedCategory(category);
    setScheduleCategory(category);
  };

  // URL Deep-Linking: Sayfa açılışında ?from=, ?to=, ?day=, ?cat=, ?allDay= parametrelerini oku
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vapur_compact_view");
      if (saved !== null) {
        setIsCompactDensity(saved === "true");
      }
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const fromParam = params.get("from");
        const toParam = params.get("to");
        const dayParam = params.get("day");
        const catParam = params.get("cat");
        const allDayParam = params.get("allDay");

        if (fromParam) setSelectedOrigin(fromParam);
        if (toParam) setSelectedDestination(toParam);
        if (fromParam || toParam) {
          // Paylaşılan bir rota bağlantısıyla gelindiğinde kategori kilidini aç
          if (!catParam) setSelectedCategory("ALL");
        }
        if (catParam === "ADALAR" || catParam === "BOGAZ" || catParam === "ALL") {
          setSelectedCategory(catParam);
        }
        if (dayParam === "TODAY" || dayParam === "WEEKDAY" || dayParam === "SATURDAY" || dayParam === "SUNDAY") {
          setSelectedDayType(dayParam);
        }
        if (allDayParam === "1" || allDayParam === "true") {
          setShowAllDay(true);
        }
      }
    } catch {}
  }, []);

  // URL Deep-Linking Senkronizasyonu: Seçilen rota ve gün tipini URL'ye yansıt (Paylaşılabilir URL)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (selectedOrigin !== "ALL") params.set("from", selectedOrigin);
      else params.delete("from");

      if (selectedDestination !== "ALL") params.set("to", selectedDestination);
      else params.delete("to");

      if (selectedDayType !== "TODAY") params.set("day", selectedDayType);
      else params.delete("day");

      if (showAllDay) params.set("allDay", "1");
      else params.delete("allDay");

      const qs = params.toString();
      const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      if (nextUrl !== `${window.location.pathname}${window.location.search}`) {
        window.history.replaceState(null, "", nextUrl);
      }
    } catch {}
  }, [selectedOrigin, selectedDestination, selectedDayType, showAllDay]);

  const handleToggleDensity = () => {
    setIsCompactDensity((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vapur_compact_view", String(next));
      } catch {}
      return next;
    });
  };

  const handleShareCurrentRoute = () => {
    triggerHaptic("light");
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    const routeLabel =
      selectedOrigin !== "ALL" && selectedDestination !== "ALL"
        ? `${selectedOrigin} ➔ ${selectedDestination}`
        : selectedOrigin !== "ALL"
        ? `${selectedOrigin} Kalkışlı Seferler`
        : selectedDestination !== "ALL"
        ? `${selectedDestination} Varışlı Seferler`
        : "İstanbul Vapur & Deniz Motoru Seferleri";
    const shareText = `⛴️ ${routeLabel} güncel vapur ve motor tarifesi: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: routeLabel,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedRouteLink(true);
        setTimeout(() => setCopiedRouteLink(false), 2500);
      }).catch(() => {});
    }
  };

  const { isOnline } = useOfflineSync();
  const [isNightTransitOpen, setIsNightTransitOpen] = useState<boolean>(false);
  const [isMissedFerryOpen, setIsMissedFerryOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [selectedHopSchedule, setSelectedHopSchedule] = useState<ScheduleCardDto | null>(null);

  // CANLI FIRMA DUYURULARI (iptal / düzenleme / ek sefer)
  useAnnouncements();
  const announcements = useAnnouncementStore((s) => s.announcements);
  const disruptions = useAnnouncementStore((s) => s.disruptions);

  // AI 1: DOĞAL DİL ARAMA & AKILLI ASİSTAN
  const aiAnalysis = useMemo(() => {
    return parseNaturalTransitQuery(searchQuery);
  }, [searchQuery]);

  // AI 2: LODOS & HAVA TAHMİNLİ İPTAL RİSK MODELİ
  const disruptionForecast = useMemo(() => {
    return predictFerryDisruption(marineWeather);
  }, [marineWeather]);

  // Duyuru → sefer eşleşmesi: iptal duyurusu ilgili kartı CANCELLED yapar.
  const disruptionByTrip = useMemo(() => {
    const map = new Map<string, "CANCELLED" | "SCHEDULE_CHANGE" | "EXTRA">();
    for (const d of disruptions) {
      const confirmed = (d.confidence ?? "CONFIRMED") === "CONFIRMED";
      if (d.kind === "CANCELLED" && confirmed) map.set(d.tripId, "CANCELLED");
      else if (d.kind === "SCHEDULE_CHANGE" && confirmed && !map.has(d.tripId))
        map.set(d.tripId, "SCHEDULE_CHANGE");
    }
    return map;
  }, [disruptions]);

  // Native IndexedDB Non-blocking Caching
  const [effectiveSchedules, setEffectiveSchedules] = useState<ScheduleCardDto[]>(schedules);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAdOffer[]>(() => getSponsoredAdsStore());

  useEffect(() => {
    trackAppOpenOnce();
    fetch("/api/ads")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.ads)) {
          setSponsoredAds(json.ads);
        }
      })
      .catch(() => {});
  }, []);

  const activeSponsoredAd = useMemo(() => {
    if (proUnlocked) return null;
    return selectContextualSponsoredAd(sponsoredAds, {
      selectedCategory,
      selectedOrigin,
      selectedDestination,
      searchQuery,
    });
  }, [sponsoredAds, selectedCategory, selectedOrigin, selectedDestination, searchQuery, proUnlocked]);

  useEffect(() => {
    let isCancelled = false;

    if (schedules && schedules.length > 0) {
      setEffectiveSchedules(schedules);
      saveSchedulesOffline(schedules).catch(() => {});
    } else {
      loadSchedulesOffline().then((cached) => {
        if (!isCancelled && cached && cached.length > 0) {
          setEffectiveSchedules(cached);
        }
      }).catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, [schedules]);

  // Geolocation states
  const [nearestPier, setNearestPier] = useState<{ name: string; distanceKm: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"IDLE" | "LOCATING" | "ACTIVE" | "DENIED">("IDLE");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("DENIED");
      return;
    }

    setGeoStatus("LOCATING");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        let closest: { name: string; distanceKm: number } | null = null;
        let minDistance = Infinity;

        for (const [pierName, coords] of Object.entries(PIER_GEO_COORDINATES)) {
          const dist = calculateDistanceKm(uLat, uLng, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = { name: pierName, distanceKm: dist };
          }
        }

        if (closest) {
          setNearestPier(closest);
          setSelectedOrigin(closest.name);
          setGeoStatus("ACTIVE");
          const categoryHasPier =
            selectedCategory === "ALL" ||
            effectiveSchedules.some((s) => {
              if (s.origin !== closest.name) return false;
              const island = isIslandRoute(s.origin, s.destination);
              return selectedCategory === "ADALAR" ? island : !island;
            });
          if (!categoryHasPier) {
            updateCategory("ALL");
          }
        }
      },
      (error) => {
        console.warn("Geolocation denied or error:", error.message);
        setGeoStatus("DENIED");
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Seçilen gün tipine (Bugün / Hafta İçi / Cumartesi / Pazar-Tatil) göre uygun sefer kümesi
  const dayFilteredSchedules = useMemo(() => {
    return effectiveSchedules.filter((s) => {
      if (selectedDayType === "WEEKDAY") return s.runsWeekday !== false;
      if (selectedDayType === "SATURDAY") return s.runsSaturday !== false;
      if (selectedDayType === "SUNDAY") return s.runsSunday !== false;
      return s.runsToday !== false;
    });
  }, [effectiveSchedules, selectedDayType]);

  const isTimetablePreviewMode = showAllDay || selectedDayType !== "TODAY";
  const dayPreviewLabel = DAY_PREVIEW_LABELS[selectedDayType];

  // 1. Filter and resolve dynamic state for active trips
  const activeSchedulesWithDyn = useMemo(() => {
    const rawList = dayFilteredSchedules
      .map((s) => {
        const disruption = selectedDayType === "TODAY" ? disruptionByTrip.get(s.id) : undefined;
        const overlaySchedule =
          disruption === "CANCELLED"
            ? { ...s, status: "CANCELLED" as const, delayText: s.delayText || "İptal" }
            : s;
        const dyn = resolveDynamicTrip(
          overlaySchedule.origin,
          overlaySchedule.destination,
          overlaySchedule.departureTime,
          overlaySchedule.targetTimeIso || new Date().toISOString(),
          overlaySchedule.stops,
          undefined,
          now,
          serverTimeIso
        );
        return {
          schedule: overlaySchedule,
          dyn: selectedDayType !== "TODAY"
            ? {
                ...dyn,
                currentOrigin: overlaySchedule.origin,
                destination: overlaySchedule.destination,
                currentDepartureTime: overlaySchedule.departureTime,
                isExpired: false,
                isDeparted: false,
                countdown: null,
                minutesUntilDeparture: null,
              }
            : dyn,
        };
      })
      .filter(({ dyn, schedule }) => {
        if (!isTimetablePreviewMode && dyn.isExpired) return false;
        if (dyn.currentOrigin.trim() === dyn.destination.trim()) return false;
        if (schedule.origin.trim() === schedule.destination.trim()) return false;

        // Kullanıcı belirli bir kalkış ve varış iskelesi seçtiyse veya arama yapıyorsa kategori kilidi kalkar
        if (searchQuery.trim().length > 0) return true;
        if (selectedOrigin !== "ALL" && selectedDestination !== "ALL") return true;
        if (selectedCategory === "ALL") return true;

        const isCurrentLegIsland = isIslandRoute(dyn.currentOrigin, dyn.destination);

        if (selectedCategory === "ADALAR") {
          return isCurrentLegIsland;
        }

        if (selectedCategory === "BOGAZ") {
          return !isCurrentLegIsland;
        }

        return true;
      });

    const masterList = selectedOrigin === "ALL" ? rawList.filter((item, idx) => {
      return !rawList.some((other, oIdx) => {
        if (idx === oIdx) return false;
        if (other.schedule.operator !== item.schedule.operator) return false;
        return (other.schedule.stops || []).some(
          (st) => st.name === item.schedule.origin && st.time === item.schedule.departureTime
        );
      });
    }) : rawList;

    const dedupMap = new Map<string, { schedule: ScheduleCardDto; dyn: DynamicTripResolution }>();
    for (const item of masterList) {
      const key = `${item.schedule.operator}:${item.dyn.currentOrigin}➔${item.dyn.destination}@${item.dyn.currentDepartureTime}`;
      if (!dedupMap.has(key)) {
        dedupMap.set(key, item);
      } else {
        const existing = dedupMap.get(key)!;
        const itemIsDirect = item.schedule.origin === item.dyn.currentOrigin;
        const existingIsDirect = existing.schedule.origin === existing.dyn.currentOrigin;
        if (itemIsDirect && !existingIsDirect) {
          dedupMap.set(key, item);
        }
      }
    }

    return Array.from(dedupMap.values());
  }, [
    dayFilteredSchedules,
    selectedCategory,
    selectedOrigin,
    selectedDestination,
    selectedDayType,
    isTimetablePreviewMode,
    searchQuery,
    now,
    serverTimeIso,
    disruptionByTrip,
  ]);

  const uniqueOperators = useMemo(() => {
    return OPERATOR_REGISTRY
      .filter((op) => {
        if (selectedCategory === "ALL") return true;
        return op.category === "HEPSI" || op.category === selectedCategory;
      })
      .map((op) => op.name);
  }, [selectedCategory]);

  // Tüm İstanbul iskeleleri (Kategori kilidine takılmadan aktarmalı seçim yapılabilmesi için tüm gün kümesinden üretilir)
  const allPiersInSystem = useMemo(() => {
    const set = new Set<string>();
    dayFilteredSchedules.forEach((s) => {
      set.add(s.origin);
      set.add(s.destination);
      if (s.stops) {
        s.stops.forEach((st) => set.add(st.name));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [dayFilteredSchedules]);

  // Doğrudan seferi olan varış iskeleleri vs. Aktarmalı varış iskeleleri
  const { directDestinations, transferDestinations } = useMemo(() => {
    if (selectedOrigin === "ALL") {
      return {
        directDestinations: allPiersInSystem,
        transferDestinations: [] as string[],
      };
    }
    const directSet = new Set<string>();
    dayFilteredSchedules.forEach((schedule) => {
      const isDirectOrigin = schedule.origin === selectedOrigin;
      const stopIndex = schedule.stops ? schedule.stops.findIndex((st) => st.name === selectedOrigin) : -1;

      if (isDirectOrigin) {
        directSet.add(schedule.destination);
        if (schedule.stops) {
          schedule.stops.forEach((st) => directSet.add(st.name));
        }
      } else if (stopIndex >= 0 && schedule.stops) {
        directSet.add(schedule.destination);
        for (let i = stopIndex + 1; i < schedule.stops.length; i++) {
          directSet.add(schedule.stops[i].name);
        }
      }
    });
    directSet.delete(selectedOrigin);
    const directList = Array.from(directSet).sort((a, b) => a.localeCompare(b, "tr"));
    const transferList = allPiersInSystem.filter(
      (p) => p !== selectedOrigin && !directSet.has(p)
    );
    return {
      directDestinations: directList,
      transferDestinations: transferList,
    };
  }, [dayFilteredSchedules, selectedOrigin, allPiersInSystem]);

  const handleSelectOrigin = (newOrigin: string) => {
    setSelectedOrigin(newOrigin);
    if (newOrigin !== "ALL" && newOrigin === selectedDestination) {
      setSelectedDestination("ALL");
    }
    // Seçilen iskele mevcut kategoride yoksa kategoriyi otomatik "ALL" yap
    if (newOrigin !== "ALL" && selectedCategory !== "ALL") {
      const hasInCat = dayFilteredSchedules.some((s) => {
        const match = s.origin === newOrigin || s.stops?.some((st) => st.name === newOrigin);
        if (!match) return false;
        const island = isIslandRoute(s.origin, s.destination);
        return selectedCategory === "ADALAR" ? island : !island;
      });
      if (!hasInCat) updateCategory("ALL");
    }
  };

  const handleSelectDestination = (newDest: string) => {
    setSelectedDestination(newDest);
    if (newDest !== "ALL" && newDest === selectedOrigin) {
      setSelectedOrigin("ALL");
    }
    if (newDest !== "ALL" && selectedCategory !== "ALL") {
      const hasInCat = dayFilteredSchedules.some((s) => {
        const match = s.destination === newDest || s.stops?.some((st) => st.name === newDest);
        if (!match) return false;
        const island = isIslandRoute(s.origin, s.destination);
        return selectedCategory === "ADALAR" ? island : !island;
      });
      if (!hasInCat) updateCategory("ALL");
    }
  };

  const swapOriginDestination = () => {
    const prevO = selectedOrigin;
    const prevD = selectedDestination;
    setSelectedOrigin(prevD);
    setSelectedDestination(prevO);
  };

  // Final filtered list
  const filteredList = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const q = searchQuery.toLowerCase().trim();

    return activeSchedulesWithDyn.filter(({ schedule, dyn }) => {
      if (hasSearch) {
        if (aiAnalysis.isAiUnderstood) {
          if (aiAnalysis.origin && !matchesTurkishSearch(schedule.origin, aiAnalysis.origin) && !matchesTurkishSearch(dyn.currentOrigin, aiAnalysis.origin)) {
            return false;
          }
          if (aiAnalysis.destination && !matchesTurkishSearch(schedule.destination, aiAnalysis.destination) && !matchesTurkishSearch(dyn.destination, aiAnalysis.destination)) {
            return false;
          }
          if (aiAnalysis.operator && schedule.operator !== aiAnalysis.operator) {
            return false;
          }
          if (aiAnalysis.afterTime) {
            if (dyn.currentDepartureTime < aiAnalysis.afterTime) return false;
          }
          if (aiAnalysis.onlyImminent && !isTimetablePreviewMode) {
            if (dyn.isDeparted) return false;
            const remainingMs = new Date(dyn.currentTargetIso).getTime() - now;
            if (remainingMs > IMMINENT_DEPARTURE_MS) return false;
          }
        } else {
          const inOrigin = matchesTurkishSearch(schedule.origin, q) || matchesTurkishSearch(dyn.currentOrigin, q);
          const inDest = matchesTurkishSearch(schedule.destination, q) || matchesTurkishSearch(dyn.destination, q);
          const inOperator = matchesTurkishSearch(schedule.operator, q);
          const inRoute = matchesTurkishSearch(schedule.routeTitle, q);
          const inStops = schedule.stops?.some((st) => matchesTurkishSearch(st.name, q));
          if (!inOrigin && !inDest && !inOperator && !inRoute && !inStops) return false;
        }
      } else {
        if (selectedOrigin !== "ALL") {
          const isDirectOrigin = schedule.origin === selectedOrigin || dyn.currentOrigin === selectedOrigin;
          const isStopOrigin = schedule.stops?.some((st) => st.name === selectedOrigin);
          if (!isDirectOrigin && !isStopOrigin) return false;
        }

        if (selectedDestination !== "ALL") {
          const isDirectDest = schedule.destination === selectedDestination || dyn.destination === selectedDestination;
          const isStopDest = schedule.stops?.some((st) => st.name === selectedDestination);
          if (!isDirectDest && !isStopDest) return false;

          // Yön doğrulaması: Kalkış durağı varış durağından önce gelmeli
          if (selectedOrigin !== "ALL") {
            const allStops = [schedule.origin, ...(schedule.stops?.map((x) => x.name) || []), schedule.destination];
            const origIdx = allStops.indexOf(selectedOrigin);
            const destIdx = allStops.indexOf(selectedDestination);
            if (origIdx !== -1 && destIdx !== -1 && origIdx >= destIdx) return false;
          }
        }

        if (selectedOperator !== "ALL") {
          if (schedule.operator !== selectedOperator) return false;
        }
      }

      if (onlyImminent && !isTimetablePreviewMode) {
        if (dyn.isDeparted) return false;
        const remainingMs = new Date(dyn.currentTargetIso).getTime() - now;
        if (remainingMs > IMMINENT_DEPARTURE_MS) return false;
      }

      return true;
    }).sort((a, b) => {
      if (isTimetablePreviewMode) {
        return a.dyn.currentDepartureTime.localeCompare(b.dyn.currentDepartureTime);
      }
      return a.dyn.currentTargetIso.localeCompare(b.dyn.currentTargetIso);
    });
  }, [
    activeSchedulesWithDyn,
    selectedOrigin,
    selectedDestination,
    selectedOperator,
    searchQuery,
    onlyImminent,
    isTimetablePreviewMode,
    aiAnalysis,
    now,
  ]);

  const upcomingTrips = filteredList;

  // P1-2: Doğrudan sefer bulunmayan iki iskele seçildiğinde (ör. Sarıyer ➔ Büyükada veya Beykoz ➔ Kartal)
  // otomatik olarak 1-Aktarmalı Deniz Rotalarını hesapla!
  const transferSuggestions = useMemo<RouteOption[]>(() => {
    if (selectedOrigin === "ALL" || selectedDestination === "ALL" || selectedOrigin === selectedDestination) {
      return [];
    }
    if (upcomingTrips.length > 0) return [];

    let currMinutes = 0;
    if (!isTimetablePreviewMode) {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.format(new Date(now)).split(":");
      currMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    const routes = planJourney(dayFilteredSchedules, selectedOrigin, selectedDestination, currMinutes);
    if (routes.length > 0) return routes;
    // Eğer günün kalan saatlerinde aktarma kalmadıysa tüm günün aktarmalı seçeneklerini göster
    return planJourney(dayFilteredSchedules, selectedOrigin, selectedDestination, 0);
  }, [selectedOrigin, selectedDestination, upcomingTrips.length, dayFilteredSchedules, isTimetablePreviewMode, now]);

  const safeguardSchedules = useMemo(() => {
    if (selectedCategory === "ALL") return dayFilteredSchedules;
    return dayFilteredSchedules.filter((s) => {
      const island = isIslandRoute(s.origin, s.destination);
      return selectedCategory === "ADALAR" ? island : !island;
    });
  }, [dayFilteredSchedules, selectedCategory]);

  useEffect(() => {
    const urgent = upcomingTrips.some(
      ({ dyn }) =>
        dyn.countdown != null ||
        (dyn.minutesUntilDeparture != null && dyn.minutesUntilDeparture <= FAST_TICK_THRESHOLD_MIN)
    );
    setTickMs(urgent ? 1000 : SLOW_TICK_INTERVAL_MS);
  }, [upcomingTrips]);

  const cancelledTrips = useMemo(() => {
    return activeSchedulesWithDyn.filter(
      ({ schedule, dyn }) => isTripCancelled(schedule, dyn) && !dyn.isDeparted && !dyn.isExpired
    );
  }, [activeSchedulesWithDyn]);

  return (
    <>
      <AlarmManager schedules={dayFilteredSchedules} />

      {/* CANLI FIRMA DUYURU BANDI (iptal / tarife / ek sefer) */}
      <AnnouncementBanner announcements={announcements} />

      {/* ÇEVRİMDIŞI PWA GÖSTERGESİ — Yalnızca gerçek çevrimdışı durumda tek satır olarak görünür */}
      {!isOnline && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 text-[11px] font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>Çevrimdışı Mod — Kayıtlı Resmi Tarife Gösteriliyor</span>
            </div>
            <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold shrink-0">
              PWA Çevrimdışı
            </span>
          </div>
        </div>
      )}

      {/* 0. GECE GÜVENCESİ: SON VAPURU KAÇIRMA ASİSTANI */}
      <LastFerrySafeguardBanner
        schedules={safeguardSchedules}
        visibleSchedules={upcomingTrips.map((t) => t.schedule)}
        serverTimeIso={serverTimeIso}
        onOpenNightTransit={() => setIsNightTransitOpen(true)}
        selectedOrigin={selectedOrigin}
        selectedDestination={selectedDestination}
      />

      {/* 1. KOMPAKT ÜST ARAMA & GÜN TİPİ / KATEGORİ ÇUBUĞU (Sticky) */}
      <div className="px-3 pt-1.5 sticky top-[52px] z-30 bg-[var(--app-bg,#070e1e)]/95 backdrop-blur-md pb-1">
        <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="w-full flex items-center gap-1 p-1">
            {/* Kalkış İskelesi */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedOrigin}
                onChange={(e) => handleSelectOrigin(e.target.value)}
                aria-label="Kalkış iskelesi seçin"
                className="w-full min-h-10 pl-3 pr-5 py-1.5 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 appearance-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer truncate"
              >
                <option value="ALL">🟢 Nereden (Tümü)</option>
                {allPiersInSystem.map((pier) => (
                  <option key={pier} value={pier}>{pier}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Yön Değiştir Butonu */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                swapOriginDestination();
              }}
              title="Kalkış ve Varış İskelesini Değiştir"
              aria-label="Kalkış ve varış iskelesini değiştir"
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer active:scale-95 shrink-0 flex items-center justify-center touch-manipulation"
            >
              <ArrowLeftRight size={14} />
            </button>

            {/* Varış İskelesi (Doğrudan + Aktarmalı Gruplu) */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedDestination}
                onChange={(e) => handleSelectDestination(e.target.value)}
                aria-label="Varış iskelesi seçin"
                className="w-full min-h-10 pl-3 pr-5 py-1.5 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 appearance-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer truncate"
              >
                <option value="ALL">🔴 Nereye (Tümü)</option>
                {selectedOrigin === "ALL" ? (
                  allPiersInSystem.map((pier) => (
                    <option key={pier} value={pier}>{pier}</option>
                  ))
                ) : (
                  <>
                    {directDestinations.length > 0 && (
                      <optgroup label="Doğrudan Sefer Olan İskeleler">
                        {directDestinations.map((pier) => (
                          <option key={pier} value={pier}>{pier}</option>
                        ))}
                      </optgroup>
                    )}
                    {transferDestinations.length > 0 && (
                      <optgroup label="Aktarmalı Deniz Ulaşımı (1 Aktarma)">
                        {transferDestinations.map((pier) => (
                          <option key={pier} value={pier}>{pier} (Aktarmalı)</option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Rotayı Paylaş & Filtre Temizle */}
            {(selectedOrigin !== "ALL" || selectedDestination !== "ALL") && (
              <>
                <button
                  type="button"
                  onClick={handleShareCurrentRoute}
                  title="Seçili rotanın bağlantısını paylaş veya kopyala"
                  aria-label="Rotayı paylaş"
                  className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  <Share2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedOrigin("ALL");
                    setSelectedDestination("ALL");
                  }}
                  title="İskele seçimini temizle"
                  aria-label="İskele seçimini temizle"
                  className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>

          {/* KATEGORİ + GÜN TİPİ (Hafta İçi / Cumartesi / Pazar) + TÜM GÜN KAPSÜL SATIRI */}
          <div className="border-t border-slate-200/70 dark:border-slate-800/70 px-1.5 py-0.5">
            <div className="w-full overflow-x-auto hide-scrollbar flex items-center gap-1.5 py-0.5">
              {/* Adalar */}
              <button
                type="button"
                onClick={() => {
                  updateCategory(selectedCategory === "ADALAR" ? "ALL" : "ADALAR");
                  setSelectedOrigin("ALL");
                  setSelectedDestination("ALL");
                }}
                aria-pressed={selectedCategory === "ADALAR"}
                className={`${chipBase} gap-1 ${
                  selectedCategory === "ADALAR" ? chipOn : chipOff
                }`}
              >
                <span>🏝️</span>
                <span>Adalar</span>
              </button>

              {/* Boğaz */}
              <button
                type="button"
                onClick={() => {
                  updateCategory(selectedCategory === "BOGAZ" ? "ALL" : "BOGAZ");
                  setSelectedOrigin("ALL");
                  setSelectedDestination("ALL");
                }}
                aria-pressed={selectedCategory === "BOGAZ"}
                className={`${chipBase} gap-1 ${
                  selectedCategory === "BOGAZ" ? chipOn : chipOff
                }`}
              >
                <span>🌊</span>
                <span>Boğaz</span>
              </button>

              {/* Gün Tipi Seçici (Bugün / Hafta İçi / Cumartesi / Pazar-Tatil) */}
              <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/90 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
                {(
                  [
                    { id: "TODAY", label: "Bugün" },
                    { id: "WEEKDAY", label: "Hafta İçi" },
                    { id: "SATURDAY", label: "Cumartesi" },
                    { id: "SUNDAY", label: "Pazar/Tatil" },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedDayType(d.id);
                    }}
                    aria-pressed={selectedDayType === d.id}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer whitespace-nowrap ${
                      selectedDayType === d.id
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Tüm Gün (06:00–00:30) Anahtarı */}
              <button
                type="button"
                onClick={() => setShowAllDay(!showAllDay)}
                aria-pressed={showAllDay}
                title="Sabah ilk vapurdan gece son sefere kadar tüm gün saatlerini göster"
                className={`${chipBase} gap-1 ${showAllDay ? chipOn : chipOff}`}
              >
                <Clock size={11} />
                <span>Tüm Gün</span>
              </button>

              {/* Acil ≤15 dk */}
              <button
                type="button"
                onClick={() => setOnlyImminent(!onlyImminent)}
                aria-pressed={onlyImminent}
                className={`${chipBase} gap-1 ${
                  onlyImminent ? chipOn : chipOff
                }`}
              >
                <span>⚡</span>
                <span>≤15 dk</span>
              </button>

              {/* GPS En Yakın İskele */}
              <button
                type="button"
                onClick={requestLocation}
                disabled={geoStatus === "LOCATING"}
                className={`${chipBase} gap-1 ${
                  geoStatus === "ACTIVE" ? chipSuccess : chipOff
                }`}
                title="Konumuma en yakın iskeleyi bul"
              >
                <Navigation size={11} className={geoStatus === "LOCATING" ? "animate-spin" : geoStatus === "ACTIVE" ? "fill-white" : ""} />
                <span>{t("nearestShort")}</span>
              </button>

              {/* Arama Aç/Kapa */}
              <button
                type="button"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                aria-pressed={isSearchVisible || searchQuery.trim().length > 0}
                className={`${chipBase} gap-1 ${
                  isSearchVisible || searchQuery.trim().length > 0 ? chipOn : chipOff
                }`}
              >
                <Search size={11} />
                <span>{t("search")}</span>
              </button>

              {/* Harita & Rota Planlayıcı Hızlı Anahtarı */}
              <button
                type="button"
                onClick={() => setShowPlanner(!showPlanner)}
                aria-pressed={showPlanner}
                className={`${chipBase} gap-1 ${showPlanner ? chipOn : chipOff}`}
              >
                <Compass size={11} />
                <span>Harita</span>
              </button>

              {/* Filtreler & Araçlar */}
              <button
                type="button"
                onClick={() => setIsToolsOpen(true)}
                aria-pressed={toolFilterCount > 0}
                className={`${chipBase} gap-1 ${toolFilterCount > 0 ? chipOn : chipOff}`}
              >
                <SlidersHorizontal size={11} />
                <span>{t("filtersTools")}{toolFilterCount > 0 ? ` · ${toolFilterCount}` : ""}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {copiedRouteLink && (
        <div className="px-3 pt-1 animate-fadeIn">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-sm">
            <span>✓ Rota bağlantısı panoya kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.</span>
          </div>
        </div>
      )}

      {/* Farklı Gün Tipi veya Tüm Gün İnceleme Bilgilendirme Şeridi */}
      {isTimetablePreviewMode && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 text-blue-800 dark:text-blue-200 text-[11px] font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                {selectedDayType !== "TODAY"
                  ? `${dayPreviewLabel} Resmi Tarifesi (Tüm Gün 06:00–00:30) inceleniyor`
                  : "Bugünün 24 Saatlik Tüm Sefer Tarifesi (06:00–00:30) gösteriliyor"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedDayType("TODAY");
                setShowAllDay(false);
              }}
              className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black cursor-pointer shrink-0 hover:bg-blue-500"
            >
              Canlı Saate Dön
            </button>
          </div>
        </div>
      )}

      {/* GPS Konumu Bildirim Rozeti */}
      {nearestPier && geoStatus === "ACTIVE" && selectedOrigin === nearestPier.name && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] animate-fadeIn">
            <span className="flex items-center gap-1.5 font-bold">
              <Navigation size={11} className="fill-emerald-600 text-emerald-600 shrink-0" />
              <span>Konumunuza en yakın iskele: <strong>{nearestPier.name}</strong> (~{nearestPier.distanceKm.toFixed(1)} km)</span>
            </span>
            <button
              onClick={() => {
                setSelectedOrigin("ALL");
                setGeoStatus("IDLE");
              }}
              className="min-h-10 px-2 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shrink-0 ml-1 cursor-pointer flex items-center"
            >
              Tümünü Göster
            </button>
          </div>
        </div>
      )}

      {/* 4. İSTEĞE BAĞLI SATIR: ARAMA ÇUBUĞU */}
      {isSearchVisible && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-rose-500 p-1"
                title={t("clear")}
              >
                ✕
              </button>
            )}
          </div>

          {searchQuery.trim().length > 0 && (
            <div className="mt-1 flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <span className="flex items-center gap-1 font-medium truncate">
                <Sparkles size={11} className="text-amber-500 shrink-0" />
                <span>{aiAnalysis.interpretationMessage}</span>
              </span>
              {aiAnalysis.isAiUnderstood && (
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold opacity-75 shrink-0 ml-2">
                  Akıllı Eşleşme
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. KAYAN İPTAL SEFERLER DUYURU BANDI */}
      {cancelledTrips.length > 0 && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="py-1.5 px-3 rounded-xl bg-linear-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-sm flex items-center gap-2 overflow-hidden border border-rose-500">
            <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-0.5 rounded-lg font-black text-[10px] tracking-wider uppercase border border-rose-400/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>İPTAL SEFERLER</span>
            </div>

            <MarqueeTicker
              speedPxPerSec={60}
              ariaLabel="İptal edilen seferler"
              className="text-xs font-bold text-white"
            >
              {cancelledTrips.map(({ schedule, dyn }, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md">
                  <span className="bg-white/15 px-1.5 py-px rounded text-[9.5px] font-black tracking-wide uppercase">
                    {schedule.operator}
                  </span>
                  <span>🔴 {schedule.origin} ➔ {schedule.destination}</span>
                  <span className="font-mono">{dyn.currentDepartureTime}</span>
                  <span className="text-amber-200">İPTAL</span>
                </span>
              ))}
            </MarqueeTicker>
          </div>
        </div>
      )}

      {/* OKUNUR İPTAL LİSTESİ */}
      <CancellationBoard
        announcements={announcements}
        disruptions={disruptions}
        schedules={dayFilteredSchedules}
      />

      {/* AI 2: LODOS & METEOROLOJİ ERKEN TAHMİN BİLDİRİMİ */}
      {disruptionForecast.isPredictiveAlertActive && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 shadow-xs">
            <Wind size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold tracking-tight">Meteorolojik Seyir Riski: {disruptionForecast.headline}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                  Risk: %{disruptionForecast.cancellationRiskPercent}
                </span>
              </div>
              <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                {disruptionForecast.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Genişletilmiş Harita & Rota Planlayıcı (Açıldığında Görünür) */}
      {showPlanner && (
        <div className="px-3 pt-2 animate-fadeIn">
          <TripPlannerWithMap
            schedules={dayFilteredSchedules}
            serverTimeIso={serverTimeIso}
            onClose={() => setShowPlanner(false)}
          />
        </div>
      )}

      {touristMode ? (
        <TouristTripList items={upcomingTrips} onExitTouristMode={() => setTouristMode(false)} />
      ) : (
        <>
          {/* SONUÇ & GÜVEN META SATIRI: sefer sayısı + tarife günü/kaynak tazeliği tek satır */}
          <div className="px-3 pt-1.5 pb-1 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="shrink-0">
              {t("activeTrips")}: <strong className="text-slate-900 dark:text-white text-xs">{upcomingTrips.length}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600 shrink-0">·</span>
            <ServiceDataTrustBar
              serverTimeIso={serverTimeIso}
              freshness={sourceFreshness}
              selectedDayType={selectedDayType}
            />
            {searchQuery.trim().length > 0 && (
              <span className="ml-auto shrink-0 text-blue-700 dark:text-blue-300 font-extrabold bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/30 px-2 py-0.5 rounded text-[11px]">
                🔍 {upcomingTrips.length}
              </span>
            )}
          </div>

          {/* Schedules List */}
          <div className={`px-3 flex flex-col ${isCompactDensity ? "gap-1.5" : "gap-2"} pb-36 sm:pb-28 mt-1`}>
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map(({ schedule, dyn }, idx) => {
                const shouldShowSponsoredRowHere =
                  activeSponsoredAd != null &&
                  ((upcomingTrips.length >= 2 && idx === 1) || (upcomingTrips.length === 1 && idx === 0));

                return (
                  <div key={`${schedule.id}-${dyn.currentOrigin}-${dyn.currentDepartureTime}`} className="contents">
                    <ScheduleCard
                      id={schedule.id}
                      origin={schedule.origin}
                      destination={schedule.destination}
                      operator={schedule.operator}
                      routeTitle={schedule.routeTitle}
                      departureTime={schedule.departureTime}
                      departureTime12={schedule.departureTime12}
                      status={schedule.status}
                      targetTimeIso={schedule.targetTimeIso}
                      serverTimeIso={serverTimeIso}
                      nowMs={nowMs}
                      delayText={schedule.delayText}
                      vessel={schedule.vessel}
                      platform={schedule.platform}
                      price={schedule.price}
                      progress={schedule.progress}
                      stops={schedule.stops}
                      arrivalTime={schedule.arrivalTime}
                      isContinuous={schedule.isContinuous}
                      continuousUntil={schedule.continuousUntil}
                      isCompact={isCompactDensity}
                      isFeaturedHero={idx === 0 && !isTimetablePreviewMode}
                      highlightStopName={searchQuery}
                      isTimetablePreview={isTimetablePreviewMode}
                      dayPreviewLabel={dayPreviewLabel}
                      onClick={() => setSelectedSchedule(schedule)}
                      onSelectHop={(s) => setSelectedHopSchedule(s)}
                    />
                    {idx === 0 && !isTimetablePreviewMode && !isCompactDensity && (
                      <div className="my-1.5 space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/90 shadow-lg bg-slate-950">
                          <InteractiveMarineMap
                            selectedOrigin={selectedOrigin !== "ALL" ? selectedOrigin : schedule.origin}
                            selectedDestination={selectedDestination !== "ALL" ? selectedDestination : schedule.destination}
                            schedules={upcomingTrips.slice(0, 8).map((u) => u.schedule)}
                            height="210px"
                          />
                        </div>
                        {upcomingTrips.length > 1 && (
                          <div className="pt-1 px-1 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                              Diğer Seferler ({upcomingTrips.length - 1} Alternatif)
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">
                              Şehir Hatları • İDO • Mavi Marmara • Turyol • Dentur
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {shouldShowSponsoredRowHere && (
                      <SponsoredTripRow ad={activeSponsoredAd} isCompact={isCompactDensity} />
                    )}
                    {idx === 7 && upcomingTrips.length > 10 && (
                      <AdSlot slotId="sefer-listesi" className="pt-1" />
                    )}
                  </div>
                );
              })
            ) : transferSuggestions.length > 0 ? (
              /* P1-2: Doğrudan Sefer Olmayan Hatlarda Otomatik 1-Aktarmalı Deniz Rota Önerileri */
              <div className="rounded-2xl border border-blue-300 dark:border-blue-800/80 bg-white dark:bg-slate-900/80 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      AKILLI DENİZ AKTARMA REHBERİ (1 AKTARMA)
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {selectedOrigin} ➔ {selectedDestination} Aktarmalı Deniz Rotaları
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Bu iki iskele arasında doğrudan (direkt) vapur seferi bulunmuyor; aşağıdaki ana aktarma iskeleleri üzerinden deniz yoluyla ulaşabilirsiniz:
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs">
                    {transferSuggestions.length} Alternatif
                  </span>
                </div>

                <div className="space-y-2.5">
                  {transferSuggestions.map((route, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
                          🔄 {route.transferPier} Aktarmalı
                        </span>
                        <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                          Toplam {route.durationMinutes} dk · Varış ~{route.arrivalTime}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400">{route.legs[0].departureTime}</span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">{route.legs[0].origin}</span>
                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{route.legs[0].destination}</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                            {route.legs[0].operator}
                          </span>
                        </div>

                        {route.legs[1] && (
                          <>
                            <div className="pl-3 py-0.5 border-l-2 border-dashed border-purple-400 dark:border-purple-500/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                              ⏳ {route.transferPier} İskelesinde {route.transferWaitMinutes} dk aktarma beklemesi
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono font-black text-amber-600 dark:text-amber-400">{route.legs[1].departureTime}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{route.legs[1].origin}</span>
                                <ArrowRight size={12} className="text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-900 dark:text-white truncate">{route.legs[1].destination}</span>
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                {route.legs[1].operator}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Tahmini Bilet Toplamı:</span>
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400">{route.totalPrice}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="text-3xl">⚓</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {!isOnline
                    ? "Sefer verileri şu anda alınamıyor — internet bağlantısı yok."
                    : searchQuery.trim().length > 0
                    ? `"${searchQuery}" aramasıyla eşleşen aktif vapur seferi bulunamadı.`
                    : language === "en" ? "No scheduled trips found matching your filters." : "Seçtiğiniz saat diliminde aktif sefer bulunamadı."}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {isOnline
                    ? "Günün tüm saatlerindeki (06:00–00:30) seferleri görmek için 'Tüm Gün Tarifesini Göster' butonuna tıklayabilir veya filtreleri sıfırlayabilirsiniz."
                    : "Bağlantı geri geldiğinde seferler otomatik olarak yüklenecek."}
                </p>

                {isOnline && selectedOperator !== "ALL" && (() => {
                  const rec = getOperatorRecord(selectedOperator);
                  if (!rec || rec.dataStatus === "REAL") return null;
                  return (
                    <div className="mx-auto max-w-sm rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 text-left">
                      <p className="text-[10px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-0.5">
                        {selectedOperator} — veri kaynağı durumu
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        {rec.statusNote}
                      </p>
                    </div>
                  );
                })()}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {!showAllDay && (
                    <button
                      type="button"
                      onClick={() => setShowAllDay(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Clock size={13} />
                      <span>Tüm Gün Tarifesini Göster (06:00–00:30)</span>
                    </button>
                  )}
                  {selectedOrigin !== "ALL" && selectedDestination !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => setIsMissedFerryOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <AlertOctagon size={13} />
                      <span>Alternatif Rota & Kurtarma Planı (Marmaray / Metro)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedOrigin("ALL");
                      setSelectedDestination("ALL");
                      updateCategory("ALL");
                      setSelectedOperator("ALL");
                      setSelectedDayType("TODAY");
                      setShowAllDay(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Filtreleri Sıfırla ve Tüm Seferleri Göster</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Persistent Live Activity Bar (Sticky Bottom) */}
      <LiveTripTrackerBar />

      {/* Bottom Sheet for Trip Details */}
      <TripDetailsSheet
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        serverTimeIso={serverTimeIso}
      />

      {/* Filtreler & Araçlar Bottom Sheet */}
      <ScheduleToolsSheet
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        currentOrigin={selectedOrigin}
        currentDestination={selectedDestination}
        onSelectRoute={(origin, destination, category) => {
          setSelectedOrigin(origin);
          setSelectedDestination(destination);
          updateCategory(category);
        }}
        operators={uniqueOperators}
        selectedOperator={selectedOperator}
        onSelectOperator={setSelectedOperator}
        onOpenNightGuide={() => setIsNightTransitOpen(true)}
        showPlanner={showPlanner}
        onTogglePlanner={() => setShowPlanner((v) => !v)}
        isCompactDensity={isCompactDensity}
        onToggleDensity={handleToggleDensity}
        onClearFilters={() => {
          setSelectedOperator("ALL");
          setShowPlanner(false);
          setSelectedDayType("TODAY");
          setShowAllDay(false);
          if (isCompactDensity) handleToggleDensity();
        }}
      />

      {/* Gece Seferleri & Sabaha Karşı Dolmuş/Taksi Rehberi Modalı */}
      <LateNightTransitModal
        isOpen={isNightTransitOpen}
        onClose={() => setIsNightTransitOpen(false)}
      />

      {/* Global Ada İskeleleri Arası Biniş & İniş Seçim Modalı */}
      <IslandHopPickerModal
        isOpen={!!selectedHopSchedule}
        onClose={() => setSelectedHopSchedule(null)}
        schedule={selectedHopSchedule}
      />

      {/* Vapuru Kaçırdım / Alternatif Marmaray & Metro Planlayıcı Modalı */}
      <MissedFerryAssistantModal
        isOpen={isMissedFerryOpen}
        onClose={() => setIsMissedFerryOpen(false)}
        origin={selectedOrigin !== "ALL" ? selectedOrigin : "Kadıköy"}
        destination={selectedDestination !== "ALL" ? selectedDestination : "Eminönü"}
        missedDepartureTime={new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
      />
    </>
  );
}
