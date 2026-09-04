import type { TripStatus } from "@/components/schedule/ScheduleCard";

export interface WaypointItem {
  name: string;
  time: string;
  targetTimeIso: string;
}

export interface DynamicWaypointView {
  name: string;
  time: string;
  state: "COMPLETED" | "CURRENT" | "UPCOMING";
}

export interface DynamicTripResolution {
  currentOrigin: string;
  destination: string;
  routeTitle: string;
  currentDepartureTime: string;
  currentDepartureTime12: string;
  currentTargetIso: string;
  isDeparted: boolean;         // Active for 30s right after leg departure
  countdown: string | null;    // Active during last 5 minutes (0 to 5 mins)
  status: TripStatus;
  isExpired: boolean;          // Should be removed from screen
  waypoints: DynamicWaypointView[];
  activeLegIndex: number;
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
  // Compute accurate server offset if provided
  let accurateNow = nowMs;
  if (serverTimeIso) {
    const serverMs = new Date(serverTimeIso).getTime();
    const clientMs = nowMs;
    accurateNow = clientMs + (serverMs - clientMs);
  }

  // Base date string (YYYY-MM-DD) from targetTimeIso
  const baseIsoDate = targetTimeIso.split('T')[0] || new Date().toISOString().split('T')[0];

  // 1. Build chronological waypoints list
  const allWaypoints: WaypointItem[] = [];
  
  // Origin
  allWaypoints.push({
    name: initialOrigin,
    time: departureTime,
    targetTimeIso: targetTimeIso
  });

  // Intermediate Stops
  if (stops && stops.length > 0) {
    stops.forEach(st => {
      allWaypoints.push({
        name: st.name,
        time: st.time,
        targetTimeIso: `${baseIsoDate}T${st.time}:00+03:00`
      });
    });
  }

  // Final Destination
  let finalArrTime = arrivalTime;
  if (!finalArrTime) {
    // Estimate arrival 15 mins after last stop or 30 mins after departure
    const lastTime = allWaypoints[allWaypoints.length - 1].time;
    const [h, m] = lastTime.split(':').map(Number);
    const estMin = (m + 20) % 60;
    const estHour = (h + Math.floor((m + 20) / 60)) % 24;
    finalArrTime = `${String(estHour).padStart(2, '0')}:${String(estMin).padStart(2, '0')}`;
  }
  allWaypoints.push({
    name: destination,
    time: finalArrTime,
    targetTimeIso: `${baseIsoDate}T${finalArrTime}:00+03:00`
  });

  const numLegs = allWaypoints.length - 1; // Number of departure stations (excluding final destination arrival)
  const isDirect = (stops?.length || 0) === 0;

  // 2. Find active leg
  // Each departure leg i is active until 30 seconds after its departure time (T_i + 30000)
  for (let i = 0; i < numLegs; i++) {
    const leg = allWaypoints[i];
    const legDepartureMs = new Date(leg.targetTimeIso).getTime();
    const diff = legDepartureMs - accurateNow;

    // Check if we are before departure or within 30 seconds after departure
    if (diff > -30000) {
      // THIS LEG IS CURRENTLY ACTIVE!
      let isDeparted = false;
      let countdown: string | null = null;
      let status: TripStatus = "ON_TIME";

      if (diff <= 0) {
        // Between departure and +30 seconds
        isDeparted = true;
        status = "IN_TRANSIT";
      } else if (diff <= 5 * 60000) {
        // Last 5 minutes before departure -> Show Live Countdown MM:SS
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        status = diff <= 2 * 60000 ? "BOARDING" : "DEPARTING_SOON";
      } else {
        // More than 5 minutes in the future
        status = "ON_TIME";
      }

      // Format 12-hour time
      const [hh, mm] = leg.time.split(':');
      const hNum = parseInt(hh, 10);
      const isPm = hNum >= 12;
      const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
      const dep12 = `${h12}:${mm} ${isPm ? 'PM' : 'AM'}`;

      // Build waypoints view with Metro / Marmaray states
      const waypointsView: DynamicWaypointView[] = allWaypoints.map((wp, idx) => {
        let state: "COMPLETED" | "CURRENT" | "UPCOMING" = "UPCOMING";
        if (idx < i) {
          state = "COMPLETED"; // Green checkmark
        } else if (idx === i) {
          state = "CURRENT";   // Glowing / ship icon
        } else {
          state = "UPCOMING";  // Standard pill
        }
        return {
          name: wp.name,
          time: wp.time,
          state
        };
      });

      return {
        currentOrigin: leg.name,
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
        activeLegIndex: i
      };
    }
  }

  // If we reach here, all departure legs have passed by more than 30 seconds
  // The trip is expired and must be removed from the screen!
  const finalWaypointsView: DynamicWaypointView[] = allWaypoints.map(wp => ({
    name: wp.name,
    time: wp.time,
    state: "COMPLETED"
  }));

  const lastLeg = allWaypoints[numLegs - 1];
  return {
    currentOrigin: lastLeg.name,
    destination,
    routeTitle: `${lastLeg.name} ➔ ${destination} Hattı`,
    currentDepartureTime: lastLeg.time,
    currentDepartureTime12: lastLeg.time,
    currentTargetIso: lastLeg.targetTimeIso,
    isDeparted: false,
    countdown: null,
    status: "COMPLETED",
    isExpired: true, // EXPIRED: Will be filtered out from screen!
    waypoints: finalWaypointsView,
    activeLegIndex: numLegs
  };
}
