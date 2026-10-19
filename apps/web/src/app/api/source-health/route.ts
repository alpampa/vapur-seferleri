import { NextResponse } from "next/server";
import { MONITOR_INTERVAL_MS, getMonitorState } from "@/lib/agents/announcement-monitor";
import { isKvConfigured } from "@/lib/agents/kv-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * KAYNAK SAĞLIĞI VE DEĞİŞİKLİK GEÇMİŞİ (herkese açık, veri üretmez)
 *
 * Kullanıcıya/operasyona "hangi firmanın kaynağı şu an doğrulanabiliyor?"
 * sorusunun dürüst yanıtını verir. Tarama tetiklemez; yalnızca son turun
 * kalıcı sonucunu okur.
 */
export async function GET() {
  const state = await getMonitorState();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    intervalMs: MONITOR_INTERVAL_MS,
    persistent: isKvConfigured(),
    storage: state.storage,
    operators: state.health,
    recentChanges: state.recentChanges.slice(0, 50),
    lastTick: state.lastTick,
  });
}
