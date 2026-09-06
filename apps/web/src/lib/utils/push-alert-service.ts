import { playStrandedEmergencySiren } from "./sound";

export interface PushAlertConfig {
  permission: NotificationPermission;
  isSubscribed: boolean;
}

export function isPushNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestDisruptionNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  } catch (err) {
    console.warn("Notification request failed:", err);
    return false;
  }
}

/**
 * Resmi Sefer İptali veya Liman Başkanlığı Fırtına Alarmı Bildirimi Fırlatır
 */
export function triggerCancellationPushAlert(routeTitle: string, reason: string, soundAlarm: boolean = true) {
  if (typeof window === "undefined") return;

  // 1. Donanımsal Titreşim (Mobil)
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate([500, 150, 500, 150, 800]);
    } catch (e) {}
  }

  // 2. Çift Tonlu Kesik Acil Durum Denizci Sireni
  if (soundAlarm) {
    try {
      playStrandedEmergencySiren();
    } catch (e) {}
  }

  // 3. Tarayıcı / Sistem Push Bildirimi
  if (isPushNotificationSupported() && Notification.permission === "granted") {
    try {
      new Notification(`🚨 SEFER İPTAL UYARISI: ${routeTitle}`, {
        body: `Resmi Duyuru: ${reason}\nAlternatif ulaşım için vapur asistanını açın.`,
        icon: "/favicon.ico",
        tag: `disruption-${routeTitle}-${Date.now()}`
      });
    } catch (err) {
      console.warn("Push trigger failed:", err);
    }
  }
}