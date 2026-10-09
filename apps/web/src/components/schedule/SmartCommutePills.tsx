"use client";

import { triggerHaptic } from "@/lib/utils/haptics";

interface CommuteRoute {
  id: string;
  title: string;
  origin: string;
  destination: string;
  category: "ADALAR" | "BOGAZ";
}

const TOP_COMMUTE_ROUTES: CommuteRoute[] = [
  { id: "bos-ada", title: "Bostancı ⇄ Adalar", origin: "Bostancı", destination: "Büyükada", category: "ADALAR" },
  { id: "kad-bes", title: "Kadıköy ⇄ Beşiktaş", origin: "Kadıköy", destination: "Beşiktaş", category: "BOGAZ" },
  { id: "kab-ada", title: "Kabataş ⇄ Adalar", origin: "Kabataş", destination: "Büyükada", category: "ADALAR" },
  { id: "emi-kad", title: "Eminönü ⇄ Kadıköy", origin: "Eminönü", destination: "Kadıköy", category: "BOGAZ" },
  { id: "usk-kar", title: "Üsküdar ⇄ Karaköy", origin: "Üsküdar", destination: "Karaköy", category: "BOGAZ" },
];

interface SmartCommutePillsProps {
  currentOrigin: string;
  currentDestination: string;
  onSelectRoute: (origin: string, destination: string, category: "ADALAR" | "BOGAZ") => void;
}

/**
 * Akıllı Sık Kullanılan Rota Kısayolları (Smart Commute Memory)
 * İstanbulluların her gün kullandığı ana güzergâhları tek dokunuşla filtreler.
 */
export function SmartCommutePills({
  currentOrigin,
  currentDestination,
  onSelectRoute,
}: SmartCommutePillsProps) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar flex items-center gap-1.5 py-1">
      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 shrink-0 ml-0.5">
        Hızlı Rotalar:
      </span>

      {TOP_COMMUTE_ROUTES.map((route) => {
        const isActive =
          (currentOrigin === route.origin && currentDestination === route.destination) ||
          (currentOrigin === route.destination && currentDestination === route.origin);

        return (
          <button
            key={route.id}
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onSelectRoute(route.origin, route.destination, route.category);
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all border flex items-center gap-1 cursor-pointer active:scale-95 touch-manipulation ${
              isActive
                ? "bg-[#FFC72C] text-slate-950 border-[#FFC72C] font-black shadow-xs ring-1 ring-[#FFC72C]/40"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-[11px]">⚡</span>
            <span>{route.title}</span>
          </button>
        );
      })}
    </div>
  );
}
