/**
 * Dokunsal Geri Bildirim Yardımcısı (Web Vibration API & Haptic Feedback)
 * Mobil cihazlarda buton tıklamaları, filtre seçimleri ve alarm kurulumlarında
 * fiziksel onay hissi verir. Desteklenmeyen masaüstü tarayıcılarda sessizce geçilir.
 */

export type HapticIntensity = "light" | "medium" | "heavy" | "success" | "warning";

export function triggerHaptic(intensity: HapticIntensity = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (intensity) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(35);
        break;
      case "success":
        navigator.vibrate([15, 40, 20]);
        break;
      case "warning":
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(12);
        break;
    }
  } catch {
    // Vibration API engellenmiş veya kısıtlanmışsa sessizce yutulur
  }
}
