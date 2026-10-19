"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { TopBar } from "@/components/navigation/TopBar";
import { FavoritesList } from "@/components/profile/FavoritesList";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import {
  isPushNotificationSupported,
  requestDisruptionNotificationPermission,
} from "@/lib/utils/push-alert-service";
import { purgeAllCachesAndReload } from "@/components/pwa/ServiceWorkerRegister";
import { CreditCard, Bell, Trash2, User } from "lucide-react";

type NotifPermission = NotificationPermission | "unsupported" | "unknown";

export default function ProfilePage() {
  const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = usePreferencesStore((s) => s.setNotificationsEnabled);
  const [permission, setPermission] = useState<NotifPermission>("unknown");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    // Tarayıcı API'sini efekt gövdesi dışında oku (SSR'da Notification yoktur).
    const id = window.setTimeout(() => {
      if (cancelled) return;
      if (!isPushNotificationSupported()) {
        setPermission("unsupported");
      } else {
        setPermission(Notification.permission);
        setNotificationsEnabled(Notification.permission === "granted");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [setNotificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (busy) return;
    if (permission === "unsupported") return;

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setNotice("");
      return;
    }

    setBusy(true);
    try {
      const granted = await requestDisruptionNotificationPermission();
      const current: NotifPermission = isPushNotificationSupported()
        ? Notification.permission
        : "unsupported";
      setPermission(current);
      setNotificationsEnabled(granted);
      setNotice(
        granted
          ? ""
          : "İzin verilmedi — tarayıcı bildirim ayarlarından engellenmiş olabilir."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClearData = () => {
    const confirmed =
      typeof window !== "undefined" &&
      window.confirm(
        "Bu cihazdaki tüm yerel veriler (favoriler, tercihler ve önbellek) silinecek. Devam edilsin mi?"
      );
    if (!confirmed) return;

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("vapur_")) keys.push(key);
      }
      keys.forEach((key) => localStorage.removeItem(key));
    } catch {
      /* localStorage erişilemezse yoksay */
    }

    purgeAllCachesAndReload();
  };

  const notifStatusText = (() => {
    if (notice) return notice;
    if (permission === "unsupported") return "Bu tarayıcı bildirimleri desteklemiyor";
    if (permission === "denied") return "Tarayıcı ayarlarından engellenmiş";
    if (notificationsEnabled && permission === "granted") return "Açık";
    return "Kapalı — açmak için dokunun";
  })();

  const notifSwitchOn = notificationsEnabled && permission === "granted";

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-[100px] px-5 pt-4">
        {/* Profile Header — dürüst yerel kullanıcı gösterimi (sahte hesap verisi yok) */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--primary-blue)] to-blue-300 p-1">
            <div className="w-full h-full bg-[#041225] rounded-full overflow-hidden flex items-center justify-center">
              <User className="text-white/70" size={34} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Misafir Kullanıcı</h1>
            <p className="text-white/50 text-sm mt-1">
              Verileriniz yalnızca bu cihazda (tarayıcıda) saklanır.
            </p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-[var(--card-bg)] border border-white/5 rounded-3xl overflow-hidden">
          {/* Bildirimler — GERÇEK: tarayıcı izni ister, tercihi kalıcı saklar */}
          <button
            type="button"
            role="switch"
            aria-checked={notifSwitchOn}
            aria-label="Sefer iptali bildirimleri"
            disabled={permission === "unsupported" || busy}
            onClick={handleToggleNotifications}
            className="w-full p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="text-white/70 shrink-0" size={20} />
              <div className="min-w-0">
                <span className="font-medium block">Notifications</span>
                <span className="text-xs text-white/40 block mt-0.5">{notifStatusText}</span>
              </div>
            </div>
            <span
              aria-hidden="true"
              className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                notifSwitchOn ? "bg-[var(--primary-blue)]" : "bg-white/15"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notifSwitchOn ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </button>

          {/* Ödeme — dürüst bilgi satırı (ödeme sistemi yok, tıklanabilir değil) */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <CreditCard className="text-white/40 shrink-0" size={20} />
              <div className="min-w-0">
                <span className="font-medium block text-white/70">Payment Methods</span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Kayıtlı ödeme yöntemi yok — uygulamada ödeme sistemi bulunmuyor.
                </span>
              </div>
            </div>
          </div>

          {/* Yerel verileri temizle — GERÇEK: favoriler/tercihler/önbellek silinir */}
          <button
            type="button"
            onClick={handleClearData}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Trash2 className="text-red-400 shrink-0" size={20} />
              <div className="min-w-0">
                <span className="font-medium text-red-400 block">Clear Local Data</span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Favoriler, tercihler ve önbellek bu cihazdan silinir.
                </span>
              </div>
            </div>
          </button>
        </div>

        <FavoritesList />
      </main>

      <BottomNav />
    </div>
  );
}
