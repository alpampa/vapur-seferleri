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
  ],
  "Kınalıada": [
    { line: "Adabüs", name: "Elektrikli Ada Minibüsü", walkMinutes: 1, type: "bus", badgeBg: "bg-emerald-600" }
  ],
  "Burgazada": [
    { line: "Adabüs", name: "Elektrikli Ada Minibüsü", walkMinutes: 1, type: "bus", badgeBg: "bg-emerald-600" }
  ],
  "Yenikapı": [
    { line: "Marmaray", name: "Marmaray Yenikapı İstasyonu", walkMinutes: 6, type: "train", badgeBg: "bg-red-600" },
    { line: "M1/M2", name: "Yenikapı Metro Aktarma Merkezi", walkMinutes: 7, type: "metro", badgeBg: "bg-red-600" }
  ],
  "Bakırköy": [
    { line: "Marmaray", name: "Marmaray Bakırköy İstasyonu", walkMinutes: 10, type: "train", badgeBg: "bg-red-600" },
    { line: "M3", name: "Bakırköy Sahil Metrosu", walkMinutes: 3, type: "metro", badgeBg: "bg-blue-600" }
  ],
  "Sirkeci": [
    { line: "Marmaray", name: "Marmaray Sirkeci İstasyonu", walkMinutes: 3, type: "train", badgeBg: "bg-red-600" },
    { line: "T1", name: "Sirkeci Tramvay Durağı", walkMinutes: 2, type: "tram", badgeBg: "bg-blue-600" }
  ],
  "Eyüpsultan": [
    { line: "T5", name: "Eyüpsultan Teleferik Tramvay İstasyonu", walkMinutes: 2, type: "tram", badgeBg: "bg-purple-600" },
    { line: "TF2", name: "Eyüp-Piyer Loti Teleferik", walkMinutes: 3, type: "funicular", badgeBg: "bg-cyan-600" }
  ]
};

export function getPierTransit(pierName: string): TransitConnection[] {
  if (!pierName) return [];
  if (PIER_TRANSIT_CONNECTIONS[pierName]) return PIER_TRANSIT_CONNECTIONS[pierName];

  // 1. İskele adı operatör eki temizliği: "Kadıköy (Şehir Hatları)" -> "Kadıköy"
  const cleanName = pierName.split("(")[0].trim();
  if (PIER_TRANSIT_CONNECTIONS[cleanName]) return PIER_TRANSIT_CONNECTIONS[cleanName];

  // 2. Kapsayıcı isim eşleşmesi (Örn: "Üsküdar İskelesi" -> "Üsküdar")
  const lower = cleanName.toLowerCase();
  for (const [key, conns] of Object.entries(PIER_TRANSIT_CONNECTIONS)) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return conns;
    }
  }

  return [];
}
