"use client";

import { Calendar, Compass, Star, CloudRain, Bell } from "lucide-react";
import { useState } from "react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNav({ activeTab = "schedules", onTabChange }: BottomNavProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleSelect = (tab: string) => {
    setCurrentTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] z-50 shadow-2xl">
      <div className="flex justify-around items-center px-3 h-[68px]">
        {/* Seferler (Ana Akış) */}
        <button
          onClick={() => handleSelect("schedules")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === "schedules"
              ? "text-blue-400 scale-105 font-black"
              : "text-slate-400 hover:text-slate-200 font-semibold"
          }`}
        >
          <div className={`p-1.5 rounded-xl ${currentTab === "schedules" ? "bg-blue-500/20" : ""}`}>
            <Calendar size={20} />
          </div>
          <span className="text-[10px] tracking-tight">Seferler</span>
        </button>

        {/* Canlı Radar / İskeleler (Orta Vurgulu Buton) */}
        <button
          onClick={() => handleSelect("radar")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === "radar"
              ? "text-emerald-400 scale-105 font-black"
              : "text-slate-400 hover:text-slate-200 font-semibold"
          }`}
        >
          <div className={`p-1.5 rounded-xl ${currentTab === "radar" ? "bg-emerald-500/20" : ""}`}>
            <Compass size={20} />
          </div>
          <span className="text-[10px] tracking-tight">İskeleler</span>
        </button>

        {/* Deniz Durumu / Lodos Uyarıları */}
        <button
          onClick={() => handleSelect("weather")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === "weather"
              ? "text-amber-400 scale-105 font-black"
              : "text-slate-400 hover:text-slate-200 font-semibold"
          }`}
        >
          <div className={`p-1.5 rounded-xl ${currentTab === "weather" ? "bg-amber-500/20" : ""}`}>
            <CloudRain size={20} />
          </div>
          <span className="text-[10px] tracking-tight">Hava & Uyarı</span>
        </button>

        {/* Favori Rotalarım */}
        <button
          onClick={() => handleSelect("favorites")}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === "favorites"
              ? "text-purple-400 scale-105 font-black"
              : "text-slate-400 hover:text-slate-200 font-semibold"
          }`}
        >
          <div className={`p-1.5 rounded-xl ${currentTab === "favorites" ? "bg-purple-500/20" : ""}`}>
            <Star size={20} />
          </div>
          <span className="text-[10px] tracking-tight">Favorilerim</span>
        </button>
      </div>
    </nav>
  );
}

