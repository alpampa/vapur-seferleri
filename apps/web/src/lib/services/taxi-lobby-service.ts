import { SeaTaxiLobby, LobbyParticipant, LobbyChatMessage } from "../types/taxi-share";
import { getSeaTaxiRoute, calculateSeaTaxiFare, SEA_TAXI_OFFICIAL_TARIFF } from "../data/sea-taxi";

const lobbies = new Map<string, SeaTaxiLobby>();

function getLobbyKey(origin: string, destination: string): string {
  const normOrigin = origin.trim().toLowerCase();
  const normDest = destination.trim().toLowerCase();
  return `${normOrigin}__${normDest}`;
}

export function getMeetupPoint(pierName: string): string {
  const norm = pierName.toLowerCase();
  if (norm.includes("bostan")) return "Bostancı İskelesi Bilet Gişeleri & Turnike Önü";
  if (norm.includes("büyükada") || norm.includes("buyukada")) return "Büyükada İskele Meydanı Saat Kulesi Önü";
  if (norm.includes("heybel")) return "Heybeliada İskele Giriş Kapısı";
  if (norm.includes("kınal") || norm.includes("kinal")) return "Kınalıada İskele Çıkışı Çınaraltı";
  if (norm.includes("kabat")) return "Kabataş Tramvay Çıkışı Deniz Taksi Rıhtımı";
  if (norm.includes("kadık") || norm.includes("kadik")) return "Kadıköy Meydanı Haldun Taner Tiyatrosu Önü";
  if (norm.includes("karak")) return "Karaköy İskele Girişi Deniz Taksi Yanaşma Yeri";
  if (norm.includes("emino")) return "Eminönü 3 Nolu Çelik Duba Önü";
  if (norm.includes("beşik") || norm.includes("besik")) return "Beşiktaş Deniz Müzesi Önü Deniz Taksi Rıhtımı";
  if (norm.includes("kartal")) return "Kartal Deniz Otobüsü İskelesi Meydanı";
  return `${pierName} İskelesi Ana Biniş Kapısı Önü`;
}

export function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/[\s\-_()]/g, "");
  if (clean.length < 7) return "***";
  return `${clean.slice(0, 4)} *** ** ${clean.slice(-2)}`;
}

function initPrepopulatedLobby(origin: string, destination: string): SeaTaxiLobby {
  const route = getSeaTaxiRoute(origin, destination);
  const now = Date.now();
  const targetTime = new Date(now + 25 * 60 * 1000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const defaultParticipants: LobbyParticipant[] = [
    {
      id: "p-01",
      name: "Murat T.",
      phone: "0532 411 20 89",
      maskedPhone: maskPhoneNumber("0532 411 20 89"),
      passengerCount: 1,
      joinedAt: now - 1000 * 60 * 12,
      note: "Turnike önünde bekliyorum, siyah montluyum"
    },
    {
      id: "p-02",
      name: "Zeynep & Arkadaşı",
      phone: "0544 883 15 42",
      maskedPhone: maskPhoneNumber("0544 883 15 42"),
      passengerCount: 2,
      joinedAt: now - 1000 * 60 * 6,
      note: "Saat kulesi yanındayız, 1 kişi daha gelse çıkarız"
    }
  ];

  const defaultMessages: LobbyChatMessage[] = [
    {
      id: "m-01",
      senderId: "p-01",
      senderName: "Murat T.",
      text: "Merhaba, Bostancı'dan Büyükada'ya geçeceğiz. 1-2 kişi daha katılırsa kişi başı çok uyguna geliyor.",
      timestamp: new Date(now - 1000 * 60 * 10).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    },
    {
      id: "m-02",
      senderId: "p-02",
      senderName: "Zeynep & Arkadaşı",
      text: "Biz 2 kişiyiz, katıldık! Saat kulesinin oradayız.",
      timestamp: new Date(now - 1000 * 60 * 5).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    }
  ];

  const totalPassengers = defaultParticipants.reduce((acc, p) => acc + p.passengerCount, 0);
  const fare = calculateSeaTaxiFare(route.nauticalMiles, totalPassengers);

  return {
    id: `lobby-${origin}-${destination}`,
    origin,
    destination,
    meetupPoint: getMeetupPoint(origin),
    targetDepartureTime: targetTime,
    totalBoatFare: fare.totalBoatFare,
    nauticalMiles: route.nauticalMiles,
    perPersonFare: fare.perPersonFare,
    totalPassengers,
    maxCapacity: SEA_TAXI_OFFICIAL_TARIFF.maxCapacity,
    participants: defaultParticipants,
    messages: defaultMessages,
    createdAt: now,
    expiresAt: now + 90 * 60 * 1000 // 90 dakika geçerli
  };
}

export function getOrCreateLobby(origin: string, destination: string): SeaTaxiLobby {
  const key = getLobbyKey(origin, destination);
  let lobby = lobbies.get(key);

  // Süresi dolmuşsa temizle
  if (lobby && lobby.expiresAt < Date.now()) {
    lobbies.delete(key);
    lobby = undefined;
  }

  if (!lobby) {
    lobby = initPrepopulatedLobby(origin, destination);
    lobbies.set(key, lobby);
  }

  // Fiyatları ve yolcu sayılarını senkronize et
  recalcLobbyFares(lobby);
  return lobby;
}

function recalcLobbyFares(lobby: SeaTaxiLobby) {
  lobby.totalPassengers = lobby.participants.reduce((acc, p) => acc + p.passengerCount, 0);
  const fare = calculateSeaTaxiFare(lobby.nauticalMiles, Math.max(1, lobby.totalPassengers));
  lobby.totalBoatFare = fare.totalBoatFare;
  lobby.perPersonFare = fare.perPersonFare;
}

export function joinLobby(
  origin: string,
  destination: string,
  data: { name: string; phone: string; passengerCount: number; note?: string }
): { lobby: SeaTaxiLobby; participant: LobbyParticipant } {
  const lobby = getOrCreateLobby(origin, destination);

  const cleanName = data.name.trim().slice(0, 40) || "Misafir Yolcu";
  const cleanPhone = data.phone.trim().slice(0, 20);
  const cleanNote = data.note ? data.note.trim().slice(0, 150) : undefined;
  const count = Math.max(1, Math.min(6, data.passengerCount || 1));

  const participant: LobbyParticipant = {
    id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    phone: cleanPhone,
    maskedPhone: maskPhoneNumber(cleanPhone),
    passengerCount: count,
    joinedAt: Date.now(),
    note: cleanNote,
    isCurrentUser: true
  };

  lobby.participants.push(participant);

  // Otomatik lobi bildirim mesajı
  lobby.messages.push({
    id: `m-${Date.now()}`,
    senderId: participant.id,
    senderName: participant.name,
    text: `${participant.name} gruba katıldı (${participant.passengerCount} yolcu). ${participant.note ? `Not: "${participant.note}"` : ""}`,
    timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  });

  if (lobby.messages.length > 50) {
    lobby.messages = lobby.messages.slice(-50);
  }

  recalcLobbyFares(lobby);
  return { lobby, participant };
}

export function leaveLobby(origin: string, destination: string, participantId: string): SeaTaxiLobby {
  const lobby = getOrCreateLobby(origin, destination);
  const leavingIndex = lobby.participants.findIndex((p) => p.id === participantId);

  if (leavingIndex !== -1) {
    const p = lobby.participants[leavingIndex];
    lobby.participants.splice(leavingIndex, 1);
    lobby.messages.push({
      id: `m-${Date.now()}`,
      senderId: "system",
      senderName: "Sistem",
      text: `${p.name} gruptan ayrıldı.`,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    });

    if (lobby.messages.length > 50) {
      lobby.messages = lobby.messages.slice(-50);
    }
  }

  recalcLobbyFares(lobby);
  return lobby;
}

export function addLobbyMessage(
  origin: string,
  destination: string,
  senderId: string,
  senderName: string,
  text: string
): SeaTaxiLobby {
  const lobby = getOrCreateLobby(origin, destination);

  const cleanSenderName = senderName.trim().slice(0, 40) || "Misafir";
  const cleanText = text.trim().slice(0, 300);

  if (cleanText) {
    lobby.messages.push({
      id: `m-${Date.now()}`,
      senderId: senderId.slice(0, 50),
      senderName: cleanSenderName,
      text: cleanText,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    });

    if (lobby.messages.length > 50) {
      lobby.messages = lobby.messages.slice(-50);
    }
  }

  return lobby;
}

/**
 * Genel GET istekleri için hassas PII (telefon no) maskeleme yapar.
 * Yalnızca lobiye katılmış kullanıcılar doğrudan arama / iletişim detayını görebilir.
 */
export function getPublicLobby(
  origin: string,
  destination: string,
  viewerParticipantId?: string
): SeaTaxiLobby {
  const lobby = getOrCreateLobby(origin, destination);
  const isJoinedViewer = Boolean(
    viewerParticipantId && lobby.participants.some((p) => p.id === viewerParticipantId)
  );

  return {
    ...lobby,
    participants: lobby.participants.map((p) => {
      const isSelf = p.id === viewerParticipantId;
      return {
        ...p,
        phone: isSelf || isJoinedViewer ? p.phone : maskPhoneNumber(p.phone),
        maskedPhone: maskPhoneNumber(p.phone)
      };
    })
  };
}
