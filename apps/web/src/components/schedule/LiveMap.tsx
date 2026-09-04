"use client";

import { useEffect, useState, useMemo } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ship, Map as MapIcon } from "lucide-react";
import { useTrackingStore } from "@/store/useTrackingStore";

export function LiveMap() {
  const { positions, connected, reconnecting, connect, disconnect } = useTrackingStore();
  const [viewState, setViewState] = useState({
    longitude: -74.009,
    latitude: 40.703,
    zoom: 13,
    pitch: 45,
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Fallback map grid if no Mapbox token is provided (Demo Mode safeguard)
  const renderFallbackMap = () => (
    <div className="absolute inset-0 bg-[#041225]">
      {/* Fake Map Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Center the mock vessels artificially since there's no real projection */}
      <div className="absolute inset-0 flex items-center justify-center gap-16">
        {positions.map((pos) => (
          <div key={pos.vesselId} className="flex flex-col items-center transition-all duration-1000 ease-linear" style={{ transform: `rotate(${pos.heading - 45}deg)` }}>
            <Ship className="text-[var(--primary-blue)] w-12 h-12 drop-shadow-[0_0_15px_rgba(38,150,255,0.8)]" />
            <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-white mt-2 whitespace-nowrap font-medium backdrop-blur-sm border border-white/10" style={{ transform: `rotate(${-(pos.heading - 45)}deg)` }}>
              {pos.speed.toFixed(1)} kn
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-24 left-0 w-full text-center pointer-events-none">
        <span className="bg-black/50 text-white/50 text-xs px-3 py-1 rounded-full border border-white/10">No Mapbox Token (Fallback Grid)</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden h-full w-full bg-[#041225]">
      
      <div className="absolute top-16 left-4 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : reconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
          {connected ? 'LIVE TRACKING ACTIVE' : reconnecting ? 'RECONNECTING...' : 'OFFLINE'}
        </span>
      </div>
      
      {!mapboxToken ? renderFallbackMap() : (
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={mapboxToken}
          style={{ width: '100%', height: '100%' }}
        >
          {positions.map((pos) => (
            <Marker
              key={pos.vesselId}
              longitude={pos.longitude}
              latitude={pos.latitude}
              anchor="center"
              pitchAlignment="map"
            >
              <div 
                className="flex flex-col items-center transition-all duration-[3000ms] ease-linear"
                style={{ transform: `rotate(${pos.heading - 45}deg)` }}
              >
                <Ship className="text-[var(--primary-blue)] w-8 h-8 drop-shadow-[0_0_15px_rgba(38,150,255,1)]" />
                <span className="text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-white mt-1 whitespace-nowrap font-medium border border-white/20" style={{ transform: `rotate(${-(pos.heading - 45)}deg)` }}>
                  {pos.speed.toFixed(1)} kn
                </span>
              </div>
            </Marker>
          ))}
        </Map>
      )}

      {positions.length === 0 && connected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-white/80 bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">Waiting for vessel data...</span>
        </div>
      )}
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center text-white/40 gap-3 bg-black/50 p-6 rounded-2xl backdrop-blur-md border border-white/10">
             <MapIcon size={48} />
             <span className="text-sm font-medium uppercase tracking-widest">Map Offline</span>
          </div>
        </div>
      )}
    </div>
  );
}
