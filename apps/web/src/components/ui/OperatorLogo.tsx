"use client";

import React from "react";

export type FerryOperator = 
  | "Şehir Hatları" 
  | "İDO" 
  | "Turyol" 
  | "Mavi Marmara" 
  | "Dentur Avrasya" 
  | "Dentur" 
  | "Prens Tur";

interface OperatorLogoProps {
  operator: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function OperatorLogo({ operator, size = "sm", showName = true, className = "" }: OperatorLogoProps) {
  const norm = operator.trim().toLowerCase();

  // Dimensions
  const logoHeight = size === "sm" ? 16 : size === "md" ? 22 : 28;
  const textSize = size === "sm" ? "text-[11px]" : size === "md" ? "text-xs" : "text-sm";

  // 1. ŞEHİR HATLARI (Kırmızı zemin üzerinde beyaz İBB Çapa & Hilal Arması)
  if (norm.includes("şehir hatları") || norm.includes("sehir hatlari")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#c8102e] flex items-center justify-center shrink-0 shadow-sm border border-red-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="İstanbul Şehir Hatları"
        >
          {/* Authentic Anchor & Star SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a2.5 2.5 0 0 0-2.5 2.5c0 .7.3 1.3.8 1.8V8h-2v2h2v7.1A7.01 7.01 0 0 1 4 11H2a9.01 9.01 0 0 0 9 9 9.01 9.01 0 0 0 9-9h-2a7.01 7.01 0 0 1-6.3 6.1V10h2V8h-2V6.3c.5-.5.8-1.1.8-1.8A2.5 2.5 0 0 0 12 2zm0 2a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1z"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-red-300 truncate ${textSize}`}>
            ŞEHİR HATLARI
          </span>
        )}
      </div>
    );
  }

  // 2. İDO (İstanbul Deniz Otobüsleri - Mavi/Lacivert Katamaran Dalga Amblemi)
  if (norm.includes("ido") || norm.includes("i̇do")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#004b87] flex items-center justify-center shrink-0 shadow-sm border border-blue-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="İDO - İstanbul Deniz Otobüsleri"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13h18l-2-5H5l-2 5zm1 2c1.5 0 2.5.8 4 1s2.5-.8 4-1c1.5 0 2.5.8 4 1s2.5-.8 4-1v2c-1.5 0-2.5.8-4 1s-2.5-.8-4-1c-1.5 0-2.5.8-4 1s-2.5-.8-4-1v-2z"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-sky-400 truncate ${textSize}`}>
            İDO
          </span>
        )}
      </div>
    );
  }

  // 3. TURYOL (Kırmızı/Beyaz Gemi Dümeni & T Arması)
  if (norm.includes("turyol")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#e11d48] flex items-center justify-center shrink-0 shadow-sm border border-rose-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="Turyol Kooperatifi"
        >
          {/* Wheel / Helm SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0-13l2.1 2.1m8.8 8.8l2.1 2.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-rose-300 truncate ${textSize}`}>
            TURYOL
          </span>
        )}
      </div>
    );
  }

  // 4. MAVİ MARMARA (Lacivert/Turkuaz Dalga Arması)
  if (norm.includes("mavi marmara")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#0284c7] flex items-center justify-center shrink-0 shadow-sm border border-cyan-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="Mavi Marmara Kooperatifi"
        >
          {/* Waves SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12c2.5-1.5 5 1.5 7.5 0s5-1.5 7.5 0 5 1.5 5 0v3c-2.5 1.5-5-1.5-7.5 0s-5 1.5-7.5 0-5-1.5-5 0v-3zM2 6c2.5-1.5 5 1.5 7.5 0s5-1.5 7.5 0 5 1.5 5 0v3c-2.5 1.5-5-1.5-7.5 0s-5 1.5-7.5 0-5-1.5-5 0V6z"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-cyan-300 truncate ${textSize}`}>
            MAVİ MARMARA
          </span>
        )}
      </div>
    );
  }

  // 5. DENTUR AVRASYA (Mavi Yelken & Pusula Arması)
  if (norm.includes("dentur")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#1e40af] flex items-center justify-center shrink-0 shadow-sm border border-blue-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="Dentur Avrasya"
        >
          {/* Sailboat / Compass SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 19h18a1 1 0 0 1 .8 1.6l-2.5 3a1 1 0 0 1-.8.4H5.5a1 1 0 0 1-.8-.4l-2.5-3A1 1 0 0 1 3 19zM12 2l8 14H4l8-14z"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-blue-300 truncate ${textSize}`}>
            DENTUR
          </span>
        )}
      </div>
    );
  }

  // 6. PRENS TUR (Mor/Altın Taç Arması)
  if (norm.includes("prens tur") || norm.includes("prenstur")) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div 
          className="rounded-md bg-[#7e22ce] flex items-center justify-center shrink-0 shadow-sm border border-purple-400/40 px-1"
          style={{ height: logoHeight, minWidth: logoHeight }}
          title="Prens Tur"
        >
          {/* Crown SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-amber-300" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4l3 12h14l3-12-5 4-5-6-5 6-5-4zm3 14h14v2H5v-2z"/>
          </svg>
        </div>
        {showName && (
          <span className={`font-black tracking-tight text-purple-300 truncate ${textSize}`}>
            PRENS TUR
          </span>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="rounded-md bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 px-1"
        style={{ height: logoHeight, minWidth: logoHeight }}
      >
        <span className="text-[10px]">⚓</span>
      </div>
      {showName && (
        <span className={`font-bold tracking-tight text-slate-300 truncate ${textSize}`}>
          {operator}
        </span>
      )}
    </div>
  );
}
