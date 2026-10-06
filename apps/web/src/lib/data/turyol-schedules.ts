import { RawOfficialTrip } from "./official-schedules";
import rawTuryolData from "./turyol-scraped.json";

interface ScrapedRoute {
  mainHatTuruId: string;
  kalkisVal: string;
  varisId: string;
  origin: string;
  destination: string;
  category: "BOGAZ" | "ADALAR";
  times: string[];
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function getTuryolSchedules(): RawOfficialTrip[] {
  const trips: RawOfficialTrip[] = [];
  const routes = rawTuryolData as ScrapedRoute[];

  routes.forEach((route, rIdx) => {
    // Tekilleştir ve sırala
    const uniqueTimes = Array.from(new Set(route.times)).sort();

    uniqueTimes.forEach((depTime, tIdx) => {
      let estDurationMins = 20;
      if (route.category === "ADALAR") {
        if (route.destination === "Büyükada") estDurationMins = 70;
        else if (route.destination === "Heybeliada") estDurationMins = 55;
        else if (route.destination === "Kınalıada") estDurationMins = 40;
        else estDurationMins = 60;
      } else {
        if (route.origin === "Üsküdar" || route.destination === "Üsküdar") {
          estDurationMins = 15;
        } else {
          estDurationMins = 25;
        }
      }

      const arrTime = addMinutes(depTime, estDurationMins);
      const platform = `${route.origin} Turyol İskelesi`;
      const price = route.category === "ADALAR" ? "120 ₺" : "45 ₺";

      trips.push({
        id: `turyol-${route.origin.toLowerCase()}-${route.destination.toLowerCase()}-${rIdx}-${tIdx}`,
        origin: route.origin,
        destination: route.destination,
        operator: "Turyol",
        category: route.category,
        departureTime: depTime,
        arrivalTime: arrTime,
        platform,
        price,
        lineName: `Turyol ${route.origin} - ${route.destination} Hattı`,
      });
    });
  });

  return trips;
}
