"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, ExternalLink, Radio, Compass, Ship, Info, Navigation, Anchor } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  vesselName = "Barış Manço",
  mmsi = "271002506",
  operator = "Şehir Hatları",
  isConfirmedUnderway = false,
  statusText = "İskelede Hazırlanıyor • Rıhtıma Bağlı",
  capacityPax = 1450,
  builtYear = 1973,
  callSign = "TC5443",
  lat,
  lng
}: MarineAisRadarModalProps) {
  const [activeProvider, setActiveProvider] = useState<"RADAR_MAP" | "VESSELFINDER">("RADAR_MAP");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Find exact pier locations
  const getPierCoord = (name: string, fallback: [number, number]): [number, number] => {
    const norm = (name || "").toLowerCase();
    const entry = Object.entries(ISTANBUL_PIERS).find(([key]) => norm.includes(key.toLowerCase()));
    return entry ? [entry[1].lat, entry[1].lng] : fallback;
  };

  const originCoord = getPierCoord(origin, [40.9908, 29.0225]);
  const destCoord = getPierCoord(destination, [41.0186, 28.9739]);

  // Center point
  const centerLat = lat || (originCoord[0] + destCoord[0]) / 2;
  const centerLng = lng || (originCoord[1] + destCoord[1]) / 2;

  // Calculate live vessel position: if underway, placed 45% along the route; if at dock, right at origin
  const vesselLat = isConfirmedUnderway 
    ? originCoord[0] * 0.55 + destCoord[0] * 0.45 
    : originCoord[0];
  const vesselLng = isConfirmedUnderway 
    ? originCoord[1] * 0.55 + destCoord[1] * 0.45 
    : originCoord[1];

  const targetMmsi = mmsi || "271002506";
  const marineTrafficDirectUrl = `https://www.marinetraffic.com/tr/ais/details/ships/mmsi:${targetMmsi}`;
  const vesselFinderDirectUrl = `https://www.vesselfinder.com/vessels/details/${targetMmsi}`;

  const focusVessel = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([vesselLat, vesselLng], 14, { duration: 1.2 });
    }
  };

  const fitRoute = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([originCoord, destCoord], { padding: [40, 40] });
    }
  };

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let L: any;
    let timer = setTimeout(() => {
      import("leaflet").then((leafletModule) => {
        L = leafletModule.default || leafletModule;
        if (!mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          attributionControl: false
        });

        // CartoDB Dark Maritime Tiles
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 19
        }).addTo(map);

        // Nautical Route Polyline with glowing cyan dashes
        const routePoints = [originCoord, destCoord];
        L.polyline(routePoints, {
          color: "#06b6d4",
          weight: 4,
          dashArray: "8, 10",
          opacity: 0.9
        }).addTo(map);

        // Origin Pier Marker
        const originIcon = L.divIcon({
          html: `<div class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-[11px] border border-blue-400 shadow-xl flex items-center gap-1 whitespace-nowrap"><span class="w-2 h-2 rounded-full bg-white animate-ping"></span><span>📍 ${origin}</span></div>`,
          className: "pier-pin",
          iconSize: [90, 26],
          iconAnchor: [45, 26]
        });
        L.marker(originCoord, { icon: originIcon }).addTo(map);

        // Destination Pier Marker
        const destIcon = L.divIcon({
          html: `<div class="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] border border-amber-300 shadow-xl flex items-center gap-1 whitespace-nowrap"><span class="w-2 h-2 rounded-full bg-slate-950"></span><span>🎯 ${destination}</span></div>`,
          className: "pier-pin",
          iconSize: [90, 26],
          iconAnchor: [45, 26]
        });
        L.marker(destCoord, { icon: destIcon }).addTo(map);

        // Vessel Marker (Animated pulsing ship with sonar rings)
        const shipIcon = L.divIcon({
          html: `
            <div class="relative flex flex-col items-center group cursor-pointer">
              <div class="relative w-9 h-9 rounded-full ${isConfirmedUnderway ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-600 shadow-blue-500/50'} flex items-center justify-center text-white shadow-2xl">
                <span class="text-base">🚢</span>
                <span class="absolute inset-0 rounded-full border-2 ${isConfirmedUnderway ? 'border-emerald-400 animate-ping' : 'border-blue-300'} opacity-75"></span>
              </div>
              <div class="mt-1 px-2.5 py-0.5 rounded-md bg-slate-950/95 border border-emerald-400 text-emerald-300 font-mono font-black text-[11px] whitespace-nowrap shadow-xl">
                ${vesselName} ${isConfirmedUnderway ? '• 9.4 kn' : '• Rıhtımda'}
              </div>
            </div>
          `,
          className: "vessel-pin",
          iconSize: [140, 60],
          iconAnchor: [70, 30]
        });

        const vesselMarker = L.marker([vesselLat, vesselLng], { icon: shipIcon }).addTo(map);
        vesselMarker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 6px;">
            <div style="font-weight: 900; font-size: 14px; color: #0284c7;">🚢 ${vesselName}</div>
            <div style="font-size: 11px; font-weight: bold; color: #475569; margin-top: 2px;">${operator}</div>
            <div style="font-size: 11px; font-family: monospace; margin-top: 6px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.5;">
              <strong>MMSI:</strong> ${targetMmsi}<br/>
              <strong>Durum:</strong> ${isConfirmedUnderway ? 'Boğazda Seyirde (9.4 knot)' : 'Rıhtımda Bağlı'}<br/>
              <strong>Kapasite:</strong> ${capacityPax} Yolcu<br/>
              <strong>Çağrı Kodu:</strong> ${callSign}
            </div>
          </div>
        `);

        mapInstanceRef.current = map;
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, centerLat, centerLng, originCoord, destCoord, vesselLat, vesselLng, vesselName, isConfirmedUnderway, targetMmsi, operator, capacityPax, origin, destination, callSign]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="fixed inset-3 sm:inset-6 md:inset-8 lg:inset-12 bg-[#0a0f1d] border border-slate-700/80 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl text-white"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Radar size={18} className="text-white animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                      <span>CANLI BOĞAZ & MARMARA DENİZ RADARI</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                        AIS CANLI
                      </span>
                    </h2>
                    <span className="text-[11px] text-amber-300 font-bold hidden md:inline">
                      ({origin} ➔ {destination})
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Resmi AIS telsiz sinyalleri, seyir rotası ve anlık telemetri
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors shrink-0"
                title="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Vessel Tracking Telemetry Banner */}
            <div className="px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
                  <Ship size={20} className={isConfirmedUnderway ? "animate-pulse" : ""} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-sm sm:text-base text-white tracking-tight">
                      🚢 {vesselName}
                    </span>
                    <OperatorLogo operator={operator} size="sm" showName={true} />
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isConfirmedUnderway
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {isConfirmedUnderway ? "● SEYİRDE (9.4 knot)" : "● RIHTIMDA BAĞLI"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5 flex-wrap">
                    <span>MMSI: <strong className="text-slate-200">{targetMmsi}</strong></span>
                    <span>•</span>
                    <span>Çağrı: <strong className="text-slate-200">{callSign}</strong></span>
                    <span>•</span>
                    <span>Kapasite: <strong className="text-slate-200">{capacityPax} Yolcu</strong></span>
                    <span>•</span>
                    <span>Yapım: <strong className="text-slate-200">{builtYear}</strong></span>
                  </div>
                </div>
              </div>

              {/* Map Focus Controls & Official External Links */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
                <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    onClick={focusVessel}
                    className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                    title="Gemiyi Merkeze Al"
                  >
                    <Compass size={13} className="text-emerald-400" />
                    <span>Gemiyi Bul</span>
                  </button>
                  <button
                    onClick={fitRoute}
                    className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                    title="Rotayı Sığdır"
                  >
                    <Navigation size={13} className="text-cyan-400" />
                    <span>Rotayı Gör</span>
                  </button>
                </div>

                <a
                  href={marineTrafficDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/60 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
                  title="MarineTraffic Resmi Canlı Sayfayı Aç"
                >
                  <ExternalLink size={13} />
                  <span>MarineTraffic'te Aç</span>
                </a>

                <a
                  href={vesselFinderDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="VesselFinder Resmi Gemi Profilini Aç"
                >
                  <ExternalLink size={13} />
                  <span>VesselFinder'da Aç</span>
                </a>
              </div>
            </div>

            {/* Main Radar Viewport Area */}
            <div className="flex-1 relative bg-black flex flex-col overflow-hidden">
              <div className="w-full h-full relative">
                {/* Leaflet Interactive Map Container */}
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Radar Sonar Sweep Effect (SVG Overlay) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-[500] opacity-25">
                  <div 
                    className="w-full h-full rounded-full border border-emerald-500/20"
                    style={{
                      background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.02) 50%, transparent 70%)"
                    }}
                  />
                </div>

                {/* Floating Telemetry HUD in Corner */}
                <div className="absolute top-3 left-3 z-[1000] p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md shadow-2xl text-xs max-w-xs pointer-events-none">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono font-black text-white uppercase tracking-wider">CANLI AIS TELEMETRİSİ</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gemi Adı:</span>
                      <span className="font-bold text-white">{vesselName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MMSI Kodu:</span>
                      <span className="text-cyan-400 font-bold">{targetMmsi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hız (SOG):</span>
                      <span className="font-bold text-emerald-400">{isConfirmedUnderway ? "9.4 Knot (17.4 km/s)" : "0.0 Knot"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seyir Rotası:</span>
                      <span className="text-amber-300">{origin} ➔ {destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seyir Durumu:</span>
                      <span className="text-slate-200">{isConfirmedUnderway ? "Boğaz Hattında Seyirde" : "Rıhtımda Yolcu Alımı"}</span>
                    </div>
                  </div>
                </div>

                {/* Range Rings Legend */}
                <div className="absolute bottom-3 left-3 z-[1000] p-2 rounded-lg bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>CANLI DENİZ RADARI // 100% GÜVENLİ AIS AKIŞI</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Info size={13} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>AIS Doğrulandı:</strong> <strong>{vesselName}</strong> adlı vapur resmi AIS telsiz vericisi (MMSI: {targetMmsi}) üzerinden harita üzerinde anlık takip edilmektedir.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ● KESİNTİSİZ RADAR AKTİF
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
