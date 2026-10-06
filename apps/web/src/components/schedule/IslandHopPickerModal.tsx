"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ship, ArrowRight, Clock, MapPin, Ticket, Bell, Pin, CheckCircle2, RotateCw } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { useAlarmStore } from "@/store/useAlarmStore";
import { useActiveVoyageStore } from "@/store/useActiveVoyageStore";
import { requestNotificationPermission } from "@/lib/utils/sound";
import { getOfficialRouteFare } from "@/lib/data/official-fares";

interface IslandHopPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleCardDto | null;
}

export function IslandHopPickerModal({
  isOpen,
  onClose,
  schedule
}: IslandHopPickerModalProps) {
  const { toggleAlarm, isAlarmSet } = useAlarmStore();
  const { setActiveVoyage } = useActiveVoyageStore();

  const [fromIndex, setFromIndex] = useState<number>(0);
  const [toIndex, setToIndex] = useState<number>(1);

  // Build the chronological station list for this master voyage
  const stations = useMemo(() => {
    if (!schedule) return [];
    const list: { name: string; time: string }[] = [
      { name: schedule.origin, time: schedule.departureTime || "00:00" }
    ];
    if (schedule.stops && schedule.stops.length > 0) {
      schedule.stops.forEach((st) => {
        if (st.name && st.time) {
          list.push({ name: st.name, time: st.time });
        }
      });
    }
    if (schedule.arrivalTime && schedule.destination && !schedule.destination.includes("Ring")) {
      list.push({ name: schedule.destination, time: schedule.arrivalTime });
    }
    return list;
  }, [schedule]);

  if (!isOpen || !schedule || typeof document === "undefined" || stations.length < 2) return null;

  const validFromIdx = Math.min(Math.max(0, fromIndex), stations.length - 1);
  const validToIdx = Math.min(Math.max(validFromIdx + 1, toIndex), stations.length - 1);

  const fromStation = stations[validFromIdx] || stations[0];
  const toStation = stations[validToIdx] || stations[stations.length - 1];

  // Calculate elapsed duration in minutes
  const calcMinutes = () => {
    try {
      const [h1, m1] = (fromStation?.time || "00:00").split(":").map(Number);
      const [h2, m2] = (toStation?.time || "00:00").split(":").map(Number);
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff < 0) diff += 24 * 60; // Crosses midnight
      return diff;
    } catch {
      return 15;
    }
  };

  const durationMin = calcMinutes();
  const fare = getOfficialRouteFare(fromStation?.name || "", toStation?.name || "").fullFare;
  const intermediateStops = stations.slice(validFromIdx + 1, validToIdx);

  const customTripId = `${schedule.id}-${fromStation?.name}-${toStation?.name}`;
  const hasAlarm = isAlarmSet(customTripId) || isAlarmSet(schedule.id);

  const handlePin = () => {
    setActiveVoyage({
      id: customTripId,
      origin: fromStation.name,
      destination: toStation.name,
      operator: schedule.operator,
      vesselName: schedule.vessel || "Şehir Hatları Vapuru",
      mmsi: "271002496",
      departureTime: fromStation.time,
      arrivalTime: toStation.time,
      price: fare
    });
    onClose();
  };

  const handleAlarm = async () => {
    await requestNotificationPermission();
    toggleAlarm(customTripId);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 text-slate-900 dark:text-white my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center shrink-0">
                <RotateCw size={18} className="animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">
                  Ada İskeleleri Arası Biniş & İniş Filtresi
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {schedule.routeTitle} • {schedule.operator}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* İskele Seçim Alanı (Biniş ve İniş) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Biniş İskelesi */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5 flex items-center gap-1">
                <span>📍</span>
                <span>Nereden Bineceksiniz?</span>
              </label>
              <select
                value={fromIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFromIndex(val);
                  if (val >= toIndex) {
                    setToIndex(Math.min(stations.length - 1, val + 1));
                  }
                }}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-black text-slate-900 dark:text-white cursor-pointer"
              >
                {stations.slice(0, stations.length - 1).map((st, idx) => (
                  <option key={idx} value={idx}>
                    {st.name} ({st.time})
                  </option>
                ))}
              </select>
            </div>

            {/* İniş İskelesi */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1.5 flex items-center gap-1">
                <span>🏁</span>
                <span>Nerede İneceksiniz?</span>
              </label>
              <select
                value={toIndex}
                onChange={(e) => setToIndex(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-black text-slate-900 dark:text-white cursor-pointer"
              >
                {stations.slice(fromIndex + 1).map((st, idx) => {
                  const realIdx = fromIndex + 1 + idx;
                  return (
                    <option key={realIdx} value={realIdx}>
                      {st.name} ({st.time})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Hesaplanan Bacak Özeti */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>🚢</span>
                <span>Seçilen Ada Bacağı:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400 text-slate-950">
                {durationMin} dk Yolculuk
              </span>
            </div>

            <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white py-1">
              <div className="flex items-center gap-1.5">
                <span>{fromStation.name}</span>
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">({fromStation.time})</span>
              </div>
              <ArrowRight size={16} className="text-amber-500 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span>{toStation.name}</span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">({toStation.time})</span>
              </div>
            </div>

            {/* Ara Durak İlerlemesi */}
            {intermediateStops.length > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                <span className="font-bold">Ara Duraklar ({intermediateStops.length}):</span>
                {intermediateStops.map((s, idx) => (
                  <span key={idx} className="font-semibold text-slate-700 dark:text-slate-300">
                    {s.name} ({s.time}){idx < intermediateStops.length - 1 ? " ➔ " : ""}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between text-xs font-black pt-2 border-t border-amber-500/20">
              <span className="text-slate-500 dark:text-slate-400">İstanbulkart Ücreti:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{fare}</span>
            </div>
          </div>

          {/* Eylem Butonları */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePin}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Pin size={14} />
              <span>Canlı Takibe Al</span>
            </button>

            <button
              type="button"
              onClick={handleAlarm}
              className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border ${
                hasAlarm
                  ? "bg-amber-400 text-slate-950 border-amber-300"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              }`}
            >
              <Bell size={14} />
              <span>{hasAlarm ? "Alarm Kurulu ✓" : "Alarm Kur"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
