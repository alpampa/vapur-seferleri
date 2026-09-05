"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Ship, MapPin, Clock, X, ChevronRight, Anchor, ShieldCheck, Ticket, Users, Train, Star, Bell, BellRing, Navigation } from "lucide-react";
import { TripStatusBadge } from "./ScheduleCard";
import type { ScheduleCardDto } from "@/app/page";
import { predictTripOccupancy } from "@/lib/utils/occupancy";
import { getPierTransit } from "@/lib/data/pier-transit-connections";
import { resolveDynamicTrip, DynamicTripResolution } from "@/lib/utils/dynamic-trip";
import { useEffect, useState } from "react";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { requestNotificationPermission } from "@/lib/utils/sound";

interface TripDetailsSheetProps {
  schedule: ScheduleCardDto | null;
  isOpen: boolean;
  onClose: () => void;
  serverTimeIso?: string;
}

export function TripDetailsSheet({ schedule, isOpen, onClose, serverTimeIso }: TripDetailsSheetProps) {
  const { isAlarmSet, toggleAlarm } = useAlarmStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [dynState, setDynState] = useState<DynamicTripResolution | null>(null);

  useEffect(() => {
    if (!schedule) {
      setDynState(null);
      return;
    }

    const update = () => {
      const resolved = resolveDynamicTrip(
        schedule.origin,
        schedule.destination,
        schedule.departureTime,
        schedule.targetTimeIso || new Date().toISOString(),
        schedule.stops,
        schedule.arrivalTime,
        Date.now(),
        serverTimeIso
      );
      setDynState(resolved);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [schedule, serverTimeIso]);

  if (!schedule) return null;

  const routeKey = `${schedule.origin} ➔ ${schedule.destination}`;
  const isFav = isFavorite(routeKey);
  const hasAlarm = isAlarmSet(schedule.id);

  const occupancy = predictTripOccupancy(schedule.origin, schedule.destination, schedule.departureTime);
  const originTransit = getPierTransit(schedule.origin);
  const destTransit = getPierTransit(schedule.destination);
  const isDirect = !schedule.stops || schedule.stops.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0d1424] border-t border-slate-700/80 rounded-t-[28px] z-50 p-5 sm:p-7 text-white shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header: Status, Title, Actions & Close */}
            <div className="flex justify-between items-start gap-3 mb-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {dynState && (
                    <TripStatusBadge status={dynState.status} delayText={schedule.delayText} />
                  )}
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80">
                    {schedule.operator}
                  </span>
                  {dynState?.countdown && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      ⏳ KALKIŞA {dynState.countdown}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-2">
                  <span>{dynState?.currentOrigin || schedule.origin}</span>
                  <span className="text-blue-400 font-extrabold">➔</span>
                  <span className="text-amber-300">{dynState?.destination || schedule.destination}</span>
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">{schedule.routeTitle}</p>
              </div>

              {/* Action Buttons: Star, Bell, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(routeKey)}
                  title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                  className={`p-2 rounded-xl border transition-all ${
                    isFav
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-amber-300"
                  }`}
                >
                  <Star size={16} className={isFav ? "fill-slate-950 text-slate-950" : ""} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    requestNotificationPermission();
                    toggleAlarm(schedule.id);
                  }}
                  title={hasAlarm ? "Alarmı Kaldır" : "5 Dk Kala Hatırlat"}
                  className={`p-2 rounded-xl border transition-all ${
                    hasAlarm
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {hasAlarm ? (
                    <BellRing size={16} className="text-amber-400 animate-bounce" />
                  ) : (
                    <Bell size={16} />
                  )}
                </button>

                <button 
                  onClick={onClose}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Kalkış Saati */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1 text-blue-400 mb-0.5">
                  <Clock size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Kalkış</span>
                </div>
                <div className="text-xl font-mono font-black text-white">
                  {dynState?.currentDepartureTime || schedule.departureTime}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {dynState?.currentDepartureTime12 || schedule.departureTime12}
                </div>
              </div>

              {/* İskele / Peron */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                  <MapPin size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">İskele / Peron</span>
                </div>
                <div className="text-base font-bold text-white truncate">{schedule.platform}</div>
                <div className="text-[10px] text-emerald-400 font-bold truncate">{schedule.origin} Rıhtım</div>
              </div>

              {/* Ücret */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
                  <Ticket size={13} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tarife</span>
                </div>
                <div className="text-xl font-mono font-black text-emerald-400">{schedule.price}</div>
                <div className="text-[10px] text-slate-400 font-medium">İstanbulkart</div>
              </div>
            </div>

            {/* Metro / Marmaray Progressive Route Timeline */}
            {!isDirect && dynState?.waypoints && dynState.waypoints.length > 1 ? (
              <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider text-[11px]">
                    <Navigation size={13} className="text-amber-400" />
                    <span>MARMARAY / METRO STİLİ GÜZERGAH İLERLEMESİ</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {dynState.waypoints.filter(w => w.state === "COMPLETED").length} / {dynState.waypoints.length} Durak Geçildi
                  </span>
                </div>

                {/* Progressive Track */}
                <div className="flex items-center gap-1 overflow-x-auto py-2 hide-scrollbar">
                  {dynState.waypoints.map((wp, wIdx) => {
                    const isCompleted = wp.state === "COMPLETED";
                    const isCurrent = wp.state === "CURRENT";
                    const isLast = wIdx === (dynState.waypoints?.length ?? 1) - 1;

                    return (
                      <div key={wIdx} className="flex items-center shrink-0">
                        {/* Station Pill */}
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all shadow-sm ${
                            isCompleted
                              ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold"
                              : isCurrent
                              ? "bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300/80 shadow-md scale-[1.03]"
                              : "bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                          }`}
                        >
                          {isCompleted ? (
                            <span className="text-emerald-400 text-xs font-black">✓</span>
                          ) : isCurrent ? (
                            <span className="text-[11px] font-black animate-pulse flex items-center gap-0.5 text-slate-950">
                              ➔ 🚢
                            </span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          )}

                          <span className="tracking-tight">{wp.name}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              isCompleted
                                ? "text-emerald-400/90 font-bold"
                                : isCurrent
                                ? "text-slate-950 underline font-black"
                                : "text-slate-400 font-semibold"
                            }`}
                          >
                            ({wp.time})
                          </span>
                        </div>

                        {/* Connecting Track Segment */}
                        {!isLast && (
                          <div
                            className={`w-4 sm:w-6 h-[3px] mx-1 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500"
                                : isCurrent
                                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-slate-700"
                                : "bg-slate-700"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl mb-4">
                <ShieldCheck size={18} />
                <span>Bu sefer direkt seferdir, ara duraklara uğramadan doğrudan {schedule.destination} iskelesine gider.</span>
              </div>
            )}

            {/* Canlı Doluluk ve Yolcu Yoğunluğu */}
            <div className="p-3.5 border border-slate-800 rounded-xl mb-4 bg-slate-900/80 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users size={13} className="text-cyan-400" />
                  CANLI DOLULUK TAHMİNİ
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${occupancy.badgeClass}`}>
                  {occupancy.label} (~%{occupancy.percentage})
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancy.level === 'HIGH' ? 'bg-rose-500' : occupancy.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${occupancy.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">{occupancy.description}</p>
            </div>

            {/* İskelelerden Raylı Sistem & Metro / Marmaray Aktarmaları */}
            {(originTransit.length > 0 || destTransit.length > 0) && (
              <div className="p-3.5 border border-slate-800 rounded-xl mb-4 bg-slate-900/80 shadow-inner">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Train size={13} className="text-cyan-400" />
                  İSKELELERDEN RAYLI SİSTEM & ŞEHİR İÇİ AKTARMALARI
                </h3>

                <div className="space-y-2.5">
                  {originTransit.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 block mb-1">
                        📍 {schedule.origin} İskelesi:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {originTransit.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                            <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                            <span className="text-slate-300 font-medium">{t.name}</span>
                            <span className="text-cyan-400 font-bold">({t.walkMinutes} dk)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {destTransit.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">
                        🏁 {schedule.destination} İskelesi:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {destTransit.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                            <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                            <span className="text-slate-300 font-medium">{t.name}</span>
                            <span className="text-amber-400 font-bold">({t.walkMinutes} dk)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-700 transition-colors shadow-md uppercase tracking-wider mt-1"
            >
              Kapat
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
