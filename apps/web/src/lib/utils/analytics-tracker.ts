import { TelemetryEventType, TelemetryEventPayload } from "../types/analytics";

/**
 * Client-Side Anonymous Telemetry Tracker
 * 
 * Sıfır kişisel veri: Yalnızca anonim oturum ve kitle kullanım metrikleri gönderir.
 */

function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  try {
    let sid = sessionStorage.getItem("vapur_anon_sid");
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem("vapur_anon_sid", sid);
    }
    return sid;
  } catch (e) {
    return "fallback-sid";
  }
}

export function trackTelemetryEvent(
  eventType: TelemetryEventType,
  details: Omit<TelemetryEventPayload, "eventType" | "sessionId" | "timestamp"> = {}
) {
  if (typeof window === "undefined") return;

  const payload: TelemetryEventPayload = {
    sessionId: getAnonymousSessionId(),
    eventType,
    timestamp: Date.now(),
    ...details
  };

  try {
    // navigator.sendBeacon tercih edilir (sayfa kapansa bile gider)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/event", blob);
    } else {
      fetch("/api/telemetry/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {
    // Sessiz hata yakalama — kullanıcı deneyimini asla kesintiye uğratmaz
  }
}

/** Uygulama açılışını 1 kez kaydeder */
export function trackAppOpenOnce() {
  if (typeof window === "undefined") return;
  try {
    const hasReported = sessionStorage.getItem("vapur_app_open_reported");
    if (!hasReported) {
      trackTelemetryEvent("APP_OPEN");
      sessionStorage.setItem("vapur_app_open_reported", "1");
    }
  } catch (e) {}
}

/** Konum izni verildiğinde kaydeder */
export function trackLocationGranted() {
  trackTelemetryEvent("LOCATION_GRANTED");
}

/** Kullanıcı iskele rıhtımında tespit edildiğinde kaydeder */
export function trackPierProximity(pier: string, line?: string) {
  trackTelemetryEvent("PIER_PROXIMITY", { origin: pier, line });
}

/** Deniz üzerinde vapur hızında seyir tespit edildiğinde kaydeder */
export function trackGpsUnderway(line: string, operator?: string, speedKnots?: number) {
  trackTelemetryEvent("TRIP_UNDERWAY_GPS", { line, operator, speedKnots });
}

/** Kullanıcı 'Vapurdayım Doğrula' ile kesin onay verdiğinde kaydeder */
export function trackOnboardConfirmed(
  line: string,
  operator?: string,
  speedKnots?: number,
  vesselName?: string,
  mmsi?: string
) {
  trackTelemetryEvent("ONBOARD_CONFIRMED", {
    line,
    operator,
    speedKnots,
    vesselName,
    mmsi
  });
}

/** Radar tıklandığında kaydeder */
export function trackRadarClicked(line?: string, origin?: string) {
  trackTelemetryEvent("RADAR_CLICKED", { line, origin });
}
