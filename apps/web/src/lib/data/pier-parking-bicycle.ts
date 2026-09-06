export interface PierParkingInfo {
  isparkName: string;
  capacityTotal: number;
  availableSpots: number;
  walkDistanceMeters: number;
  walkMinutes: number;
  pricingPerHour: string;
  hasElectricCharging: boolean;
  hasDisabledSpots: boolean;
}

export interface PierBicycleInfo {
  isbikeStationName: string;
  totalDocks: number;
  availableBikes: number;
  availableEmptyDocks: number;
  isFreeFerryTransfer: boolean;
}

export interface PierMobilityHub {
  pierName: string;
  parking: PierParkingInfo;
  bicycle: PierBicycleInfo;
}

/**
 * İskele bazlı resmi İSPARK ve İSBİKE tesisleri ve gerçekçi doluluk modeli
 */
export const PIER_MOBILITY_DATA: Record<string, PierMobilityHub> = {
  "Kadıköy": {
    pierName: "Kadıköy İskelesi",
    parking: {
      isparkName: "Kadıköy Rıhtım Açık Otoparkı",
      capacityTotal: 450,
      availableSpots: 68,
      walkDistanceMeters: 80,
      walkMinutes: 1,
      pricingPerHour: "52 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Kadıköy İskele Meydanı İSBİKE",
      totalDocks: 24,
      availableBikes: 11,
      availableEmptyDocks: 13,
      isFreeFerryTransfer: true
    }
  },
  "Bostancı": {
    pierName: "Bostancı İskelesi",
    parking: {
      isparkName: "Bostancı İDO Katlı Otoparkı",
      capacityTotal: 720,
      availableSpots: 142,
      walkDistanceMeters: 50,
      walkMinutes: 1,
      pricingPerHour: "52 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Bostancı Sahil İskelesi İSBİKE",
      totalDocks: 20,
      availableBikes: 8,
      availableEmptyDocks: 12,
      isFreeFerryTransfer: true
    }
  },
  "Kabataş": {
    pierName: "Kabataş İskelesi",
    parking: {
      isparkName: "Kabataş Transfer Merkezi Yeraltı Otoparkı",
      capacityTotal: 600,
      availableSpots: 215,
      walkDistanceMeters: 40,
      walkMinutes: 1,
      pricingPerHour: "70 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Kabataş Parkı İSBİKE",
      totalDocks: 18,
      availableBikes: 9,
      availableEmptyDocks: 9,
      isFreeFerryTransfer: true
    }
  },
  "Karaköy": {
    pierName: "Karaköy İskelesi",
    parking: {
      isparkName: "Karaköy Katlı Otoparkı & Galataport",
      capacityTotal: 550,
      availableSpots: 84,
      walkDistanceMeters: 140,
      walkMinutes: 2,
      pricingPerHour: "70 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Karaköy Rıhtım İSBİKE",
      totalDocks: 14,
      availableBikes: 5,
      availableEmptyDocks: 9,
      isFreeFerryTransfer: true
    }
  },
  "Eminönü": {
    pierName: "Eminönü İskelesi",
    parking: {
      isparkName: "Eminönü Zemin Altı Otoparkı",
      capacityTotal: 320,
      availableSpots: 42,
      walkDistanceMeters: 120,
      walkMinutes: 2,
      pricingPerHour: "70 ₺ / saat",
      hasElectricCharging: false,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Eminönü Meydan İSBİKE",
      totalDocks: 20,
      availableBikes: 7,
      availableEmptyDocks: 13,
      isFreeFerryTransfer: true
    }
  },
  "Üsküdar": {
    pierName: "Üsküdar İskelesi",
    parking: {
      isparkName: "Üsküdar Meydan Katlı Otoparkı",
      capacityTotal: 900,
      availableSpots: 280,
      walkDistanceMeters: 60,
      walkMinutes: 1,
      pricingPerHour: "52 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Üsküdar Sahil İSBİKE",
      totalDocks: 20,
      availableBikes: 12,
      availableEmptyDocks: 8,
      isFreeFerryTransfer: true
    }
  },
  "Beşiktaş": {
    pierName: "Beşiktaş İskelesi",
    parking: {
      isparkName: "Beşiktaş Meydan & Barbaros Otoparkı",
      capacityTotal: 380,
      availableSpots: 55,
      walkDistanceMeters: 90,
      walkMinutes: 1,
      pricingPerHour: "70 ₺ / saat",
      hasElectricCharging: true,
      hasDisabledSpots: true
    },
    bicycle: {
      isbikeStationName: "Beşiktaş İskele İSBİKE",
      totalDocks: 16,
      availableBikes: 6,
      availableEmptyDocks: 10,
      isFreeFerryTransfer: true
    }
  }
};

export function getPierMobility(pierName: string): PierMobilityHub | null {
  for (const [key, hub] of Object.entries(PIER_MOBILITY_DATA)) {
    if (pierName.toLowerCase().includes(key.toLowerCase())) {
      return hub;
    }
  }
  return null;
}
