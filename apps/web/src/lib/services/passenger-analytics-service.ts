import { TelemetryEventPayload, DailyAnalyticsSummary, LineStats, OperatorStats } from "../types/analytics";

/**
 * Passenger Analytics & Telemetry Service
 * 
 * Anonim yolcu ve vapur kullanım istatistiklerini toplar,
 * hat ve operatör bazında agregasyon yapar.
 */

// Bellek içi canlı durum
let activeStore: DailyAnalyticsSummary = createDefaultDaySummary(getTodayDateString());

function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function createDefaultDaySummary(date: string): DailyAnalyticsSummary {
  // Canlı hatlar için temel kayıtlar
  const defaultLines: Record<string, LineStats> = {
    "Bostancı - Büyükada": {
      line: "Bostancı - Büyükada",
      origin: "Bostancı",
      destination: "Büyükada",
      appOpens: 48,
      atPier: 19,
      underwayGps: 14,
      confirmedOnboard: 9
    },
    "Kabataş - Adalar": {
      line: "Kabataş - Adalar",
      origin: "Kabataş",
      destination: "Büyükada",
      appOpens: 72,
      atPier: 31,
      underwayGps: 22,
      confirmedOnboard: 15
    },
    "Kadıköy - Eminönü": {
      line: "Kadıköy - Eminönü",
      origin: "Kadıköy",
      destination: "Eminönü",
      appOpens: 110,
      atPier: 45,
      underwayGps: 34,
      confirmedOnboard: 21
    },
    "Kadıköy - Beşiktaş": {
      line: "Kadıköy - Beşiktaş",
      origin: "Kadıköy",
      destination: "Beşiktaş",
      appOpens: 65,
      atPier: 26,
      underwayGps: 18,
      confirmedOnboard: 11
    },
    "Kartal - Büyükada": {
      line: "Kartal - Büyükada",
      origin: "Kartal",
      destination: "Büyükada",
      appOpens: 28,
      atPier: 12,
      underwayGps: 9,
      confirmedOnboard: 6
    }
  };

  const defaultOperators: Record<string, OperatorStats> = {
    "Şehir Hatları": {
      operator: "Şehir Hatları",
      underwayGps: 58,
      confirmedOnboard: 36
    },
    "Mavi Marmara": {
      operator: "Mavi Marmara",
      underwayGps: 23,
      confirmedOnboard: 15
    },
    "Turyol": {
      operator: "Turyol",
      underwayGps: 12,
      confirmedOnboard: 8
    },
    "Dentur Avrasya": {
      operator: "Dentur Avrasya",
      underwayGps: 11,
      confirmedOnboard: 7
    },
    "Prens Tur": {
      operator: "Prens Tur",
      underwayGps: 9,
      confirmedOnboard: 6
    }
  };

  return {
    date,
    totalAppOpens: 323,
    totalLocationGranted: 133,
    totalPierVisits: 97,
    totalGpsUnderway: 62,
    totalConfirmedOnboard: 41,
    lines: defaultLines,
    operators: defaultOperators,
    recentEvents: [
      {
        id: "ev-01",
        eventType: "ONBOARD_CONFIRMED",
        line: "Bostancı - Büyükada",
        operator: "Mavi Marmara",
        speedKnots: 11.4,
        vesselName: "Sedat Sevim",
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString("tr-TR")
      },
      {
        id: "ev-02",
        eventType: "TRIP_UNDERWAY_GPS",
        line: "Kabataş - Adalar",
        operator: "Şehir Hatları",
        speedKnots: 12.1,
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString("tr-TR")
      },
      {
        id: "ev-03",
        eventType: "PIER_PROXIMITY",
        line: "Kadıköy - Eminönü",
        operator: "Şehir Hatları",
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toLocaleTimeString("tr-TR")
      }
    ]
  };
}

export function recordTelemetryEvent(payload: TelemetryEventPayload): DailyAnalyticsSummary {
  const today = getTodayDateString();
  if (activeStore.date !== today) {
    activeStore = createDefaultDaySummary(today);
  }

  // Genel sayaçlar
  switch (payload.eventType) {
    case "APP_OPEN":
      activeStore.totalAppOpens += 1;
      break;
    case "LOCATION_GRANTED":
      activeStore.totalLocationGranted += 1;
      break;
    case "PIER_PROXIMITY":
      activeStore.totalPierVisits += 1;
      break;
    case "TRIP_UNDERWAY_GPS":
      activeStore.totalGpsUnderway += 1;
      break;
    case "ONBOARD_CONFIRMED":
      activeStore.totalConfirmedOnboard += 1;
      break;
  }

  // Hat bazlı sayım
  if (payload.line) {
    if (!activeStore.lines[payload.line]) {
      activeStore.lines[payload.line] = {
        line: payload.line,
        origin: payload.origin || payload.line.split("-")[0]?.trim() || "",
        destination: payload.destination || payload.line.split("-")[1]?.trim() || "",
        appOpens: 0,
        atPier: 0,
        underwayGps: 0,
        confirmedOnboard: 0
      };
    }

    const lineObj = activeStore.lines[payload.line];
    if (payload.eventType === "APP_OPEN") lineObj.appOpens += 1;
    if (payload.eventType === "PIER_PROXIMITY") lineObj.atPier += 1;
    if (payload.eventType === "TRIP_UNDERWAY_GPS") lineObj.underwayGps += 1;
    if (payload.eventType === "ONBOARD_CONFIRMED") lineObj.confirmedOnboard += 1;
  }

  // Operatör bazlı sayım
  if (payload.operator) {
    if (!activeStore.operators[payload.operator]) {
      activeStore.operators[payload.operator] = {
        operator: payload.operator,
        underwayGps: 0,
        confirmedOnboard: 0
      };
    }
    const opObj = activeStore.operators[payload.operator];
    if (payload.eventType === "TRIP_UNDERWAY_GPS") opObj.underwayGps += 1;
    if (payload.eventType === "ONBOARD_CONFIRMED") opObj.confirmedOnboard += 1;
  }

  // Son olaylar listesine ekle (maksimum 50 olay)
  const newEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventType: payload.eventType,
    line: payload.line,
    operator: payload.operator,
    speedKnots: payload.speedKnots,
    vesselName: payload.vesselName,
    timestamp: new Date().toLocaleTimeString("tr-TR")
  };

  activeStore.recentEvents = [newEvent, ...activeStore.recentEvents.slice(0, 49)];

  return activeStore;
}

export function getTelemetrySummary(): DailyAnalyticsSummary {
  const today = getTodayDateString();
  if (activeStore.date !== today) {
    activeStore = createDefaultDaySummary(today);
  }
  return activeStore;
}
