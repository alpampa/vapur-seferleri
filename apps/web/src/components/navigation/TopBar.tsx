"use client";

import { Ship, CreditCard, Headphones, Palette, Clock } from "lucide-react";
import { ThemeSelectorModal } from "@/components/theme/ThemeSelectorModal";
import { SUPPORTED_LANGUAGES } from "@/store/useLanguageStore";
import { IstanbulkartWalletModal } from "@/components/wallet/IstanbulkartWalletModal";
import { BosphorusAudioGuideModal } from "@/components/guide/BosphorusAudioGuideModal";
import { useEffect, useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

export function TopBar() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAudioGuideOpen, setIsAudioGuideOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const { language, toggleLanguage } = useLanguageStore();

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const locale = language === "en" ? "en-US" : "tr-TR";
      const timeFmt = new Intl.DateTimeFormat(locale, {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const dateFmt = new Intl.DateTimeFormat(locale, {
        timeZone: "Europe/Istanbul",
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      setTimeStr(timeFmt.format(now));
      setDateStr(dateFmt.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <header className="px-3 sm:px-4 py-2 bg-white/95 dark:bg-[#070e1e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs flex items-center justify-between transition-colors duration-150">
      {/* SOL KISIM: ANA SAAT (TR SAATİ) + VAPUR SEFERLERİ BAŞLIĞI */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Canlı Ticking Dijital Saat Göstergesi (Kullanıcı Kuralı: Sol Üste Alındı) */}
        <div className="flex items-center gap-2 bg-slate-900 dark:bg-black/90 text-white px-2.5 py-1 rounded-xl border border-slate-700 dark:border-emerald-500/40 shadow-sm shrink-0">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              TR SAATİ
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
              {dateStr || "Bugün"}
            </span>
          </div>
          <div className="font-mono font-black text-base sm:text-lg text-emerald-400 tabular-nums tracking-tight pl-2 border-l border-slate-700 dark:border-slate-800">
            {timeStr || "--:--:--"}
          </div>
        </div>

        {/* Logo & Portal Adı */}
        <div className="flex items-center gap-1.5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg flex items-center justify-center shadow-xs text-white shrink-0 hidden xs:flex">
            <Ship size={15} />
          </div>
          <div>
            <h1 className="font-black text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none">
              <span>VAPUR SEFERLERİ</span>
              <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.2 rounded border border-emerald-500/30">
                CANLI
              </span>
            </h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
              Resmi Sefer Tarifesi & Canlı Radar
            </p>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM: KOMPAKT HIZLI ARAÇLAR (Temalar, Dil, İstanbulkart, Sesli Rehber) */}
      <div className="flex items-center gap-1.5">
        {/* Temalar Butonu (6 Profesyonel Tasarım) */}
        <button
          type="button"
          onClick={() => setIsThemeModalOpen(true)}
          title="Tasarım ve Renk Paletleri"
          className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center gap-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 shadow-2xs cursor-pointer"
        >
          <Palette size={13} className="text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Tema</span>
        </button>

        {/* 5 Dil Seçici */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={`Aktif Dil: ${language.toUpperCase()}`}
          className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer"
        >
          <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag || "🌐"}</span>
          <span>{language.toUpperCase()}</span>
        </button>

        {/* İstanbulkart Butonu */}
        <button
          type="button"
          onClick={() => setIsWalletOpen(true)}
          title="İstanbulkart Tarife & QR Cüzdan"
          className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 shadow-2xs cursor-pointer"
        >
          <CreditCard size={12} className="text-red-600 dark:text-red-400" />
          <span className="hidden sm:inline">Kart</span>
        </button>

        {/* Sesli Rehber */}
        <button
          type="button"
          onClick={() => setIsAudioGuideOpen(true)}
          title="Boğaz Sesli Rehberi"
          className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-2xs cursor-pointer"
        >
          <Headphones size={12} className="text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Rehber</span>
        </button>
      </div>

      {/* Modallar */}
      <IstanbulkartWalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <BosphorusAudioGuideModal isOpen={isAudioGuideOpen} onClose={() => setIsAudioGuideOpen(false)} />
      <ThemeSelectorModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </header>
  );
}
