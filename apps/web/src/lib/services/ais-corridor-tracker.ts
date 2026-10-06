/**
 * Estimated Voyage-Phase & Route-Progress Model
 *
 * DİKKAT: Bu modül GERÇEK ZAMANLI AIS (Otomatik Tanımlama Sistemi) verisi kullanmaz.
 * Canlı uydu/radar bağlantısı olmadığı için gemi hareketi, sefer tarifesi saatine dayalı
 * deterministik bir TAHMİN modeliyle üretilir:
 *   1. Tarifedeki kalkış anı (T_dep) → faz (rıhtım / kalkış / seyir / varış)
 *   2. İskeleler arası mesafe ve ortalama ~18.5 km/s hız → tahmini ilerleme ve ETA
 *
 * Bu model KULLANICIYI YANILTMAZ: arayüz her yerde bu göstergeleri "tahmini" olarak etiketler.
 * Gerçek AIS verisi bir kaynaktan bağlandığında `isVerified: true` dönülerek arayüz
 * doğrudan "canlı" moda geçebilir.
 */

import { ISTANBUL_FERRY_FLEET } from "@/lib/agents/fleet-registry";
import { PIER_GEO_COORDINATES, calculateDistanceKm } from "@/lib/data/piers";

export function calculateBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

export type AisMatchStatus =
  | "WAITING_DEPARTURE"     // İskelede bağlı, kalkış saati bekleniyor
  | "CASTING_OFF"          // Kalkış anı: Palamarlar çözüldü, hız artıyor
  | "CONFIRMED_EN_ROUTE"   // Seyirde: tarife saatine göre rota koridorunda ilerliyor (tahmini)
  | "COURSE_DEVIATION"     // Rotadan saptı (şu anda tahmin modelinde tetiklenmez)
  | "ARRIVED_MOORED";      // Varış iskelesine yanaştı

export interface CorrelatedAisResult {
  vesselName: string;
  mmsi: string;
  callSign?: string;
  operator: string;
  status: AisMatchStatus;
  statusLabel: string;
  badgeColor: string;
  isVerified: boolean;
  speedKnots: number;
  headingDeg: number;
  bearingDeg: number;
  corridorMatchScore: number; // 0 - 100
  progressPercent: number;    // 0 - 100
  currentCoordinates: { lat: number; lng: number };
  distanceRemainingKm: number;
  etaMinutes: number;
  explanation: string;
}

/**
 * Tarife saatine göre TAHMİNİ sefer fazı ve ilerleme üretir.
 * `isVerified` her zaman `false` döner; bu bir canlı doğrulama DEĞİLDİR.
 */
export function correlateAisVessel(
  origin: string,
  destination: string,
  departureTime: string,
  targetTimeIso?: string,
  nowMs: number = Date.now()
): CorrelatedAisResult {
  const origCoords = PIER_GEO_COORDINATES[origin] || { lat: 41.0186, lng: 28.9739, label: origin };
  const destCoords = PIER_GEO_COORDINATES[destination] || { lat: 40.9908, lng: 29.0225, label: destination };

  const corridorBearing = Math.round(calculateBearingDeg(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng));
  const totalDistanceKm = calculateDistanceKm(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng);

  // Parse departure time
  let depTimestampMs = nowMs;
  if (targetTimeIso) {
    depTimestampMs = new Date(targetTimeIso).getTime();
  } else if (departureTime) {
    const [h, m] = departureTime.split(":").map(Number);
    const d = new Date(nowMs);
    d.setHours(h, m, 0, 0);
    depTimestampMs = d.getTime();
  }

  const diffSec = Math.floor((nowMs - depTimestampMs) / 1000);

  // Deterministik "temsili" filo seçimi (gereksiz filtreyi korur, canlı GEMİ VERİSİ DEĞİLDİR)
  const fleetMatches = ISTANBUL_FERRY_FLEET.filter((v) => {
    return v.assignedLines.some((l) => l.includes(origin) || l.includes(destination));
  });
  const candidatePool = fleetMatches.length > 0 ? fleetMatches : ISTANBUL_FERRY_FLEET.slice(0, 8);
  const hash = Math.abs((origin.charCodeAt(0) * 31 + destination.charCodeAt(0) * 17 + depTimestampMs / 60000) % candidatePool.length);
  const assigned = candidatePool[Math.floor(hash)] || candidatePool[0];

  // Estimated cruise duration in seconds (based on distance: average 10 knots = ~18.5 km/h)
  const estTripDurationSec = Math.max(900, Math.round((totalDistanceKm / 18.5) * 3600));

  if (diffSec < -120) {
    // Over 2 minutes before departure: Vessel will be moored at berth (tahmini)
    return {
      vesselName: assigned.name,
      mmsi: assigned.mmsi,
      callSign: assigned.callSign,
      operator: assigned.operator,
      status: "WAITING_DEPARTURE",
      statusLabel: "Rıhtımda • Kalkış bekleniyor (tahmini)",
      badgeColor: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      isVerified: false,
      speedKnots: 0,
      headingDeg: corridorBearing,
      bearingDeg: corridorBearing,
      corridorMatchScore: 100,
      progressPercent: 0,
      currentCoordinates: { lat: origCoords.lat, lng: origCoords.lng },
      distanceRemainingKm: totalDistanceKm,
      etaMinutes: Math.round(estTripDurationSec / 60),
      explanation: "Sefer tarifeye göre iskelede bekliyor. Canlı AIS doğrulaması şu an bağlı değil; bu tahmini bir durumdur."
    };
  } else if (diffSec >= -120 && diffSec < 60) {
    // 2 min before to 1 min after: Casting off / Maneuvering out of berth (tahmini)
    return {
      vesselName: assigned.name,
      mmsi: assigned.mmsi,
      callSign: assigned.callSign,
      operator: assigned.operator,
      status: "CASTING_OFF",
      statusLabel: "Kalkış anı • Hareket başladı (tahmini)",
      badgeColor: "bg-amber-500 text-slate-950 font-black",
      isVerified: false,
      speedKnots: 0.5,
      headingDeg: corridorBearing,
      bearingDeg: corridorBearing,
      corridorMatchScore: 98,
      progressPercent: 2,
      currentCoordinates: {
        lat: origCoords.lat + (destCoords.lat - origCoords.lat) * 0.03,
        lng: origCoords.lng + (destCoords.lng - origCoords.lng) * 0.03
      },
      distanceRemainingKm: Math.max(0.1, totalDistanceKm * 0.97),
      etaMinutes: Math.round(estTripDurationSec / 60),
      explanation: "Tarife saati geldiğinden iskeleden ayrıldığı varsayılıyor. Canlı AIS doğrulaması şu an bağlı değil."
    };
  } else if (diffSec >= 60 && diffSec < estTripDurationSec) {
    // En route in corridor (tahmini)
    const progress = Math.min(0.98, Math.max(0.05, diffSec / estTripDurationSec));
    const currentLat = origCoords.lat + (destCoords.lat - origCoords.lat) * progress;
    const currentLng = origCoords.lng + (destCoords.lng - origCoords.lng) * progress;
    const remainingKm = Math.max(0.1, totalDistanceKm * (1 - progress));
    const etaMin = Math.max(1, Math.round(((estTripDurationSec - diffSec) / 60)));

    return {
      vesselName: assigned.name,
      mmsi: assigned.mmsi,
      callSign: assigned.callSign,
      operator: assigned.operator,
      status: "CONFIRMED_EN_ROUTE",
      statusLabel: "Seyirde (tahmini)",
      badgeColor: "bg-emerald-600 text-white font-black",
      isVerified: false,
      speedKnots: 12.8,
      headingDeg: corridorBearing,
      bearingDeg: corridorBearing,
      corridorMatchScore: 99,
      progressPercent: Math.round(progress * 100),
      currentCoordinates: { lat: currentLat, lng: currentLng },
      distanceRemainingKm: Number(remainingKm.toFixed(1)),
      etaMinutes: etaMin,
      explanation: "Tarife saatine göre vapurun rota koridorunda ilerlediği tahmin ediliyor. Canlı AIS doğrulaması şu an bağlı değil."
    };
  } else {
    // Arrived at destination
    return {
      vesselName: assigned.name,
      mmsi: assigned.mmsi,
      callSign: assigned.callSign,
      operator: assigned.operator,
      status: "ARRIVED_MOORED",
      statusLabel: "Varış iskelesine yanaştı (tahmini)",
      badgeColor: "bg-blue-600 text-white font-black",
      isVerified: false,
      speedKnots: 0,
      headingDeg: corridorBearing,
      bearingDeg: corridorBearing,
      corridorMatchScore: 100,
      progressPercent: 100,
      currentCoordinates: { lat: destCoords.lat, lng: destCoords.lng },
      distanceRemainingKm: 0,
      etaMinutes: 0,
      explanation: "Tarife süresi dolduğundan vapurun varış iskelesinde olduğu varsayılıyor. Canlı AIS doğrulaması şu an bağlı değil."
    };
  }
}
