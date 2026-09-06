/**
 * Official Istanbul Metropolitan Municipality (IBB) Sea Taxi Tariff & Network
 * Verified by official UKOME transportation coordination decisions (2026).
 */

export interface SeaTaxiPierRoute {
  origin: string;
  destination: string;
  nauticalMiles: number;
  estimatedMinutes: number;
}

export const SEA_TAXI_OFFICIAL_TARIFF = {
  baseFare: 500, // 2026 UKOME Resmi Açılış Ücreti (TL)
  perMileFare: 750, // 2026 UKOME Deniz Mili Başı Ücreti (TL)
  maxCapacity: 10, // Maksimum yolcu kapasitesi (Hibrit Deniz Taksi)
  legalCitation: "İBB UKOME 2026 Resmi Deniz Taksi Tebliği",
  appUrl: "https://deniztaksi.ibb.gov.tr/",
  callCenter: "153"
};

export const COMMON_SEA_TAXI_ROUTES: SeaTaxiPierRoute[] = [
  { origin: "Kadıköy", destination: "Karaköy", nauticalMiles: 2.4, estimatedMinutes: 10 },
  { origin: "Kadıköy", destination: "Beşiktaş", nauticalMiles: 2.8, estimatedMinutes: 12 },
  { origin: "Kadıköy", destination: "Eminönü", nauticalMiles: 2.5, estimatedMinutes: 11 },
  { origin: "Kadıköy", destination: "Kabataş", nauticalMiles: 2.6, estimatedMinutes: 11 },
  { origin: "Beşiktaş", destination: "Üsküdar", nauticalMiles: 1.1, estimatedMinutes: 6 },
  { origin: "Beşiktaş", destination: "Kadıköy", nauticalMiles: 2.8, estimatedMinutes: 12 },
  { origin: "Üsküdar", destination: "Karaköy", nauticalMiles: 1.8, estimatedMinutes: 8 },
  { origin: "Üsküdar", destination: "Kabataş", nauticalMiles: 1.5, estimatedMinutes: 7 },
  { origin: "Bostancı", destination: "Büyükada", nauticalMiles: 4.1, estimatedMinutes: 15 },
  { origin: "Bostancı", destination: "Heybeliada", nauticalMiles: 3.5, estimatedMinutes: 14 },
  { origin: "Bostancı", destination: "Kınalıada", nauticalMiles: 3.2, estimatedMinutes: 12 },
  { origin: "Büyükada", destination: "Bostancı", nauticalMiles: 4.1, estimatedMinutes: 15 },
  { origin: "Kabataş", destination: "Büyükada", nauticalMiles: 10.5, estimatedMinutes: 30 },
  { origin: "Eminönü", destination: "Üsküdar", nauticalMiles: 1.9, estimatedMinutes: 8 },
  { origin: "Karaköy", destination: "Kadıköy", nauticalMiles: 2.4, estimatedMinutes: 10 }
];

export function calculateSeaTaxiFare(nauticalMiles: number, passengerCount: number = 1) {
  const totalBoatFare = Math.round(
    SEA_TAXI_OFFICIAL_TARIFF.baseFare + nauticalMiles * SEA_TAXI_OFFICIAL_TARIFF.perMileFare
  );
  const clampedPassengers = Math.max(1, Math.min(10, passengerCount));
  const perPersonFare = Math.round(totalBoatFare / clampedPassengers);

  return {
    totalBoatFare,
    perPersonFare,
    passengerCount: clampedPassengers,
    baseFare: SEA_TAXI_OFFICIAL_TARIFF.baseFare,
    mileCost: Math.round(nauticalMiles * SEA_TAXI_OFFICIAL_TARIFF.perMileFare)
  };
}

export function getSeaTaxiRoute(origin: string, destination: string): SeaTaxiPierRoute {
  const found = COMMON_SEA_TAXI_ROUTES.find(
    r =>
      (r.origin.toLowerCase().includes(origin.toLowerCase()) &&
        r.destination.toLowerCase().includes(destination.toLowerCase())) ||
      (r.origin.toLowerCase().includes(destination.toLowerCase()) &&
        r.destination.toLowerCase().includes(origin.toLowerCase()))
  );

  if (found) return found;

  // Fallback estimation: average 2.5 nautical miles across Bosphorus
  const isIsland = origin.includes("Ada") || destination.includes("Ada");
  return {
    origin,
    destination,
    nauticalMiles: isIsland ? 4.5 : 2.5,
    estimatedMinutes: isIsland ? 18 : 10
  };
}
