"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Ship, MapPin, Clock, X, ChevronRight, Anchor, ShieldCheck, Ticket, Calendar, Users, Train } from "lucide-react";
import { TripStatusBadge } from "./ScheduleCard";
import type { ScheduleCardDto } from "@/app/page";
import { predictTripOccupancy } from "@/lib/utils/occupancy";
import { getPierTransit } from "@/lib/data/pier-transit-connections";

interface TripDetailsSheetProps {
  schedule: ScheduleCardDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TripDetailsSheet({ schedule, isOpen, onClose }: TripDetailsSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && schedule && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-700/80 rounded-t-[32px] z-50 p-6 sm:p-8 text-white shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
          >
            {/* Drag Bar */}
            <div className="w-14 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 shrink-0" />

            {/* Header: Title & Close */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TripStatusBadge status={schedule.status} delayText={schedule.delayText} />
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {schedule.operator}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight flex items-center gap-2">
                  <span>{schedule.origin}</span>
                  <span className="text-blue-400 font-extrabold">➔</span>
                  <span className="text-amber-300">{schedule.destination}</span>
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1">{schedule.routeTitle}</p>
              </div>

              <button 
                onClick={onClose}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {/* Kalkış Saati */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                  <Clock size={15} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Kalkış Saati</span>
                </div>
                <div className="text-2xl font-mono font-black text-white">{schedule.departureTime}</div>
                <div className="text-[11px] text-slate-400 font-medium">{schedule.departureTime12}</div>
              </div>

              {/* İskele / Peron */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                  <MapPin size={15} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Kalkış İskelesi</span>
                </div>
                <div className="text-xl font-bold text-white">{schedule.platform}</div>
                <div className="text-[11px] text-emerald-400 font-bold">{schedule.origin} Ana Rıhtım</div>
              </div>

              {/* Bilet / İstanbulkart */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                  <Ticket size={15} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Geçiş Ücreti</span>
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">{schedule.price}</div>
                <div className="text-[11px] text-slate-400 font-medium">İstanbulkart Geçerli</div>
              </div>
            </div>

            {/* Operatör & Sefer Tipi Bilgisi */}
            <div className="flex items-center gap-3.5 p-4 border border-slate-800 rounded-2xl mb-4 bg-slate-900/60 shadow-md">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                <Ship className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-base text-white">{schedule.operator} Tarifeli Seferi</h4>
                <p className="text-xs text-slate-400 font-medium">
                  {schedule.routeTitle} • Resmi Deniz Ulaşım Tarifesi
                </p>
              </div>
            </div>

            {/* Canlı Yolcu Yoğunluğu ve Doluluk Tahmini */}
            {(() => {
              const occupancy = predictTripOccupancy(schedule.origin, schedule.destination, schedule.departureTime);
              return (
                <div className="p-4 border border-slate-800 rounded-2xl mb-4 bg-slate-900/90 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users size={14} className="text-cyan-400" />
                      YOLCU DOLULUK TAHMİNİ
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-black ${occupancy.badgeClass}`}>
                      {occupancy.label} (~%{occupancy.percentage})
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancy.level === 'HIGH' ? 'bg-rose-500' : occupancy.level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${occupancy.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{occupancy.description}</p>
                </div>
              );
            })()}

            {/* İskelelerden Raylı Sistem & Şehir İçi Aktarmaları */}
            {(() => {
              const originTransit = getPierTransit(schedule.origin);
              const destTransit = getPierTransit(schedule.destination);
              if (originTransit.length === 0 && destTransit.length === 0) return null;

              return (
                <div className="p-4 border border-slate-800 rounded-2xl mb-6 bg-slate-900/90 shadow-inner">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Train size={14} className="text-cyan-400" />
                    İSKELELERDEN RAYLI SİSTEM & ŞEHİR İÇİ AKTARMALARI
                  </h3>

                  <div className="space-y-3">
                    {/* Origin Transit */}
                    {originTransit.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-blue-400 block mb-1">
                          📍 {schedule.origin} İskelesi Bağlantıları:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {originTransit.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                              <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                              <span className="text-slate-300 font-medium">{t.name}</span>
                              <span className="text-cyan-400 font-bold">({t.walkMinutes} dk yürüyüş)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Destination Transit */}
                    {destTransit.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-amber-400 block mb-1">
                          🏁 {schedule.destination} İskelesi Bağlantıları:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {destTransit.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                              <span className={`text-[9px] font-black text-white px-1.5 py-0.2 rounded ${t.badgeBg}`}>{t.line}</span>
                              <span className="text-slate-300 font-medium">{t.name}</span>
                              <span className="text-amber-400 font-bold">({t.walkMinutes} dk yürüyüş)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Duraklar ve Güzergah Zaman Çizelgesi */}
            <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-inner">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Anchor size={14} className="text-blue-400" />
                GÜZERGAH VE ARA DURAK ZAMAN ÇİZELGESİ
              </h3>

              {schedule.stops && schedule.stops.length > 0 ? (
                <div className="space-y-3 relative pl-4 border-l-2 border-blue-500/40 ml-2">
                  {/* Başlangıç İskelesi */}
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#0f172a]" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{schedule.origin} (Kalkış)</span>
                      <span className="font-mono font-black text-blue-400">{schedule.departureTime}</span>
                    </div>
                  </div>

                  {/* Ara Duraklar */}
                  {schedule.stops.map((stop, idx) => (
                    <div key={idx} className="relative pt-1">
                      <span className="absolute -left-[23px] top-2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#0f172a]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{stop.name}</span>
                        <span className="font-mono font-black text-amber-400">{stop.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* Varış İskelesi */}
                  <div className="relative pt-1">
                    <span className="absolute -left-[23px] top-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f172a]" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{schedule.destination} (Varış)</span>
                      <span className="font-mono font-black text-emerald-400">Son Durak</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                  <ShieldCheck size={18} />
                  <span>Bu sefer direkt seferdir, ara duraklara uğramadan doğrudan varış iskelesine gider.</span>
                </div>
              )}
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl border border-slate-700 transition-colors shadow-md uppercase tracking-wider"
            >
              Kapat
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

