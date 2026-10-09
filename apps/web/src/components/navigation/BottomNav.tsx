"use client";

import { Calendar, Compass, Star, CloudRain } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "schedules", label: "Seferler", Icon: Calendar },
  { id: "piers", label: "İskeleler", Icon: Compass },
  { id: "weather", label: "Hava & Uyarı", Icon: CloudRain },
  { id: "favorites", label: "Favorilerim", Icon: Star }
] as const;

export function BottomNav({ activeTab = "schedules", onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Ana gezinme"
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] z-50 shadow-2xl"
    >
      <div className="flex justify-around items-center px-3 h-17">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={`flex-1 min-w-0 min-h-[44px] flex flex-col items-center justify-center gap-1 transition-all touch-manipulation cursor-pointer active:scale-95 ${
                isActive
                  ? "text-blue-400 scale-105 font-black"
                  : "text-slate-400 hover:text-slate-200 font-semibold"
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? "bg-blue-500/20" : ""}`}>
                <Icon size={19} />
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
