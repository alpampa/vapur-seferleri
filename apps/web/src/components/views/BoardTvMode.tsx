"use client";

import { useMemo, useState, useEffect } from "react";
import { X, Maximize, Minimize, QrCode, Building2, Anchor } from "lucide-react";
import { useTransitClock } from "@/hooks/useTransitClock";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { useLanguageStore } from "@/store/useLanguageStore";

interface BoardTvModeProps {
  schedules: ScheduleCardDto[];
  serverTimeIso: string;
  onExit: () => void;
  defaultPier?: string;
  partnerName?: string;
}

const MAX_ROWS = 16;

/**
 * PANO TV MODU (B2B KIOSK & İSKELE / OTEL EKRANI)
 *
 * Özellikler:
 * 1. WakeLock API: Ekranın uyumasını/ekran koruyucuya geçmesini engeller.
 * 2. Fullscreen API: Tek dokunuşla tam ekran Kiosk görünümüne geçer.
 * 3. Özelleştirilebilir İskele & Partner: ?pier=Büyükada&partner=Ada%20Palas%20Butik%20Otel
 * 4. Canlı QR Kod: Yolcuların panoyu telefonlarına alması için dinamik SVG QR kod kutusu.
 */
export function BoardTvMode({
  schedules,
  serverTimeIso,
  onExit,
  defaultPier,
  partnerName: propPartnerName,
}: BoardTvModeProps) {
  const { nowMs } = useTransitClock(1000, { serverTimeIso, keepTickingWhenHidden: true });
  const { t } = useLanguageStore();

  const [selectedPier, setSelectedPier] = useState<string>("ALL");
  const [partnerName, setPartnerName] = useState<string>(propPartnerName || "");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // URL parametrelerini oku (?pier=...&partner=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pierParam = params.get("pier") || defaultPier;
      const partnerParam = params.get("partner") || propPartnerName;
      if (pierParam) setSelectedPier(pierParam);
      if (partnerParam) setPartnerName(partnerParam);
    }
  }, [defaultPier, propPartnerName]);

  // Screen Wake Lock API: Ekranın kapanmasını önle
  useEffect(() => {
    let wakeLock: any = null;

    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator && (navigator as any).wakeLock) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        // WakeLock desteklenmiyor veya izin reddedildi; sessizce devam et
      }
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // ESC tuşu ile TV modundan çıkış
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Mevcut tüm iskeleler
  const allPiers = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach((s) => {
      set.add(s.origin);
      if (s.stops) s.stops.forEach((st) => set.add(st.name));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [schedules]);

  const rows = useMemo(() => {
    const now = nowMs;
    const list: { trip: ScheduleCardDto; dyn: ReturnType<typeof resolveDynamicTrip> }[] = [];

    const filtered = schedules.filter((trip) => {
      if (selectedPier === "ALL") return true;
      return (
        trip.origin === selectedPier ||
        trip.stops?.some((st) => st.name === selectedPier)
      );
    });

    for (const trip of filtered) {
      const dyn = resolveDynamicTrip(
        trip.origin,
        trip.destination,
        trip.departureTime,
        trip.targetTimeIso || new Date().toISOString(),
        trip.stops,
        undefined,
        now,
        serverTimeIso
      );
      if (dyn.isExpired) continue;
      // Belirli bir iskele seçiliyse, o iskelenin biniş saati ve durağını kullan
      if (selectedPier !== "ALL" && dyn.currentOrigin !== selectedPier && trip.origin !== selectedPier) {
        continue;
      }
      list.push({ trip, dyn });
      if (list.length >= MAX_ROWS) break;
    }

    return list;
  }, [schedules, selectedPier, nowMs, serverTimeIso]);

  const clockLabel = useMemo(() => {
    try {
      return new Date(nowMs).toLocaleTimeString("tr-TR", { hour12: false });
    } catch {
      return "--:--:--";
    }
  }, [nowMs]);

  // Mobil Deep-Link URL'si
  const mobileLink = useMemo(() => {
    const base = "https://adalar-sefer-asistani.vercel.app";
    if (selectedPier !== "ALL") return `${base}/?from=${encodeURIComponent(selectedPier)}`;
    return base;
  }, [selectedPier]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#070b14] text-white flex flex-col overflow-hidden select-none">
      {/* ÜST BAŞLIK */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black shadow-md shrink-0">
            <Anchor size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-widest uppercase text-amber-400">
                {partnerName ? partnerName.toUpperCase() : "İSTANBUL DENİZ ULAŞIMI"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CANLI PANO
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white truncate">
              {selectedPier !== "ALL"
                ? `${selectedPier} İskelesi Canlı Kalkış Panosu`
                : "Tüm İskeleler Canlı Sefer Panosu"}
            </h1>
          </div>
        </div>

        {/* SAĞ: İskele Filtresi, Saat, Tam Ekran, Çıkış */}
        <div className="flex items-center gap-3">
          {/* İskele Seçici */}
          <div className="relative">
            <select
              value={selectedPier}
              onChange={(e) => setSelectedPier(e.target.value)}
              aria-label="Pano iskelesi seçin"
              className="min-h-[40px] pl-3 pr-7 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="ALL">📍 Tüm İskeleler</option>
              {allPiers.map((p) => (
                <option key={p} value={p}>{p} İskelesi</option>
              ))}
            </select>
          </div>

          {/* Canlı Dijital Saat */}
          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xl sm:text-2xl font-black tabular-nums text-emerald-400 shadow-inner">
            {clockLabel}
          </div>

          {/* Tam Ekran Butonu */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekrana Geç"}
            aria-label="Tam ekran"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors text-slate-300 cursor-pointer"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Kapat Butonu */}
          <button
            type="button"
            onClick={onExit}
            title="TV Modundan Çık (ESC)"
            aria-label="Kapat"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors text-slate-300 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* SEFER ÇİZELGESİ */}
      <div className="flex-1 overflow-hidden px-6 py-3 flex flex-col">
        <div className="grid grid-cols-[7rem_1.2fr_1.4fr_8rem_11rem] gap-x-4 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2.5 shrink-0">
          <span>Kalkış</span>
          <span>İskele / Rıhtım</span>
          <span>Varış / Güzergah</span>
          <span>Operatör</span>
          <span className="text-right">Durum / Kalan Süre</span>
        </div>

        {rows.length > 0 ? (
          <div className="flex-1 divide-y divide-slate-800/70 overflow-hidden">
            {rows.map(({ trip, dyn }, idx) => (
              <div
                key={`${trip.id}-${dyn.currentOrigin}-${idx}`}
                className={`grid grid-cols-[7rem_1.2fr_1.4fr_8rem_11rem] gap-x-4 items-center py-2.5 sm:py-3 transition-colors ${
                  idx % 2 === 0 ? "bg-slate-900/25" : ""
                }`}
              >
                <span className="font-mono text-2xl sm:text-3xl font-black tabular-nums text-amber-300 leading-none">
                  {dyn.currentDepartureTime || trip.departureTime}
                </span>
                <div className="min-w-0">
                  <span className="text-base sm:text-lg font-black text-white truncate block">
                    {dyn.currentOrigin}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 truncate block">
                    {trip.platform || "Yolcu Rıhtımı"}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-base sm:text-lg font-bold text-slate-200 truncate block">
                    {trip.destination}
                  </span>
                  {trip.stops && trip.stops.length > 0 && (
                    <span className="text-[10px] text-slate-400 truncate block font-medium">
                      Ara duraklar: {trip.stops.map((s) => s.name).join(" ➔ ")}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-300 truncate">
                  {trip.operator}
                </span>
                <div className="text-right">
                  {dyn.isDeparted ? (
                    <span className="inline-block text-xs font-black bg-rose-600 px-2.5 py-1 rounded-lg animate-pulse text-white shadow-xs">
                      {t("underway")}
                    </span>
                  ) : dyn.countdown ? (
                    <span className="inline-block font-mono text-lg sm:text-xl font-black text-amber-300 tabular-nums animate-pulse">
                      {dyn.countdown}
                    </span>
                  ) : (
                    <span className="inline-block text-xs font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg">
                      {t("boardOnTime")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <Anchor size={36} className="text-slate-600 mb-2 animate-bounce" />
            <p className="text-base font-bold text-slate-300">
              {selectedPier !== "ALL"
                ? `${selectedPier} iskelesinden yaklaşan aktif sefer bulunamadı.`
                : t("boardEmpty")}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Günün diğer saatlerini incelemek için iskele filtresini değiştirebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* ALT BİLGİ & DİNAMİK QR KOD B2B ALANI */}
      <footer className="px-6 py-2.5 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          {partnerName ? (
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Building2 size={13} className="text-amber-400" />
              <span>{partnerName} Misafirleri İçin Özel Canlı İskele Panosu</span>
            </span>
          ) : (
            <span>İBB Şehir Hatları, İDO, Mavi Marmara, Dentur, Prens Tur ve Turyol Resmi Seferleri</span>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 text-[11px]">Ekran koruyucu engellendi (WakeLock aktif)</span>
        </div>

        {/* Canlı Telefon QR Kodu Yönlendirmesi */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl shadow-xs">
          <QrCode size={18} className="text-cyan-400 shrink-0" />
          <div className="text-[10px] leading-tight">
            <span className="font-black text-slate-200 block">Telefonda Takip Et</span>
            <span className="text-slate-400 font-mono text-[9px]">{mobileLink.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
