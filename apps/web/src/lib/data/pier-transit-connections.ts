export interface TransitConnection {
  line: string;
  name: string;
  walkMinutes: number;
  type: "metro" | "tram" | "train" | "funicular" | "bus";
  badgeBg: string;
}

export const PIER_TRANSIT_CONNECTIONS: Record<string, TransitConnection[]> = {
  "Kadıköy": [
    { line: "M4", name: "Kadıköy-Sabiha Gökçen Metrosu", walkMinutes: 2, type: "metro", badgeBg: "bg-pink-600" },
    { line: "T3", name: "Moda Tramvayı", walkMinutes: 3, type: "tram", badgeBg: "bg-emerald-600" },
    { line: "İETT", name: "Rıhtım Otobüs Peronları", walkMinutes: 2, type: "bus", badgeBg: "bg-blue-600" }
  ],
  "Karaköy": [
    { line: "T1", name: "Kabataş-Bağcılar Tramvayı", walkMinutes: 2, type: "tram", badgeBg: "bg-blue-600" },
    { line: "F2", name: "Tarihi Karaköy Tüneli", walkMinutes: 3, type: "funicular", badgeBg: "bg-amber-600" }
  ],
  "Eminönü": [
    { line: "T1", name: "Kabataş-Bağcılar Tramvayı", walkMinutes: 1, type: "tram", badgeBg: "bg-blue-600" },
    { line: "T5", name: "Eminönü-Alibeyköy Tramvayı", walkMinutes: 2, type: "tram", badgeBg: "bg-purple-600" },
    { line: "M2", name: "Haliç Metro İstasyonu", walkMinutes: 8, type: "metro", badgeBg: "bg-emerald-600" }
  ],
  "Üsküdar": [
    { line: "Marmaray", name: "Marmaray Üsküdar İstasyonu", walkMinutes: 1, type: "train", badgeBg: "bg-red-600" },
    { line: "M5", name: "Üsküdar-Çekmeköy Metrosu", walkMinutes: 2, type: "metro", badgeBg: "bg-purple-600" }
  ],
  "Kabataş": [
    { line: "F1", name: "Taksim Füniküleri", walkMinutes: 1, type: "funicular", badgeBg: "bg-cyan-600" },
    { line: "T1", name: "Kabataş-Bağcılar Tramvayı", walkMinutes: 1, type: "tram", badgeBg: "bg-blue-600" }
  ],
  "Beşiktaş": [
    { line: "İETT", name: "Beşiktaş Meydan Otobüs Peronları", walkMinutes: 2, type: "bus", badgeBg: "bg-yellow-600" },
    { line: "M7", name: "Yıldız Metro İstasyonu", walkMinutes: 10, type: "metro", badgeBg: "bg-pink-600" }
  ],
  "Bostancı": [
    { line: "Marmaray", name: "Marmaray Bostancı İstasyonu", walkMinutes: 4, type: "train", badgeBg: "bg-red-600" },
    { line: "M8", name: "Bostancı-Parseller Metrosu", walkMinutes: 3, type: "metro", badgeBg: "bg-blue-600" }
  ],
  "Kartal": [
    { line: "Marmaray", name: "Marmaray Başak İstasyonu", walkMinutes: 8, type: "train", badgeBg: "bg-red-600" },
    { line: "İETT", name: "Sahil Otobüs Durakları", walkMinutes: 1, type: "bus", badgeBg: "bg-yellow-600" }
  ],
  "Büyükada": [
    { line: "Adabüs", name: "Elektrikli Ada Minibüsü", walkMinutes: 1, type: "bus", badgeBg: "bg-emerald-600" }
  ],
  "Heybeliada": [
    { line: "Adabüs", name: "Elektrikli Ada Minibüsü", walkMinutes: 1, type: "bus", badgeBg: "bg-emerald-600" }
  ]
};

export function getPierTransit(pierName: string): TransitConnection[] {
  return PIER_TRANSIT_CONNECTIONS[pierName] || [];
}
