import type { TripStatus } from "@/components/schedule/ScheduleCard";

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
  status: TripStatus;
  isExpired: boolean;          // True if 30s passed after last departure leg (should be removed from screen)
  waypoints: DynamicWaypointView[];
  activeChain: DynamicWaypointView[];
  activeLegIndex: number;
}

/**
 * Gets today's YYYY-MM-DD in Europe/Istanbul timezone
 */
export function getIstanbulTodayDateStr(nowMs: number = Date.now()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date(nowMs)); // Returns "YYYY-MM-DD"
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
  const todayIsoDate = getIstanbulTodayDateStr(accurateNow);

  // 1. Build chronological waypoints list with live ISO timestamps for today
  const allWaypoints: WaypointItem[] = [];
  
  // Origin
  const originIso = `${todayIsoDate}T${departureTime}:00+03:00`;
  allWaypoints.push({
    name: initialOrigin,
    time: departureTime,
    targetTimeMs: new Date(originIso).getTime(),
    targetTimeIso: originIso
  });

  // Intermediate Stops
  if (stops && stops.length > 0) {
    stops.forEach(st => {
      const stopIso = `${todayIsoDate}T${st.time}:00+03:00`;
      allWaypoints.push({
        name: st.name,
        time: st.time,
        targetTimeMs: new Date(stopIso).getTime(),
        targetTimeIso: stopIso
      });
    });
  }

  // Final Destination
  let finalArrTime = arrivalTime;
  if (!finalArrTime) {
    const lastTime = allWaypoints[allWaypoints.length - 1].time;
    const [h, m] = lastTime.split(':').map(Number);
    const estMin = (m + 20) % 60;
    const estHour = (h + Math.floor((m + 20) / 60)) % 24;
    finalArrTime = `${String(estHour).padStart(2, '0')}:${String(estMin).padStart(2, '0')}`;
  }
  const destIso = `${todayIsoDate}T${finalArrTime}:00+03:00`;
  allWaypoints.push({
    name: destination,
    time: finalArrTime,
    targetTimeMs: new Date(destIso).getTime(),
    targetTimeIso: destIso
  });

  const numLegs = allWaypoints.length - 1; // Number of departure stations (excluding final destination arrival)

  // 2. Find active leg
  // Each departure leg i is active until 30 seconds after its departure time (targetTimeMs + 30000)
  for (let i = 0; i < numLegs; i++) {
    const leg = allWaypoints[i];
    const diff = leg.targetTimeMs - accurateNow;

    // Check if we are before departure or within 30 seconds after departure
    if (diff > -30000) {
      // THIS LEG IS CURRENTLY ACTIVE!
      let isDeparted = false;
      let countdown: string | null = null;
      let status: TripStatus = "ON_TIME";

      if (diff <= 0) {
        // Between departure and +30 seconds: Flash "HAREKET ETTİ"
        isDeparted = true;
        status = "IN_TRANSIT";
      } else if (diff <= 5 * 60000) {
        // Last 5 minutes before departure: Show Live Countdown MM:SS
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        status = diff <= 2 * 60000 ? "BOARDING" : "DEPARTING_SOON";
      } else {
        // More than 5 minutes in the future: Normal "ZAMANINDA"
        status = "ON_TIME";
      }

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
          state
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

  const lastLeg = allWaypoints[numLegs - 1];
  return {
    currentOrigin: lastLeg.name,
    initialOrigin,
    destination,
    routeTitle: `${lastLeg.name} ➔ ${destination} Hattı`,
    currentDepartureTime: lastLeg.time,
    currentDepartureTime12: lastLeg.time,
    currentTargetIso: lastLeg.targetTimeIso,
    isDeparted: false,
    countdown: null,
    status: "COMPLETED",
    isExpired: true, // EXPIRED: Will be automatically removed from the list!
    waypoints: finalWaypointsView,
    activeChain: [],
    activeLegIndex: numLegs
  };
}
