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
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      setTimeStr(timeFmt.format(now));
      setDateStr(dateFmt.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-3.5 py-2.5 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 shadow-sm flex items-center justify-between">
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
          <Ship size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
            VAPUR SEFERLERİ
            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
              CANLI
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
            İstanbul Resmi Deniz Ulaşım Portalı
          </p>
        </div>
      </div>

      {/* Compact Digital National Clock */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">
            ULUSAL SAAT
          </span>
          <span className="text-[9px] text-slate-400 font-semibold">
            {dateStr || "Bugün"}
          </span>
        </div>
        <div className="font-mono font-black text-emerald-400 text-sm tracking-tight pl-1.5 border-l border-slate-800 tabular-nums">
          {timeStr || "--:--:--"}
        </div>
      </div>
    </header>
  );
}


