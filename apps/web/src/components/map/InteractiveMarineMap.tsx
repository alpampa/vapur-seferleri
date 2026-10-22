"use client";

import { useEffect, useRef, useState } from "react";
import { Radar, Satellite, Waves } from "lucide-react";
import { MarineAisRadarModal } from "./MarineAisRadarModal";
import "leaflet/dist/leaflet.css";
import { ISTANBUL_PIERS } from "@/lib/data/piers";
import type { ScheduleCardDto } from "@/lib/types/schedule";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";
import { MARINE_SWELL_TRACKS } from "@/lib/data/marine-swell-tracks";

interface InteractiveMarineMapProps {
  selectedOrigin?: string;
  selectedDestination?: string;
  onSelectPier?: (pierName: string, role: "origin" | "destination") => void;
  schedules?: ScheduleCardDto[];
  height?: string;
  interactive?: boolean;
}

export function InteractiveMarineMap({
  selectedOrigin,
  selectedDestination,
  onSelectPier,
  schedules = [],
  height = "420px",
  interactive = true
}: InteractiveMarineMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const vesselsLayerRef = useRef<any>(null);
  const satelliteTileRef = useRef<any>(null);
  const satelliteLabelsRef = useRef<any>(null);
  const darkTileRef = useRef<any>(null);
  const darkLabelsRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [mapMode, setMapMode] = useState<"SATELLITE" | "DARK">("SATELLITE");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      if (isCancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center between Historic Peninsula, Kadıköy and Prince Islands
      const map = L.map(mapContainerRef.current, {
        center: [40.92, 29.08],
        zoom: 11,
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive
      });

      // 1. Satellite Layers (Esri World Imagery)
      satelliteTileRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      );
      satelliteLabelsRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.85 }
      );

      // 2. Dark Maritime Base Layers
      darkTileRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16 }
      );
      darkLabelsRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16 }
      );

      // Default to Satellite
      if (mapMode === "SATELLITE") {
        satelliteTileRef.current.addTo(map);
        satelliteLabelsRef.current.addTo(map);
      } else {
        darkTileRef.current.addTo(map);
        darkLabelsRef.current.addTo(map);
      }

      // Create Pier Markers
      Object.values(ISTANBUL_PIERS).forEach((pier) => {
        const isOrigin = selectedOrigin === pier.name;
        const isDest = selectedDestination === pier.name;
        const isSelected = isOrigin || isDest;

        const markerHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer">
            <div class="w-4 h-4 rounded-full flex items-center justify-center ${
              isOrigin
                ? "bg-blue-500 ring-4 ring-blue-500/40 animate-pulse"
                : isDest
                ? "bg-amber-400 ring-4 ring-amber-400/40 animate-pulse"
                : "bg-slate-700 hover:bg-cyan-400 border border-slate-500"
            } shadow-lg transition-transform hover:scale-125">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
            <span class="text-[10px] font-black mt-1 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap ${
              isSelected
                ? "bg-slate-950 text-white border border-blue-400/60 font-black"
                : "bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-sm"
            }">
              ${pier.name}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "custom-pier-icon",
          iconSize: [60, 30],
          iconAnchor: [30, 8]
        });

        const marker = L.marker([pier.lat, pier.lng], { icon }).addTo(map);

        marker.on("click", () => {
          if (onSelectPier) {
            if (!selectedOrigin || (selectedOrigin && selectedDestination)) {
              onSelectPier(pier.name, "origin");
            } else {
              onSelectPier(pier.name, "destination");
            }
          }
        });
      });

      mapInstanceRef.current = map;
      routeLayerRef.current = L.layerGroup().addTo(map);
      vesselsLayerRef.current = L.layerGroup().addTo(map);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, interactive]);

  // Handle Map Mode Switch (Satellite vs Dark)
  useEffect(() => {
    if (!mapInstanceRef.current || !satelliteTileRef.current || !darkTileRef.current) return;
    const map = mapInstanceRef.current;

    if (mapMode === "SATELLITE") {
      map.removeLayer(darkTileRef.current);
      if (darkLabelsRef.current) map.removeLayer(darkLabelsRef.current);
      satelliteTileRef.current.addTo(map);
      if (satelliteLabelsRef.current) satelliteLabelsRef.current.addTo(map);
    } else {
      map.removeLayer(satelliteTileRef.current);
      if (satelliteLabelsRef.current) map.removeLayer(satelliteLabelsRef.current);
      darkTileRef.current.addTo(map);
      if (darkLabelsRef.current) darkLabelsRef.current.addTo(map);
    }
  }, [mapMode]);

  // Update Route Polyline when origin or destination changes
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      routeLayerRef.current.clearLayers();

      if (selectedOrigin && selectedDestination && selectedOrigin !== selectedDestination) {
        const p1 = ISTANBUL_PIERS[selectedOrigin];
        const p2 = ISTANBUL_PIERS[selectedDestination];

        if (p1 && p2) {
          const polyline = L.polyline(
            [
              [p1.lat, p1.lng],
              [p2.lat, p2.lng]
            ],
            {
              color: "#38bdf8",
              weight: 4,
              opacity: 0.9,
              dashArray: "6, 10"
            }
          );
          routeLayerRef.current.addLayer(polyline);

          const bounds = L.latLngBounds([
            [p1.lat, p1.lng],
            [p2.lat, p2.lng]
          ]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      }
    });
  }, [selectedOrigin, selectedDestination]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#090d16]" style={{ height }}>
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Controls Bar */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-2">
        {/* Layer Mode Toggle */}
        <div className="p-0.5 rounded-xl bg-slate-950/90 border border-slate-700 backdrop-blur-md flex items-center text-xs font-bold shadow-lg">
          <button
            type="button"
            onClick={() => setMapMode("SATELLITE")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mapMode === "SATELLITE"
                ? "bg-cyan-600 text-white font-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Satellite size={12} />
            <span>Gerçek Uydu</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode("DARK")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mapMode === "DARK"
                ? "bg-cyan-600 text-white font-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Waves size={12} />
            <span>Deniz Haritası</span>
          </button>
        </div>

        {/* Live AIS Radar Modal Trigger */}
        <button
          onClick={() => setIsRadarOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
        >
          <Radar size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>Gemi Sicili & Harici Takip</span>
        </button>
      </div>

      {/* Map Overlay Badge */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-bold text-white shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>{mapMode === "SATELLITE" ? "İstanbul Uydu Görüntüsü" : "🌊 Vektörel Deniz Haritası"}</span>
      </div>

      {/* Radar Modal */}
      <MarineAisRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        origin={selectedOrigin || "Bostancı"}
        destination={selectedDestination || "Büyükada"}
      />
    </div>
  );
}
