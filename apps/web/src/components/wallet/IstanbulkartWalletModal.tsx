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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
        {/* Backdrop Click */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container - my-auto guarantees it never clips above top:0 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative my-auto w-full max-w-md bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-900 dark:text-white z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>İSTANBULKART DİJİTAL GEÇİŞ</span>
                  <span className="text-[9px] font-mono bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                    BELBİM
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Turnike QR kod & Güncel UKOME Deniz Ücret Tarifesi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Turnstile QR Code Simulator Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 text-white shadow-lg mb-4 text-center relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono font-bold opacity-90 mb-3">
              <span className="flex items-center gap-1">
                <Smartphone size={13} />
                <span>DİJİTAL GEÇİŞ KARTI</span>
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                TEMASSIZ / NFC
              </span>
            </div>

            {/* QR Mock Display */}
            <div className="bg-white p-3 rounded-2xl w-36 h-36 mx-auto shadow-inner flex flex-col items-center justify-center gap-1.5 border-4 border-white/30">
              <QrCode size={110} className="text-slate-900" />
            </div>

            <div className="mt-3">
              <span className="text-xs font-mono font-black tracking-widest bg-black/30 px-3 py-1 rounded-lg">
                {qrToken}
              </span>
              <div className="text-[10px] text-white/80 font-bold mt-1.5 flex items-center justify-center gap-1">
                <RefreshCw size={10} className="animate-spin" />
                <span>Geçerlilik süresi: <strong>{secondsRemaining} sn</strong></span>
              </div>
            </div>

            <p className="text-[10px] text-white/70 mt-2 font-medium">
              Turnike okuyucusuna 5-10 cm yaklaştırın
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a
              href="https://www.istanbulkart.istanbul/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Smartphone size={13} className="text-blue-500" />
              <span>İstanbulkart App</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>

            <a
              href="https://bakiye.istanbulkart.istanbul/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard size={13} className="text-emerald-500" />
              <span>Bakiye Yükle</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>
          </div>

          {/* UKOME Official Ferry Fares */}
          <div>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              <span>UKOME RESMİ DENİZ ULAŞIMI TARİFESİ</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">GÜNCEL FİYATLAR</span>
            </div>

            <div className="space-y-1.5">
              {fares.map((fare, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {fare.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {fare.note}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {fare.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
