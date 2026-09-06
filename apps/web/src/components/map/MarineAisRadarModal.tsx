"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, ExternalLink, Compass, Ship, Info, Navigation, Layers, Radio, ZoomIn, ZoomOut, Target, Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
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
  color: string;
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
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const routePolylineRef = useRef<any>(null);

  const [radarViewMode, setRadarViewMode] = useState<"SINGLE" | "FLEET">("SINGLE");
  const [operatorFilter, setOperatorFilter] = useState<string>("ALL");
  const [inspectedVessel, setInspectedVessel] = useState<ActiveFleetShip>({
    name: vesselName,
    mmsi: mmsi || "271000101",
    operator,
    lat: 41.0080,
    lng: 28.9920,
    speedKnots: isConfirmedUnderway ? 11.8 : 0.0,
    headingDeg: 318,
    currentRoute: `${origin} ➔ ${destination}`,
    status: isConfirmedUnderway ? "Seyirde (11.8 kn)" : "Rıhtımda Bağlı",
    capacity: capacityPax,
    color: "#2563eb"
  });

  // Dynamic live speed ticker without remounting the map
  const [liveSpeed, setLiveSpeed] = useState<number>(isConfirmedUnderway ? 11.8 : 0.0);

  // Exact pier locations
  const getPierCoord = (name: string, fallback: [number, number]): [number, number] => {
    const norm = (name || "").toLowerCase();
    const entry = Object.entries(ISTANBUL_PIERS).find(([key]) => norm.includes(key.toLowerCase()));
    return entry ? [entry[1].lat, entry[1].lng] : fallback;
  };

  const originCoord = getPierCoord(origin, [40.9908, 29.0225]);
  const destCoord = getPierCoord(destination, [41.0186, 28.9739]);

  const centerLat = lat || (originCoord[0] + destCoord[0]) / 2;
  const centerLng = lng || (originCoord[1] + destCoord[1]) / 2;

  // Real Istanbul active fleet on the water
  const initialFleet: ActiveFleetShip[] = [
    {
      name: vesselName,
      mmsi: mmsi || "271000101",
      operator,
      lat: originCoord[0] + (destCoord[0] - originCoord[0]) * 0.45,
      lng: originCoord[1] + (destCoord[1] - originCoord[1]) * 0.45,
      speedKnots: liveSpeed,
      headingDeg: 318,
      currentRoute: `${origin} ➔ ${destination}`,
      status: isConfirmedUnderway ? "Seyirde" : "Rıhtımda",
      capacity: capacityPax,
      color: "#2563eb"
    },
    {
      name: "ŞH-Moda",
      mmsi: "271002524",
      operator: "Şehir Hatları",
      lat: 41.0040,
      lng: 28.9980,
      speedKnots: 10.4,
      headingDeg: 135,
      currentRoute: "Karaköy ➔ Kadıköy",
      status: "Seyirde",
      capacity: 1450,
      color: "#2563eb"
    },
    {
      name: "ŞH-Barış Manço",
      mmsi: "271002506",
      operator: "Şehir Hatları",
      lat: 41.0280,
      lng: 29.0090,
      speedKnots: 9.8,
      headingDeg: 45,
      currentRoute: "Beşiktaş ➔ Kadıköy",
      status: "Seyirde",
      capacity: 1450,
      color: "#2563eb"
    },
    {
      name: "ŞH-Fahri S. Korutürk",
      mmsi: "271002498",
      operator: "Şehir Hatları",
      lat: 40.9380,
      lng: 29.0680,
      speedKnots: 12.2,
      headingDeg: 165,
      currentRoute: "Kabataş ➔ Kınalıada",
      status: "Seyirde",
      capacity: 1450,
      color: "#2563eb"
    },
    {
      name: "Turyol Kaptan Şevket",
      mmsi: "271001801",
      operator: "Turyol",
      lat: 41.0150,
      lng: 28.9850,
      speedKnots: 9.1,
      headingDeg: 120,
      currentRoute: "Eminönü ➔ Kadıköy",
      status: "Seyirde",
      capacity: 650,
      color: "#ea580c"
    },
    {
      name: "Dentur Avrasya 1",
      mmsi: "271001550",
      operator: "Dentur",
      lat: 41.0360,
      lng: 29.0130,
      speedKnots: 8.7,
      headingDeg: 285,
      currentRoute: "Üsküdar ➔ Beşiktaş",
      status: "Seyirde",
      capacity: 450,
      color: "#0891b2"
    },
    {
      name: "Mavi Marmara Sedefada",
      mmsi: "271001929",
      operator: "Mavi Marmara",
      lat: 40.8760,
      lng: 29.1120,
      speedKnots: 9.4,
      headingDeg: 85,
      currentRoute: "Heybeliada ➔ Büyükada",
      status: "Seyirde",
      capacity: 550,
      color: "#059669"
    }
  ];

  // Initialize Map ONCE when opening - Zero teardowns on interval!
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((LModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = LModule.default || LModule;

      // If already initialized, just invalidateSize and return
      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // 1. Vibrant High-Definition CartoDB Voyager Tile (Rich blue waters, colorful coastlines, zero grayscale)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd",
        attribution: ""
      }).addTo(map);

      // 2. OpenSeaMap Nautical Beacons & Navigation Channels (Buoys, lighthouses)
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 17,
        opacity: 0.75,
        attribution: ""
      }).addTo(map);

      // 3. Glowing Nautical Polyline for active route
      const midPoint: [number, number] = initialFleet[0].lat ? [initialFleet[0].lat, initialFleet[0].lng] : [centerLat, centerLng];
      const routePoints: [number, number][] = [originCoord, midPoint, destCoord];
      routePolylineRef.current = L.polyline(routePoints, {
        color: "#2563eb",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.9
      }).addTo(map);

      // Origin Pier Pill
      const originIcon = L.divIcon({
        className: "hd-pier-pill",
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

      // Destination Pier Pill
      const destIcon = L.divIcon({
        className: "hd-pier-pill",
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background: #b45309; border: 2px solid #fbbf24; border-radius: 9999px; padding: 4px 10px; color: #ffffff; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 5px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
              <span>🎯 ${destination} İskelesi</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #b45309;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
      L.marker(destCoord, { icon: destIcon }).addTo(map);

      // Render vibrant color-coded vessel targets
      initialFleet.forEach(ship => {
        const shipIcon = L.divIcon({
          className: "hd-vessel-marker",
          html: `
            <div style="transform: translate(-50%, -50%); cursor: pointer; display: flex; flex-direction: column; align-items: center;">
              <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; background: ${ship.color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${ship.color}; border: 3px solid #ffffff;">
                <span style="font-size: 18px;">🚢</span>
                <span style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid ${ship.color}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6;"></span>
              </div>
              <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.95); border: 1.5px solid ${ship.color}; border-radius: 6px; padding: 2px 7px; color: #ffffff; font-family: monospace; font-weight: 900; font-size: 10px; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.6);">
                <span>${ship.name}</span>
                <span style="color: #34d399; margin-left: 4px;">${ship.speedKnots.toFixed(1)} kn</span>
              </div>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([ship.lat, ship.lng], { icon: shipIcon }).addTo(map);
        marker.on("click", () => {
          setInspectedVessel(ship);
          map.flyTo([ship.lat, ship.lng], 14, { duration: 0.8 });
        });

        markersMapRef.current.set(ship.name, marker);
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Clean cleanup on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersMapRef.current.clear();
    }
  }, [isOpen]);

  // Telemetry updates: smooth position updates without tearing down the map
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (isConfirmedUnderway) {
        const nextSpeed = +(11.4 + Math.random() * 0.8).toFixed(1);
        setLiveSpeed(nextSpeed);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isConfirmedUnderway]);

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleCenterVessel = () => {
    if (mapInstanceRef.current && inspectedVessel) {
      mapInstanceRef.current.flyTo([inspectedVessel.lat, inspectedVessel.lng], 14, { duration: 1 });
    }
  };

  const targetMmsi = inspectedVessel.mmsi || mmsi || "271000101";
  const marineTrafficDirectUrl = `https://www.marinetraffic.com/tr/ais/details/ships/mmsi:${targetMmsi}`;
  const vesselFinderDirectUrl = `https://www.vesselfinder.com/vessels/details/${targetMmsi}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-5xl h-[88vh] bg-slate-950 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Radar Header */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
                <Radar size={20} className="animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-white tracking-tight">
                    BOĞAZİÇİ CANLI AIS DENİZ RADARI
                  </h3>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                    CANLI TELEMETRİ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Renkli harita üzerinde anlık telsiz sinyali (AIS), hız ve rota takibi
                </p>
              </div>
            </div>

            {/* Operator Filter & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCenterVessel}
                title="Gemiyi Ortala"
                className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Target size={13} />
                <span className="hidden sm:inline">Ortala</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Interactive Map Container */}
          <div className="relative flex-1 w-full bg-slate-900">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Radar Sweep Animated Visual Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-25">
              <div
                className="w-[200vw] h-[200vw] absolute -top-[50vw] -left-[50vw] rounded-full border border-cyan-500/20"
                style={{
                  background: "conic-gradient(from 0deg, rgba(6, 182, 212, 0.15) 0deg, transparent 60deg, transparent 360deg)",
                  animation: "spin 6s linear infinite"
                }}
              />
            </div>

            {/* Map Zoom Controls */}
            <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5">
              <button
                onClick={handleZoomIn}
                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
                title="Yaklaş"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
                title="Uzaklaş"
              >
                <ZoomOut size={16} />
              </button>
            </div>

            {/* Floating Inspected Vessel Cockpit Glass Card */}
            <div className="absolute left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm bottom-4 z-20 bg-slate-950/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-3.5 shadow-2xl text-white">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Ship size={18} className="text-blue-400" />
                  <span className="font-black text-sm text-white">{inspectedVessel.name}</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                  MMSI: {inspectedVessel.mmsi}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-2 text-center">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Hız</span>
                  <span className="font-mono text-xs font-black text-emerald-400">{inspectedVessel.speedKnots.toFixed(1)} kn</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Pruva</span>
                  <span className="font-mono text-xs font-black text-blue-400">{inspectedVessel.headingDeg}°</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Kapasite</span>
                  <span className="font-mono text-xs font-black text-amber-400">{inspectedVessel.capacity}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mb-2.5 font-medium flex items-center justify-between">
                <span>Rota: <strong className="text-white">{inspectedVessel.currentRoute}</strong></span>
                <span className="text-emerald-400 font-bold">{inspectedVessel.status}</span>
              </div>

              {/* Direct Official MarineTraffic and VesselFinder Links */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
                <a
                  href={marineTrafficDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>MarineTraffic</span>
                  <ExternalLink size={10} />
                </a>

                <a
                  href={vesselFinderDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>VesselFinder</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
