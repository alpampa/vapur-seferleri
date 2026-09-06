"use client";

import { useState, useEffect } from "react";
import { CreditCard, QrCode, AlertTriangle, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import { IstanbulkartWalletModal } from "@/components/wallet/IstanbulkartWalletModal";

interface TurnstileCheckBannerProps {
  tripPrice?: string; // e.g. "27.00 ₺" or "90.00 ₺"
  originPier?: string;
  isAdalar?: boolean;
}

export function TurnstileCheckBanner({ tripPrice = "27.00 ₺", originPier = "Kadıköy", isAdalar = false }: TurnstileCheckBannerProps) {
  const [balance, setBalance] = useState<number>(35.0);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vapur_simulated_balance");
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val)) setBalance(val);
    }
  }, []);

  const priceVal = parseFloat(tripPrice.replace("[^0-9.]", "")) || (isAdalar ? 90.0 : 27.0);
  const isInsufficient = balance < priceVal;

  const handleSimulateTopup = () => {
    const newBal = balance + 50.0;
    setBalance(newBal);
    localStorage.setItem("vapur_simulated_balance", newBal.toString());
  };

  if (!mounted) return null;

  return (
    <>
      <div className={`p-3 rounded-2xl border transition-all shadow-xs ${
        isInsufficient
          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/60"
          : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60"
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isInsufficient
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-emerald-600 text-white shadow-sm"
            }`}>
              {isInsufficient ? <AlertTriangle size={16} className="animate-bounce" /> : <CheckCircle2 size={16} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  TURNİKE GEÇİŞ KONTROLÜ
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isInsufficient
                    ? "bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-black"
                    : "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                }`}>
                  {isInsufficient ? "YETERSİZ BAKİYE" : "GEÇİŞE HAZIR"}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5 truncate">
                {isInsufficient ? (
                  <>Mevcut Bakiyeniz: <strong>{balance.toFixed(2)} ₺</strong> (Sefer: <strong>{tripPrice}</strong>). Turnikede beklememek için QR kod açın.</>
                ) : (
                  <>Mevcut Bakiyeniz: <strong>{balance.toFixed(2)} ₺</strong> (Sefer: <strong>{tripPrice}</strong>). Turnikeden doğrudan geçebilirsiniz.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInsufficient && (
              <button
                onClick={handleSimulateTopup}
                className="px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Hızlı 50 TL Bakiye Yükle"
              >
                <RefreshCw size={10} />
                <span className="hidden sm:inline">+50 ₺ Yükle</span>
              </button>
            )}

            <button
              onClick={() => setIsWalletOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                isInsufficient
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              <QrCode size={13} />
              <span>{isInsufficient ? "QR Geçişi Aç" : "Dijital Kart"}</span>
            </button>
          </div>
        </div>
      </div>

      <IstanbulkartWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />
    </>
  );
}
