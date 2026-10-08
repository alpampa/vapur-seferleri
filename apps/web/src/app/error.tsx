"use client";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useEffect } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#070e1e] text-white">
      <TopBar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-black mb-2 text-white">Tarife Yenileniyor</h2>
        <p className="text-slate-400 mb-4 text-xs leading-relaxed">
          Canlı vapur sefer tarifesi ve radar verileri senkronize edilirken anlık bir gecikme oluştu. Sayfayı yenileyerek resmi tarifeye bağlanabilirsiniz.
        </p>
        {error?.message && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-amber-300 font-mono text-left max-w-full overflow-x-auto">
            {error.message}
          </div>
        )}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              try {
                // Hatalı veya şişmiş istemci önbelleğini temizleyip taze veriyle başlat
                localStorage.removeItem("vapur_schedules_cache_v1");
              } catch {}
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer text-xs"
        >
          <RotateCcw size={15} />
          <span>Yeniden Dene & Güncelle</span>
        </button>
      </main>
      
      <BottomNav />
    </div>
  );
}
