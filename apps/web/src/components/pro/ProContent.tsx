"use client";

import { useState } from "react";
import { BadgeCheck, CreditCard, Sparkles } from "lucide-react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

export function ProContent() {
  const { proUnlocked, setProUnlocked } = usePreferencesStore();
  const [noticeVisible, setNoticeVisible] = useState(false);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-indigo-300/60 dark:border-indigo-500/30 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[11px] uppercase tracking-widest">
          <Sparkles size={14} />
          <span>Vapur Pro</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight">
          Reklamsız, sakin bir sefer deneyimi
        </h2>
        <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-1.5">
            <BadgeCheck size={13} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Sefer listesindeki sponsor satırları ve reklam alanları tamamen gizlenir.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <BadgeCheck size={13} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Pano, Turist Modu, büyük punto ve 5 dil desteği her zaman ücretsiz kalır.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <BadgeCheck size={13} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Ödeme altyapısı yakında: abonelik, App Store / Google Play üzerinden yönetilecek.</span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {proUnlocked ? "Pro aktif (tanıtım)" : "Tanıtım sürümü"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Ödeme altyapısı hazır olana kadar Pro&apos;yu yalnızca bu cihazda, tanıtım amacıyla
              açıp kapatabilirsiniz. Hiçbir ücret alınmaz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setProUnlocked(!proUnlocked)}
            aria-pressed={proUnlocked}
            className={`shrink-0 min-h-[44px] px-4 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              proUnlocked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {proUnlocked ? "Pro'yu kapat" : "Pro'yu aç"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <button
          type="button"
          onClick={() => setNoticeVisible(true)}
          className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <CreditCard size={14} aria-hidden="true" />
          <span>Abonelikle satın al (yakında)</span>
        </button>
        {noticeVisible && (
          <p className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 text-center">
            Ödeme altyapısı henüz yayında değil. Duyuruları takip edin.
          </p>
        )}
      </section>
    </div>
  );
}
