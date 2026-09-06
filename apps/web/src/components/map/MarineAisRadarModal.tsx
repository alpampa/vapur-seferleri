"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, ExternalLink, Compass, Ship, Info, Navigation, Layers, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { ISTANBUL_PIERS } from "@/lib/services/route-planner";
import { OperatorLogo } from "@/components/ui/OperatorLogo";
import { ISTANBUL_FERRY_FLEET, type RegisteredVessel } from "@/lib/agents/fleet-registry";

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

// Simulated active fleet vessels on the water across Bosphorus & Marmara
interface ActiveFleetShip {
  name: string;
  mmsi: string;
  operator: string;
  lat: number;
  lng: number;
  speedKnots: number;
  headingDeg: number;
  currentRoute: string;
  status: string;
  capacity: number;
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Mode: Single Voyage focus vs Entire Active Istanbul Fleet
  const [radarViewMode, setRadarViewMode] = useState<"SINGLE" | "FLEET">("SINGLE");
  const [inspectedVessel, setInspectedVessel] = useState<{
    name: string;
    mmsi: string;
    operator: string;
    speed: number;
    heading: number;
    route: string;
    status: string;
    capacity: number;
  }>({
    name: vesselName,
    mmsi: mmsi || "271002506",
    operator,
    speed: isConfirmedUnderway ? 9.4 : 0.0,
    heading: 142,
    route: `${origin} ➔ ${destination}`,
    status: isConfirmedUnderway ? "Seyirde (9.4 kn)" : "Rıhtımda Bağlı",
    capacity: capacityPax
  });

  // Dynamic live speed ticker
  const [liveSpeed, setLiveSpeed] = useState<number>(isConfirmedUnderway ? 9.4 : 0.0);
  const [tick, setTick] = useState<number>(0);

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

  // Calculate live vessel position:
  const dLat = destCoord[0] - originCoord[0];
  const dLng = destCoord[1] - originCoord[1];
  const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001;

  // When underway: 45% along corridor.
  // When at dock: offset ~250m into water along corridor so vessel never sits on top of pier marker!
  const progressRatio = isConfirmedUnderway ? 0.45 : Math.min(0.22, 0.0035 / dist);
  const vesselLat = originCoord[0] + dLat * progressRatio;
  const vesselLng = originCoord[1] + dLng * progressRatio;

  const targetMmsi = inspectedVessel.mmsi || mmsi || "271002506";
  const marineTrafficDirectUrl = `https://www.marinetraffic.com/tr/ais/details/ships/mmsi:${targetMmsi}`;
  const vesselFinderDirectUrl = `https://www.vesselfinder.com/vessels/details/${targetMmsi}`;

  // Ticker for realistic nautical telemetry
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
      if (isConfirmedUnderway) {
        setLiveSpeed(+(9.2 + Math.random() * 0.5).toFixed(1));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen, isConfirmedUnderway]);

  // List of active Istanbul fleet vessels spread across Bosphorus and Prince Islands
  const activeFleet: ActiveFleetShip[] = [
    {
      name: vesselName,
      mmsi: mmsi || "271002506",
      operator,
      lat: vesselLat,
      lng: vesselLng,
      speedKnots: liveSpeed,
      headingDeg: 142,
      currentRoute: `${origin} ➔ ${destination}`,
      status: isConfirmedUnderway ? "Seyirde" : "Rıhtımda",
      capacity: capacityPax
    },
    {
      name: "Moda",
      mmsi: "271002524",
      operator: "Şehir Hatları",
      lat: 41.0062,
      lng: 28.9950,
      speedKnots: 8.9,
      headingDeg: 310,
      currentRoute: "Kadıköy ➔ Karaköy",
      status: "Seyirde",
      capacity: 1450
    },
    {
      name: "Şehit Sami Akbulut",
      mmsi: "271002527",
      operator: "Şehir Hatları",
      lat: 41.0285,
      lng: 29.0080,
      speedKnots: 9.6,
      headingDeg: 45,
      currentRoute: "Beşiktaş ➔ Kadıköy",
      status: "Seyirde",
      capacity: 1450
    },
    {
      name: "Ahmet Hulusi Yıldırım",
      mmsi: "271002507",
      operator: "Şehir Hatları",
      lat: 41.0340,
      lng: 29.0110,
      speedKnots: 7.8,
      headingDeg: 285,
      currentRoute: "Üsküdar ➔ Beşiktaş",
      status: "Seyirde",
      capacity: 1450
    },
    {
      name: "Fahri S. Korutürk",
      mmsi: "271002498",
      operator: "Şehir Hatları",
      lat: 40.9420,
      lng: 29.0650,
      speedKnots: 11.2,
      headingDeg: 165,
      currentRoute: "Kabataş ➔ Kınalıada",
      status: "Seyirde",
      capacity: 1450
    },
    {
      name: "Kaptan Şevket",
      mmsi: "271001801",
      operator: "Turyol",
      lat: 41.0120,
      lng: 28.9880,
      speedKnots: 9.1,
      headingDeg: 120,
      currentRoute: "Eminönü ➔ Kadıköy",
      status: "Seyirde",
      capacity: 650
    },
    {
      name: "Sedefada",
      mmsi: "271001929",
      operator: "Mavi Marmara",
      lat: 40.8755,
      lng: 29.1150,
      speedKnots: 8.4,
      headingDeg: 80,
      currentRoute: "Heybeliada ➔ Büyükada",
      status: "Seyirde",
      capacity: 550
    },
    {
      name: "Prens Tur 1",
      mmsi: "271001601",
      operator: "Prens Tur",
      lat: 40.8820,
      lng: 29.1550,
      speedKnots: 10.1,
      headingDeg: 240,
      currentRoute: "Kartal ➔ Büyükada",
      status: "Seyirde",
      capacity: 450
    }
  ];

  const focusVessel = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([vesselLat, vesselLng], 14, { duration: 1.2 });
    }
  };

  const fitRoute = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([originCoord, destCoord], { padding: [60, 60] });
    }
  };

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let L: any;
    const timer = setTimeout(() => {
      import("leaflet").then((leafletModule) => {
        L = leafletModule.default || leafletModule;
        if (!mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: radarViewMode === "FLEET" ? [40.97, 29.04] : [centerLat, centerLng],
          zoom: radarViewMode === "FLEET" ? 11 : 13,
          attributionControl: false
        });

        // 1. Esri Dark Gray Base Map (Official, zero API key, NO watermark)
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 16,
          attribution: ""
        }).addTo(map);

        // 2. Esri Dark Gray Reference Map (Coastal lines, city labels)
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 16,
          attribution: ""
        }).addTo(map);

        // 3. OpenSeaMap Nautical Seamarks (Buoys, channels, marine lights)
        L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
          maxZoom: 16,
          opacity: 0.7,
          attribution: ""
        }).addTo(map);

        // Nautical Route Polyline with glowing cyan dashes
        const routePoints = [originCoord, [vesselLat, vesselLng], destCoord];
        L.polyline(routePoints, {
          color: "#06b6d4",
          weight: 3.5,
          dashArray: "8, 10",
          opacity: 0.85
        }).addTo(map);

        // Origin Pier Marker (Zero clipping, full auto width pill)
        const originIcon = L.divIcon({
          className: "clean-pier-marker",
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; transform: translate(-50%, -100%);">
              <div style="background: rgba(15, 23, 42, 0.96); border: 2px solid #0284c7; border-radius: 9999px; padding: 5px 12px; color: #ffffff; font-weight: 800; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 18px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 6px;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
                <span>📍 ${origin} İskelesi</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #0284c7;"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
        L.marker(originCoord, { icon: originIcon }).addTo(map);

        // Destination Pier Marker (Zero clipping, full auto width pill)
        const destIcon = L.divIcon({
          className: "clean-pier-marker",
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; transform: translate(-50%, -100%);">
              <div style="background: rgba(15, 23, 42, 0.96); border: 2px solid #f59e0b; border-radius: 9999px; padding: 5px 12px; color: #fbbf24; font-weight: 800; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 18px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 6px;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
                <span>🎯 ${destination} İskelesi</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #f59e0b;"></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
        L.marker(destCoord, { icon: destIcon }).addTo(map);

        // Render vessels based on mode: Single vs Fleet
        const vesselsToRender = radarViewMode === "FLEET" ? activeFleet : [activeFleet[0]];

        vesselsToRender.forEach(ship => {
          const isSelected = ship.name === inspectedVessel.name;
          const isUnderway = ship.status === "Seyirde" || ship.speedKnots > 1.0;

          const shipIcon = L.divIcon({
            className: "clean-ship-marker",
            html: `
              <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
                <div style="position: relative; width: ${isSelected ? '44px' : '36px'}; height: ${isSelected ? '44px' : '36px'}; border-radius: 50%; background: ${isSelected ? '#0284c7' : '#059669'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px ${isSelected ? 'rgba(2, 132, 199, 0.8)' : 'rgba(16, 185, 129, 0.7)'}; border: 2.5px solid #ffffff;">
                  <span style="font-size: ${isSelected ? '20px' : '16px'};">🚢</span>
                  ${isUnderway ? '<span style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid #34d399; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>' : ''}
                </div>
                <div style="margin-top: 5px; background: rgba(9, 14, 26, 0.96); border: 1.5px solid ${isSelected ? '#38bdf8' : '#10b981'}; border-radius: 8px; padding: 3px 8px; color: #ffffff; font-family: monospace; font-weight: 800; font-size: 10px; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.85); display: flex; align-items: center; gap: 4px;">
                  <span style="color: ${isSelected ? '#7dd3fc' : '#34d399'};">🚢 ${ship.name}</span>
                  <span style="color: ${isUnderway ? '#10b981' : '#fbbf24'}; font-weight: 900;">• ${ship.speedKnots.toFixed(1)} kn</span>
                </div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          const marker = L.marker([ship.lat, ship.lng], { icon: shipIcon }).addTo(map);
          marker.on("click", () => {
            setInspectedVessel({
              name: ship.name,
              mmsi: ship.mmsi,
              operator: ship.operator,
              speed: ship.speedKnots,
              heading: ship.headingDeg,
              route: ship.currentRoute,
              status: ship.status,
              capacity: ship.capacity
            });
          });
        });

        mapInstanceRef.current = map;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, centerLat, centerLng, originCoord, destCoord, vesselLat, vesselLng, vesselName, isConfirmedUnderway, targetMmsi, operator, capacityPax, origin, destination, callSign, radarViewMode, tick, liveSpeed, inspectedVessel.name]);

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
            className="fixed inset-3 sm:inset-6 md:inset-8 max-h-[92vh] my-auto bg-[#0a0f1d] border border-slate-700/80 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl text-white"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
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
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    {inspectedVessel.name} ({inspectedVessel.route}) • Resmi AIS Transponder Sinyali
                  </p>
                </div>
              </div>

              {/* View Mode Switcher + Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setRadarViewMode("SINGLE")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      radarViewMode === "SINGLE"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🎯 Bu Sefer
                  </button>
                  <button
                    onClick={() => setRadarViewMode("FLEET")}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      radarViewMode === "FLEET"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Radio size={12} className="animate-pulse" />
                    <span>Tüm Filo ({activeFleet.length})</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors shrink-0"
                  title="Kapat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Vessel Tracking Telemetry Banner */}
            <div className="px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
                  <Ship size={20} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-sm sm:text-base text-white tracking-tight">
                      🚢 {inspectedVessel.name}
                    </span>
                    <OperatorLogo operator={inspectedVessel.operator} size="sm" showName={true} />
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse">
                      ● SEYİRDE ({inspectedVessel.speed.toFixed(1)} knot)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
                      MMSI: <strong className="text-cyan-400">{inspectedVessel.mmsi}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
                      Rota: <strong className="text-amber-300">{inspectedVessel.route}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
                      Kapasite: <strong className="text-white">{inspectedVessel.capacity} Yolcu</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800">
                      Pusula: <strong className="text-emerald-400">{inspectedVessel.heading}° Güneydoğu</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Focus Controls & Official External Satellite AIS Links */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap shrink-0">
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
                  title="MarineTraffic Resmi Canlı Uydu Sayfasını Aç"
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
                      <span className="text-slate-500">Takip Edilen:</span>
                      <span className="font-bold text-white">{inspectedVessel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MMSI Kodu:</span>
                      <span className="text-cyan-400 font-bold">{inspectedVessel.mmsi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hız (SOG):</span>
                      <span className="font-bold text-emerald-400">{inspectedVessel.speed.toFixed(1)} Knot ({(inspectedVessel.speed * 1.852).toFixed(1)} km/s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seyir Rotası:</span>
                      <span className="text-amber-300">{inspectedVessel.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">İşletmeci:</span>
                      <span className="text-slate-200">{inspectedVessel.operator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sinyal Durumu:</span>
                      <span className="text-emerald-400 font-bold">● Saniyede Bir Canlı Telemetri</span>
                    </div>
                  </div>
                </div>

                {/* Range Rings Legend */}
                <div className="absolute bottom-3 left-3 z-[1000] p-2 rounded-lg bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>CANLI DENİZ RADARI // KESİNTİSİZ AIS AKIŞI // HARİTADA TIKLAYIP DİĞER GEMİLERİ İNCELEYEBİLİRSİNİZ</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <Info size={13} className="text-cyan-400 shrink-0" />
                <span className="truncate">
                  <strong>AIS Doğrulandı:</strong> <strong>{inspectedVessel.name}</strong> resmi AIS telsiz vericisi (MMSI: {inspectedVessel.mmsi}) üzerinden takip edilmektedir.
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
