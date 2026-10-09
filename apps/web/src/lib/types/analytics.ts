export type TelemetryEventType =
  | "APP_OPEN"
  | "LOCATION_GRANTED"
  | "PIER_PROXIMITY"
  | "TRIP_UNDERWAY_GPS"
  | "ONBOARD_CONFIRMED"
  | "RADAR_CLICKED";

export interface TelemetryEventPayload {
  sessionId?: string;
  eventType: TelemetryEventType;
  line?: string;
  origin?: string;
  destination?: string;
  operator?: string;
  speedKnots?: number;
  headingDeg?: number;
  vesselName?: string;
  mmsi?: string;
  timestamp?: number;
}

export interface LineStats {
  line: string;
  origin: string;
  destination: string;
  appOpens: number;
  atPier: number;
  underwayGps: number;
  confirmedOnboard: number;
}

export interface OperatorStats {
  operator: string;
  underwayGps: number;
  confirmedOnboard: number;
}

export interface DailyAnalyticsSummary {
  date: string; // YYYY-MM-DD
  totalAppOpens: number;
  totalLocationGranted: number;
  totalPierVisits: number;
  totalGpsUnderway: number;
  totalConfirmedOnboard: number;
  lines: Record<string, LineStats>;
  operators: Record<string, OperatorStats>;
  recentEvents: {
    id: string;
    eventType: TelemetryEventType;
    line?: string;
    operator?: string;
    speedKnots?: number;
    vesselName?: string;
    timestamp: string;
  }[];
}
