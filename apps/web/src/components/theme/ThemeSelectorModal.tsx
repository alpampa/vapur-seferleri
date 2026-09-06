"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Check, Sparkles } from "lucide-react";
import { useThemeStore, THEME_PRESETS, ThemePresetId } from "@/store/useThemeStore";
import { useLanguageStore } from "@/store/useLanguageStore";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const { theme, setTheme } = useThemeStore();
  const { language } = useLanguageStore();

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-amber-500 text-white flex items-center justify-center font-black shadow-md">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>PROFESYONEL TASARIM & RENK PALETLERİ</span>
                  <span className="text-[9px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 px-2 py-0.2 rounded-full font-bold">
                    6 SEÇENEK
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Uluslararası standartlarda renk armonisinde 6 farklı profesyonel tasarım
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

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = theme === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => setTheme(preset.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "ring-2 ring-blue-500 border-blue-500 shadow-md bg-blue-50/40 dark:bg-blue-950/40 scale-[1.01]"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/60"
                  }`}
                >
                  <div>
                    {/* Header: Title & Checkmark */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {language === "en" ? preset.nameEn : preset.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                          <Check size={12} />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  {/* 4 Swatch Color Circles */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[9px] font-mono font-bold text-slate-400 mr-1">
                      {preset.isDark ? "Gece / Dark" : "Gündüz / Light"}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      {preset.previewColors.map((color, cIdx) => (
                        <span
                          key={cIdx}
                          className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
