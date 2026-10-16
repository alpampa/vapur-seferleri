export const btnBase =
  "inline-flex items-center justify-center font-bold transition-all cursor-pointer active:scale-95 touch-manipulation select-none";

export const btnPrimary = `${btnBase} bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-2xs`;

export const btnSecondary = `${btnBase} bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800`;

export const btnGhost = `${btnBase} bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`;

export const chipBase = `${btnBase} shrink-0 min-h-10 px-3 py-1 rounded-xl text-[11px] border`;

export const chipOn = "bg-[#FFC72C] text-slate-950 border-[#FFC72C] font-black shadow-2xs";

export const chipOff =
  "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800";

export const chipSuccess = "bg-emerald-500 text-white border-emerald-400 font-black shadow-2xs";
