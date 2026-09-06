import { ShieldCheck, ExternalLink, Award, FileCheck2 } from "lucide-react";
import { OfficialFareInfo } from "@/lib/data/official-fares";

interface UkomeOfficialSealBadgeProps {
  fareInfo: OfficialFareInfo;
  origin: string;
  destination: string;
}

export function UkomeOfficialSealBadge({ fareInfo, origin, destination }: UkomeOfficialSealBadgeProps) {
  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-blue-950/30 border-2 border-emerald-500/40 text-xs space-y-2.5 shadow-md relative overflow-hidden">
      {/* Background Watermark Stamp */}
      <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-300 pointer-events-none select-none">
        <Award size={130} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileCheck2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white tracking-wide">
                T.C. İBB UKOME RESMİ TARİFE MÜHRÜ
              </span>
              <span className="text-[8px] font-mono font-black bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                2026/DENİZ ONAYLI
              </span>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-mono">
              Karar No: UKOME 2024/1-1 & 2026 Tebliği
            </span>
          </div>
        </div>

        <a
          href={fareInfo.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-all shrink-0"
          title="Şehir Hatları Resmi Fiyat Tebliğini Görüntüle"
        >
          <span>Resmi Tebliğ</span>
          <ExternalLink size={10} />
        </a>
      </div>

      {/* Fares Matrix */}
      <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
          <span className="text-[9px] text-slate-400 block font-bold">Tam İstanbulkart</span>
          <strong className="text-xs sm:text-sm font-mono font-black text-emerald-400">{fareInfo.fullFare}</strong>
          <span className="text-[8px] text-slate-500 block font-mono mt-0.5">UKOME Taban</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-blue-500/30">
          <span className="text-[9px] text-slate-400 block font-bold">Öğrenci Kartı</span>
          <strong className="text-xs sm:text-sm font-mono font-black text-blue-400">{fareInfo.studentFare}</strong>
          <span className="text-[8px] text-slate-500 block font-mono mt-0.5">%50 İndirim</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30">
          <span className="text-[9px] text-slate-400 block font-bold">{fareInfo.isIslandRoute ? "Adakart İkamet" : "Sosyal / 60+"}</span>
          <strong className="text-xs sm:text-sm font-mono font-black text-amber-400">{fareInfo.islandResidentFare || fareInfo.socialFare}</strong>
          <span className="text-[8px] text-slate-500 block font-mono mt-0.5">Mukim / Sosyal</span>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <ShieldCheck size={12} />
          <span>%100 Doğrulanmış Resmi Veri</span>
        </div>
        <span>65+ Yaş & Engelli: <strong className="text-white">Ücretsiz (0.00 ₺)</strong></span>
      </div>
    </div>
  );
}