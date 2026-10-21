"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Anchor, BookOpen, Compass, Footprints, Landmark, MapPin, X } from "lucide-react";
import { ADALAR_HERITAGE_DATA, type IslandProfile } from "@/lib/data/adalar-heritage";
import { BOSPHORUS_LANDMARKS, type BosphorusLandmark } from "@/lib/data/bosphorus-landmarks";
import { ISTANBUL_PIERS, PIER_GEO_COORDINATES } from "@/lib/data/piers";

interface PierCulturalAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPierName: string;
  onSelectPierForSchedules?: (pierName: string) => void;
}

interface PierCoordinate {
  lat: number;
  lng: number;
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findIsland(pierName: string): IslandProfile | undefined {
  const target = normalize(pierName);
  return ADALAR_HERITAGE_DATA.find((island) => {
    const name = normalize(island.name);
    return name === target || target.includes(name) || name.includes(target) || island.id === target;
  });
}

function findCoordinate(pierName: string): PierCoordinate | undefined {
  const target = normalize(pierName);
  const entry = Object.entries(ISTANBUL_PIERS).find(
    ([key, value]) => normalize(key) === target || normalize(value.name) === target
  );
  if (entry) return entry[1];

  const geoEntry = Object.entries(PIER_GEO_COORDINATES).find(
    ([key]) => normalize(key) === target
  );
  return geoEntry?.[1];
}

function distanceKm(a: PierCoordinate, b: PierCoordinate): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function PierCulturalAtlasModal({
  isOpen,
  onClose,
  initialPierName,
  onSelectPierForSchedules,
}: PierCulturalAtlasModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const island = useMemo(() => findIsland(initialPierName), [initialPierName]);
  const coordinate = useMemo(() => findCoordinate(initialPierName), [initialPierName]);

  const nearbyLandmarks = useMemo<BosphorusLandmark[]>(() => {
    if (!coordinate) return BOSPHORUS_LANDMARKS.slice(0, 4);
    return [...BOSPHORUS_LANDMARKS]
      .map((landmark) => ({
        landmark,
        distance: distanceKm(coordinate, { lat: landmark.lat, lng: landmark.lng }),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4)
      .map((item) => item.landmark);
  }, [coordinate]);

  if (!isOpen || !mounted) return null;

  const pierRegion = ISTANBUL_PIERS[initialPierName]?.region;

  return createPortal(
    <div
      className="fixed inset-0 z-[99990] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${initialPierName} Semt Atlası`}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Landmark size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                {initialPierName} Semt Atlası
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin size={11} />
                {pierRegion ? `${pierRegion} yakası` : "İstanbul"} • Kültürel miras rehberi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {island ? (
            <>
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    {island.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-emerald-900/60 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {island.badge}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                    {island.greekName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {island.overview}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={12} /> Tarihi Duraklar
                </span>
                {island.heritagePoints.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {point.name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {point.era}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {point.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="inline-flex items-center gap-1">
                        <Footprints size={11} /> {point.walkingMinutes} dk yürüme
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Anchor size={11} /> {point.distanceFromPierKm} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Compass size={12} /> Ulaşım Notu
                </span>
                {island.transitRoutes.map((route) => (
                  <div
                    key={`${route.departurePier}-${route.approxDurationMin}`}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 text-[11px] text-slate-600 dark:text-slate-400"
                  >
                    <strong className="text-slate-900 dark:text-white">
                      {route.departurePier}
                    </strong>{" "}
                    • {route.operators.join(", ")} • ~{route.approxDurationMin} dk
                    <p className="mt-1 leading-relaxed">{route.tip}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {initialPierName} iskelesine en yakın tarihi noktalar. Mesafeler kuş uçuşu
                yaklaşık değerlerdir.
              </p>
              {nearbyLandmarks.map((landmark) => (
                <div
                  key={landmark.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {landmark.name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {landmark.builtYear}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {landmark.sideLabel}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {landmark.shortDesc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {onSelectPierForSchedules ? (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => {
                onSelectPierForSchedules(initialPierName);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer transition-colors"
            >
              {initialPierName} kalkışlı seferleri gör
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
