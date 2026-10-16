import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Check, MonitorPlay, Store } from "lucide-react";
import { BUSINESS_MAILTO, BUSINESS_PACKAGES } from "@/lib/data/business-pricing";
import { TopBar } from "@/components/navigation/TopBar";

export const metadata: Metadata = {
  title: "İşletme Vitrini ve Sponsorluk — Vapur Seferleri",
  description:
    "Vapur yolcusuna ulaşın: native sponsor satırı, Pano TV lisansı ve kupon ortaklığı paketleri.",
};

export default function IsletmelerPage() {
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

        <header className="mt-4 mb-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-widest">
            <Store size={14} />
            <span>İşletmeler İçin</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-tight">
            Her gün binlerce vapur yolcusuna ulaşın
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Adalar ve Boğaz hatlarını kullanan yolcular sefer saatine bakarken sizi görsün: doğal
            sponsor kartı, işletme ekranınız için kalkış panosu veya komisyonlu kupon ortaklığı.
          </p>
        </header>

        <div className="space-y-4">
          {BUSINESS_PACKAGES.map((pkg) => (
            <section
              key={pkg.id}
              className={`rounded-2xl border p-4 ${
                pkg.highlighted
                  ? "border-amber-400/70 bg-amber-50/60 dark:bg-amber-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 size={15} className="text-amber-500 shrink-0" aria-hidden="true" />
                  <span>{pkg.name}</span>
                </h2>
                {pkg.highlighted && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    En çok tercih edilen
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{pkg.tagline}</p>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{pkg.priceLabel}</span>
                <span className="text-[10px] font-semibold text-slate-400">{pkg.priceNote}</span>
              </div>

              <ul className="mt-3 space-y-1.5">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={BUSINESS_MAILTO}
                className="mt-4 w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <MonitorPlay size={14} aria-hidden="true" />
                <span>{pkg.ctaLabel}</span>
              </a>
            </section>
          ))}
        </div>

        <p className="mt-4 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Fiyatlar tanıtım amaçlı başlangıç seviyesidir; kesin teklif işletmenizin ihtiyacına göre
          iletişim üzerinden verilir. Sponsorlu içerikler her zaman &quot;Sponsorlu&quot; etiketiyle
          gösterilir; Pano ve Yetişme Modu hiçbir zaman reklam içermez.
        </p>
      </main>
    </div>
  );
}
