"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Bell, BellRing, Volume2, ShieldAlert, Footprints, Phone, Anchor, CheckCircle2 } from "lucide-react";
import { playStrandedEmergencySiren, requestNotificationPermission } from "@/lib/utils/sound";
import { SharedSeaTaxiModal } from "@/components/taxishare/SharedSeaTaxiModal";

interface IslandStrandedAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  originPier: string;
  destinationPier: string;
  departureTime: string;
  countdown?: string | null;
}

export function IslandStrandedAlertModal({
  isOpen,
  onClose,
  originPier,
  destinationPier,
  departureTime,
  countdown
}: IslandStrandedAlertModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isSeaTaxiOpen, setIsSeaTaxiOpen] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleTestAlarm = () => {
    playStrandedEmergencySiren();
    setSoundPlayed(true);
    setTimeout(() => setSoundPlayed(false), 2500);
  };

  const handleSet15MinAlarm = async () => {
    const hasPermission = await requestNotificationPermission();
    playStrandedEmergencySiren();
    setIsAlarmActive(true);

    if (hasPermission && typeof window !== "undefined" && "Notification" in window) {
      new Notification("🚨 ADALAR SON VAPUR ALARMI AKTİF!", {
        body: `${originPier} ➔ ${destinationPier} (${departureTime}) son seferine 15 dakika kala sesli ve titreşimli uyarı verilecektir.`,
        icon: "/favicon.ico"
      });
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto min-h-full">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative my-auto w-full max-w-lg bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-2xl text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-rose-950/40 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 font-bold shadow-md">
                <ShieldAlert size={22} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    ADADA MAHSUR KALMA ERKEN UYARISI
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white border border-rose-400 animate-pulse">
                    SON SEFER
                  </span>
                </div>
                <p className="text-[11px] text-rose-200 font-medium truncate mt-0.5">
                  {originPier} ➔ {destinationPier} • Kalkış: {departureTime}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-150px)]">
            {/* Urgent Warning Box */}
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-rose-300 text-sm">
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                <span>BU AKŞAM ANAKARAYA DÖNÜŞ İÇİN SON VAPUR!</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                Bu seferi kaçırmanız durumunda sabaha kadar adalardan anakaraya (Bostancı / Kadıköy) başka tarifeli toplu ulaşım bulunmamaktadır. Palamar çözülmeden önce iskele turnikesinden geçiş yapmış olmalısınız.
              </p>
            </div>

            {/* Countdown Box */}
            {countdown && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-black">
                    ⏳
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      KALKIŞA KALAN SÜRE
                    </span>
                    <strong className="text-sm font-black text-slate-200">
                      Rampa Kapanış Hazırlığı
                    </strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 tabular-nums animate-pulse">
                    {countdown}
                  </span>
                  <span className="text-[9px] text-slate-500 block">kaldı</span>
                </div>
              </div>
            )}

            {/* Alarm & Siren Trigger Panel */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <BellRing size={15} className="text-amber-400" />
                  <span>SESLİ & TİTREŞİMLİ 15 DK KRİTİK ALARMI</span>
                </span>
                {isAlarmActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                    ✓ KURULDU
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Vapurun kalkmasına 15 dakika kala telefonunuzda yüksek frekanslı denizci sireni ve haptik titreşim çalar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 size={14} className={soundPlayed ? "text-amber-400 animate-spin" : ""} />
                  <span>{soundPlayed ? "Siren Çalıyor..." : "Sireni Test Et"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSet15MinAlarm}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  <Bell size={14} />
                  <span>{isAlarmActive ? "Alarmı Güncelle" : "15 Dk Alarmı Kur"}</span>
                </button>
              </div>
            </div>

            {/* Emergency Sea Taxi Alternative */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Anchor size={16} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-black text-white truncate">
                    Kaçırırsanız: İBB Deniz Taksi Alternatifi
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    10 kişiye kadar paylaşımlı gece acil deniz taksi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSeaTaxiOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
              >
                Gör ➔
              </button>
            </div>
          </div>

          {/* Footer Emergency Call */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
            <a
              href="tel:153"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone size={13} className="text-rose-400" />
              <span>Adalar Zabıta / ALO 153</span>
            </a>

            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </motion.div>
      </div>

      <SharedSeaTaxiModal
        isOpen={isSeaTaxiOpen}
        onClose={() => setIsSeaTaxiOpen(false)}
        defaultOrigin={originPier}
        defaultDestination={destinationPier}
      />
    </AnimatePresence>,
    document.body
  );
}
