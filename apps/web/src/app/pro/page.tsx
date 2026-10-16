import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { ProContent } from "@/components/pro/ProContent";

export const metadata: Metadata = {
  title: "Vapur Pro — Reklamsız Deneyim",
  description: "Vapur Pro: reklamsız sefer listesi, sakin deneyim. Ödeme altyapısı yakında.",
};

export default function ProPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      <TopBar />

      <main className="flex-1 px-4 pt-4 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Sefer listesine dön</span>
        </Link>

        <div className="mt-4">
          <ProContent />
        </div>
      </main>
    </div>
  );
}
