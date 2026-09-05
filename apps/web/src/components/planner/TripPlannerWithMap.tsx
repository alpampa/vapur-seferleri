"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ArrowLeftRight, Clock, MapPin, Navigation, Compass, Ticket, ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";
import type { ScheduleCardDto } from "@/app/page";
import { ISTANBUL_PIERS, planJourney, type RouteOption } from "@/lib/services/route-planner";

// Dynamically import InteractiveMarineMap (No SSR for Leaflet)
const InteractiveMarineMap = dynamic(
  () => import("@/components/map/InteractiveMarineMap").then((m) => m.InteractiveMarineMap),
  { ssr: false, loading: () => <div className="w-full h-[380px] bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-xs font-bold">Harita Yükleniyor...</div> }
);

interface TripPlannerWithMapProps {
  schedules: ScheduleCardDto[];
  serverTimeIso?: string;
  onClose?: () => void;
}

const PIER_LIST = Object.keys(ISTANBUL_PIERS);

export function TripPlannerWithMap({ schedules, serverTimeIso, onClose }: TripPlannerWithMapProps) {
  const [origin, setOrigin] = useState<string>("Kadıköy");
  const [destination, setDestination] = useState<string>("Büyükada");
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);

  // Swap direction
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Plan journey options
  const routes = useMemo(() => {
    // Current minutes in Istanbul today
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.format(now).split(':');
    const currMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

    return planJourney(schedules, origin, destination, currMinutes);
  }, [schedules, origin, destination]);

  const activeRoute = routes[selectedRouteIdx] || routes[0];

  return (
    <div className="bg-[#0b1324] border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Top Header: Title & Close if toggleable */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Compass size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
              <Sparkles size={11} />
              DENİZ ROTA & AKTARMA MOTORU
            </span>
            <h3 className="text-lg font-black text-white leading-tight">Nasıl Giderim?</h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Origin - Destination Selection Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        {/* Origin Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Nereden (Kalkış İskelesi)
          </label>
          <select
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setSelectedRouteIdx(0);
            }}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {PIER_LIST.map((p) => (
              <option key={p} value={p} disabled={p === destination}>
                {p} İskelesi ({ISTANBUL_PIERS[p].region})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pt-2 sm:pt-4">
          <button
            onClick={handleSwap}
            title="Yönü Değiştir"
            className="p-2 bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-400 rounded-xl text-slate-300 hover:text-white transition-all shadow"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Nereye (Varış İskelesi)
          </label>
          <select
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setSelectedRouteIdx(0);
            }}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {PIER_LIST.map((p) => (
              <option key={p} value={p} disabled={p === origin}>
                {p} İskelesi ({ISTANBUL_PIERS[p].region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split View: Left Route Alternatives, Right Live Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Route Options List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[440px] overflow-y-auto pr-1 hide-scrollbar">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Önerilen Güzergahlar:</span>
            <span className="text-cyan-400">{routes.length} Alternatif Bulundu</span>
          </div>

          {routes.length > 0 ? (
            routes.map((route, idx) => {
              const isSelected = idx === selectedRouteIdx;
              const isDirect = route.type === "DIRECT";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-md flex flex-col gap-2.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-slate-900 to-[#14233c] border-cyan-400 ring-2 ring-cyan-500/30"
                      : "bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-300"
                  }`}
                >
                  {/* Top Bar: Direct/Transfer badge & Duration */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        isDirect
                          ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300"
                          : "bg-purple-950 border border-purple-500/50 text-purple-300"
                      }`}
                    >
                      {isDirect ? "DİREKT SEFER" : `AKTARMA (${route.transferPier})`}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white">
                      <Clock size={13} className="text-cyan-400" />
                      <span>{route.durationMinutes} Dakika</span>
                    </div>
                  </div>

                  {/* Route Timeline Legs */}
                  <div className="space-y-1.5">
                    {/* Leg 1 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-300 text-sm">{route.legs[0].departureTime}</span>
                        <span className="font-bold text-white">{route.legs[0].origin}</span>
                        <ArrowRight size={13} className="text-slate-500" />
                        <span className="font-bold text-slate-300">{route.legs[0].destination}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-semibold">
                        {route.legs[0].operator}
                      </span>
                    </div>

                    {/* If Transfer Leg 2 */}
                    {!isDirect && route.legs[1] && (
                      <>
                        <div className="pl-3 py-0.5 border-l-2 border-dashed border-purple-500/50 text-[10px] text-purple-300 font-bold flex items-center gap-1">
                          <span>⏳ {route.transferPier} İskelesinde {route.transferWaitMinutes} dk aktarma beklemesi</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-300 text-sm">{route.legs[1].departureTime}</span>
                            <span className="font-bold text-slate-300">{route.legs[1].origin}</span>
                            <ArrowRight size={13} className="text-slate-500" />
                            <span className="font-bold text-white">{route.legs[1].destination}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-semibold">
                            {route.legs[1].operator}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer: Arrival & Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Tahmini Varış:</span>
                      <strong className="font-mono text-white text-xs">{route.arrivalTime}</strong>
                    </span>

                    <span className="font-mono font-black text-emerald-400 text-xs">
                      {route.totalPrice}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-900/60 rounded-xl border border-slate-800 p-4 text-slate-400 text-xs">
              <p className="font-bold text-slate-300">Bu iki iskele arasında bugün için doğrudan veya aktarmalı sefer bulunamadı.</p>
              <p className="text-[11px] mt-1 text-slate-500">Lütfen farklı bir kalkış veya varış iskelesi seçiniz.</p>
            </div>
          )}
        </div>

        {/* Right Column: Embedded Interactive Live Marine Map */}
        <div className="lg:col-span-7 flex flex-col">
          <InteractiveMarineMap
            selectedOrigin={origin}
            selectedDestination={destination}
            schedules={schedules}
            height="440px"
            onSelectPier={(pier, role) => {
              if (role === "origin") setOrigin(pier);
              else setDestination(pier);
            }}
          />
        </div>
      </div>
    </div>
  );
}
