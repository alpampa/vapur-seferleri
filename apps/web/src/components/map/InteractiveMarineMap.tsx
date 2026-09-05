"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { ISTANBUL_PIERS, type PierLocation } from "@/lib/services/route-planner";
import type { ScheduleCardDto } from "@/app/page";
import { resolveDynamicTrip } from "@/lib/utils/dynamic-trip";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let L: any;
    import("leaflet").then((leafletModule) => {
      L = leafletModule.default || leafletModule;

      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Center between Historic Peninsula, Kadıköy and Prince Islands
      const map = L.map(mapContainerRef.current, {
        center: [40.94, 29.04],
        zoom: 11,
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive
      });

      // Sleek Dark Matter Maritime Tiles (CartoDB Dark)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);

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
                : "bg-slate-900/90 text-slate-300 border border-slate-800"
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, interactive]);

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
          // Draw Glowing Sea Corridor Line
          const polyline = L.polyline(
            [
              [p1.lat, p1.lng],
              [p2.lat, p2.lng]
            ],
            {
              color: "#38bdf8",
              weight: 4,
              opacity: 0.85,
              dashArray: "6, 10"
            }
          );
          routeLayerRef.current.addLayer(polyline);

          // Fit Bounds
          const bounds = L.latLngBounds([
            [p1.lat, p1.lng],
            [p2.lat, p2.lng]
          ]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      }
    });
  }, [selectedOrigin, selectedDestination]);

  // Interpolate Active In-Transit Ferries on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !vesselsLayerRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      vesselsLayerRef.current.clearLayers();

      const now = Date.now();

      schedules.forEach((trip) => {
        const dyn = resolveDynamicTrip(
          trip.origin,
          trip.destination,
          trip.departureTime,
          trip.targetTimeIso || new Date().toISOString(),
          trip.stops,
          undefined,
          now
        );

        // If trip is actively in transit
        if (dyn.status === "IN_TRANSIT" || dyn.isDeparted) {
          const originCoords = ISTANBUL_PIERS[dyn.currentOrigin];
          const destCoords = ISTANBUL_PIERS[trip.destination];

          if (originCoords && destCoords) {
            // Estimate mid-point navigation based on current progress
            const lat = (originCoords.lat + destCoords.lat) / 2;
            const lng = (originCoords.lng + destCoords.lng) / 2;

            const shipHtml = `
              <div class="flex flex-col items-center animate-pulse">
                <div class="w-7 h-7 rounded-full bg-indigo-600/90 border border-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 text-xs font-black">
                  🚢
                </div>
                <span class="text-[9px] font-bold bg-slate-950/90 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap shadow">
                  ${trip.operator}
                </span>
              </div>
            `;

            const shipIcon = L.divIcon({
              html: shipHtml,
              className: "vessel-marker",
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const marker = L.marker([lat, lng], { icon: shipIcon });
            marker.bindPopup(`
              <div style="font-family: sans-serif; font-size: 11px; color: #fff; background: #0f172a; padding: 6px; border-radius: 8px;">
                <strong style="color: #38bdf8;">${dyn.currentOrigin} ➔ ${trip.destination}</strong><br/>
                Operatör: ${trip.operator}<br/>
                Durum: Seyir Halinde (Denizde)
              </div>
            `);
            vesselsLayerRef.current.addLayer(marker);
          }
        }
      });
    });
  }, [schedules]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#090d16]" style={{ height }}>
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Overlay Badge */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-bold text-white shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Canlı İstanbul Deniz Haritası</span>
      </div>

      {/* Quick Legend Overlay */}
      <div className="absolute bottom-2.5 right-2.5 z-[1000] flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 shadow-md">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Kalkış</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Varış</span>
        <span className="flex items-center gap-1">🚢 Seyirde</span>
      </div>
    </div>
  );
}
