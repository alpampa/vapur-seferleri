"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Navigation, Phone, ExternalLink, ShieldCheck, Users, Clock, Anchor, Compass, Sparkles } from "lucide-react";
import {
  calculateSeaTaxiFare,
  getSeaTaxiRoute,
  SEA_TAXI_OFFICIAL_TARIFF,
  COMMON_SEA_TAXI_ROUTES
} from "@/lib/data/sea-taxi";
import { PierSharingQrCard } from "./PierSharingQrCard";
import { QrCode, Calculator } from "lucide-react";

interface SharedSeaTaxiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export function SharedSeaTaxiModal({
  isOpen,
  onClose,
  defaultOrigin = "Kadıköy",
  defaultDestination = "Karaköy"
}: SharedSeaTaxiModalProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [passengers, setPassengers] = useState<number>(4);
  const [hasJoinedPool, setHasJoinedPool] = useState(false);
  const [activeTab, setActiveTab] = useState<"CALCULATOR" | "QR">("CALCULATOR");

  if (!isOpen) return null;

  const route = getSeaTaxiRoute(origin, destination);
  const fare = calculateSeaTaxiFare(route.nauticalMiles, passengers);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto min-h-full">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative my-auto w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-md">
                <Anchor size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    PAYLAŞIMLI İBB DENİZ TAKSİ
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    GECE & HIZLI GEÇİŞ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  Vapurlar bittiğinde veya acil geçişte masrafı bölüşerek seyahat edin
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

          {/* Tab Selector: Hesaplayıcı vs Toplanma QR'ı */}
          <div className="px-5 pt-3 pb-0 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("CALCULATOR")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "CALCULATOR"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calculator size={13} />
              <span>Ücret Hesaplayıcı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("QR")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "QR"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <QrCode size={13} />
              <span>İskele Toplanma QR Kodu</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-150px)]">
            {/* Route Selector Badges */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>SEÇİLİ İSKELE GÜZERGAHI</span>
                <span className="font-mono text-cyan-300 text-[11px]">
                  {route.nauticalMiles} Deniz Mili • ~{route.estimatedMinutes} Dakika
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Biniş İskelesi
                  </label>
                  <select
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {COMMON_SEA_TAXI_ROUTES.map((r, i) => (
                      <option key={`orig-${i}`} value={r.origin}>
                        {r.origin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    İniş İskelesi
                  </label>
                  <select
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {COMMON_SEA_TAXI_ROUTES.map((r, i) => (
                      <option key={`dest-${i}`} value={r.destination}>
                        {r.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {activeTab === "QR" ? (
              <PierSharingQrCard
                origin={origin}
                destination={destination}
                perPersonFare={fare.perPersonFare}
                passengers={passengers}
              />
            ) : (
              <>
                {/* Passenger Count Slider & Split Cost Calculator */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <Users size={14} className="text-amber-400" />
                      <span>PAYLAŞILAN YOLCU SAYISI</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/40">
                      {passengers} Yolcu
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={passengers}
                    onChange={e => setPassengers(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>1 Kişi (Özel Tekne)</span>
                    <span>5 Kişi</span>
                    <span>10 Kişi (Maksimum)</span>
                  </div>

                  {/* Cost Box */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Kişi Başı Tutar
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-black text-amber-400">
                        {fare.perPersonFare} ₺
                      </strong>
                      <span className="text-[9px] text-slate-500 block">masraf bölüşüldüğünde</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Toplam Tekne Ücreti
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-black text-slate-200">
                        {fare.totalBoatFare} ₺
                      </strong>
                      <span className="text-[9px] text-slate-500 block">
                        (500₺ açılış + {fare.mileCost}₺ mil)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Live Pier Pool Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-300">
                    <Sparkles size={15} className="text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                    <span>CANLI İSKELE PAYLAŞIM HAVUZU</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Şu an <strong>{origin} İskelesi</strong> çevresinde gece veya acil geçiş için masrafı bölüşmek isteyen yolcular bekleniyor. Gruba katılarak kişi başı <strong>{fare.perPersonFare} ₺</strong> ile tekne çağırabilirsiniz.
                  </p>

                  <button
                    type="button"
                    onClick={() => setHasJoinedPool(!hasJoinedPool)}
                    className={`w-full py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasJoinedPool
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                    }`}
                  >
                    {hasJoinedPool ? "✓ İskele Paylaşım Grubuna Katıldınız (3 Yolcu)" : "İskele Paylaşım Grubuna Katıl"}
                  </button>
                </div>
              </>
            )}

            {/* Official UKOME Citation */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-xs">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-400 leading-tight">
                <strong className="text-slate-300 block">Yasal Dayanak & Tarife:</strong>
                {SEA_TAXI_OFFICIAL_TARIFF.legalCitation} gereği İBB Deniz Taksiler açılış 500 ₺ ve mil başı 750 ₺ sabit tarifeyle hizmet vermektedir. Rezervasyonlar resmi İBB uygulaması üzerinden gerçekleştirilir.
              </div>
            </div>
          </div>

          {/* Footer Direct Action Buttons */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
            <a
              href="tel:153"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>ALO 153</span>
            </a>

            <a
              href={SEA_TAXI_OFFICIAL_TARIFF.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>İBB Deniz Taksi Çağır</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
