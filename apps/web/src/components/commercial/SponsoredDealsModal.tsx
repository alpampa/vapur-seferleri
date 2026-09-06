"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Coffee, Bike, Croissant, ShieldCheck, Mail, Sparkles, Building2, TrendingUp, CheckCircle2 } from "lucide-react";
import { SPONSORED_PIER_DEALS, SponsoredDeal } from "@/lib/data/commercial-sponsorships";

interface SponsoredDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SponsoredDealsModal({ isOpen, onClose }: SponsoredDealsModalProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pierTarget, setPierTarget] = useState("Kadıköy");

  if (!isOpen) return null;

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                    İSKELE AYRICALIKLARI & TİCARİ SPONSORLUK
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    DOĞRULANMIŞ PARTNER
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Vapur yolcularına özel rıhtım ayrıcalıkları ve işletmeler için yerel reklam modeli
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Commercial Model Announcement Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-amber-600/10 border border-emerald-500/30 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span>Denizcilik ve Kent Yaşamı İçin Nitelikli Reklam Mimarisi</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Kullanıcıyı rahatsız eden spam bannerlar yerine; iskele çevresindeki tarihi kahvehaneler, ada bisiklet kiralama istasyonları, vapur içi BELTUR büfesi ve müze biletleri gibi yolcuya doğrudan fayda sağlayan yerel sponsorluk modelleri uygulanmaktadır.
                </p>
              </div>

              <button
                onClick={() => setShowInquiryForm(!showInquiryForm)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shrink-0 transition-colors shadow-xs"
              >
                {showInquiryForm ? "Fırsatları Gör" : "Sponsor Olun"}
              </button>
            </div>

            {/* If Sponsor Inquiry Form Opened */}
            {showInquiryForm ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-500" />
                  <span>İşletmenizi İskele Ayrıcalıklarına Ekleyin (Reklam Talebi)</span>
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Her gün on binlerce vapur yolcusunun takip ettiği hatta veya iskelede işletmenizin kuponunu ve konumunu yayınlayın.
                </p>

                {inquirySubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>Başvurunuz başarıyla kaydedildi! Ticari ekibimiz 24 saat içinde sizinle iletişime geçecektir.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitInquiry} className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">İşletme / Marka Adı:</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Kadıköy Liman Kafe"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">İletişim E-posta / Telefon:</label>
                        <input
                          type="text"
                          required
                          placeholder="info@isletme.com / 05xx..."
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hedef İskele / Hat:</label>
                        <select
                          value={pierTarget}
                          onChange={(e) => setPierTarget(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                        >
                          <option value="Kadıköy">Kadıköy Rıhtım</option>
                          <option value="Bostancı">Bostancı İskelesi</option>
                          <option value="Büyükada">Büyükada İskelesi</option>
                          <option value="Heybeliada">Heybeliada</option>
                          <option value="Eminönü">Eminönü İskeleleri</option>
                          <option value="Karaköy">Karaköy İskelesi</option>
                          <option value="Beşiktaş">Beşiktaş İskelesi</option>
                          <option value="Tüm Vapurlar">Vapur İçi BELTUR / Genel Hatlar</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
                    >
                      Sponsorluk Başvurusunu Gönder
                    </button>
                  </form>
                )}
              </div>
            ) : null}

            {/* List of Verified Local Partner Deals */}
            <div className="space-y-3">
              {SPONSORED_PIER_DEALS.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        📍 {deal.pierName}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {deal.businessName}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/40">
                        {deal.badge}
                      </span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {deal.dealTitle}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {deal.dealDescription}
                    </p>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                      🚶 {deal.distanceFromPier}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-auto">
                    <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                      {deal.discountRate}
                    </span>
                    {deal.promoCode && (
                      <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700">
                        KOD: {deal.promoCode}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              İstanbul Deniz Ulaşımı Yerel Ekosistem Ağı
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-black transition-colors"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
