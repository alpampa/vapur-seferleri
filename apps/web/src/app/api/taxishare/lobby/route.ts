import { NextRequest, NextResponse } from "next/server";
import {
  getPublicLobby,
  joinLobby,
  leaveLobby,
  addLobbyMessage
} from "@/lib/services/taxi-lobby-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin") || "Bostancı";
    const destination = searchParams.get("destination") || "Büyükada";
    const participantId = searchParams.get("participantId") || undefined;

    const lobby = getPublicLobby(origin, destination, participantId);

    return NextResponse.json(lobby, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    console.error("Taxi share lobby GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, origin, destination, payload } = body;

    if (!origin || !destination || typeof origin !== "string" || typeof destination !== "string") {
      return NextResponse.json({ error: "Missing or invalid origin or destination" }, { status: 400 });
    }

    if (action === "JOIN") {
      if (!payload || typeof payload !== "object") {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }

      const name = String(payload.name || "").trim().slice(0, 40) || "Misafir Yolcu";
      const phone = String(payload.phone || "").trim().slice(0, 20);
      const note = payload.note ? String(payload.note).trim().slice(0, 150) : "";
      const rawCount = Number(payload.passengerCount) || 1;
      const passengerCount = Math.max(1, Math.min(6, rawCount));

      const result = joinLobby(origin, destination, {
        name,
        phone,
        passengerCount,
        note
      });
      return NextResponse.json(result);
    }

    if (action === "LEAVE") {
      if (!payload?.participantId || typeof payload.participantId !== "string") {
        return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
      }
      const lobby = leaveLobby(origin, destination, payload.participantId.slice(0, 60));
      return NextResponse.json({ lobby, success: true });
    }

    if (action === "MESSAGE") {
      if (!payload || typeof payload !== "object") {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }

      const senderId = String(payload.senderId || "anon").slice(0, 60);
      const senderName = String(payload.senderName || "Misafir").trim().slice(0, 40);
      const text = String(payload.text || "").trim().slice(0, 300);

      if (!text) {
        return NextResponse.json({ error: "Message text cannot be empty" }, { status: 400 });
      }

      const lobby = addLobbyMessage(origin, destination, senderId, senderName, text);
      return NextResponse.json({ lobby, success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Taxi share lobby POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
