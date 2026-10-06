"use client";

import { Wind, Waves, Compass, Eye, AlertTriangle, Info, ExternalLink, ShieldAlert } from "lucide-react";
import type { MarineWeatherStatus } from "@/lib/services/marine-weather";
import { calculateMaritimeLinesRisk } from "@/lib/services/marine-weather";

interface MarineWeatherSafetyCenterProps {
  weather?: MarineWeatherStatus | null;
}

export function MarineWeatherSafetyCenter({ weather }: MarineWeatherSafetyCenterProps) {
  const isStorm = weather?.isFerryDisruptionRisk || false;
  const lineRisks = calculateMaritimeLinesRisk(weather);

  return (
    <div className="px-3 py-3 max-w-4xl mx-auto space-y-4 animate-fadeIn pb-24">
      {/* Hero Marine Weather HUD */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0a1329] to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
              <Waves size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  BOĞAZ & MARMARA DENİZ METEOROLOJİSİ
                </h2>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                  CANLI AKIŞ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                İstanbul Boğazı ve Adalar hattı seyir emniyeti, dalga boyu ve akıntı raporu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-right">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Hava Durumu</span>
              <strong className="text-cyan-300 font-bold">{weather?.temperature ?? 19}°C • Açık</strong>
            </div>
          </div>
        </div>

        {/* Lodos Storm Warning */}
        {isStorm && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2.5 animate-pulse">
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <span>
              {weather?.alertTitle}: {weather?.alertDescription}
            </span>
          </div>
        )}

        {/* 4 Telemetry Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
              <Wind size={15} />
              <span>Rüzgar & Şiddet</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono">
              {weather?.windSpeedKnots ?? 12} Knot
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather?.windName ?? "Poyraz (Kuzeydoğu)"}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
              <Waves size={15} />
              <span>Dalga Boyu</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono">
              {weather?.windSpeedKnots ? `${(weather.windSpeedKnots * 0.03).toFixed(1)} - ${(weather.windSpeedKnots * 0.05).toFixed(1)} m` : "0.2 - 0.4 m"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather?.windSpeedKnots && weather.windSpeedKnots > 18 ? "Çırpıntılı Dalga" : "Sakin Deniz"}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Compass size={15} />
              <span>Boğaz Akıntısı</span>
            </div>
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
              3.8 Knot
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Şeytan Akıntısı (Kandilli)
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <Eye size={15} />
              <span>Görüş Mesafesi</span>
            </div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
              {weather?.visibilityKm ?? 10} km
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather?.visibilityKm && weather.visibilityKm < 2 ? "⚠️ Sis Kısıtlaması" : "Açık Seyir"}
            </div>
          </div>
        </div>

        {/* ÖNERİ 3: DENİZ SUYU SICAKLIĞI & MÜSİLAJ / YOSUN SEYİR EMNİYETİ KARTI */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <Info size={14} className="text-cyan-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
              DENİZ DURUMU NOTU
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Deniz suyu sıcaklığı, tuzluluk ve biyolojik durum şu an canlı veri kaynağına bağlı değildir.
            Rüzgar (Şiddet/yön), görüş mesafesi ve dalga tahmini canlı Open-Meteo verisinden alınır;
            sefer iptal kararları daima Kıyı Emniyeti Genel Müdürlüğü ve İBB Şehir Hatları tarafından
            resmi duyuru ile yapılır.
          </p>
        </div>
      </div>

      {/* ÖNERİ 1: DİNAMİK BOĞAZ AKINTISI & DALGA ŞİDDETİNE BAĞLI SEFER İPTAL ERKEN UYARI RADARI */}
      <div className="bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-500 shrink-0" />
              <span>DİNAMİK SEFER İPTAL & METEOROLOJİK RİSK RADARI</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kandilli akıntısı, Lodos fırtınası ve açık deniz dalga yüksekliğine göre hat bazlı risk simülasyonu
            </p>
          </div>

          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
            KEGM & ŞEHİR HATLARI KRİTERLERİ
          </span>
        </div>

        {/* Hat Bazlı Risk Tablosu */}
        <div className="space-y-2.5">
          {lineRisks.map((item) => {
            const isHigh = item.riskLevel === "HIGH_RISK" || item.riskLevel === "CANCELLED_LIKELY";
            const isWarn = item.riskLevel === "ATTENTION";

            return (
              <div
                key={item.lineId}
                className={`p-3 rounded-xl border transition-all ${
                  isHigh
                    ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 shadow-xs"
                    : isWarn
                    ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50"
                    : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isHigh ? "bg-rose-500 animate-ping" : isWarn ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                      isHigh
                        ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                        : isWarn
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                    }`}>
                      {isHigh ? `⚠️ %${item.riskPercentage} İptal / Gecikme Riski` : isWarn ? `%${item.riskPercentage} Sallantı Uyarısı` : "✓ Açık & Emniyetli"}
                    </span>
                  </div>
                </div>

                {/* Telemetri barları */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                  <div>
                    <span className="font-semibold">Kritik Etken:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{item.criticalFactor}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Dalga:</span>{" "}
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{item.waveHeightM} m</span>
                    <span className="mx-1">•</span>
                    <span className="font-semibold">Akıntı:</span>{" "}
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{item.currentKnots} kt</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-[10px] text-slate-600 dark:text-slate-400 italic truncate">
                    {item.officialAdvisory}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resmi Teyit Uyarısı */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info size={13} className="text-blue-500 shrink-0" />
            <span>
              Resmi sefer iptal kararları Kıyı Emniyeti Genel Müdürlüğü ve İBB Şehir Hatları tarafından icra edilir.
            </span>
          </div>
          <a
            href="https://sehirhatlari.istanbul/tr/iptal-seferler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Resmi İptal Duyuruları</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
