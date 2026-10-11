"use client";

import { useState } from "react";
import { Sparkles, ExternalLink, MessageCircle, Copy, Check, Building2, X, ShieldCheck } from "lucide-react";
import type { SponsoredAdOffer } from "@/lib/data/sponsored-ads";
import { triggerHaptic } from "@/lib/utils/haptics";

interface SponsoredTripRowProps {
  ad: SponsoredAdOffer;
  isCompact?: boolean;
}

export function SponsoredTripRow({ ad, isCompact = false }: SponsoredTripRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAdvertiseInfo, setShowAdvertiseInfo] = useState(false);

  const trackInteraction = (action: "CLICK" | "WHATSAPP_LEAD") => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adId: ad.id }),
    }).catch(() => {});
  };

  const handleRowClick = () => {
    triggerHaptic("light");
    trackInteraction("CLICK");
    setIsModalOpen(true);
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ad.couponCode).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDirectBooking = () => {
    trackInteraction("CLICK");
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleWhatsappBooking = () => {
    trackInteraction("WHATSAPP_LEAD");
    const phone = ad.whatsappPhone || "905320000001";
    const text = encodeURIComponent(
      ad.whatsappPrefillText ||
        `Merhaba, Adalar Sefer Asistanı uygulamasındaki #${ad.couponCode} fırsatıyla rezervasyon yapmak istiyorum.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {isCompact ? (
        /* KOMPAKT LİSTE MODU — Sefer satırlarıyla aynı hizada, saat yerine Sponsor İkonu */
        <div
          onClick={handleRowClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleRowClick();
            }
          }}
          className="rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer border border-amber-400/60 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 dark:from-amber-950/25 dark:via-[#111726] dark:to-amber-950/20 text-slate-900 dark:text-white hover:border-amber-500 shadow-2xs group"
        >
          {/* Sol: Saat yerine net Sponsor Rozeti (Vapur saatiyle asla karışmaz) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded-md bg-amber-400/90 text-slate-950 font-black text-[10px] tracking-tight uppercase flex items-center gap-1 shadow-2xs">
              <span>{ad.iconEmoji}</span>
              <span>ÖNERİ</span>
            </span>
          </div>

          {/* Orta: Başlık & Kupon */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-slate-900 dark:text-amber-100 truncate">
              {ad.sponsorName}
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-600 dark:text-slate-300 truncate">
              — {ad.offerText}
            </span>
          </div>

          {/* Sağ: İndirim Rozeti & CTA */}
          <div className="flex items-center gap-1.5 shrink-0">
            {ad.priceHighlight && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono font-black text-[10px]">
                {ad.priceHighlight}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 transition-transform group-hover:scale-105">
              <span>İncele</span>
              <ExternalLink size={10} />
            </span>
          </div>
        </div>
      ) : (
        /* GENİŞ KART MODU — Vapur kartlarıyla uyumlu, altın çerçeveli Native Sponsorlu Satır */
        <div
          onClick={handleRowClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleRowClick();
            }
          }}
          className="rounded-2xl p-3 transition-all cursor-pointer border border-amber-400/70 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-[#171c2b] dark:via-[#111726] dark:to-[#1a1829] hover:border-amber-500 shadow-xs group relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2.5">
            {/* Sol İkon Kutusu (Saat yerine Otel/Mekan İkonu — Sıfır Yanıltma) */}
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/30 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg leading-none">{ad.iconEmoji}</span>
              <span className="text-[8px] font-mono font-black uppercase tracking-tighter text-amber-800 dark:text-amber-300 mt-0.5">
                REHBER
              </span>
            </div>

            {/* Orta İçerik */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={9} />
                  <span>{ad.badgeLabel}</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                  • SPONSORLU
                </span>
                {ad.priceHighlight && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono font-black text-[9.5px]">
                    {ad.priceHighlight}
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                {ad.headline}
              </h3>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                {ad.offerText}
              </p>
            </div>

            {/* Sağ Eylem Butonu */}
            <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
              <span className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-2xs flex items-center gap-1 transition-transform group-hover:scale-105">
                <span>{ad.ctaLabel}</span>
                <ExternalLink size={11} />
              </span>

              <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                Kod: <strong className="text-amber-600 dark:text-amber-400">#{ad.couponCode}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tıklanınca Açılan Hızlı Rezervasyon, İndirim Kodu & WhatsApp Yönlendirme Modalı */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
          >
            {/* Üst Başlık */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                  {ad.iconEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      {ad.badgeLabel}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck size={11} /> Doğrulanmış İşletme
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {ad.sponsorName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Kampanya Detayı */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-slate-950/90 border border-amber-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {ad.headline}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {ad.offerText}
              </p>

              {/* Kupon Kodu Kopyalama Barı */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-amber-400 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Yolcu İndirim Kodu:</span>
                  <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                    {ad.couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                </button>
              </div>
            </div>

            {/* Ana Rezervasyon / Yönlendirme Butonları */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDirectBooking}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>{ad.ctaLabel} (Web Sitesine Git)</span>
              </button>

              {ad.whatsappPhone && (
                <button
                  type="button"
                  onClick={handleWhatsappBooking}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp ile Anında İndirimli Oda / Masa Ayırt</span>
                </button>
              )}
            </div>

            {/* B2B İşletmeler İçin "Buraya Reklam Verin" Bölümü */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {!showAdvertiseInfo ? (
                <button
                  type="button"
                  onClick={() => setShowAdvertiseInfo(true)}
                  className="w-full text-center text-[11px] text-slate-500 hover:text-amber-500 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Building2 size={12} />
                  <span>Ada oteli veya restoran işletmecisi misiniz? Sefer satırına reklam verin ➔</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                  <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-500" />
                    <span>Adalar & Boğaz Hat Sponsorluğu</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-snug">
                    Binlerce ada ve boğaz yolcusuna tam vapur saatine bakarken işletmenizi gösterin. Aylık sabit hat sponsorluğu veya rezervasyon başı performans modeli için bize ulaşın.
                  </p>
                  <a
                    href="mailto:iletisim@adalarseferasistani.com?subject=Sefer%20Sat%C4%B1r%C4%B1%20Sponsorluk%20Ba%C5%9Fvurusu"
                    className="inline-flex items-center gap-1 font-black text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                  >
                    <span>Kurumsal Sponsorluk Başvurusu Gönder</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
