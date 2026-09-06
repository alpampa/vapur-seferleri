"use client";

import { Ship, Sun, Moon, Globe, CreditCard, Headphones } from "lucide-react";
import { IstanbulkartWalletModal } from "@/components/wallet/IstanbulkartWalletModal";
import { BosphorusAudioGuideModal } from "@/components/guide/BosphorusAudioGuideModal";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useLanguageStore } from "@/store/useLanguageStore";

export function TopBar() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAudioGuideOpen, setIsAudioGuideOpen] = useState<boolean>(false);

  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage, t } = useLanguageStore();

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
    <header className="px-3.5 py-2.5 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 shadow-xs flex items-center justify-between transition-colors duration-150">
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
          <Ship size={18} />
        </div>
        <div>
          <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
            VAPUR SEFERLERİ
            <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30">
              {language === "en" ? "LIVE" : "CANLI"}
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5">
            {language === "en" ? "Istanbul Maritime Transit Portal" : "İstanbul Resmi Deniz Ulaşım Portalı"}
          </p>
        </div>
      </div>

      {/* Right Controls: Language, Theme & National Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* ÖNERİ 1: İstanbulkart QR & Cüzdan Butonu */}
        <button
          type="button"
          onClick={() => setIsWalletOpen(true)}
          title="İstanbulkart / QR Kod Dijital Geçiş & Ücret Tarifesi"
          className="px-2 py-1 rounded-lg text-[11px] font-black transition-all border flex items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 shadow-2xs"
        >
          <CreditCard size={12} className="text-red-600 dark:text-red-400" />
          <span className="hidden sm:inline">İstanbulkart</span>
          <span className="sm:hidden">QR</span>
        </button>

        {/* ÖNERİ 3: Boğaz Yalıları & Tarihi Eserler Sesli Rehberi (Audioguide) */}
        <button
          type="button"
          onClick={() => setIsAudioGuideOpen(true)}
          title="Boğaz Yalıları & Tarihi Eserler Sesli Rehberi"
          className="px-2 py-1 rounded-lg text-[11px] font-black transition-all border flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-2xs"
        >
          <Headphones size={12} className="text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Sesli Rehber</span>
          <span className="sm:hidden">Rehber</span>
        </button>

        {/* Language Switcher (TR | EN) */}
        <button
          onClick={toggleLanguage}
          title={language === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
          className="px-2 py-1 rounded-lg text-[11px] font-black tracking-wider transition-all border flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
        >
          <Globe size={12} className="text-blue-600 dark:text-blue-400" />
          <span>{language === "tr" ? "EN" : "TR"}</span>
        </button>

        {/* Theme Toggle (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Gündüz Moduna Geç (Light Mode)" : "Gece Moduna Geç (Dark Mode)"}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs flex items-center justify-center shrink-0"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={15} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={15} className="text-indigo-600 hover:-rotate-12 transition-transform" />
            )
          ) : (
            <Sun size={15} className="text-amber-500" />
          )}
        </button>

        {/* Compact Digital National Clock */}
        <div className="hidden xs:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[8px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              {language === "en" ? "IST TIME" : "ULUSAL SAAT"}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
              {dateStr || (language === "en" ? "Today" : "Bugün")}
            </span>
          </div>
          <div className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm tracking-tight pl-1.5 border-l border-slate-300 dark:border-slate-800 tabular-nums">
            {timeStr || "--:--:--"}
          </div>
        </div>
      </div>
      <IstanbulkartWalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <BosphorusAudioGuideModal isOpen={isAudioGuideOpen} onClose={() => setIsAudioGuideOpen(false)} />
    </header>
  );
}
