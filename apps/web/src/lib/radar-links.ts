import { ISTANBUL_PIERS, PierLocation } from "./data/piers";

/**
 * Verilen iskele ismi için ISTANBUL_PIERS koordinatlarını bulur (büyük/küçük harf ve Türkçe karakter toleranslı)
 */
export function getPierCoordinates(pierName?: string): PierLocation {
  if (!pierName) {
    return ISTANBUL_PIERS["Kadıköy"];
  }

  const normalized = pierName.trim().toLowerCase();

  // 1. Tam veya parça eşleşme
  for (const [key, val] of Object.entries(ISTANBUL_PIERS)) {
    const keyNorm = key.toLowerCase();
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return val;
    }
  }

  // 2. Yaygın yazım biçimleri
  if (normalized.includes("bostan")) return ISTANBUL_PIERS["Bostancı"];
  if (normalized.includes("kinal") || normalized.includes("kınal")) return ISTANBUL_PIERS["Kınalıada"];
  if (normalized.includes("burgaz")) return ISTANBUL_PIERS["Burgazada"];
  if (normalized.includes("heybel")) return ISTANBUL_PIERS["Heybeliada"];
  if (normalized.includes("buyuk") || normalized.includes("büyük")) return ISTANBUL_PIERS["Büyükada"];
  if (normalized.includes("kabat")) return ISTANBUL_PIERS["Kabataş"];
  if (normalized.includes("kadik") || normalized.includes("kadık")) return ISTANBUL_PIERS["Kadıköy"];
  if (normalized.includes("emino") || normalized.includes("eminö")) return ISTANBUL_PIERS["Eminönü"];
  if (normalized.includes("besik") || normalized.includes("beşik")) return ISTANBUL_PIERS["Beşiktaş"];
  if (normalized.includes("uskud") || normalized.includes("üsküd")) return ISTANBUL_PIERS["Üsküdar"];
  if (normalized.includes("karak")) return ISTANBUL_PIERS["Karaköy"];
  if (normalized.includes("kartal")) return ISTANBUL_PIERS["Kartal"];
  if (normalized.includes("maltep")) return ISTANBUL_PIERS["Maltepe"];

  return ISTANBUL_PIERS["Kadıköy"];
}

export interface RadarUrlConfig {
  origin?: string;
  destination?: string;
  zoom?: number;
}

/**
 * Seferin kalkış iskelesine veya güzergâh merkezine odaklı canlı MarineTraffic harita bağlantısı üretir.
 */
export function getDynamicMarineTrafficUrl({ origin, destination, zoom = 15 }: RadarUrlConfig): string {
  const originPier = getPierCoordinates(origin);
  
  // Eğer hem kalkış hem varış varsa orta noktayı hesaplayabiliriz
  if (destination) {
    const destPier = getPierCoordinates(destination);
    const midLat = (originPier.lat + destPier.lat) / 2;
    const midLng = (originPier.lng + destPier.lng) / 2;
    // Rota koridoru için zoom 13-14 daha uygundur
    const routeZoom = zoom > 14 ? 13 : zoom;
    return `https://www.marinetraffic.com/en/ais/home/centerx:${midLng.toFixed(4)}/centery:${midLat.toFixed(4)}/zoom:${routeZoom}`;
  }

  // Sadece kalkış iskelesi rıhtımı (yakın çekim zoom 15-16)
  return `https://www.marinetraffic.com/en/ais/home/centerx:${originPier.lng.toFixed(4)}/centery:${originPier.lat.toFixed(4)}/zoom:${zoom}`;
}

/**
 * Seferin kalkış iskelesine odaklı canlı VesselFinder harita bağlantısı üretir.
 */
export function getDynamicVesselFinderUrl({ origin, destination, zoom = 15 }: RadarUrlConfig): string {
  const originPier = getPierCoordinates(origin);

  if (destination) {
    const destPier = getPierCoordinates(destination);
    const midLat = (originPier.lat + destPier.lat) / 2;
    const midLng = (originPier.lng + destPier.lng) / 2;
    const routeZoom = zoom > 14 ? 13 : zoom;
    return `https://www.vesselfinder.com/?ll=${midLat.toFixed(4)},${midLng.toFixed(4)}&zoom=${routeZoom}`;
  }

  return `https://www.vesselfinder.com/?ll=${originPier.lat.toFixed(4)},${originPier.lng.toFixed(4)}&zoom=${zoom}`;
}
