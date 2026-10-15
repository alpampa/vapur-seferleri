import type { TripStatus } from "@/lib/types/schedule";

/**
 * Sefer durum rozeti (tek doğruluk kaynağı).
 * Renk + metin birlikte kullanılır (erişilebilirlik).
 */
export function TripStatusBadge({
  status,
  delayText,
}: {
  status: TripStatus;
  delayText?: string;
}) {
  let bgColor =
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  let label = status.replace("_", " ");

  switch (status) {
    case "ON_TIME":
      // Kullanıcı kuralı: "Zamanında" yazısı kaldırıldı, yalın görünür
      return null;
    case "DEPARTING_SOON":
      bgColor =
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-black animate-pulse";
      label = "AZ KALDI";
      break;
    case "BOARDING":
      bgColor =
        "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 font-bold animate-pulse";
      label = "YOLCU ALINIYOR";
      break;
    case "IN_TRANSIT":
      bgColor =
        "bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-bold";
      label = "SEYİRDE";
      break;
    case "ARRIVING":
      bgColor =
        "bg-cyan-100 dark:bg-cyan-600/30 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-bold";
      label = "YANAŞIYOR";
      break;
    case "DELAYED":
      bgColor =
        "bg-rose-100 dark:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold";
      label = "GECİKMELİ";
      break;
    case "CANCELLED":
      bgColor =
        "bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 font-black border border-rose-400 dark:border-rose-500/60 animate-pulse";
      label = "İPTAL EDİLDİ";
      break;
    case "COMPLETED":
      bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
      label = "TAMAMLANDI";
      break;
  }

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-tight text-center whitespace-nowrap leading-none ${bgColor}`}
    >
      {label} {delayText && `(${delayText})`}
    </span>
  );
}
