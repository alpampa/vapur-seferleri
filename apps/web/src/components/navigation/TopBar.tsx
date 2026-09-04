"use client";

import { Ship, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFmt = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const dateFmt = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setTimeStr(timeFmt.format(now));
      setDateStr(dateFmt.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-4 pt-3 pb-3 text-white border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-40 shadow-md">
      {/* Brand & National Clock Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Ship size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              İSTANBUL VAPUR SEFERLERİ
            </h1>
            <p className="text-[11px] text-blue-300 font-semibold tracking-wider uppercase">
              Resmi ve Canlı Sefer Takip Portalı
            </p>
          </div>
        </div>

        {/* National Live Clock Box */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-blue-500/40 rounded-xl px-3.5 py-1.5 flex items-center justify-between sm:justify-end gap-3 shadow-inner">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                GERÇEK SAAT • GÜNLÜK ULUSAL SAAT
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {dateStr || "Yükleniyor..."}
              </span>
            </div>
          </div>
          <div className="bg-black/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <span className="font-mono font-black text-emerald-400 text-base sm:text-lg tracking-wider tabular-nums">
              {timeStr || "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

