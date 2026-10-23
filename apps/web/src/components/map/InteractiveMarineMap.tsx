"use client";

import { useEffect, useRef, useState } from "react";
import { Radar } from "lucide-react";
import { MarineAisRadarModal } from "./MarineAisRadarModal";
import "leaflet/dist/leaflet.css";
import { ISTANBUL_PIERS } from "@/lib/data/piers";
import type { ScheduleCardDto } from "@/lib/types/schedule";

interface InteractiveMarineMapProps {
  selectedOrigin?: string;
  selectedDestination?: string;
  onSelectPier?: (pierName: string, role: "origin" | "destination") => void;
  schedules?: ScheduleCardDto[];
  height?: string;
  interactive?: boolean;
}

const PRIMARY_VISIBLE_LABEL_PIERS = new Set([
  "Kadıköy",
  "Eminönü",
  "Kabataş",
  "Beşiktaş",
  "Üsküdar",
  "Bostancı",
  "Büyükada",
  "Heybeliada",
  "Burgazada",
  "Kınalıada",
  "Karaköy",
  "Sarıyer",
  "Ortaköy",
  "Moda",
  "Bakırköy",
  "Kartal",
]);

function resolveCleanPier(name?: string) {
  if (!name || name === "ALL" || name === "Tümü") return undefined;
  const clean = name.replace(/\s*\(Ring\).*$/i, "").trim();
  return ISTANBUL_PIERS[clean];
}

export function InteractiveMarineMap({
  selectedOrigin,
  selectedDestination,
  onSelectPier,
  height = "250px",
  interactive = true
}: InteractiveMarineMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const nauticalTileRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Initialize Leaflet Map (Pure Nautical Vector Maritime Map)
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

      const map = L.map(mapContainerRef.current, {
        center: [40.955, 29.055],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: false,
        touchZoom: interactive
      });

      // Crisp Nautical/Voyager Layer (CartoDB Voyager)
      nauticalTileRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 18, crossOrigin: true }
      );
      nauticalTileRef.current.addTo(map);

      if (interactive) {
        L.control.zoom({ position: "bottomright" }).addTo(map);
      }

      routeLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);

      // Ensure tiles fill container after layout settle
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    });

    return () => {
      isCancelled = true;
      setMapReady(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, interactive]);

  // 2. Render Markers, Active Route Corridor & Fit Bounds with Safe Padding (Zero Clipping)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !routeLayerRef.current || !markersLayerRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      const map = mapInstanceRef.current;
      if (!map) return;

      routeLayerRef.current.clearLayers();
      markersLayerRef.current.clearLayers();

      const originPier = resolveCleanPier(selectedOrigin);
      const destPier = resolveCleanPier(selectedDestination);

      Object.values(ISTANBUL_PIERS).forEach((pier) => {
        const isOrigin = originPier?.name === pier.name;
        const isDest = destPier?.name === pier.name;
        const isSelected = isOrigin || isDest;
        const showLabel = isSelected || PRIMARY_VISIBLE_LABEL_PIERS.has(pier.name);

        const dotColor = isOrigin
          ? "background:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,0.35);"
          : isDest
          ? "background:#38bdf8;box-shadow:0 0 0 4px rgba(56,189,248,0.35);"
          : "background:#1e293b;border:1.5px solid #94a3b8;";

        const labelStyle = isOrigin
          ? "background:#064e3b;color:#ecfdf5;border:1px solid #10b981;font-weight:900;"
          : isDest
          ? "background:#0c4a6e;color:#e0f2fe;border:1px solid #38bdf8;font-weight:900;"
          : "background:rgba(15,23,42,0.88);color:#e2e8f0;border:1px solid rgba(100,116,139,0.5);font-weight:700;";

        const markerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);cursor:pointer;">
            ${
              showLabel
                ? `<span style="font-size:10px;line-height:1.1;padding:2px 6px;border-radius:6px;white-space:nowrap;margin-bottom:3px;box-shadow:0 2px 6px rgba(0,0,0,0.45);${labelStyle}">${pier.name}</span>`
                : ""
            }
            <div style="width:${isSelected ? "12px" : "9px"};height:${isSelected ? "12px" : "9px"};border-radius:9999px;border:2px solid #ffffff;${dotColor}"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "clean-pier-marker",
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const marker = L.marker([pier.lat, pier.lng], { icon });
        marker.on("click", () => {
          if (onSelectPier) {
            if (!selectedOrigin || (selectedOrigin && selectedDestination)) {
              onSelectPier(pier.name, "origin");
            } else {
              onSelectPier(pier.name, "destination");
            }
          }
        });
        markersLayerRef.current.addLayer(marker);
      });

      if (originPier && destPier && originPier.name !== destPier.name) {
        // Outer glow line
        const glowLine = L.polyline(
          [
            [originPier.lat, originPier.lng],
            [destPier.lat, destPier.lng]
          ],
          {
            color: "#0ea5e9",
            weight: 8,
            opacity: 0.35,
            lineCap: "round"
          }
        );
        // Inner crisp dashed route line
        const coreLine = L.polyline(
          [
            [originPier.lat, originPier.lng],
            [destPier.lat, destPier.lng]
          ],
          {
            color: "#0284c7",
            weight: 3.5,
            opacity: 0.95,
            dashArray: "7, 7",
            lineCap: "round"
          }
        );
        routeLayerRef.current.addLayer(glowLine);
        routeLayerRef.current.addLayer(coreLine);

        const bounds = L.latLngBounds([
          [originPier.lat, originPier.lng],
          [destPier.lat, destPier.lng]
        ]);
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      } else {
        // Fit core Marmara + Bosphorus corridor with generous padding so islands are never clipped
        const defaultBounds = L.latLngBounds([
          [40.865, 28.965],
          [41.055, 29.145]
        ]);
        map.fitBounds(defaultBounds, { padding: [28, 28], maxZoom: 12 });
      }
    });
  }, [selectedOrigin, selectedDestination, mapReady, onSelectPier]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl"
      style={{
        height,
        background: "linear-gradient(180deg, #0c223f 0%, #071529 100%)"
      }}
    >
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Overlay Badge */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-bold text-white shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>🗺️ Deniz Ulaşım Haritası</span>
      </div>

      {/* Top Right Controls Bar */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsRadarOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow-lg transition-all cursor-pointer"
        >
          <Radar size={12} />
          <span>Gemi Sicili & AIS</span>
        </button>
      </div>

      {/* Radar / Fleet Registry Modal */}
      <MarineAisRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        origin={selectedOrigin || "Bostancı"}
        destination={selectedDestination || "Büyükada"}
      />
    </div>
  );
}
