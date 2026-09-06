"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, CreditCard, ShieldCheck, RefreshCw, ExternalLink, Smartphone, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface IstanbulkartWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IstanbulkartWalletModal({ isOpen, onClose }: IstanbulkartWalletModalProps) {
  const { t, language } = useLanguageStore();
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [qrToken, setQrToken] = useState("IST-8942-7104");

  // Regenerate QR every 60 seconds (Standard BELBİM Digital Pass security protocol)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setQrToken(`IST-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const fares = [
    { title: "Şehir İçi Vapur (Tam)", price: "27.00 ₺", note: "İstanbulkart Tam Bilet" },
    { title: "Öğrenci Tarifesi", price: "13.17 ₺", note: "İndirimli Öğrenci Kartı" },
    { title: "Sosyal Kart (Öğretmen / 60+)", price: "19.34 ₺", note: "Sosyal İndirim Grubu" },
    { title: "Adalar Hattı (Misafir)", price: "90.00 ₺", note: "Bostancı / Kabataş ➔ Adalar" },
    { title: "Adakart (Ada Mukimi)", price: "45.00 ₺", note: "Adalar İkametgah Kartı" },
    { title: "65+ Yaş & Engelli", price: "0.00 ₺", note: "Ücretsiz Geçiş Hakkı" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/30">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                  <span>İSTANBULKART DİJİTAL GEÇİŞ</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  İskele Turnikeleri & UKOME Resmi Deniz Tarifesi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Digital QR Card Simulation */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-700 p-5 text-white shadow-xl mb-4">
            {/* Background Watermark */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg tracking-wider">istanbulkart</span>
                <span className="text-[9px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  DİJİTAL CÜZDAN
                </span>
              </div>
              <ShieldCheck size={18} className="text-amber-200" />
            </div>

            {/* QR Code Graphic Box */}
            <div className="bg-white rounded-xl p-3.5 flex flex-col items-center justify-center text-slate-950 shadow-inner">
              <div className="relative w-36 h-36 flex items-center justify-center border-4 border-slate-900 rounded-lg p-1 bg-white">
                <QrCode size={124} className="text-slate-950" />
              </div>
              <span className="font-mono text-xs font-black tracking-widest mt-2 text-slate-800">
                {qrToken}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-1">
                <RefreshCw size={10} className="animate-spin text-red-600" />
                <span>Geçerlilik süresi: <strong>{secondsRemaining} sn</strong></span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-rose-100">
              <span>Turnike okuyucusuna 5-10 cm yaklaştırın</span>
              <span className="font-mono font-bold">BELBİM A.Ş.</span>
            </div>
          </div>

          {/* Direct Mobile App Launch Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a
              href="istanbulkart://"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-red-500 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
            >
              <Smartphone size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
              <span>İstanbulkart App</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>

            <a
              href="https://www.istanbulkart.istanbul/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-blue-500 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
            >
              <CreditCard size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Bakiye Yükle</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>
          </div>

          {/* Official UKOME Fare Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                UKOME RESMİ DENİZ ULAŞIMI TARİFESİ
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                GÜNCEL FİYATLAR
              </span>
            </div>

            <div className="space-y-1.5">
              {fares.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.note}</span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Turnstile Legal Notice */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <span>
              Tarifeler İstanbul Büyükşehir Belediyesi Ulaşım Koordinasyon Merkezi (UKOME) resmi kararlarına göre uygulanmaktadır. Aktarmalı geçişlerde kademeli indirim geçerlidir.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
