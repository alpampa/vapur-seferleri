"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import type { OperatorAnnouncement } from "@/lib/types/announcement";

interface AnnouncementDetailSheetProps {
  announcement: OperatorAnnouncement | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABEL: Record<OperatorAnnouncement["type"], string> = {
  CANCELLATION: "İPTAL",
  CANCELLED_TRIPS: "İPTAL SEFERLER",
  EXTRA_SERVICE: "EK SEFER",
  SCHEDULE_CHANGE: "TARİFE",
  INFO: "DUYURU",
  WEATHER: "HAVA",
};

/**
 * KULLANICI KURALI: İptal duyurusunun tamamı UYGULAMA İÇİNDE okunur —
 * kullanıcı asla firmanın dış sitesine yönlendirilmez. Metin, firmanın
 * duyuru sayfasından birebir alınmıştır (değiştirilmez, süslenmez).
 */
export function AnnouncementDetailSheet({
  announcement,
  isOpen,
  onClose,
}: AnnouncementDetailSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && announcement && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] cursor-pointer"
            aria-hidden
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${announcement.operator} duyurusu`}
            className="fixed bottom-0 left-0 right-0 z-[99999] mx-auto max-w-lg bg-white dark:bg-[#0c1322] border-t border-slate-200 dark:border-slate-800 rounded-t-[28px] shadow-2xl flex flex-col max-h-[88dvh] pb-[max(0px,env(safe-area-inset-bottom))]"
          >
            {/* Başlık: firma + tip rozeti + kapat */}
            <div className="flex items-center justify-between gap-2 px-4 pt-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <OperatorLogo operator={announcement.operator} size="sm" showName={false} />
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {announcement.operator}
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0">
                  {TYPE_LABEL[announcement.type] ?? "DUYURU"}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Duyuru penceresini kapat"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Duyuru başlığı */}
            <h3 className="px-4 pt-2 text-sm font-black text-slate-900 dark:text-white shrink-0">
              {announcement.title}
            </h3>

            {/* Duyuru metni: kaynaktan birebir, kaydırılabilir */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-2">
              {announcement.body ? (
                <p className="text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {announcement.body}
                </p>
              ) : (
                <p className="text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Bu duyurunun ayrıntı metni kaynak sayfada yayınlanmamıştır; yalnızca başlık
                  bilgisi mevcuttur.
                </p>
              )}
            </div>

            {/* Kaynak bilgisi (bağlantı YOK — kullanıcı uygulamada kalır) */}
            <div className="px-4 pb-2 shrink-0">
              <div className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <AlertTriangle size={11} className="text-rose-500 mt-px shrink-0" aria-hidden />
                <span>
                  Metin, {announcement.operator} duyuru sayfasından birebir alınmıştır
                  {announcement.publishedAt ? ` · ${announcement.publishedAt}` : ""}.
                </span>
              </div>
            </div>

            {/* Kapat */}
            <div className="px-4 pb-4 pt-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black rounded-2xl border border-slate-300 dark:border-slate-700 transition-colors uppercase tracking-wider cursor-pointer active:scale-98"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
