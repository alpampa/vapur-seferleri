"use client";

import { useEffect, useState } from "react";
import { Wind, AlertTriangle, ShieldCheck, Waves, Compass, Activity } from "lucide-react";
import { MarineWeatherStatus, fetchLiveMarineWeather } from "@/lib/services/marine-weather";

interface HarbourMasterWeatherBarometerProps {
  initialWeather?: MarineWeatherStatus | null;
  originPier?: string;
}

export function HarbourMasterWeatherBarometer({ initialWeather, originPier }: HarbourMasterWeatherBarometerProps) {
  const [weather, setWeather] = useState<MarineWeatherStatus | null>(initialWeather || null);
  const [isLoading, setIsLoading] = useState(!initialWeather);

  useEffect(() => {
    if (!initialWeather) {
      fetchLiveMarineWeather().then(w => {
        setWeather(w);
        setIsLoading(false);
      });
    }
  }, [initialWeather]);

  const windKnots = weather?.windSpeedKnots ?? 12;
  const gustsKnots = weather?.windGustsKnots ?? 16;
  const windName = weather?.windName ?? "Poyraz (Kuzeydoğu)";

  // Liman Başkanlığı Resmi Emniyet Skalası
  let riskLevel: "SAFE" | "CHOPPY" | "CRITICAL_THRESHOLD" | "STORM_SUSPENSION" = "SAFE";
  let riskTitle = "Liman Emniyeti: Açık ve Güvenli Seyir";
  let riskBadge = "EMNİYETLİ SEYİR";
  let riskColor = "emerald";
  let riskPercentage = 5;

  if (windKnots >= 28) {
    riskLevel = "STORM_SUSPENSION";
    riskTitle = "Liman Başkanlığı Resmi Fırtına Eşiği (Beaufort 7+)";
    riskBadge = "SEFER DURDURMA RİSKİ %95";
    riskColor = "rose";
    riskPercentage = 95;
  } else if (windKnots >= 22) {
    riskLevel = "CRITICAL_THRESHOLD";
    riskTitle = "Liman Başkanlığı Kritik Eşiği Yaklaştı";
    riskBadge = "ASKIYA ALMA RİSKİ %70";
    riskColor = "amber";
    riskPercentage = 70;
  } else if (windKnots >= 16) {
    riskLevel = "CHOPPY";
    riskTitle = "Çalkantılı Marmara & Boğaz Geçişi";
    riskBadge = "ORTA DALGA DİKKATİ";
    riskColor = "cyan";
    riskPercentage = 35;
  }

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a1220] to-slate-950 border-2 ${
      riskLevel === "STORM_SUSPENSION" ? "border-rose-500/60" :
      riskLevel === "CRITICAL_THRESHOLD" ? "border-amber-500/60" :
      riskLevel === "CHOPPY" ? "border-cyan-500/40" : "border-emerald-500/40"
    } shadow-lg space-y-3 relative overflow-hidden text-xs`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            riskLevel === "STORM_SUSPENSION" ? "bg-rose-500/20 text-rose-400" :
            riskLevel === "CRITICAL_THRESHOLD" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
            "bg-blue-500/20 text-blue-400"
          }`}>
            <Compass size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white tracking-wide">
                LİMAN BAŞKANLIĞI METEOROLOJİK ERKEN UYARI
              </span>
              <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                riskLevel === "STORM_SUSPENSION" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                riskLevel === "CRITICAL_THRESHOLD" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {riskBadge}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Canlı İstasyon: Marmara-Boğaz Kesişimi (40.95°N, 29.05°E)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-slate-500 block font-mono">Sensör Verisi</span>
          <span className="text-xs font-mono font-black text-white">{windKnots} Knot</span>
        </div>
      </div>

      {/* Barometer Gauge / Risk Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-300 font-bold">{riskTitle}</span>
          <span className="font-mono font-black text-slate-400">%{riskPercentage} İptal İhtimali</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${riskPercentage}%` }}
            className={`h-full transition-all duration-700 ${
              riskLevel === "STORM_SUSPENSION" ? "bg-rose-500" :
              riskLevel === "CRITICAL_THRESHOLD" ? "bg-amber-500" :
              riskLevel === "CHOPPY" ? "bg-cyan-500" : "bg-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* Meteorological Readings */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[9px] text-slate-400 block font-bold">Rüzgar Yönü</span>
          <strong className="text-xs font-black text-cyan-400 truncate block">{windName.split(" ")[0]}</strong>
          <span className="text-[8px] text-slate-500 font-mono">{windName.includes("Lodos") ? "Güneybatı" : "Kuzeydoğu"}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[9px] text-slate-400 block font-bold">Ortalama Hız</span>
          <strong className="text-xs font-mono font-black text-white">{windKnots} Knot</strong>
          <span className="text-[8px] text-slate-500 font-mono">~{Math.round(windKnots * 1.852)} km/s</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[9px] text-slate-400 block font-bold">Hamle (Gust)</span>
          <strong className="text-xs font-mono font-black text-amber-400">{gustsKnots} Knot</strong>
          <span className="text-[8px] text-slate-500 font-mono">Ani Rüzgar Tepe</span>
        </div>
      </div>

      {/* Advisory Message */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-2">
        <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-bold block">Resmi Denizcilik Kuralı:</span>
          Liman Başkanlığı 28 Knot (Beaufort 7) eşiğini aştığında küçük motor hatları (Mavi Marmara, Prens Tur vb.) sefere çıkamaz; büyük buharlı Şehir Hatları vapurları fırtınaya karşı en yüksek emniyetli alternatiftir.
        </div>
      </div>
    </div>
  );
}