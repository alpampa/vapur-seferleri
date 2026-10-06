/**
 * İstanbul iskeleleri — tek koordinat kaynağı.
 *
 * Daha önce üç ayrı kopyada yaşayan tablo burada birleştirildi:
 *   - route-planner        → ISTANBUL_PIERS (12 iskele, bölge bilgili)
 *   - ScheduleListClient   → PIER_COORDINATES (15 iskele)
 *   - ais-corridor-tracker → PIER_GEO_COORDINATES (19 iskele)
 * Koordinat değişikliği yalnızca bu dosyada yapılır.
 */

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
  "Karaköy": { name: "Karaköy", lat: 41.0222, lng: 28.9772, region: "Avrupa" },
  "Yenikapı": { name: "Yenikapı", lat: 41.0028, lng: 28.9567, region: "Avrupa" },
  "Bakırköy": { name: "Bakırköy", lat: 40.9722, lng: 28.8753, region: "Avrupa" },
  "Bostancı": { name: "Bostancı", lat: 40.9525, lng: 29.0944, region: "Anadolu" },
  "Kartal": { name: "Kartal", lat: 40.8872, lng: 29.1864, region: "Anadolu" },
  "Maltepe": { name: "Maltepe", lat: 40.9231, lng: 29.1306, region: "Anadolu" },
  "Sarıyer": { name: "Sarıyer", lat: 41.1685, lng: 29.0545, region: "Avrupa" },
  "Beykoz": { name: "Beykoz", lat: 41.1311, lng: 29.0911, region: "Anadolu" },
  "Çengelköy": { name: "Çengelköy", lat: 41.0505, lng: 29.0522, region: "Anadolu" },
  "Kınalıada": { name: "Kınalıada", lat: 40.9103, lng: 29.0522, region: "Adalar" },
  "Burgazada": { name: "Burgazada", lat: 40.8817, lng: 29.0700, region: "Adalar" },
  "Heybeliada": { name: "Heybeliada", lat: 40.8767, lng: 29.0992, region: "Adalar" },
  "Büyükada": { name: "Büyükada", lat: 40.8744, lng: 29.1283, region: "Adalar" }
};

export interface PierCoordinates {
  lat: number;
  lng: number;
  label: string;
}

/** Etiketli koordinat görünümü — ISTANBUL_PIERS'tan türetilir. */
export const PIER_GEO_COORDINATES: Record<string, PierCoordinates> = Object.fromEntries(
  Object.entries(ISTANBUL_PIERS).map(([name, p]) => [
    name,
    { lat: p.lat, lng: p.lng, label: `${name} İskelesi` }
  ])
);

/** İki nokta arası mesafe (km) — Haversine formülü. */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
