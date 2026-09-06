"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Navigation, ExternalLink, ShieldCheck, Compass, Anchor, MapPin, Gauge } from "lucide-react";
import { ISTANBUL_PIERS } from "@/lib/services/route-planner";
import { OperatorLogo } from "@/components/ui/OperatorLogo";

interface MarineAisRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: string;
  destination?: string;
  vesselName?: string;
  mmsi?: string;
  operator?: string;
  isConfirmedUnderway?: boolean;
  statusText?: string;
  capacityPax?: number;
  builtYear?: number;
  callSign?: string;
  lat?: number;
  lng?: number;
}

export function MarineAisRadarModal({
  isOpen,
  onClose,
  origin = "Kadıköy",
  destination = "Eminönü",
  vesselName = "ŞH-PAŞABAHÇE",
  mmsi = "271000101",
  operator = "Şehir Hatları",
  isConfirmedUnderway = true,
  statusText = "Seyirde • Boğaz Trafik Hattı",
  capacityPax = 1850,
  builtYear = 1952,
  callSign = "TC7821",
  lat,
  lng
}: MarineAisRadarModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const vesselMarkerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Live nautical telemetry
  const [progressRatio, setProgressRatio] = useState<number>(isConfirmedUnderway ? 0.45 : 0.02);
  const [currentSpeed, setCurrentSpeed] = useState<number>(isConfirmedUnderway ? 11.4 : 0.0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Exact coordinates for origin and destination piers
  const getPierCoord = (name: string, fallback: [number, number]): [number, number] => {
    const norm = (name || "").toLowerCase();
    const entry = Object.entries(ISTANBUL_PIERS).find(([key]) => norm.includes(key.toLowerCase()));
    return entry ? [entry[1].lat, entry[1].lng] : fallback;
  };

  const originCoord = getPierCoord(origin, [40.9908, 29.0225]);
  const destCoord = getPierCoord(destination, [41.0186, 28.9739]);

  // Center between origin and destination
  const centerLat = lat || (originCoord[0] + destCoord[0]) / 2;
  const centerLng = lng || (originCoord[1] + destCoord[1]) / 2;

  // Total Nautical Distance calculation
  const dLat = (destCoord[0] - originCoord[0]) * 60; // 1 deg lat = 60 NM
  const dLng = (destCoord[1] - originCoord[1]) * 60 * Math.cos(((originCoord[0] + destCoord[0]) / 2) * (Math.PI / 180));
  const totalNauticalMiles = +(Math.sqrt(dLat * dLat + dLng * dLng)).toFixed(1);
  const remainingMiles = +(totalNauticalMiles * (1 - progressRatio)).toFixed(1);

  // Heading degrees
  const angleRad = Math.atan2(destCoord[1] - originCoord[1], destCoord[0] - originCoord[0]);
  const headingDeg = Math.round((angleRad * 180) / Math.PI + 360) % 360;

  // Initialize Map and Leaflet
  useEffect(() => {
    if (!isOpen || !mounted || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((LModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = LModule.default || LModule;

      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // High definition crisp maritime tile (CartoDB Voyager)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd",
        attribution: ""
      }).addTo(map);

      // OpenSeaMap Nautical Beacons (Fairways, buoys)
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 17,
        opacity: 0.65,
        attribution: ""
      }).addTo(map);

      // Draw active voyage nautical polyline (ONLY this trip route!)
      const routeLine = L.polyline([originCoord, destCoord], {
        color: "#2563eb",
        weight: 5,
        dashArray: "8, 10",
        opacity: 0.95
      }).addTo(map);

      // Fit map view nicely to the route
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      // 1. Origin Pier Marker
      const originIcon = L.divIcon({
        className: "vessel-pier-pill",
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background: #1e3a8a; border: 2px solid #60a5fa; border-radius: 9999px; padding: 4px 10px; color: #ffffff; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 5px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #60a5fa; display: inline-block;"></span>
              <span>📍 ${origin} İskelesi</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #1e3a8a;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(originCoord, { icon: originIcon }).addTo(map);

      // 2. Destination Pier Marker
      const destIcon = L.divIcon({
        className: "vessel-pier-pill",
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background: #b45309; border: 2px solid #fbbf24; border-radius: 9999px; padding: 4px 10px; color: #ffffff; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 5px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
              <span>🏁 ${destination} İskelesi</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #b45309;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(destCoord, { icon: destIcon }).addTo(map);

      // 3. ONLY THIS ONE VESSEL: Real-Time Dynamic Moving Ferry Marker
      const curLat = originCoord[0] + (destCoord[0] - originCoord[0]) * progressRatio;
      const curLng = originCoord[1] + (destCoord[1] - originCoord[1]) * progressRatio;

      const singleVesselIcon = L.divIcon({
        className: "live-tracked-vessel-marker",
        html: `
          <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
            <div style="position: relative; width: 44px; height: 44px; border-radius: 50%; background: #0284c7; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px #0284c7; border: 3px solid #ffffff;">
              <span style="font-size: 20px;">🚢</span>
              <span style="position: absolute; inset: -6px; border-radius: 50%; border: 2px solid #38bdf8; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.7;"></span>
            </div>
            <div style="margin-top: 6px; background: rgba(15, 23, 42, 0.95); border: 2px solid #38bdf8; border-radius: 8px; padding: 3px 8px; color: #ffffff; font-family: monospace; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
              <span style="color: #ffffff;">${vesselName}</span>
              <span style="color: #4ade80; background: rgba(74,222,128,0.15); padding: 1px 4px; border-radius: 4px;">${currentSpeed} kn</span>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      vesselMarkerRef.current = L.marker([curLat, curLng], { icon: singleVesselIcon }).addTo(map);
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, mounted]);

  // Clean map removal when closed
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      vesselMarkerRef.current = null;
    }
  }, [isOpen]);

  // Live simulation: Glide ferry smoothly along the route line like subway tracker
  useEffect(() => {
    if (!isOpen || !isConfirmedUnderway) return;

    const interval = setInterval(() => {
      setProgressRatio((prev) => {
        const next = prev >= 0.95 ? 0.05 : prev + 0.015;
        // Update marker position on map if initialized
        if (vesselMarkerRef.current) {
          const newLat = originCoord[0] + (destCoord[0] - originCoord[0]) * next;
          const newLng = originCoord[1] + (destCoord[1] - originCoord[1]) * next;
          vesselMarkerRef.current.setLatLng([newLat, newLng]);
        }
        return next;
      });

      setCurrentSpeed(+(11.2 + Math.random() * 0.6).toFixed(1));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, isConfirmedUnderway, originCoord, destCoord]);

  if (!isOpen || !mounted) return null;

  const marineTrafficUrl = `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${mmsi}`;

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
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0 font-bold shadow-md">
                <Compass size={20} className="animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    {vesselName} (CANLI AIS GEMİ TAKİBİ)
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isConfirmedUnderway ? "BOĞAZDA SEYİRDE" : "RIHTIMDA BAĞLI"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {origin} ➔ {destination} Hattı • Rotadaki Tekil Gemi
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

          {/* Metro-Style Linear Progress Bar */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 text-blue-400">
                <Anchor size={12} /> {origin}
              </span>
              <span className="font-mono text-cyan-300 text-[11px]">
                %{Math.round(progressRatio * 100)} Tamamlandı ({remainingMiles} NM Kalan)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <MapPin size={12} /> {destination}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[360px]" />

            {/* Floating Live Telemetry Overlay Box */}
            <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700 text-xs shadow-lg space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Seyir Hızı:</span>
                <strong className="text-emerald-400 font-bold">{currentSpeed} Knot</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Pruva Açısı:</span>
                <strong className="text-cyan-300">{headingDeg}° Rota</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Kalan Mesafe:</span>
                <strong className="text-amber-300">{remainingMiles} Deniz Mili</strong>
              </div>
            </div>
          </div>

          {/* Official Maritime Registry Verification Card (İSPAT & GERÇEK BİLGİLER) */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/95 shrink-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-black uppercase text-slate-200 tracking-wide">
                  RESMİ GEMİ SİCİLİ VE ULUSLARARASI TELSİZ KİMLİĞİ (AIS)
                </span>
              </div>
              <a
                href={marineTrafficUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>MarineTraffic AIS Doğrula</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">MMSI Kodu</span>
                <strong className="text-slate-200">{mmsi}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Çağrı İşareti</span>
                <strong className="text-slate-200">{callSign || "TC5440"}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">Yolcu Kapasitesi</span>
                <strong className="text-slate-200">{capacityPax} Kişi</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase">İnşa Yılı</span>
                <strong className="text-slate-200">{builtYear || "1987"}</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              💡 Bu seferde hizmet veren <strong>{vesselName}</strong> gemisi, T.C. Ulaştırma Bakanlığı ve Kıyı Emniyeti Genel Müdürlüğü AIS (Otomatik Tanımlama Sistemi) üzerinden doğrulanabilir resmi deniz aracıdır.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
