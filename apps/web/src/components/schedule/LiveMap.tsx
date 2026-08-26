"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Ship } from "lucide-react";

interface VesselPosition {
  vesselId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export function LiveMap() {
  const [positions, setPositions] = useState<VesselPosition[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to NestJS WebSocket Gateway
    const socket = io("http://localhost:3001/ws/tracking", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected to Realtime Tracking Engine");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("vessel.positions", (data: VesselPosition[]) => {
      setPositions(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="mx-5 my-4 p-4 rounded-xl glass bg-white/5 border border-white/10 relative overflow-hidden h-[120px]">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold text-white/70 uppercase">
          {connected ? 'LIVE TRACKING ACTIVE' : 'RECONNECTING...'}
        </span>
      </div>
      
      {/* Fake Map Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Render Mock Vessels */}
      <div className="absolute inset-0 flex items-center justify-center gap-8">
        {positions.map((pos) => (
          <div key={pos.vesselId} className="flex flex-col items-center animate-bounce-slow" style={{ transform: `rotate(${pos.heading - 45}deg)` }}>
            <Ship className="text-[var(--primary-blue)] w-6 h-6 drop-shadow-[0_0_10px_rgba(38,150,255,0.8)]" />
            <span className="text-[8px] bg-black/50 px-1 rounded text-white mt-1 whitespace-nowrap" style={{ transform: `rotate(${-(pos.heading - 45)}deg)` }}>
              {pos.speed.toFixed(1)} kn
            </span>
          </div>
        ))}
        {positions.length === 0 && (
          <span className="text-white/50 text-xs">Waiting for vessel data...</span>
        )}
      </div>
    </div>
  );
}
