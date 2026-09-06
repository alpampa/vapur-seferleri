"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Check, Sparkles, CheckCircle2 } from "lucide-react";
import { useThemeStore, THEME_PRESETS, ThemePresetId } from "@/store/useThemeStore";
import { useLanguageStore } from "@/store/useLanguageStore";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const { theme, setTheme } = useThemeStore();
  const { language } = useLanguageStore();
  const [selectedId, setSelectedId] = useState<ThemePresetId>(theme);

  if (!isOpen) return null;

  const handleSelectTheme = (id: ThemePresetId) => {
    setSelectedId(id);
    setTheme(id); // Anında canlı önizleme uygula
  };

  const handleConfirmAndClose = () => {
    setTheme(selectedId);
    onClose();
  };

  const handleCardDoubleClick = (id: ThemePresetId) => {
    setSelectedId(id);
    setTheme(id);
    onClose();
  };

  const activePreset = THEME_PRESETS.find(p => p.id === selectedId) || THEME_PRESETS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Arka Plan Karartması */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleConfirmAndClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Konteyneri - Sticky Header & Footer, Kaydırılabilir Orta Alan */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* 1. ÜST BAŞLIK BÖLÜMÜ (Sabit) */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Palette size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                    PROFESYONEL TASARIM & RENK PALETLERİ
                  </h3>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold">
                    6 TEMA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {language === "en"
                    ? "Select a theme. Changes apply instantly in the background."
                    : "İstediğiniz temaya tıklayarak canlı test edin, alttaki butondan onaylayın."}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmAndClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0"
              title="Kapat"
            >
              <X size={16} />
            </button>
          </div>

          {/* 2. ORTA BÖLÜM - 6 TEMA KARTI (Kaydırılabilir) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = selectedId === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectTheme(preset.id)}
                    onDoubleClick={() => handleCardDoubleClick(preset.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between gap-3 text-left relative group ${
                      isSelected
                        ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 shadow-md scale-[1.01]"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    {/* Üst Kısım: Başlık & Rozet */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                          {language === "en" ? preset.nameEn : preset.name}
                        </span>
                        
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shrink-0 shadow-xs">
                            <Check size={11} />
                            <span>AKTİF</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                            Seç
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium">
                        {preset.description}
                      </p>
                    </div>

                    {/* Alt Renk Paleti Göstergesi */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        preset.isDark 
                          ? "bg-slate-900 text-slate-200 dark:bg-slate-800" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}>
                        {preset.isDark ? "🌙 Gece / Koyu" : "☀️ Gündüz / Aydınlık"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {preset.previewColors.map((color, cIdx) => (
                          <span
                            key={cIdx}
                            className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SABİT ALT ONAY BÖLÜMÜ (Sticky Bottom Confirmation Bar) */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-center sm:justify-start">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>
                Aktif Tema: <strong className="text-slate-900 dark:text-white">{activePreset.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleConfirmAndClose}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Check size={16} />
                <span>TEMAYI UYGULA VE DEVAM ET</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
