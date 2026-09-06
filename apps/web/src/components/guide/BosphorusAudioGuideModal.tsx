"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Headphones, Volume2, Play, Pause, MapPin, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BOSPHORUS_LANDMARKS, BosphorusLandmark } from "@/lib/data/bosphorus-landmarks";
import { useLanguageStore } from "@/store/useLanguageStore";

interface BosphorusAudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVesselHeading?: number;
}

export function BosphorusAudioGuideModal({ isOpen, onClose }: BosphorusAudioGuideModalProps) {
  const { language } = useLanguageStore();
  const [selectedLandmark, setSelectedLandmark] = useState<BosphorusLandmark>(BOSPHORUS_LANDMARKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [narrationLang, setNarrationLang] = useState<"tr" | "en">(language === "en" ? "en" : "tr");
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  const playAudio = (landmark: BosphorusLandmark, lang: "tr" | "en") => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const textToSpeak = lang === "en" ? landmark.audioNarrationEn : landmark.audioNarrationTr;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === "en" ? "en-US" : "tr-TR";
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(selectedLandmark, narrationLang);
    }
  };

  const handleSelect = (landmark: BosphorusLandmark) => {
    stopAudio();
    setSelectedLandmark(landmark);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            stopAudio();
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative my-auto w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-md">
                <Headphones size={20} className={isPlaying ? "animate-bounce" : ""} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                    BOĞAZ YALILARI VE TARİHİ ESERLER SESLİ REHBERİ
                  </h3>
                  <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2 py-0.2 rounded-full font-bold">
                    AUDIOGUIDE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                  Vapur seyrinde önünden geçtiğiniz tarihi anıtlar ve yalıların kültürel hikayesi
                </p>
              </div>
            </div>

            {/* Language & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  const newLang = narrationLang === "tr" ? "en" : "tr";
                  setNarrationLang(newLang);
                  if (isPlaying) {
                    playAudio(selectedLandmark, newLang);
                  }
                }}
                title="Ses Dili Değiştir (TR / EN)"
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:border-indigo-500 transition-colors"
              >
                <Globe size={12} />
                <span>{narrationLang.toUpperCase()}</span>
              </button>

              <button
                onClick={() => {
                  stopAudio();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Active Landmark Player Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 text-white mb-4 shadow-lg shrink-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                    📍 {selectedLandmark.sideLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    İnşa: {selectedLandmark.builtYear}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white tracking-tight">
                  {selectedLandmark.name}
                </h4>
              </div>

              {/* Play / Pause Big Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${
                  isPlaying
                    ? "bg-amber-400 text-slate-950 scale-105 ring-4 ring-amber-400/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105"
                }`}
                title={isPlaying ? "Durdur" : "Sesli Dinle"}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="translate-x-0.5" />}
              </button>
            </div>

            {/* Narration Text Box */}
            <p className="text-xs text-slate-300 leading-relaxed font-medium mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {narrationLang === "en" ? selectedLandmark.audioNarrationEn : selectedLandmark.audioNarrationTr}
            </p>

            {/* Audio Progress Bar & Speed Slider */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1 text-indigo-300">
                <Volume2 size={13} className={isPlaying ? "animate-pulse" : ""} />
                <span>{isPlaying ? "Sesli Anlatım Sürüyor..." : "Dinlemek için Oynat'a basın"}</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span>Hız:</span>
                <button
                  onClick={() => setSpeechRate(prev => (prev === 0.95 ? 1.15 : 0.95))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                >
                  {speechRate}x
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal / Grid Landmark Selector */}
          <div className="flex-1 overflow-y-auto pr-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              BOĞAZ ESERLERİ LİSTESİ ({BOSPHORUS_LANDMARKS.length} ANIT & YALI)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOSPHORUS_LANDMARKS.map((item) => {
                const isSelected = item.id === selectedLandmark.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-500 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.side === "EUROPE" ? "bg-blue-500" : "bg-emerald-500"}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.sideLabel} • {item.builtYear}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLandmark(item);
                        playAudio(item, narrationLang);
                      }}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isSelected && isPlaying
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                      }`}
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
