"use client";

import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAlarmStore } from "@/store/useAlarmStore";
import { Star, Bell, BellRing, Ship, Clock, ArrowRight, Trash2 } from "lucide-react";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { useState } from "react";
import { TripDetailsSheet } from "@/components/schedule/TripDetailsSheet";

interface FavoritesAlarmsViewProps {
  schedules: ScheduleCardDto[];
  serverTimeIso?: string;
  onNavigateToSchedules?: () => void;
}

export function FavoritesAlarmsView({ schedules, serverTimeIso, onNavigateToSchedules }: FavoritesAlarmsViewProps) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { alarms, toggleAlarm } = useAlarmStore();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleCardDto | null>(null);

  // Filter schedules that match favorited routes: "Kadıköy ➔ Karaköy"
  const favoritedSchedules = schedules.filter(s => {
    const routeKey = `${s.origin} ➔ ${s.destination}`;
    return favorites.includes(routeKey);
  });

  // Filter schedules that have active alarms set
  const alarmSchedules = schedules.filter(s => alarms[s.id]);

  const popularSuggestions = [
    { origin: "Kadıköy", destination: "Karaköy" },
    { origin: "Kabataş", destination: "Büyükada" },
    { origin: "Bostancı", destination: "Heybeliada" },
    { origin: "Üsküdar", destination: "Beşiktaş" },
    { origin: "Eminönü", destination: "Kadıköy" }
  ];

  return (
    <div className="px-3 py-3 max-w-4xl mx-auto space-y-4 animate-fadeIn pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
            <Star size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>FAVORİ HATLARIM & KALKIŞ ALARMLARI</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                {favorites.length} HAT KAYITLI
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sık kullandığınız güzergahlar ve kurduğunuz sesli kalkış bildirimleri
            </p>
          </div>
        </div>
      </div>

      {/* Active Departure Alarms Section */}
      {alarmSchedules.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-black mb-2.5">
            <BellRing size={16} className="animate-bounce" />
            <span>KURULU KALKIŞ ALARMLARINIZ ({alarmSchedules.length})</span>
          </div>

          <div className="flex flex-col gap-2">
            {alarmSchedules.map(schedule => (
              <div
                key={schedule.id}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-2 text-white"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">🚢</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">
                      {schedule.origin} ➔ {schedule.destination}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono">
                      Kalkış Saati: <strong>{schedule.departureTime}</strong> ({schedule.operator})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleAlarm(schedule.id)}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold shrink-0"
                >
                  Alarmı Kaldır
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorited Routes List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Star size={14} className="text-purple-400" />
            <span>Kayıtlı Favori Güzergahlar</span>
          </h3>
        </div>

        {favorites.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {favorites.map(routeKey => (
              <div
                key={routeKey}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-500/40 text-slate-900 dark:text-white text-xs font-black shadow-2xs"
              >
                <span>⭐ {routeKey}</span>
                <button
                  onClick={() => toggleFavorite(routeKey)}
                  title="Favorilerden Çıkar"
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 mb-3">
            Henüz favori hat eklemediniz. Aşağıdaki hızlı önerilere tıklayarak hemen ekleyebilirsiniz.
          </div>
        )}

        {/* Quick Add Suggestions */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
            Hızlı Ekleme Önerileri:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {popularSuggestions.map(sug => {
              const key = `${sug.origin} ➔ ${sug.destination}`;
              const isFav = favorites.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleFavorite(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                    isFav
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{isFav ? "✓" : "+"}</span>
                  <span>{key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Upcoming Trips on Favorited Lines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Favori Hatlarınızdaki Aktif Seferler ({favoritedSchedules.length})
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            {favoritedSchedules.length > 0 ? (
              favoritedSchedules.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  id={schedule.id}
                  origin={schedule.origin}
                  destination={schedule.destination}
                  operator={schedule.operator}
                  routeTitle={schedule.routeTitle}
                  departureTime={schedule.departureTime}
                  departureTime12={schedule.departureTime12}
                  status={schedule.status}
                  targetTimeIso={schedule.targetTimeIso}
                  serverTimeIso={serverTimeIso}
                  delayText={schedule.delayText}
                  vessel={schedule.vessel}
                  platform={schedule.platform}
                  price={schedule.price}
                  progress={schedule.progress}
                  stops={schedule.stops}
                  arrivalTime={schedule.arrivalTime}
                  onClick={() => setSelectedSchedule(schedule)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                Favori hatlarınızda şu an bekleyen sefer bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>

      <TripDetailsSheet
        schedule={selectedSchedule}
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        serverTimeIso={serverTimeIso}
      />
    </div>
  );
}
