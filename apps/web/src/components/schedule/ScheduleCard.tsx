import { Ship, Signal, Info } from "lucide-react";

export type TripStatus = "ON TIME" | "DEPARTING SOON" | "DELAYED" | "BOARDING" | "CANCELLED";

interface ScheduleCardProps {
  origin: string;
  destination: string;
  operator: string;
  routeTitle: string;
  departureTime: string;
  departureTime12: string;
  status: TripStatus;
  countdown?: string;
  countdownSubtext?: string;
  delayText?: string;
  vessel: string;
  platform: string;
  price: string;
  progress: number;
}

export function TripStatusBadge({ status, delayText }: { status: TripStatus; delayText?: string }) {
  let bgColor = "bg-[var(--success)]";
  
  if (status === "DEPARTING SOON") bgColor = "bg-emerald-500"; // Based on reference, green
  if (status === "ON TIME") bgColor = "bg-emerald-500";
  if (status === "DELAYED") bgColor = "bg-[var(--danger)]";
  if (status === "BOARDING") bgColor = "bg-[var(--primary-blue)]";
  if (status === "CANCELLED") bgColor = "bg-[var(--danger)]";

  return (
    <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wide uppercase ${bgColor}`}>
      {status} {delayText && `(${delayText})`}
    </div>
  );
}

export function ScheduleCard(props: ScheduleCardProps) {
  return (
    <div className="bg-[var(--card)] rounded-[18px] p-4 flex gap-4 text-[#1a2b42] shadow-[0_10px_30px_rgba(0,0,0,0.12)] relative">
      {/* Left Column: Time & Icon */}
      <div className="flex flex-col items-center w-[60px] shrink-0">
        <Ship size={28} className="text-[#1a2b42] mb-1" />
        <span className="font-bold text-xl leading-tight tabular-nums">{props.departureTime}</span>
        <span className="text-[10px] text-gray-500 font-medium mb-3">{props.departureTime12}</span>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden mt-auto mb-1">
          <div 
            className="h-full bg-[#1a2b42] rounded-full" 
            style={{ width: `${props.progress}%` }}
          />
        </div>
      </div>

      {/* Center & Right Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-bold text-[17px] leading-tight text-gray-900">
              {props.origin} to {props.destination}
            </h3>
            <span className="text-[13px] font-medium text-gray-700">{props.operator}</span>
            <span className="text-[11px] text-gray-500 mt-0.5">{props.routeTitle}</span>
          </div>
          <Signal size={16} className="text-gray-400 mt-0.5" />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <TripStatusBadge status={props.status} delayText={props.delayText} />
          {props.countdown && (
            <div className="flex flex-col items-center">
              <span className="text-[var(--danger)] font-bold text-lg tabular-nums leading-none">
                {props.countdown}
              </span>
              {props.countdownSubtext && (
                <span className="text-[var(--danger)] text-[8px] uppercase">
                  {props.countdownSubtext}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-medium">Vessel</span>
              <span className="text-[12px] font-semibold">{props.vessel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-medium">Platform</span>
              <span className="text-[12px] font-semibold">{props.platform}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end relative -top-3">
             <Ship size={24} className="text-gray-300 mb-2 opacity-50" />
             <span className="font-bold text-[17px]">{props.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
