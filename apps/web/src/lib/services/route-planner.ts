import type { ScheduleCardDto } from "@/lib/types/schedule";
import { toAbsoluteDayMinutes } from "@/lib/utils/istanbul-time";
import {
  ESTIMATED_TRAVEL_MIN_PER_HOP,
  TRANSFER_HUB_TRAVEL_MIN,
  TRANSFER_MIN_WAIT_MIN,
  TRANSFER_MAX_WAIT_MIN,
  PAST_DEPARTURE_TOLERANCE_MIN,
  MAX_ROUTE_RESULTS,
  MINUTES_PER_DAY,
} from "@/lib/constants";

/** Sefer verisinde fiyat yoksa gösterilen varsayılan bilet ücreti */
const DEFAULT_TICKET_PRICE = "₺45.00";

/** Sefer verisinde platform yoksa gösterilen varsayılan rıhtım adı */
const DEFAULT_PLATFORM = "Ana Rıhtım";

export interface RouteOption {
  type: "DIRECT" | "TRANSFER";
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  totalPrice: string;
  legs: {
    origin: string;
    destination: string;
    operator: string;
    departureTime: string;
    arrivalTime: string;
    platform: string;
    price: string;
    tripId: string;
  }[];
  transferPier?: string;
  transferWaitMinutes?: number;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const normalized = ((mins % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates direct and 1-stop transfer routes between origin and destination
 */
export function planJourney(
  schedules: ScheduleCardDto[],
  origin: string,
  destination: string,
  currentMinutes: number = 0
): RouteOption[] {
  if (!origin || !destination || origin === destination) return [];

  const results: RouteOption[] = [];

  // 1. Find DIRECT trips
  for (const s of schedules) {
    const originMatches = s.origin === origin;
    const destMatches = s.destination === destination;

    // Check intermediate stops as origin or destination
    let depTime = s.departureTime;
    // Varış: ara duraksa durak saati, seferin son durağıysa seferin varış saati
    let arrTime: string | null = null;

    // If origin is intermediate stop
    if (!originMatches && s.stops) {
      const st = s.stops.find(x => x.name === origin);
      if (st) depTime = st.time;
    }

    // If destination is intermediate stop
    if (!destMatches && s.stops) {
      const st = s.stops.find(x => x.name === destination);
      if (st) arrTime = st.time;
    }

    // If destination is the trip's final stop, use the trip's own arrival time
    if (!arrTime && destMatches && s.arrivalTime) {
      arrTime = s.arrivalTime;
    }

    // Verify valid direction: origin must be visited before destination
    const allStops = [s.origin, ...(s.stops?.map(x => x.name) || []), s.destination];
    const origIdx = allStops.indexOf(origin);
    const destIdx = allStops.indexOf(destination);

    if (origIdx !== -1 && destIdx !== -1 && origIdx < destIdx) {
      const absDepM = toAbsoluteDayMinutes(depTime, currentMinutes);
      if (currentMinutes > 0 && absDepM < currentMinutes - PAST_DEPARTURE_TOLERANCE_MIN) {
        // Already departed in the past
        continue;
      }

      // Varış hesabı: süre = kalkış gününe göre mutlak dakika farkı
      let durationMin: number;
      if (arrTime) {
        let arrM = timeToMinutes(arrTime);
        // Gece yarısını aşan sefer: varış kalkıştan önceki saatte görünüyorsa ertesi güne aittir
        if (arrM < timeToMinutes(depTime)) arrM += MINUTES_PER_DAY;
        durationMin = arrM - timeToMinutes(depTime);
      } else {
        // Estimate approx travel time per hop
        durationMin = (destIdx - origIdx) * ESTIMATED_TRAVEL_MIN_PER_HOP;
      }
      const absArrM = absDepM + durationMin;

      results.push({
        type: "DIRECT",
        origin,
        destination,
        departureTime: depTime,
        arrivalTime: minutesToTime(absArrM),
        durationMinutes: durationMin,
        totalPrice: s.price || DEFAULT_TICKET_PRICE,
        legs: [
          {
            origin,
            destination,
            operator: s.operator,
            departureTime: depTime,
            arrivalTime: minutesToTime(absArrM),
            platform: s.platform || DEFAULT_PLATFORM,
            price: s.price || DEFAULT_TICKET_PRICE,
            tripId: s.id
          }
        ]
      });
    }
  }

  // 2. Find 1-TRANSFER trips if not enough direct routes or different regions
  // Common hub transfers: Büyükada, Kadıköy, Bostancı, Kabataş
  const transferHubs = ["Büyükada", "Kadıköy", "Bostancı", "Kabataş"];

  for (const hub of transferHubs) {
    if (hub === origin || hub === destination) continue;

    // Find leg 1: origin -> hub
    const leg1Options = schedules.filter(s => {
      const allStops = [s.origin, ...(s.stops?.map(x => x.name) || []), s.destination];
      const i1 = allStops.indexOf(origin);
      const i2 = allStops.indexOf(hub);
      return i1 !== -1 && i2 !== -1 && i1 < i2;
    });

    // Find leg 2: hub -> destination
    const leg2Options = schedules.filter(s => {
      const allStops = [s.origin, ...(s.stops?.map(x => x.name) || []), s.destination];
      const i1 = allStops.indexOf(hub);
      const i2 = allStops.indexOf(destination);
      return i1 !== -1 && i2 !== -1 && i1 < i2;
    });

    for (const l1 of leg1Options) {
      const l1DepM = toAbsoluteDayMinutes(l1.departureTime, currentMinutes);
      if (currentMinutes > 0 && l1DepM < currentMinutes - PAST_DEPARTURE_TOLERANCE_MIN) continue;

      const l1ArrM = l1DepM + TRANSFER_HUB_TRAVEL_MIN; // approx travel to hub
      const l1ArrTime = minutesToTime(l1ArrM);

      // Find compatible leg2 within the transfer wait window
      for (const l2 of leg2Options) {
        const l2DepM = toAbsoluteDayMinutes(l2.departureTime, currentMinutes);
        const waitMinutes = l2DepM - l1ArrM;

        if (waitMinutes >= TRANSFER_MIN_WAIT_MIN && waitMinutes <= TRANSFER_MAX_WAIT_MIN) {
          const l2ArrM = l2DepM + TRANSFER_HUB_TRAVEL_MIN;
          const l2ArrTime = minutesToTime(l2ArrM);

          results.push({
            type: "TRANSFER",
            origin,
            destination,
            departureTime: l1.departureTime,
            arrivalTime: l2ArrTime,
            durationMinutes: l2ArrM - l1DepM,
            transferPier: hub,
            transferWaitMinutes: waitMinutes,
            totalPrice: "₺90.00 (2 Bilet)",
            legs: [
              {
                origin,
                destination: hub,
                operator: l1.operator,
                departureTime: l1.departureTime,
                arrivalTime: l1ArrTime,
                platform: l1.platform || DEFAULT_PLATFORM,
                price: l1.price || DEFAULT_TICKET_PRICE,
                tripId: l1.id
              },
              {
                origin: hub,
                destination,
                operator: l2.operator,
                departureTime: l2.departureTime,
                arrivalTime: l2ArrTime,
                platform: l2.platform || "Aktarma Rıhtımı",
                price: l2.price || DEFAULT_TICKET_PRICE,
                tripId: l2.id
              }
            ]
          });
        }
      }
    }
  }

  // Sort: Direct routes first, then by earliest effective departure time
  // (gece yarısını aşan seferler akşam planlamasında en sona sıralanır)
  results.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "DIRECT" ? -1 : 1;
    }
    return toAbsoluteDayMinutes(a.departureTime, currentMinutes) - toAbsoluteDayMinutes(b.departureTime, currentMinutes);
  });

  return results.slice(0, MAX_ROUTE_RESULTS);
}
