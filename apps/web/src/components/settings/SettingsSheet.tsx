"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Check, Languages, Type, Compass } from "lucide-react";
import { useLanguageStore, SUPPORTED_LANGUAGES, type AppLanguage } from "@/store/useLanguageStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * KULLANICI AYARLARI — Dil, yazı boyutu ve turist modu tek panelde.
 * Dil seçimi anında uygulanır (lang + RTL), diğerleri kalıcıdır (localStorage).
 */
export function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
  const { language, setLanguage, t } = useLanguageStore();
  const { fontScale, setFontScale, touristMode, setTouristMode } = usePreferencesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSelectLanguage = (code: AppLanguage) => {
    setLanguage(code);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative my-auto w-full max-w-lg bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Başlık */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Settings size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight">{t("settings")}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-5">
            {/* 1. DİL */}
            <section>
              <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                <Languages size={13} className="text-blue-500" />
                <span>{t("languageLabel")}</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      aria-pressed={isActive}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                      {isActive && <Check size={13} className="text-blue-600 dark:text-blue-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. YAZI BOYUTU */}
            <section>
              <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                <Type size={13} className="text-emerald-500" />
                <span>{t("fontSize")}</span>
              </h4>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {(["normal", "large"] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setFontScale(scale)}
                    aria-pressed={fontScale === scale}
                    className={`flex-1 px-3 py-2.5 text-xs font-black transition-all cursor-pointer ${
                      fontScale === scale
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {scale === "normal" ? t("sizeNormal") : t("sizeLarge")}
                  </button>
                ))}
              </div>
            </section>

            {/* 3. TURİST MODU */}
            <section>
              <button
                type="button"
                onClick={() => setTouristMode(!touristMode)}
                aria-pressed={touristMode}
                className={`w-full px-3.5 py-3 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer active:scale-[0.99] ${
                  touristMode
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    touristMode ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Compass size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black">{t("touristMode")}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {t("touristModeHint")}
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${touristMode ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${touristMode ? "translate-x-4" : "translate-x-0"}`}
                  />
                </span>
              </button>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
