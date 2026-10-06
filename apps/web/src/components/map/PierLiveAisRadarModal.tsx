"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radar, ExternalLink, ShieldCheck, Compass, Anchor, MapPin, Radio, Waves, Info } from "lucide-react";
import { ISTANBUL_PIERS } from "@/lib/data/piers";

interface PierLiveAisRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pierName: string;
}

export function PierLiveAisRadarModal({
  isOpen,
  onClose,
  pierName = "Kadıköy"
}: PierLiveAisRadarModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeZone, setActiveZone] = useState<"500M" | "250M">("500M");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve pier coordinates
  const getPierCoord = (name: string): [number, number] => {
    const norm = (name || "").toLowerCase();
    const entry = Object.entries(ISTANBUL_PIERS).find(([key]) => norm.includes(key.toLowerCase()));
    return entry ? [entry[1].lat, entry[1].lng] : [40.9908, 29.0225];
  };

  const pierCoord = getPierCoord(pierName);

  useEffect(() => {
    if (!isOpen || !mounted || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then(LModule => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = LModule.default || LModule;

      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: pierCoord,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // CartoDB Voyager Tile
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd"
      }).addTo(map);

      // OpenSeaMap Nautical Beacons & Fairways
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 17,
        opacity: 0.7
      }).addTo(map);

      // 500m Nautical Zone Ring
      const circle500 = L.circle(pierCoord, {
        radius: 500,
        color: "#0284c7",
        fillColor: "#38bdf8",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6, 6"
      }).addTo(map);

      // 250m Inner Berthing Ring
      L.circle(pierCoord, {
        radius: 250,
        color: "#10b981",
        fillColor: "#34d399",
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: "4, 4"
      }).addTo(map);

      // Center Pier Beacon Marker
      const pierIcon = L.divIcon({
        className: "pier-ais-beacon",
        html: `
          <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
            <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: #1e3a8a; border: 3px solid #60a5fa; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px #3b82f6;">
              <span style="font-size: 16px;">⚓</span>
              <span style="position: absolute; inset: -8px; border-radius: 50%; border: 2px solid #60a5fa; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.7;"></span>
            </div>
            <div style="margin-top: 6px; background: rgba(15, 23, 42, 0.95); border: 2px solid #60a5fa; border-radius: 8px; padding: 2px 8px; color: #ffffff; font-family: monospace; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              📍 ${pierName} İskelesi
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker(pierCoord, { icon: pierIcon }).addTo(map);

      // Fit map view
      map.fitBounds(circle500.getBounds(), { padding: [30, 30] });
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, mounted, pierCoord, pierName]);

  // Cleanup map instance on close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const marineTrafficSectorUrl = `https://www.marinetraffic.com/en/ais/home/centerx:${pierCoord[1].toFixed(4)}/centery:${pierCoord[0].toFixed(4)}/zoom:15`;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto min-h-full">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative my-auto w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-white z-10 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 font-bold shadow-md">
                <Radar size={20} className="animate-spin" style={{ animationDuration: "8s" }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    {pierName} İSKELESİ ÇEVRESİ 500M CANLI RADAR
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                    <Radio size={10} className="animate-pulse text-emerald-400" />
                    <span>CANLI AIS TELSİZ ALICISI</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  İskele rıhtımına yaklaşan ve Boğaz trafik ayrımındaki tüm gerçek gemiler
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Interactive Map Canvas */}
          <div className="relative flex-1 min-h-[320px] sm:min-h-[400px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[400px]" />

            {/* Floating Sector Legend Box */}
            <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-xs shadow-xl space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-400" />
                <span className="text-slate-300">250m İskele Yanaşma Bölgesi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500/40 border border-blue-400" />
                <span className="text-slate-300">500m Yaklaşım & Manevra Sahası</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-cyan-300">
                <Compass size={12} />
                <span>Kıyı Emniyeti VTS Kanalı: Sektör Kadıköy / Marmara</span>
              </div>
            </div>

            {/* Bottom Direct AIS Button Overlay */}
            <div className="absolute bottom-3 left-3 right-3 z-[400] flex justify-center">
              <a
                href={marineTrafficSectorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs shadow-xl flex items-center gap-2 transition-all cursor-pointer border border-cyan-400/40"
              >
                <Radio size={14} className="animate-pulse" />
                <span>Bu Sektördeki Tüm Canlı Gemileri MarineTraffic Üzerinde Gör</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Footer Technical Note */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/95 shrink-0 flex items-start gap-2.5 text-xs text-slate-400">
            <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Bu radar, <strong>{pierName}</strong> iskelesinin coğrafi merkezini baz alarak Kıyı Emniyeti Genel Müdürlüğü ve OpenSeaMap deniz fenerleri/şamandıralarını görüntüler. Rıhtıma yanaşan vapurların AIS telsiz verileri 500 metrelik operasyon dairesi içerisinde taranmaktadır.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
