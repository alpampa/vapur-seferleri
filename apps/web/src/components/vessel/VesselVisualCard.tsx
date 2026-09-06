"use client";

import React, { useState } from "react";
import { Ship, Info, Image as ImageIcon, ChevronDown, ChevronUp, Anchor, CheckCircle2, Ruler, Gauge, Users } from "lucide-react";
import { getVesselVisualProfile } from "@/lib/data/vessel-visuals";
import { VesselSilhouetteGraphic } from "./VesselSilhouetteGraphic";

interface VesselVisualCardProps {
  vesselName: string;
  operator?: string;
  builtYear?: number;
  capacityPax?: number;
  callSign?: string;
  mmsi?: string;
}

export function VesselVisualCard({
  vesselName,
  operator,
  builtYear,
  capacityPax,
  callSign,
  mmsi
}: VesselVisualCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"SILHOUETTE" | "PHOTO">("SILHOUETTE");

  const profile = getVesselVisualProfile(vesselName, operator);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-3.5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Ship size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                {vesselName} MİMARİ PROFİLİ
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                {profile.categoryBadge}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {profile.categoryTitle} • {builtYear || profile.shipyard}
            </p>
          </div>
        </div>

        {/* Toggle Silhouette / Photo Mode */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode("SILHOUETTE")}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "SILHOUETTE"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Siluet
            </button>
            <button
              type="button"
              onClick={() => setViewMode("PHOTO")}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "PHOTO"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ImageIcon size={11} />
              <span>Fotoğraf</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? "Detayları Gizle" : "Detayları Göster"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Visual Canvas (Silhouette SVG or Photo Preview) */}
      <div className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/80 relative flex items-center justify-center min-h-[140px] border-b border-slate-100 dark:border-slate-800/60">
        {viewMode === "SILHOUETTE" ? (
          <div className="w-full">
            <VesselSilhouetteGraphic category={profile.category} vesselName={vesselName} />
          </div>
        ) : (
          <div className="relative w-full max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-md">
            <img
              src={profile.photoUrl}
              alt={profile.photoCaption}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-bold drop-shadow-sm">
                📷 {profile.photoCaption}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Dimension & Performance Badges */}
      <div className="grid grid-cols-4 gap-1.5 p-3 text-center bg-slate-50/40 dark:bg-slate-950/20 text-[11px] font-mono border-b border-slate-100 dark:border-slate-800/60">
        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 block">Tam Boy (LOA)</span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold">{profile.lengthMeters} m</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 block">Genişlik (Beam)</span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold">{profile.beamMeters} m</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 block">Seyir Sürati</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{profile.speedKnots} Knot</strong>
        </div>
        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 block">Kapasite</span>
          <strong className="text-blue-600 dark:text-blue-400 font-bold">{capacityPax || profile.capacityPax} Kişi</strong>
        </div>
      </div>

      {/* Expandable Technical Dossier */}
      {isExpanded && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {profile.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Ruler size={14} className="text-cyan-500 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 block">Su Çekimi (Draft)</span>
                <strong className="text-slate-700 dark:text-slate-300">{profile.draftMeters} metre</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Anchor size={14} className="text-amber-500 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 block">Tersane & Gövde</span>
                <strong className="text-slate-700 dark:text-slate-300">{profile.shipyard}</strong>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
              GEMİ DONANIM & KONFOR ÖZELLİKLERİ
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
