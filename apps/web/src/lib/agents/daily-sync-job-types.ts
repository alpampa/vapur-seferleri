/**
 * GÜNLÜK SENKRON AJANI — TİPLER
 * (daily-sync-job.ts'ten ayrı tutuldu: dairesel import riskini önler)
 */

export interface OperatorScraperConfig {
  operatorName: string;
  officialWebsite: string;
  timetableEndpoint: string;
  category: "ADALAR" | "BOGAZ" | "HEPSİ";
  updateFrequency: string;
  status: "ACTIVE" | "VERIFIED" | "STANDBY";
}

export interface ScraperAgentLog {
  operator: string;
  url: string;
  lastChecked: string;
  recordsVerified: number;
  isCompliant: boolean;
  message: string;
}

export const OFFICIAL_OPERATOR_CRAWLERS_DEPRECATED: OperatorScraperConfig[] = [];
