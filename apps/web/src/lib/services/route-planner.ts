import type { ScheduleCardDto } from "@/app/page";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";

export interface PierLocation {
  name: string;
  lat: number;
  lng: number;
  region: "Anadolu" | "Avrupa" | "Adalar";
}

export const ISTANBUL_PIERS: Record<string, PierLocation> = {
  "Kabataş": { name: "Kabataş", lat: 41.0347, lng: 28.9903, region: "Avrupa" },
  "Kadıköy": { name: "Kadıköy", lat: 40.9908, lng: 29.0225, region: "Anadolu" },
  "Eminönü": { name: "Eminönü", lat: 41.0186, lng: 28.9739, region: "Avrupa" },
  "Beşiktaş": { name: "Beşiktaş", lat: 41.0422, lng: 29.0067, region: "Avrupa" },
  "Üsküdar": { name: "Üsküdar", lat: 41.0267, lng: 29.0156, region: "Anadolu" },
  "Bostancı": { name: "Bostancı", lat: 40.9525, lng: 29.0944, region: "Anadolu" },
  "Kartal": { name: "Kartal", lat: 40.8872, lng: 29.1864, region: "Anadolu" },
  "Maltepe": { name: "Maltepe", lat: 40.9231, lng: 29.1306, region: "Anadolu" },
  "Kınalıada": { name: "Kınalıada", lat: 40.9103, lng: 29.0522, region: "Adalar" },
  "Burgazada": { name: "Burgazada", lat: 40.8817, lng: 29.0700, region: "Adalar" },
  "Heybeliada": { name: "Heybeliada", lat: 40.8767, lng: 29.0992, region: "Adalar" },
  "Büyükada": { name: "Büyükada", lat: 40.8744, lng: 29.1283, region: "Adalar" }
};

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
  const normalized = ((mins % 1440) + 1440) % 1440;
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
    let arrTime = "12:00"; // fallback

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

    // Verify valid direction: origin must be visited before destination
    const allStops = [s.origin, ...(s.stops?.map(x => x.name) || []), s.destination];
    const origIdx = allStops.indexOf(origin);
    const destIdx = allStops.indexOf(destination);

    if (origIdx !== -1 && destIdx !== -1 && origIdx < destIdx) {
      const depM = timeToMinutes(depTime);
      if (currentMinutes > 0 && depM < currentMinutes - 5) {
        // Already departed in the past
        continue;
      }

      // Calculate arrival time if not explicit
      let arrM = timeToMinutes(arrTime);
      if (arrM <= depM) {
        // Estimate approx 25-45 mins depending on stop distance
        const hopCount = destIdx - origIdx;
        arrM = depM + hopCount * 20;
        arrTime = minutesToTime(arrM);
      }

      results.push({
        type: "DIRECT",
        origin,
        destination,
        departureTime: depTime,
        arrivalTime: arrTime,
        durationMinutes: arrM - depM,
        totalPrice: s.price || "₺45.00",
        legs: [
          {
            origin,
            destination,
            operator: s.operator,
            departureTime: depTime,
            arrivalTime: arrTime,
            platform: s.platform || "Ana Rıhtım",
            price: s.price || "₺45.00",
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
      const l1DepM = timeToMinutes(l1.departureTime);
      if (currentMinutes > 0 && l1DepM < currentMinutes - 5) continue;

      const l1ArrM = l1DepM + 35; // approx 35 mins to hub
      const l1ArrTime = minutesToTime(l1ArrM);

      // Find compatible leg2 where departure is between (l1ArrM + 10 mins) and (l1ArrM + 90 mins)
      for (const l2 of leg2Options) {
        const l2DepM = timeToMinutes(l2.departureTime);
        const waitMinutes = l2DepM - l1ArrM;

        if (waitMinutes >= 10 && waitMinutes <= 120) {
          const l2ArrM = l2DepM + 35;
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
                platform: l1.platform || "Ana Rıhtım",
                price: l1.price || "₺45.00",
                tripId: l1.id
              },
              {
                origin: hub,
                destination,
                operator: l2.operator,
                departureTime: l2.departureTime,
                arrivalTime: l2ArrTime,
                platform: l2.platform || "Aktarma Rıhtımı",
                price: l2.price || "₺45.00",
                tripId: l2.id
              }
            ]
          });
        }
      }
    }
  }

  // Sort: Direct routes first, then by earliest departure time
  results.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "DIRECT" ? -1 : 1;
    }
    return a.departureTime.localeCompare(b.departureTime);
  });

  return results.slice(0, 10);
}
