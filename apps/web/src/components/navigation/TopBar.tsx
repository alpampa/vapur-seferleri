"use client";

import { Ship, CreditCard, Headphones, Palette, Clock, RotateCcw } from "lucide-react";
import { ThemeSelectorModal } from "@/components/theme/ThemeSelectorModal";
import { purgeAllCachesAndReload } from "@/components/pwa/ServiceWorkerRegister";
import { SUPPORTED_LANGUAGES } from "@/store/useLanguageStore";
import { IstanbulkartWalletModal } from "@/components/wallet/IstanbulkartWalletModal";
import { BosphorusAudioGuideModal } from "@/components/guide/BosphorusAudioGuideModal";
import { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTransitClock } from "@/hooks/useTransitClock";

// Modül seviyesinde önbelleklenmiş formatter'lar — her tick'te yeniden oluşturulmaz.
const TIME_FMT = {
  tr: new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  en: new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
} as const;
const DATE_FMT = {
  tr: new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
  en: new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", weekday: "short", day: "numeric", month: "short" }),
} as const;

export function TopBar() {
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAudioGuideOpen, setIsAudioGuideOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);

  const { language, toggleLanguage } = useLanguageStore();

  // Tek saat kaynağı: useTransitClock (sekme gizliyken tick durur, pil tasarrufu)
  const { nowMs } = useTransitClock();
  const lang = language === "en" ? "en" : "tr";
  const timeStr = TIME_FMT[lang].format(nowMs);
  const dateStr = DATE_FMT[lang].format(nowMs);

  return (
    <header className="px-3 sm:px-4 py-2 pt-[max(8px,env(safe-area-inset-top))] bg-white/95 dark:bg-[#070e1e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs flex items-center justify-between transition-colors duration-150">
      {/* SOL KISIM: ANA SAAT (TR SAATİ) + VAPUR SEFERLERİ BAŞLIĞI */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        {/* Canlı Saat Göstergesi */}
        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs shrink-0">
          <Clock size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex flex-col items-start leading-none">
            {/* suppressHydrationWarning: SSR anındaki sunucu saati ile istemci hidrasyon saati saniye bazında farklıdır */}
            <span suppressHydrationWarning className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {dateStr}
            </span>
            <span suppressHydrationWarning className="font-mono font-black text-[11px] sm:text-sm tracking-tight text-slate-900 dark:text-white tabular-nums mt-0.5">
              {timeStr}
            </span>
          </div>
        </div>

        {/* Logo & Portal Adı */}
        <div className="flex items-center gap-1.5 truncate">
          <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg items-center justify-center shadow-xs text-white shrink-0 hidden xs:flex">
            <Ship size={14} />
          </div>
          <div className="truncate">
            <h1 className="font-black text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none truncate">
              <span className="truncate">VAPUR</span>
              <button
                type="button"
                onClick={purgeAllCachesAndReload}
                title="Tıkla: Önbelleği temizle ve en son sürümü anında çek"
                aria-label="Önbelleği temizle ve son sürümü yükle"
                className="bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0 cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
              >
                <span>CANLI</span>
                <span className="text-[8px]">⚡</span>
              </button>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
              İstanbul Deniz Ulaşımı — Resmi Tarife
            </p>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM: KOMPAKT HIZLI ARAÇLAR (Mobilde Dil + Tek Araçlar Menüsü, Masaüstünde Ayrı Butonlar) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative">
        {/* Dil Seçici (Hem Mobil Hem Masaüstü) */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={`Aktif Dil: ${language.toUpperCase()}`}
          aria-label="Dili değiştir"
          className="h-8 px-2 rounded-lg text-xs font-black transition-all border flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer active:scale-95"
        >
          <span className="text-sm">{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag || "🌐"}</span>
          <span className="text-xs font-mono">{language.toUpperCase()}</span>
        </button>

        {/* Mobilde (<sm): Tekil Hızlı Araçlar Menü Butonu */}
        <div className="sm:hidden relative">
          <button
            type="button"
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            aria-label="Hızlı Araçlar Menüsü"
            className="w-8 h-8 rounded-lg text-xs font-black transition-all border flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <span className="text-sm">⚡</span>
          </button>

          {/* Mobil Araçlar Açılır Menüsü */}
          {isToolsMenuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  setIsThemeModalOpen(true);
                  setIsToolsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
              >
                <Palette size={14} className="text-amber-500" />
                <span>Tema & Renk Paleti</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWalletOpen(true);
                  setIsToolsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
              >
                <CreditCard size={14} className="text-red-500" />
                <span>İstanbulkart & Cüzdan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAudioGuideOpen(true);
                  setIsToolsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
              >
                <Headphones size={14} className="text-indigo-500" />
                <span>Boğaz Sesli Rehberi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsToolsMenuOpen(false);
                  purgeAllCachesAndReload();
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-800/80"
              >
                <RotateCcw size={14} className="text-emerald-500" />
                <span>Önbelleği Temizle & Güncelle</span>
              </button>
            </div>
          )}
        </div>

        {/* Masaüstünde (>=sm): Geniş Butonlar */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Temalar Butonu */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            title="Tasarım ve Renk Paletleri"
            aria-label="Tema seç"
            className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <Palette size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Tema</span>
          </button>

          {/* İstanbulkart Butonu */}
          <button
            type="button"
            onClick={() => setIsWalletOpen(true)}
            title="İstanbulkart Tarife & QR Cüzdan"
            aria-label="İstanbulkart cüzdanı"
            className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <CreditCard size={13} className="text-red-600 dark:text-red-400 shrink-0" />
            <span>Kart</span>
          </button>

          {/* Sesli Rehber */}
          <button
            type="button"
            onClick={() => setIsAudioGuideOpen(true)}
            title="Boğaz Sesli Rehberi"
            aria-label="Sesli rehberi aç"
            className="px-2 py-1 rounded-lg text-xs font-black transition-all border flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <Headphones size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Rehber</span>
          </button>

          {/* Önbelleği Temizle & Son Sürümü Yükle */}
          <button
            type="button"
            onClick={purgeAllCachesAndReload}
            title="Önbelleği Temizle ve Son Sürümü Yükle"
            aria-label="Önbelleği temizle ve sayfayı yenile"
            className="h-8 px-2 rounded-lg text-xs font-black transition-all border flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer active:scale-95"
          >
            <RotateCcw size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] hidden md:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* Modallar */}
      <IstanbulkartWalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
      <BosphorusAudioGuideModal isOpen={isAudioGuideOpen} onClose={() => setIsAudioGuideOpen(false)} />
      <ThemeSelectorModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </header>
  );
}
