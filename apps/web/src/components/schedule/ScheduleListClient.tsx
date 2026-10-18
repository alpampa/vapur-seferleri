"use client";

import { useState, useEffect, useMemo } from "react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { Search, Navigation, ArrowLeftRight, RotateCcw, ChevronDown, Sparkles, Wind, X, AlertOctagon, SlidersHorizontal } from "lucide-react";
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
import { ScheduleToolsSheet } from "@/components/schedule/ScheduleToolsSheet";
import { MarqueeTicker } from "@/components/ui/MarqueeTicker";
import { LastFerrySafeguardBanner } from "@/components/schedule/LastFerrySafeguardBanner";
import { ServiceDataTrustBar } from "@/components/trust/ServiceDataTrustBar";
import type { SourceFreshnessMeta } from "@/components/trust/ServiceDataTrustBar";
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

interface ScheduleListClientProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  initialOrigin?: string;
  marineWeather?: MarineWeatherStatus | null;
  /** GÜVEN KATMANI: resmî kaynakların son doğrulanma üst verisi (sunucudan gelir). */
  sourceFreshness: SourceFreshnessMeta;
}

export function ScheduleListClient({ schedules, serverTimeIso, initialOrigin, marineWeather, sourceFreshness }: ScheduleListClientProps) {
  const { t, language } = useLanguageStore();
  const { touristMode, setTouristMode, proUnlocked, scheduleCategory, setScheduleCategory } = usePreferencesStore();
  // Y4 — İKİ KADEME TICK: canlı MM:SS penceresine giren görünür sefer varken 1 sn,
  // aksi halde 15 sn (dakika hassasiyeti yeterli). Kademe geçişi aşağıdaki effect ile yönetilir.
  const [tickMs, setTickMs] = useState(1000);
  const { nowMs } = useTransitClock(tickMs, { serverTimeIso });
  const now = nowMs;

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"ADALAR" | "BOGAZ" | "ALL">(scheduleCategory);
  const [selectedOrigin, setSelectedOrigin] = useState<string>(initialOrigin || "ALL");
  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");
  const [selectedOperator, setSelectedOperator] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPlanner, setShowPlanner] = useState<boolean>(false);
  const [onlyImminent, setOnlyImminent] = useState<boolean>(false);
  const [isCompactDensity, setIsCompactDensity] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const toolFilterCount = (selectedOperator !== "ALL" ? 1 : 0) + (showPlanner ? 1 : 0) + (isCompactDensity ? 1 : 0);

  // KULLANICI KURALI: Kategori seçimi tercih olarak saklanır — Adalar seçen kullanıcı
  // uygulamayı Yeniden açtığında yine Adalar görür (her açılışta sıfırlanmaz).
  const updateCategory = (category: "ADALAR" | "BOGAZ" | "ALL") => {
    setSelectedCategory(category);
    setScheduleCategory(category);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vapur_compact_view");
      if (saved !== null) {
        setIsCompactDensity(saved === "true");
      }
    } catch {}
  }, []);

  const handleToggleDensity = () => {
    setIsCompactDensity((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vapur_compact_view", String(next));
      } catch {}
      return next;
    });
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

  // AI 1: DOĞAL DİL ARAMA & AKILLI ASİSTAN (Hugging Face / NLP Intent Parser)
  const aiAnalysis = useMemo(() => {
    return parseNaturalTransitQuery(searchQuery);
  }, [searchQuery]);

  // AI 2: LODOS & HAVA TAHMİNLİ İPTAL RİSK MODELİ (Meteoroloji & Rüzgar Tahmin Motoru)
  const disruptionForecast = useMemo(() => {
    return predictFerryDisruption(marineWeather);
  }, [marineWeather]);

  // Duyuru → sefer eşleşmesi: iptal duyurusu ilgili kartı CANCELLED yapar
  const disruptionByTrip = useMemo(() => {
    const map = new Map<string, "CANCELLED" | "SCHEDULE_CHANGE" | "EXTRA">();
    for (const d of disruptions) {
      if (d.kind === "CANCELLED") map.set(d.tripId, "CANCELLED");
      else if (d.kind === "SCHEDULE_CHANGE" && !map.has(d.tripId)) map.set(d.tripId, "SCHEDULE_CHANGE");
      // EXTRA (ek sefer) uyarı değil; durum değiştirmez
    }
    return map;
  }, [disruptions]);

  // Native IndexedDB Non-blocking Caching
  const [effectiveSchedules, setEffectiveSchedules] = useState<ScheduleCardDto[]>(schedules);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAdOffer[]>(() => getSponsoredAdsStore());

  // Anonim oturum & telemetri açılış kaydı + Canlı Sponsorlu Satır Senkronizasyonu
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
      // Non-blocking background persistence to IndexedDB
      saveSchedulesOffline(schedules).catch(() => {});
    } else {
      // Async load from IndexedDB without freezing UI thread
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
          // KULLANICI KURALI: Konum modu "oradaki seferleri göster" demektir —
          // seçili kategori en yakın iskeleden sefer üretmiyorsa kategori kilidi açılır.
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

  // 1. Filter and resolve dynamic state for active trips
  const activeSchedulesWithDyn = useMemo(() => {
    const rawList = effectiveSchedules
      .map((s) => {
        const disruption = disruptionByTrip.get(s.id);
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
          dyn
        };
      })
      .filter(({ dyn, schedule }) => {
        if (dyn.isExpired) return false;
        // KULLANICI KURALI & SIFIR TOLERANS: Kalkış ve varış noktası aynı olan hatalı seferler (örn: Büyükada -> Büyükada) kesinlikle kabul edilmez
        if (dyn.currentOrigin.trim() === dyn.destination.trim()) return false;
        if (schedule.origin.trim() === schedule.destination.trim()) return false;

        // GLOBAL ARAMA: Kullanıcı bir arama terimi yazdığında kategori kilidi kalkar, tüm İstanbul taranır
        if (searchQuery.trim().length > 0) return true;
        if (selectedCategory === "ALL") return true;

        // KULLANICI KURALI: DİNAMİK KATEGORİ DENETİMİ (ADALAR vs BOĞAZ):
        // Bir vapur Adalar'dan kalkıp anakaraya ulaştığında (örn: Adalar -> Kadıköy -> Kabataş),
        // Adalar'ı terk edip Kadıköy'den Kabataş'a geçerken artık "anakaradan anakaraya" bir seferdir.
        // Adalı yolcuyu ilgilendirmez; dolayısıyla "ADALAR" sekmesinde ASLA gösterilmemelidir!
        // Yalnızca Boğaz / Şehir İçi ("BOGAZ") veya "ALL" sekmesinde görünebilir.
        const isCurrentLegIsland = isIslandRoute(dyn.currentOrigin, dyn.destination);

        if (selectedCategory === "ADALAR") {
          return isCurrentLegIsland;
        }

        if (selectedCategory === "BOGAZ") {
          return !isCurrentLegIsland;
        }

        return true;
      });

    // KESİN TEKİLLEŞTİRME VE MASTER SEFER FİLTRESİ (Strict Master Voyage Deduplication):
    // Genel listede (selectedOrigin === "ALL") aynı fiziksel gemiye ait ara durak hayalet kartlarını eler.
    // Bir vapurun ana kalkış seferi varken, o vapurun uğrayacağı ara duraklar için ayrı ayrı mükerrer kart basılmaz!
    const masterList = selectedOrigin === "ALL" ? rawList.filter((item, idx) => {
      return !rawList.some((other, oIdx) => {
        if (idx === oIdx) return false;
        if (other.schedule.operator !== item.schedule.operator) return false;
        // Eğer başka bir ana seferin ara duraklarında bu seferin kalkış iskelesi ve saati varsa, bu bir ara bacaktır!
        return (other.schedule.stops || []).some(
          (st) => st.name === item.schedule.origin && st.time === item.schedule.departureTime
        );
      });
    }) : rawList;

    // Aynı kalkış iskelesi, aynı varış iskelesi ve aynı kalkış saatine sahip tekrarlayan kartları tekilleştir
    const dedupMap = new Map<string, { schedule: ScheduleCardDto; dyn: DynamicTripResolution }>();
    for (const item of masterList) {
      // Anahtar operatörü de içerir: aynı saatte aynı iskeleden kalkan FARKLI firmaların
      // seferleri (örn. MM ile Şehir Hatları Kabataş 13:00) birbirini yutmamalı.
      // Aynı firmanın aynı saat/rota mükerrer kaydı yine tekilleşir (regresyon yok).
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
  }, [effectiveSchedules, selectedCategory, selectedOrigin, searchQuery, now, serverTimeIso, disruptionByTrip]);

  const uniqueOperators = useMemo(() => {
    return OPERATOR_REGISTRY
      .filter((op) => {
        if (selectedCategory === "ALL") return true;
        return op.category === "HEPSI" || op.category === selectedCategory;
      })
      .map((op) => op.name);
  }, [selectedCategory]);

  // 1. Tüm geçerli seferlerden toplanan ana kalkış ve varış iskeleleri
  const allOrigins = useMemo(() => {
    const set = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule, dyn }) => {
      set.add(dyn.currentOrigin || schedule.origin);
      if (schedule.stops) {
        schedule.stops.forEach((st) => set.add(st.name));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [activeSchedulesWithDyn]);

  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule, dyn }) => {
      set.add(dyn.destination || schedule.destination);
      if (schedule.stops) {
        schedule.stops.forEach((st) => set.add(st.name));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [activeSchedulesWithDyn]);

  // 2. Akıllı Bağlantılı İskele Filtrelemesi (Cascading Piers):
  // Eğer kullanıcı bir kalkış (Nereden) seçtiyse, Nereye menüsünde YALNIZCA o iskeleden seferi olan iskeleler listelenir.
  // Örnek: Bostancı seçilince Beykoz menüde görünmez!
  const availableDestinations = useMemo(() => {
    if (selectedOrigin === "ALL") {
      return allDestinations;
    }
    const set = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule, dyn }) => {
      const isDirectOrigin = schedule.origin === selectedOrigin || dyn.currentOrigin === selectedOrigin;
      const stopIndex = schedule.stops ? schedule.stops.findIndex((st) => st.name === selectedOrigin) : -1;
      
      if (isDirectOrigin) {
        // Doğrudan kalkış: Varış ve tüm ara duraklar varış adayıdır
        set.add(dyn.destination || schedule.destination);
        if (schedule.stops) {
          schedule.stops.forEach((st) => set.add(st.name));
        }
      } else if (stopIndex >= 0 && schedule.stops) {
        // Ara duraktan biniş: Bu duraktan sonraki duraklar ve nihai varış varış adayıdır
        set.add(dyn.destination || schedule.destination);
        for (let i = stopIndex + 1; i < schedule.stops.length; i++) {
          set.add(schedule.stops[i].name);
        }
      }
    });
    set.delete(selectedOrigin); // Kendisine sefer açılamaz
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [activeSchedulesWithDyn, selectedOrigin, allDestinations]);

  // Eğer kullanıcı bir varış (Nereye) seçtiyse, Nereden menüsünde YALNIZCA o varışa giden iskeleler listelenir.
  const availableOrigins = useMemo(() => {
    if (selectedDestination === "ALL") {
      return allOrigins;
    }
    const set = new Set<string>();
    activeSchedulesWithDyn.forEach(({ schedule, dyn }) => {
      const isDirectDest = schedule.destination === selectedDestination || dyn.destination === selectedDestination;
      const stopIndex = schedule.stops ? schedule.stops.findIndex((st) => st.name === selectedDestination) : -1;

      if (isDirectDest) {
        set.add(dyn.currentOrigin || schedule.origin);
        if (schedule.stops) {
          schedule.stops.forEach((st) => set.add(st.name));
        }
      } else if (stopIndex >= 0 && schedule.stops) {
        set.add(dyn.currentOrigin || schedule.origin);
        for (let i = 0; i < stopIndex; i++) {
          set.add(schedule.stops[i].name);
        }
      }
    });
    set.delete(selectedDestination);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [activeSchedulesWithDyn, selectedDestination, allOrigins]);

  // Seçilen iskele artık geçerli değilse otomatik olarak "ALL" (Tümü) durumuna getir
  useEffect(() => {
    if (selectedDestination !== "ALL" && !availableDestinations.includes(selectedDestination)) {
      setSelectedDestination("ALL");
    }
  }, [availableDestinations, selectedDestination]);

  useEffect(() => {
    if (selectedOrigin !== "ALL" && !availableOrigins.includes(selectedOrigin)) {
      setSelectedOrigin("ALL");
    }
  }, [availableOrigins, selectedOrigin]);

  const swapOriginDestination = () => {
    const prevO = selectedOrigin;
    const prevD = selectedDestination;
    setSelectedOrigin(prevD);
    setSelectedDestination(prevO);
  };

  // Final filtered list - KULLANICI KURALI: En üstte yer alacak ilk sefer (kesin kronolojik sıralama)
  const filteredList = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const q = searchQuery.toLowerCase().trim();

    return activeSchedulesWithDyn.filter(({ schedule, dyn }) => {
      // AI ARAMA & GLOBAL TÜRKÇE KARAKTERE DUYARLI ARAMA
      if (hasSearch) {
        // Eğer Doğal Dil AI Asistanı sorguyu yapılandırdıysa (örn. "Bostancı'dan Adalar'a")
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
          if (aiAnalysis.onlyImminent) {
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
        }

        if (selectedOperator !== "ALL") {
          if (schedule.operator !== selectedOperator) return false;
        }
      }

      if (onlyImminent) {
        if (dyn.isDeparted) return false;
        // Kalan süre kalkış damgasından hesaplanır (string ayrıştırması yok)
        const remainingMs = new Date(dyn.currentTargetIso).getTime() - now;
        if (remainingMs > IMMINENT_DEPARTURE_MS) return false;
      }

      return true;
    }).sort((a, b) => {
      // HH:mm dizgisel karşılaştırma güvenilmez; gece yarısı (23:50 → 00:20)
      // geçişlerinde gün doğru taşındığı için ISO damgasına göre sırala.
      // Kalkışını yeni geçen kart (30 sn'lik "Hareket etti" penceresi) yerinde
      // kalır; pencere bitince liste kaymadan ekrandan tamamen silinir.
      return a.dyn.currentTargetIso.localeCompare(b.dyn.currentTargetIso);
    });
  }, [activeSchedulesWithDyn, selectedOrigin, selectedDestination, selectedOperator, searchQuery, onlyImminent, now]);

  // KULLANICI KURALI: Geçmiş sefer görünümü YOKTUR. Kalkışı 30 sn'den fazla geçmiş
  // her sefer activeSchedulesWithDyn'de (isExpired) elenir; kalkışı yeni geçen kart
  // ise yerinde en çok 30 sn "Hareket etti" olarak görünür, sonra kendiliğinden silinir.
  const upcomingTrips = filteredList;

  // KULLANICI KURALI: Gece güvenlik bandı yalnızca seçili kategoriye uyan seferleri
  // dikkate alır (Adalar seçiliyken Boğaz seferi duyurulmaz) ve listede zaten görünen
  // bir seferi ikinci kez duyurmaz (mükerrer bilgi yasağı).
  const safeguardSchedules = useMemo(() => {
    if (selectedCategory === "ALL") return effectiveSchedules;
    return effectiveSchedules.filter((s) => {
      const island = isIslandRoute(s.origin, s.destination);
      return selectedCategory === "ADALAR" ? island : !island;
    });
  }, [effectiveSchedules, selectedCategory]);

  // Y4 — KADEME SEÇİMİ: canlı geri sayım penceresine (eşik: pencere + 1 dk tampon)
  // giren görünür sefer varken saniyelik tick. Aynı değere setTickMs no-op'tur;
  // upcomingTrips her tick'te yeniden üretilir ama efekt ucuzdur (.some taraması).
  useEffect(() => {
    const urgent = upcomingTrips.some(
      ({ dyn }) =>
        dyn.countdown != null ||
        (dyn.minutesUntilDeparture != null && dyn.minutesUntilDeparture <= FAST_TICK_THRESHOLD_MIN)
    );
    setTickMs(urgent ? 1000 : SLOW_TICK_INTERVAL_MS);
  }, [upcomingTrips]);

  // İptal Seferler Algoritması (Kullanıcı Kuralı: Kayan bantta yalnızca güncel/gelecek iptaller gösterilir, eski/geçmiş iptaller elenir)
  const cancelledTrips = useMemo(() => {
    return activeSchedulesWithDyn.filter(
      ({ schedule, dyn }) => isTripCancelled(schedule, dyn) && !dyn.isDeparted && !dyn.isExpired
    );
  }, [activeSchedulesWithDyn]);

  return (
    <>
      <AlarmManager schedules={effectiveSchedules} />

      {/* CANLI FIRMA DUYURU BANDI (iptal / tarife / ek sefer) */}
      <AnnouncementBanner announcements={announcements} />

      {/* ÇEVRİMDIŞI PWA GÖSTERGESİ (Metro / Deniz Tünelinde Kesintisiz Hafıza Modu) */}
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

      {/* 0. GECE GÜVENCESİ: SON VAPURU KAÇIRMA ASİSTANI (23:45 Sonrası Aktif) */}
      <LastFerrySafeguardBanner
        schedules={safeguardSchedules}
        visibleSchedules={upcomingTrips.map((t) => t.schedule)}
        serverTimeIso={serverTimeIso}
        onOpenNightTransit={() => setIsNightTransitOpen(true)}
      />

      {/* 1. TEK KART: İSKELE SEÇİCİ + MİKRO FİLTRELER (Birleşik Kart) */}
      <div className="px-3 pt-1.5">
        <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="w-full flex items-center gap-1 p-1">
          {/* Kalkış İskelesi */}
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              aria-label="Kalkış iskelesi seçin"
              className="w-full min-h-10 pl-5 pr-5 py-1.5 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 appearance-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer truncate"
            >
              <option value="ALL">🟢 Nereden (Tümü)</option>
              {availableOrigins.map((pier) => (
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

          {/* Varış İskelesi */}
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              aria-label="Varış iskelesi seçin"
              className="w-full min-h-10 pl-5 pr-5 py-1.5 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 appearance-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer truncate"
            >
              <option value="ALL">🔴 Nereye (Tümü)</option>
              {availableDestinations.map((pier) => (
                <option key={pier} value={pier}>{pier}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Filtre Temizle */}
          {(selectedOrigin !== "ALL" || selectedDestination !== "ALL") && (
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
          )}
          </div>
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

      {/* GPS Konumu Bildirim Rozeti (En Yakın İskele Seçildiğinde) */}
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

          {/* AI 1: DOĞAL DİL ANLAMA ROZETİ (Hugging Face / LLM Transit Intent) */}
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

      {/* 4. KULLANICI KURALI: KAYAN İPTAL SEFERLER DUYURU BANTI (Marquee Ticker) */}
      {cancelledTrips.length > 0 && (
        <div className="px-3 pt-1.5 animate-fadeIn">
          <div className="py-1.5 px-3 rounded-xl bg-linear-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-sm flex items-center gap-2 overflow-hidden border border-rose-500">
            <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-0.5 rounded-lg font-black text-[10px] tracking-wider uppercase border border-rose-400/50">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>İPTAL SEFERLER</span>
            </div>
            
            {/* KULLANICI KURALI: TÜM firmaların iptalleri tek satırda akar — her chip
                firma adıyla etiketlenir; asla gizlenemez, satıra sığmazsa otomatik kayar. */}
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

      {/* Genişletilmiş Harita Planlayıcı (Açıldığında Görünür) */}
      {showPlanner && (
        <div className="px-3 pt-2 animate-fadeIn">
          <TripPlannerWithMap
            schedules={effectiveSchedules}
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
        <ServiceDataTrustBar serverTimeIso={serverTimeIso} freshness={sourceFreshness} />
        {searchQuery.trim().length > 0 && (
          <span className="ml-auto shrink-0 text-blue-700 dark:text-blue-300 font-extrabold bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/30 px-2 py-0.5 rounded text-[11px]">
            🔍 {upcomingTrips.length}
          </span>
        )}
      </div>

      {/* Schedules List (Comfortable or Compact Rows) */}
      <div className={`px-3 flex flex-col ${isCompactDensity ? "gap-1.5" : "gap-2"} pb-36 sm:pb-28 mt-1`}>
        {upcomingTrips.length > 0 ? (
          upcomingTrips.map(({ schedule, dyn }, idx) => {
            const shouldShowSponsoredRowHere =
              activeSponsoredAd != null &&
              ((upcomingTrips.length >= 2 && idx === 1) || (upcomingTrips.length === 1 && idx === 0));

            return (
              <div key={`${schedule.id}-${dyn.currentOrigin}`} className="contents">
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
                  isFeaturedHero={idx === 0}
                  highlightStopName={searchQuery}
                  onClick={() => setSelectedSchedule(schedule)}
                  onSelectHop={(s) => setSelectedHopSchedule(s)}
                />
                {shouldShowSponsoredRowHere && (
                  <SponsoredTripRow ad={activeSponsoredAd} isCompact={isCompactDensity} />
                )}
                {idx === 7 && upcomingTrips.length > 10 && (
                  <AdSlot slotId="sefer-listesi" className="pt-1" />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="text-3xl">⚓</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {!isOnline
                ? "Sefer verileri şu anda alınamıyor — internet bağlantısı yok."
                : searchQuery.trim().length > 0
                ? `"${searchQuery}" aramasıyla eşleşen aktif vapur seferi bulunamadı.`
                : language === "en" ? "No scheduled trips found matching your filters." : "Seçtiğiniz kriterlere uygun aktif sefer bulunamadı."}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isOnline
                ? "İskele adını kontrol edebilir veya filtreleri sıfırlayarak güncel tüm Boğaz ve Adalar seferlerini görebilirsiniz."
                : "Bağlantı geri geldiğinde seferler otomatik olarak yüklenecek."}
            </p>

            {/* VERİ DURUMU NOTU: Tarifesi yayınlanmayan / görsel bazlı operatörler için dürüst açıklama */}
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

      {/* Bottom Sheet for Trip Details with AIS Live Radar & IBB Pier Camera */}
      <TripDetailsSheet
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        serverTimeIso={serverTimeIso}
      />

      {/* Filtreler & Araçlar Bottom Sheet: Hızlı Rotalar + Operatör + Görünüm */}
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
