import { describe, it, expect } from "vitest";
import { recordTelemetryEvent, getTelemetrySummary } from "../passenger-analytics-service";

describe("Passenger Analytics & Telemetry Service", () => {
  it("records APP_OPEN event and increments counter", () => {
    const before = getTelemetrySummary().totalAppOpens;
    const after = recordTelemetryEvent({ eventType: "APP_OPEN" });
    expect(after.totalAppOpens).toBe(before + 1);
  });

  it("records LOCATION_GRANTED event", () => {
    const before = getTelemetrySummary().totalLocationGranted;
    const after = recordTelemetryEvent({ eventType: "LOCATION_GRANTED" });
    expect(after.totalLocationGranted).toBe(before + 1);
  });

  it("records ONBOARD_CONFIRMED event with line, operator, and vessel", () => {
    const beforeConfirmed = getTelemetrySummary().totalConfirmedOnboard;
    const summary = recordTelemetryEvent({
      eventType: "ONBOARD_CONFIRMED",
      line: "Bostancı - Büyükada",
      operator: "Mavi Marmara",
      speedKnots: 11.4,
      vesselName: "Sedat Sevim",
      mmsi: "271001925"
    });

    expect(summary.totalConfirmedOnboard).toBe(beforeConfirmed + 1);
    expect(summary.lines["Bostancı - Büyükada"]).toBeDefined();
    expect(summary.lines["Bostancı - Büyükada"].confirmedOnboard).toBeGreaterThan(0);
    expect(summary.operators["Mavi Marmara"]).toBeDefined();

    // Check recent events list
    const latestEvent = summary.recentEvents[0];
    expect(latestEvent.eventType).toBe("ONBOARD_CONFIRMED");
    expect(latestEvent.line).toBe("Bostancı - Büyükada");
    expect(latestEvent.vesselName).toBe("Sedat Sevim");
  });

  it("handles new custom routes dynamically", () => {
    const summary = recordTelemetryEvent({
      eventType: "TRIP_UNDERWAY_GPS",
      line: "Yenikapı - Bandırma",
      operator: "İDO",
      speedKnots: 28.5
    });

    expect(summary.lines["Yenikapı - Bandırma"]).toBeDefined();
    expect(summary.lines["Yenikapı - Bandırma"].underwayGps).toBe(1);
    expect(summary.operators["İDO"]).toBeDefined();
    expect(summary.operators["İDO"].underwayGps).toBe(1);
  });
});
