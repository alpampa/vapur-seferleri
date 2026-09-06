"use client";

import React from "react";
import type { VesselCategory } from "@/lib/data/vessel-visuals";

interface VesselSilhouetteGraphicProps {
  category: VesselCategory;
  className?: string;
  vesselName?: string;
}

export function VesselSilhouetteGraphic({ category, className = "w-full h-32", vesselName }: VesselSilhouetteGraphicProps) {
  if (category === "HISTORIC_STEAMER") {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 700 190" className="w-full h-full max-h-40 drop-shadow-md">
          {/* Waterline / Sea Surface */}
          <line x1="20" y1="160" x2="680" y2="160" stroke="#0284c7" strokeWidth="3" strokeDasharray="6, 4" opacity="0.6" />
          <path d="M 10 162 Q 180 165 350 162 T 690 162" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />

          {/* Under-waterline Hull / Keel */}
          <path
            d="M 60 160 Q 90 180 350 180 Q 610 180 640 160 Z"
            fill="#b91c1c"
            opacity="0.85"
          />

          {/* Main Black/White Hull */}
          <path
            d="M 50 160 L 70 125 L 630 125 L 650 160 Z"
            fill="#0f172a"
          />
          {/* White Upper Sheer Stripe */}
          <path
            d="M 68 128 L 73 118 L 627 118 L 632 128 Z"
            fill="#f8fafc"
          />

          {/* Main Passenger Deck (Lower Deck) with Salon Windows */}
          <rect x="110" y="85" width="480" height="33" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Wooden Salon Window Strip */}
          {Array.from({ length: 18 }).map((_, i) => (
            <rect
              key={`win-lower-${i}`}
              x={130 + i * 25}
              y={93}
              width="15"
              height="17"
              rx="2"
              fill="#0284c7"
              opacity="0.85"
            />
          ))}

          {/* Upper Promenade Deck (Açık Güverte & Üst Salon) */}
          <rect x="150" y="55" width="400" height="30" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          {/* Upper Windows */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={`win-upper-${i}`}
              x={170 + i * 26}
              y={62}
              width="14"
              height="15"
              rx="2"
              fill="#0369a1"
              opacity="0.9"
            />
          ))}

          {/* Open Aft Railing (Kıç Balkon) */}
          <line x1="110" y1="85" x2="150" y2="85" stroke="#64748b" strokeWidth="2" />
          <line x1="110" y1="75" x2="150" y2="75" stroke="#64748b" strokeWidth="1.5" />
          <line x1="110" y1="65" x2="150" y2="65" stroke="#64748b" strokeWidth="1.5" />

          {/* Wheelhouse / Kaptan Köşkü */}
          <path
            d="M 460 55 L 475 28 L 530 28 L 540 55 Z"
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Bridge Windows */}
          <rect x="480" y="34" width="14" height="12" rx="1" fill="#0c4a6e" />
          <rect x="498" y="34" width="14" height="12" rx="1" fill="#0c4a6e" />
          <rect x="516" y="34" width="14" height="12" rx="1" fill="#0c4a6e" />

          {/* Radar Scanner & Navigation Light Mast */}
          <line x1="505" y1="28" x2="505" y2="10" stroke="#475569" strokeWidth="2" />
          <line x1="495" y1="14" x2="515" y2="14" stroke="#475569" strokeWidth="1.5" />
          <circle cx="505" cy="8" r="3" fill="#22c55e" />

          {/* Nostalgic Yellow & Black Steam Funnel (Sarı-Siyah Şehir Hatları Bacası) */}
          <path
            d="M 330 55 L 340 18 L 375 18 L 370 55 Z"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />
          {/* Funnel Black Top Band */}
          <path
            d="M 337 28 L 340 18 L 375 18 L 372 28 Z"
            fill="#0f172a"
          />
          {/* Funnel City Lines White Emblem Anchor Circle */}
          <circle cx="355" cy="38" r="6" fill="#ffffff" opacity="0.9" />
          <circle cx="355" cy="38" r="3" fill="#0f172a" />

          {/* Bow Flagstaff & Stern Turkish Flag */}
          <line x1="640" y1="125" x2="648" y2="100" stroke="#475569" strokeWidth="1.5" />
          <line x1="75" y1="125" x2="60" y2="90" stroke="#475569" strokeWidth="1.5" />
          {/* Turkish Flag on Aft */}
          <rect x="42" y="90" width="18" height="12" fill="#ef4444" rx="1" />
          <circle cx="50" cy="96" r="3.5" fill="#ffffff" />
          <circle cx="51.5" cy="96" r="2.8" fill="#ef4444" />

          {/* Waterline Metric Rulers */}
          <text x="350" y="186" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            LOA: 67.5 m • Genişlik: 10.5 m • Su Çekimi: 2.8 m
          </text>
        </svg>
      </div>
    );
  }

  if (category === "MODERN_TWIN_END") {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 700 190" className="w-full h-full max-h-40 drop-shadow-md">
          {/* Waterline */}
          <line x1="20" y1="155" x2="680" y2="155" stroke="#0284c7" strokeWidth="3" strokeDasharray="6, 4" opacity="0.6" />

          {/* Underwater Hull */}
          <path
            d="M 60 155 Q 120 178 350 178 Q 580 178 640 155 Z"
            fill="#0369a1"
            opacity="0.8"
          />

          {/* Symmetrical Double-Ended Steel Hull */}
          <path
            d="M 50 155 L 75 120 L 625 120 L 650 155 Z"
            fill="#1e293b"
          />
          {/* Blue Accent Band */}
          <path
            d="M 65 130 L 75 120 L 625 120 L 635 130 Z"
            fill="#0284c7"
          />

          {/* Large Full Panoramic Glazed Salon */}
          <rect x="100" y="75" width="500" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Panoramic Continuous Windows */}
          {Array.from({ length: 15 }).map((_, i) => (
            <rect
              key={`mod-win-${i}`}
              x={120 + i * 31}
              y={84}
              width="24"
              height="26"
              rx="3"
              fill="#0284c7"
              opacity="0.85"
            />
          ))}

          {/* Upper Bridge Deck (Double Ended Cockpits) */}
          <path
            d="M 160 75 L 180 40 L 520 40 L 540 75 Z"
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Forward and Aft Bridge Glass */}
          <rect x="190" y="47" width="40" height="18" rx="2" fill="#0f172a" />
          <rect x="470" y="47" width="40" height="18" rx="2" fill="#0f172a" />
          {/* Mid Upper Windows */}
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={`mod-up-${i}`}
              x={250 + i * 29}
              y={50}
              width="20"
              height="15"
              rx="2"
              fill="#38bdf8"
              opacity="0.75"
            />
          ))}

          {/* Modern Twin Radars & Antennas */}
          <line x1="210" y1="40" x2="210" y2="20" stroke="#475569" strokeWidth="2" />
          <ellipse cx="210" cy="18" rx="10" ry="3" fill="#cbd5e1" />
          <line x1="490" y1="40" x2="490" y2="20" stroke="#475569" strokeWidth="2" />
          <ellipse cx="490" cy="18" rx="10" ry="3" fill="#cbd5e1" />

          {/* Hydraulic Barrier-Free Ramp Indicator */}
          <rect x="75" y="116" width="30" height="6" rx="2" fill="#fbbf24" />
          <rect x="595" y="116" width="30" height="6" rx="2" fill="#fbbf24" />

          {/* Dimensions */}
          <text x="350" y="186" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            LOA: 68.0 m • Genişlik: 13.0 m • Çift Başlı Azimut İtici
          </text>
        </svg>
      </div>
    );
  }

  // PASSENGER_MOTOR (Turyol / Mavi Marmara / Dentur)
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 700 190" className="w-full h-full max-h-40 drop-shadow-md">
        {/* Waterline */}
        <line x1="30" y1="150" x2="670" y2="150" stroke="#0284c7" strokeWidth="3" strokeDasharray="6, 4" opacity="0.6" />

        {/* Planing V-Hull */}
        <path
          d="M 120 150 L 150 172 L 560 172 L 620 150 Z"
          fill="#1e3a8a"
          opacity="0.85"
        />

        {/* Sleek Motor Hull */}
        <path
          d="M 100 150 L 120 120 L 590 120 L 635 150 Z"
          fill="#0f172a"
        />
        {/* White Accent Hull Stripe */}
        <path
          d="M 115 125 L 120 120 L 590 120 L 605 125 Z"
          fill="#ffffff"
        />

        {/* Main Cabin Structure */}
        <rect x="180" y="80" width="380" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Slanted Fast Windows */}
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon
            key={`mot-win-${i}`}
            points={`${200 + i * 31},112 ${220 + i * 31},112 ${226 + i * 31},88 ${206 + i * 31},88`}
            fill="#0284c7"
            opacity="0.85"
          />
        ))}

        {/* Upper Open Sun Deck (Teras Katı) */}
        <rect x="230" y="55" width="290" height="25" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        {/* Upper Deck Awning Sunscreen Roof */}
        <line x1="220" y1="52" x2="530" y2="52" stroke="#0284c7" strokeWidth="4" />
        {/* Deck Railing */}
        <line x1="140" y1="120" x2="180" y2="120" stroke="#64748b" strokeWidth="2" />
        <line x1="560" y1="120" x2="600" y2="120" stroke="#64748b" strokeWidth="2" />

        {/* Wheelhouse Cockpit */}
        <polygon points="500,80 540,80 555,55 520,55" fill="#0f172a" />
        <polygon points="522,57 552,57 540,75 515,75" fill="#38bdf8" />

        {/* High Speed Marine Radar Arch */}
        <path d="M 430 52 L 440 28 L 460 28 L 470 52" fill="none" stroke="#475569" strokeWidth="2.5" />
        <ellipse cx="450" cy="25" rx="12" ry="3.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />

        {/* Dimensions */}
        <text x="350" y="186" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
          LOA: 42.0 m • Genişlik: 8.5 m • İkiz Deniz Dizeli • 15.5 Knot
        </text>
      </svg>
    </div>
  );
}
