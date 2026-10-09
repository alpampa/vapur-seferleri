import { describe, it, expect } from "vitest";
import { getPierCoordinates, getDynamicMarineTrafficUrl, getDynamicVesselFinderUrl } from "../../radar-links";
import { verifyOnboardTelemetry } from "../passenger-telemetry-agent";

describe("Radar Links and Pier Coordinate Resolver", () => {
  it("resolves Bostancı pier coordinates correctly", () => {
    const pier = getPierCoordinates("Bostancı");
    expect(pier.name).toBe("Bostancı");
    expect(pier.lat).toBeCloseTo(40.9525, 3);
    expect(pier.lng).toBeCloseTo(29.0944, 3);
  });

  it("handles case-insensitive and partial pier names", () => {
    const pier = getPierCoordinates("bostanci iskelesi");
    expect(pier.name).toBe("Bostancı");

    const buyukada = getPierCoordinates("Büyükada İskelesi");
    expect(buyukada.name).toBe("Büyükada");
  });

  it("generates pier-focused MarineTraffic URL", () => {
    const url = getDynamicMarineTrafficUrl({ origin: "Bostancı", zoom: 15 });
    expect(url).toContain("marinetraffic.com/en/ais/home");
    expect(url).toContain("centerx:29.0944");
    expect(url).toContain("centery:40.9525");
    expect(url).toContain("zoom:15");
  });

  it("generates route corridor MarineTraffic URL with midpoint", () => {
    const url = getDynamicMarineTrafficUrl({ origin: "Bostancı", destination: "Büyükada", zoom: 14 });
    expect(url).toContain("marinetraffic.com/en/ais/home");
    // Midpoint between Bostancı (40.9525, 29.0944) and Büyükada (40.8744, 29.1283)
    expect(url).toContain("centerx:29.1114");
    expect(url).toMatch(/centery:40\.913[45]/);
  });

  it("generates VesselFinder URL", () => {
    const url = getDynamicVesselFinderUrl({ origin: "Bostancı", zoom: 15 });
    expect(url).toContain("vesselfinder.com/?ll=40.9525,29.0944&zoom=15");
  });
});

describe("Passenger Telemetry Cross-Verification Agent", () => {
  const trip = {
    origin: "Bostancı",
    destination: "Büyükada",
    operator: "Mavi Marmara",
    departureTime: "14:30"
  };

  it("detects passenger waiting at pier when stationary", () => {
    const result = verifyOnboardTelemetry(
      {
        latitude: 40.9526,
        longitude: 29.0945,
        speedMps: 0.2, // ~0.4 knots
        headingDeg: 45
      },
      trip
    );

    expect(result.status).toBe("AT_PIER");
    expect(result.isConfirmed).toBe(false);
    expect(result.summaryText).toContain("Bostancı İskelesi rıhtımındasınız");
  });

  it("confirms underway voyage when passenger is moving in maritime corridor", () => {
    // Coordinate midway between Bostancı and Büyükada on the water
    const result = verifyOnboardTelemetry(
      {
        latitude: 40.9135,
        longitude: 29.1114,
        speedMps: 5.8, // ~11.3 knots
        headingDeg: 165
      },
      trip
    );

    expect(result.status).toBe("CONFIRMED_ONBOARD");
    expect(result.isConfirmed).toBe(true);
    expect(result.confidenceScore).toBe(98);
    expect(result.currentSpeedKnots).toBeCloseTo(11.3, 1);
    expect(result.matchedVessel).toBeDefined();
    expect(result.matchedVessel?.operator).toContain("Mavi Marmara");
    expect(result.etaMinutes).toBeGreaterThan(0);
    expect(result.summaryText).toContain("Gemide seyir halindesiniz");
  });

  it("rejects locations far outside the maritime corridor", () => {
    // Coordinate in Kadıköy / Üsküdar or inland
    const result = verifyOnboardTelemetry(
      {
        latitude: 41.0200,
        longitude: 29.0100,
        speedMps: 6.0,
        headingDeg: 90
      },
      trip
    );

    expect(result.status).toBe("OUTSIDE_CORRIDOR");
    expect(result.isConfirmed).toBe(false);
    expect(result.summaryText).toContain("deniz koridorunun");
  });

  it("rejects stationary locations not at pier", () => {
    // On land and not moving
    const result = verifyOnboardTelemetry(
      {
        latitude: 40.9400,
        longitude: 29.1000,
        speedMps: 0.1,
        headingDeg: 0
      },
      trip
    );

    expect(result.status).toBe("STATIONARY_ON_LAND");
    expect(result.isConfirmed).toBe(false);
    expect(result.summaryText).toContain("deniz seyri için düşük");
  });
});
