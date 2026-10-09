"use client";

import React, { useState } from "react";
import { QrCode, Share2, Copy, Check, Users, Sparkles } from "lucide-react";

interface PierSharingQrCardProps {
  origin: string;
  destination: string;
  perPersonFare: number;
  passengers: number;
}

export function PierSharingQrCard({
  origin,
  destination,
  perPersonFare,
  passengers
}: PierSharingQrCardProps) {
  const [copied, setCopied] = useState(false);

  const groupCode = `DT-${origin.slice(0, 3).toUpperCase()}-${destination.slice(0, 3).toUpperCase()}-942`;
  const shareUrl = `https://adalar-sefer-asistani.vercel.app/?seaTaxi=${groupCode}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "İBB Deniz Taksi İskele Paylaşım Grubu",
        text: `${origin} ➔ ${destination} arası İBB Deniz Taksi masrafını bölüşüyoruz! Kişi başı: ${perPersonFare} ₺. Katılmak için linke tıkla:`,
        url: shareUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/40 space-y-3.5 text-center">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <QrCode size={16} className="text-amber-400" />
          <span className="font-black text-white">İSKELE TOPLANMA QR KODU</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
          {groupCode}
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-tight">
        İskele kapısındaki diğer yolculara bu QR kodu okutun; grubunuza katılan her kişiyle ücret otomatik bölünür.
      </p>

      {/* Stylized SVG QR Matrix */}
      <div className="flex justify-center my-2">
        <div className="p-3.5 bg-white rounded-2xl shadow-xl border-4 border-amber-400 flex flex-col items-center">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {/* 3 Corner Anchor Patterns (QR Finder Patterns) */}
            {/* Top-Left */}
            <rect x="10" y="10" width="40" height="40" rx="6" fill="#0f172a" />
            <rect x="18" y="18" width="24" height="24" rx="3" fill="#ffffff" />
            <rect x="24" y="24" width="12" height="12" rx="2" fill="#d97706" />

            {/* Top-Right */}
            <rect x="110" y="10" width="40" height="40" rx="6" fill="#0f172a" />
            <rect x="118" y="18" width="24" height="24" rx="3" fill="#ffffff" />
            <rect x="124" y="24" width="12" height="12" rx="2" fill="#d97706" />

            {/* Bottom-Left */}
            <rect x="10" y="110" width="40" height="40" rx="6" fill="#0f172a" />
            <rect x="18" y="118" width="24" height="24" rx="3" fill="#ffffff" />
            <rect x="24" y="124" width="12" height="12" rx="2" fill="#d97706" />

            {/* Simulated Data Grid */}
            <rect x="60" y="15" width="8" height="8" fill="#0f172a" />
            <rect x="75" y="15" width="8" height="8" fill="#0f172a" />
            <rect x="90" y="25" width="8" height="8" fill="#0f172a" />
            <rect x="60" y="35" width="16" height="8" fill="#0f172a" />
            <rect x="85" y="40" width="8" height="8" fill="#d97706" />

            <rect x="15" y="65" width="8" height="8" fill="#0f172a" />
            <rect x="30" y="75" width="8" height="8" fill="#0f172a" />
            <rect x="45" y="65" width="8" height="8" fill="#0f172a" />
            <rect x="60" y="70" width="12" height="12" rx="2" fill="#0f172a" />
            <rect x="80" y="65" width="8" height="16" fill="#0f172a" />
            <rect x="95" y="75" width="12" height="8" fill="#0f172a" />
            <rect x="115" y="65" width="16" height="8" fill="#0f172a" />
            <rect x="135" y="75" width="8" height="16" fill="#0f172a" />

            <rect x="65" y="95" width="16" height="8" fill="#0f172a" />
            <rect x="90" y="95" width="8" height="8" fill="#0f172a" />
            <rect x="110" y="105" width="8" height="8" fill="#0f172a" />
            <rect x="125" y="115" width="8" height="16" fill="#0f172a" />
            <rect x="140" y="110" width="8" height="8" fill="#0f172a" />

            <rect x="60" y="125" width="8" height="8" fill="#0f172a" />
            <rect x="75" y="135" width="16" height="8" fill="#0f172a" />
            <rect x="100" y="130" width="8" height="8" fill="#0f172a" />

            {/* Center Logo Icon */}
            <rect x="65" y="65" width="30" height="30" rx="6" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
            <text x="80" y="84" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="bold">🚤</text>
          </svg>
          <span className="text-[10px] font-mono font-bold text-slate-700 mt-1.5">
            {origin} ➔ {destination}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Kopyalandı!" : "Grubu Kopyala"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <Share2 size={13} />
          <span>WhatsApp / Paylaş</span>
        </button>
      </div>
    </div>
  );
}
