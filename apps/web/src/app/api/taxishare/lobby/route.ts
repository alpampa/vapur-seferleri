import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLobby,
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

    const lobby = getOrCreateLobby(origin, destination);

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

    if (!origin || !destination) {
      return NextResponse.json({ error: "Missing origin or destination" }, { status: 400 });
    }

    if (action === "JOIN") {
      const result = joinLobby(origin, destination, {
        name: payload.name || "Misafir Yolcu",
        phone: payload.phone || "",
        passengerCount: payload.passengerCount || 1,
        note: payload.note || ""
      });
      return NextResponse.json(result);
    }

    if (action === "LEAVE") {
      const lobby = leaveLobby(origin, destination, payload.participantId);
      return NextResponse.json({ lobby, success: true });
    }

    if (action === "MESSAGE") {
      const lobby = addLobbyMessage(
        origin,
        destination,
        payload.senderId || "anon",
        payload.senderName || "Misafir",
        payload.text || ""
      );
      return NextResponse.json({ lobby, success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Taxi share lobby POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
