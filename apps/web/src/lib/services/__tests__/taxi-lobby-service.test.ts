import { describe, it, expect } from "vitest";
import {
  getOrCreateLobby,
  getMeetupPoint,
  joinLobby,
  leaveLobby,
  addLobbyMessage,
  maskPhoneNumber,
  getPublicLobby
} from "../taxi-lobby-service";

describe("Sea Taxi Shared Ride Meetup Lobby Service", () => {
  it("resolves accurate physical meetup points for major piers", () => {
    expect(getMeetupPoint("Bostancı")).toContain("Bilet Gişeleri");
    expect(getMeetupPoint("Büyükada")).toContain("Saat Kulesi");
    expect(getMeetupPoint("Kabataş")).toContain("Tramvay Çıkışı");
    expect(getMeetupPoint("Kadıköy")).toContain("Haldun Taner Tiyatrosu");
  });

  it("creates or returns an active lobby with fares and participants", () => {
    const lobby = getOrCreateLobby("Bostancı", "Büyükada");
    expect(lobby.origin).toBe("Bostancı");
    expect(lobby.destination).toBe("Büyükada");
    expect(lobby.meetupPoint).toContain("Bostancı");
    expect(lobby.totalPassengers).toBeGreaterThanOrEqual(1);
    expect(lobby.perPersonFare).toBeGreaterThan(0);
    expect(lobby.participants.length).toBeGreaterThan(0);
  });

  it("allows a commuter to join the lobby and recalculates fares", () => {
    const { lobby, participant } = joinLobby("Bostancı", "Büyükada", {
      name: "Ali V.",
      phone: "0533 123 45 67",
      passengerCount: 2,
      note: "İskele önündeyim"
    });

    expect(participant.name).toBe("Ali V.");
    expect(participant.passengerCount).toBe(2);

    const found = lobby.participants.find((p) => p.id === participant.id);
    expect(found).toBeDefined();

    // Verify chat announcement
    const hasAnnouncement = lobby.messages.some((m) => m.text.includes("Ali V."));
    expect(hasAnnouncement).toBe(true);
  });

  it("handles participant leaving the lobby", () => {
    const { lobby: joinedLobby, participant } = joinLobby("Bostancı", "Büyükada", {
      name: "Deneme Ayrılacak",
      phone: "0555 000 00 00",
      passengerCount: 1
    });

    const countBefore = joinedLobby.participants.length;
    const updatedLobby = leaveLobby("Bostancı", "Büyükada", participant.id);

    expect(updatedLobby.participants.length).toBe(countBefore - 1);
    const stillThere = updatedLobby.participants.some((p) => p.id === participant.id);
    expect(stillThere).toBe(false);
  });

  it("appends chat messages to the lobby board", () => {
    const lobby = addLobbyMessage(
      "Bostancı",
      "Büyükada",
      "user-1",
      "Ahmet",
      "Ben gişelerin önüne geldim!"
    );

    const lastMsg = lobby.messages[lobby.messages.length - 1];
    expect(lastMsg.senderName).toBe("Ahmet");
    expect(lastMsg.text).toBe("Ben gişelerin önüne geldim!");
  });

  it("masks phone numbers properly to protect PII against scrapers", () => {
    expect(maskPhoneNumber("0532 411 20 89")).toBe("0532 *** ** 89");
    expect(maskPhoneNumber("05448831542")).toBe("0544 *** ** 42");
    expect(maskPhoneNumber("123")).toBe("***");

    const publicLobby = getPublicLobby("Bostancı", "Büyükada");
    // Anonymous viewer should never see unmasked cleartext phone
    for (const p of publicLobby.participants) {
      expect(p.phone).toContain("***");
    }
  });
});
