export interface LobbyParticipant {
  id: string;
  name: string;
  phone: string;
  passengerCount: number;
  joinedAt: number;
  note?: string;
  isCurrentUser?: boolean;
}

export interface LobbyChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SeaTaxiLobby {
  id: string;
  origin: string;
  destination: string;
  meetupPoint: string;
  targetDepartureTime: string;
  totalBoatFare: number;
  nauticalMiles: number;
  perPersonFare: number;
  totalPassengers: number;
  maxCapacity: number;
  participants: LobbyParticipant[];
  messages: LobbyChatMessage[];
  createdAt: number;
  expiresAt: number;
}
