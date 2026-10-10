import type { TripStatus, ScheduleCardDto } from "@/lib/types/schedule";
import { getIstanbulParts, compareHhmm, nightRolloverDayOffset } from "@/lib/utils/istanbul-time";
import { normalizeTurkishText } from "@/lib/utils/search-normalizer";
import {
  DEPARTED_GRACE_MS,
  LIVE_COUNTDOWN_WINDOW_MS,
  BOARDING_THRESHOLD_MS,
  ESTIMATED_TRAVEL_MIN_PER_HOP,
} from "@/lib/constants";

export interface WaypointItem {
  name: string;
  time: string;
  targetTimeMs: number;
  targetTimeIso: string;
}

export interface DynamicWaypointView {
  name: string;
  time: string;
  state: "COMPLETED" | "CURRENT" | "UPCOMING";
  isOrigin?: boolean;
  isDestination?: boolean;
}

export interface DynamicTripResolution {
  currentOrigin: string;
  initialOrigin: string;
  destination: string;
  routeTitle: string;
  currentDepartureTime: string;
  currentDepartureTime12: string;
  currentTargetIso: string;
  isDeparted: boolean;         // Active for 30s right after leg departure
  countdown: string | null;    // Active during last 5 minutes (0 to 5 mins)
  minutesUntilDeparture: number | null; // Whole minutes until departure (ceil); null after departure
  status: TripStatus;
  isExpired: boolean;          // True if 30s passed after last departure leg (should be removed from screen)
  waypoints: DynamicWaypointView[];
  activeChain: DynamicWaypointView[];
  activeLegIndex: number;
}

/**
 * İptal sefer tespiti — tek doğruluk kaynağı.
 * Kart, hero ve liste seçimi aynı kuralı paylaşır (KULLANICI KURALI: / İPTAL rozeti).
 * Not: Türkçe büyük "İ" düzgün eşlensin diye normalizeTurkishText kullanılır
 * (plain toLowerCase "İptal" → "i̇ptal" üretir, "iptal" aramasını kaçırır).
 */
export function isTripCancelled(
  schedule: Pick<ScheduleCardDto, "status" | "delayText">,
  dyn: Pick<DynamicTripResolution, "status">
): boolean {
  return (
    schedule.status === "CANCELLED" ||
    dyn.status === "CANCELLED" ||
    normalizeTurkishText(schedule.delayText).includes("iptal")
  );
}

/** YYYY-MM-DD → ertesi gün YYYY-MM-DD (yerel takvim) */
function incrementDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10);
}

/**
 * Resolves real-time dynamic state of a ferry trip (Marmaray / Metro style progressive route tracking)
 */
export function resolveDynamicTrip(
  initialOrigin: string,
  destination: string,
  departureTime: string,
  targetTimeIso: string,
  stops?: { name: string; time: string }[],
  arrivalTime?: string,
  nowMs: number = Date.now(),
  serverTimeIso?: string
): DynamicTripResolution {
  const accurateNow = nowMs;
  const istParts = getIstanbulParts(accurateNow);
  const todayIsoDate = istParts.dateStr;

  // Gece seferi (00:00-04:59 kalkış), akşam saatlerinde (20:00+) görüntülenirken
  // bugünkü gerçekleşimi çoktan geçmiştir: kalkış yarına taşınır.
  // Örn: 23:50'de 00:15 kalkışlı sefer → yarın 00:15 (25 dk sonra, aktif sefer).
  // Kural tek kaynaktır: nightRolloverDayOffset (istanbul-time).
  const baseDayOffset = nightRolloverDayOffset(departureTime, accurateNow);

  // 0. Güvenlik Kontrolü: Kalkış ve varış aynı olamaz (örn: Büyükada -> Büyükada)
  if (!initialOrigin || !destination || initialOrigin.trim() === destination.trim()) {
    return {
      currentOrigin: initialOrigin || "",
      initialOrigin: initialOrigin || "",
      destination: destination || "",
      routeTitle: `${initialOrigin} ➔ ${destination} Hattı`,
      currentDepartureTime: departureTime,
      currentDepartureTime12: departureTime,
      currentTargetIso: targetTimeIso,
      isDeparted: true,
      countdown: null,
      minutesUntilDeparture: null,
      status: "COMPLETED",
      isExpired: true,
      waypoints: [],
      activeChain: [],
      activeLegIndex: 0
    };
  }

  // 1. Build chronological waypoints with proper midnight rollover.
  // Bir durak saati bir öncekinden ERKENSE (örn. 23:45 kalkış → 00:10 varış)
  // o durak/varış ertesi güne aittir ve `dayOffset` artırılır.
  const buildWaypoint = (name: string, time: string, dayOffset: number): WaypointItem => {
    let isoDate = todayIsoDate;
    for (let d = 0; d < dayOffset; d++) isoDate = incrementDateStr(isoDate);
    const iso = `${isoDate}T${time}:00+03:00`;
    return {
      name,
      time,
      targetTimeMs: new Date(iso).getTime(),
      targetTimeIso: iso
    };
  };

  const allWaypoints: WaypointItem[] = [];
  let dayOffset = baseDayOffset;

  // Kalkış noktası
  const pushWaypoint = (name: string, time: string) => {
    const prev = allWaypoints[allWaypoints.length - 1];
    if (prev && compareHhmm(time, prev.time) < 0) {
      dayOffset += 1;
    }
    allWaypoints.push(buildWaypoint(name, time, dayOffset));
  };

  pushWaypoint(initialOrigin.trim(), departureTime);

  // Ara duraklar: Sadece gerçek ara duraklar! Kalkış veya Varış ile aynı olamaz, ardışık mükerrer olamaz
  if (stops && stops.length > 0) {
    stops.forEach(st => {
      const cleanName = st.name.trim();
      if (cleanName === initialOrigin.trim() || cleanName === destination.trim()) {
        return; // Asla kalkış veya varış noktasını ara durak olarak ekleme!
      }
      const prev = allWaypoints[allWaypoints.length - 1];
      if (prev && prev.name.trim() === cleanName) {
        return; // Ardışık aynı durağı mükerrer ekleme!
      }
      pushWaypoint(cleanName, st.time);
    });
  }

  // Varış noktası
  let finalArrTime = arrivalTime;
  if (!finalArrTime) {
    const lastTime = allWaypoints[allWaypoints.length - 1].time;
    const [h, m] = lastTime.split(':').map(Number);
    const estMin = (m + ESTIMATED_TRAVEL_MIN_PER_HOP) % 60;
    const estHour = (h + Math.floor((m + ESTIMATED_TRAVEL_MIN_PER_HOP) / 60)) % 24;
    finalArrTime = `${String(estHour).padStart(2, '0')}:${String(estMin).padStart(2, '0')}`;
  }
  const lastWp = allWaypoints[allWaypoints.length - 1];
  if (!lastWp || lastWp.name.trim() !== destination.trim()) {
    pushWaypoint(destination.trim(), finalArrTime);
  }

  const numLegs = allWaypoints.length - 1; // Number of departure stations (excluding final destination arrival)

  // 2. Find active leg
  // Each departure leg i is active until DEPARTED_GRACE_MS after its departure time
  for (let i = 0; i < numLegs; i++) {
    const leg = allWaypoints[i];

    // GÜVENLİK KURALI: Kalkış bacağı asla varış noktası olamaz (X -> X engeli)!
    if (leg.name.trim() === destination.trim()) {
      continue;
    }

    const diff = leg.targetTimeMs - accurateNow;

    // Check if we are before departure or within the grace window after departure
    if (diff > -DEPARTED_GRACE_MS) {
      if (leg.name.trim() === destination.trim()) {
        continue;
      }
      // THIS LEG IS CURRENTLY ACTIVE!
      let isDeparted = false;
      let countdown: string | null = null;
      let status: TripStatus = "ON_TIME";

      if (diff <= 0) {
        // Between departure and +30 seconds: Flash "HAREKET ETTİ"
        isDeparted = true;
        status = "IN_TRANSIT";
      } else if (diff <= LIVE_COUNTDOWN_WINDOW_MS) {
        // Live countdown window before departure: Show Live Countdown MM:SS
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        status = diff <= BOARDING_THRESHOLD_MS ? "BOARDING" : "DEPARTING_SOON";
      } else {
        // Beyond the live countdown window: Normal "ZAMANINDA"
        status = "ON_TIME";
      }

      // Whole minutes until departure (ceil); null once departed
      const minutesUntilDeparture = diff > 0 ? Math.ceil(diff / 60000) : null;

      // Format 12-hour time
      const [hh, mm] = leg.time.split(':');
      const hNum = parseInt(hh, 10);
      const isPm = hNum >= 12;
      const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
      const dep12 = `${h12}:${mm} ${isPm ? 'PM' : 'AM'}`;

      // Build waypoints view with Metro / Marmaray progressive states
      const waypointsView: DynamicWaypointView[] = allWaypoints.map((wp, idx) => {
        let state: "COMPLETED" | "CURRENT" | "UPCOMING" = "UPCOMING";
        if (idx < i) {
          state = "COMPLETED"; // Green checkmark (completed)
        } else if (idx === i) {
          state = "CURRENT";   // Glowing / active target
        } else {
          state = "UPCOMING";  // Standard upcoming pill
        }
        return {
          name: wp.name,
          time: wp.time,
          state,
          isOrigin: idx === 0,
          isDestination: idx === allWaypoints.length - 1
        };
      });

      const activeChain: DynamicWaypointView[] = waypointsView.slice(i).map((wp, cIdx, arr) => ({
        ...wp,
        isOrigin: cIdx === 0,
        isDestination: cIdx === arr.length - 1
      }));

      return {
        currentOrigin: leg.name,
        initialOrigin,
        destination,
        routeTitle: `${leg.name} ➔ ${destination} Hattı`,
        currentDepartureTime: leg.time,
        currentDepartureTime12: dep12,
        currentTargetIso: leg.targetTimeIso,
        isDeparted,
        countdown,
        minutesUntilDeparture,
        status,
        isExpired: false,
        waypoints: waypointsView,
        activeChain,
        activeLegIndex: i
      };
    }
  }

  // If all departure legs have passed by more than 30 seconds:
  // The trip is expired and will be automatically removed from the screen!
  const finalWaypointsView: DynamicWaypointView[] = allWaypoints.map((wp, cIdx, arr) => ({
    name: wp.name,
    time: wp.time,
    state: "COMPLETED",
    isOrigin: cIdx === 0,
    isDestination: cIdx === arr.length - 1
  }));

  const lastLeg = (numLegs > 0 && allWaypoints[numLegs - 1]) ? allWaypoints[numLegs - 1] : allWaypoints[0];
  const fallbackOrigin = lastLeg?.name || initialOrigin;
  return {
    currentOrigin: fallbackOrigin,
    initialOrigin,
    destination,
    routeTitle: `${fallbackOrigin} ➔ ${destination} Hattı`,
    currentDepartureTime: lastLeg?.time || departureTime,
    currentDepartureTime12: lastLeg?.time || departureTime,
    currentTargetIso: lastLeg?.targetTimeIso || targetTimeIso,
    isDeparted: false,
    countdown: null,
    minutesUntilDeparture: null,
    status: "COMPLETED",
    isExpired: true, // EXPIRED: Will be automatically removed from the list!
    waypoints: finalWaypointsView,
    activeChain: [],
    activeLegIndex: numLegs
  };
}
