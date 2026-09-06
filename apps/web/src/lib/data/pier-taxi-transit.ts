export interface PierTaxiStand {
  standName: string;
  phone: string;
  phoneDisplay: string;
  distanceMeters: number;
  walkMinutes: number;
  locationDescription: string;
}

export interface PierBusPlatform {
  platformName: string;
  keyLines: string[];
  destinations: string;
}

export interface PierGroundTransit {
  pierName: string;
  taxi: PierTaxiStand;
  buses: PierBusPlatform[];
}

export const PIER_TRANSIT_GROUND_DATA: Record<string, PierGroundTransit> = {
  "Kadıköy": {
    pierName: "Kadıköy İskelesi",
    taxi: {
      standName: "Kadıköy Rıhtım İskele Taksi",
      phone: "+902163360667",
      phoneDisplay: "0216 336 06 67",
      distanceMeters: 70,
      walkMinutes: 1,
      locationDescription: "Kadıköy Haldun Taner Sahnesi yanı, Rıhtım ana caddesi üzeri"
    },
    buses: [
      { platformName: "Rıhtım 1. Peron (E-10, E-11)", keyLines: ["E-10", "E-11", "SG-1"], destinations: "Sabiha Gökçen Havalimanı (Ekspres)" },
      { platformName: "Rıhtım 2. Peron (19F, 14ŞB)", keyLines: ["19F", "14ŞB", "19ES"], destinations: "Ataşehir, Kozyatağı, Ümraniye" },
      { platformName: "Rıhtım 3. Peron (16D)", keyLines: ["16D", "4"], destinations: "Bağdat Caddesi, Bostancı, Maltepe Sahil" }
    ]
  },
  "Bostancı": {
    pierName: "Bostancı İskelesi",
    taxi: {
      standName: "Bostancı İskele Meydan Taksi",
      phone: "+902163842020",
      phoneDisplay: "0216 384 20 20",
      distanceMeters: 50,
      walkMinutes: 1,
      locationDescription: "Bostancı İDO terminali ana kapı çıkışı meydanı"
    },
    buses: [
      { platformName: "Bostancı Sahil Peronu", keyLines: ["16D", "4", "10B"], destinations: "Kadıköy Rıhtım (Bağdat Cad. üzerinden)" },
      { platformName: "Marmaray & Metro Girişi", keyLines: ["M8 Metro", "Marmaray"], destinations: "Dudullu, Parseller, Halkalı, Gebze" }
    ]
  },
  "Kabataş": {
    pierName: "Kabataş İskelesi",
    taxi: {
      standName: "Kabataş İskele Taksi",
      phone: "+902122495858",
      phoneDisplay: "0212 249 58 58",
      distanceMeters: 40,
      walkMinutes: 1,
      locationDescription: "Kabataş Transfer Merkezi çıkışı, Meclis-i Mebusan Caddesi"
    },
    buses: [
      { platformName: "Kabataş İskele Önü (22, 25E)", keyLines: ["22", "25E", "40T"], destinations: "Ortaköy, Bebek, Sarıyer Sahil Hattı" },
      { platformName: "Raylı Sistem", keyLines: ["T1 Tramvay", "F1 Füniküler"], destinations: "Sultanahmet, Eminönü, Taksim Meydanı" }
    ]
  },
  "Karaköy": {
    pierName: "Karaköy İskelesi",
    taxi: {
      standName: "Karaköy Meydan Taksi",
      phone: "+902122440114",
      phoneDisplay: "0212 244 01 14",
      distanceMeters: 90,
      walkMinutes: 1,
      locationDescription: "Karaköy Vapur İskelesi önü, Galata Köprüsü ayağı"
    },
    buses: [
      { platformName: "Karaköy Tramvay", keyLines: ["T1 Tramvay"], destinations: "Eminönü, Sultanahmet, Beyazıt, Bağcılar" },
      { platformName: "Tünel", keyLines: ["F2 Tünel"], destinations: "İstiklal Caddesi / Beyoğlu" }
    ]
  },
  "Eminönü": {
    pierName: "Eminönü İskelesi",
    taxi: {
      standName: "Eminönü İskele Taksi",
      phone: "+902125222020",
      phoneDisplay: "0212 522 20 20",
      distanceMeters: 80,
      walkMinutes: 1,
      locationDescription: "Mısır Çarşısı önü, Galata Köprüsü girişi"
    },
    buses: [
      { platformName: "Eminönü Otobüs Hareket Amirliği", keyLines: ["BN1", "28", "26"], destinations: "Sirkeci, Bakırköy Sahil, Beşiktaş, Edirnekapı" },
      { platformName: "Tramvay Hatları", keyLines: ["T1", "T5 Tramvay"], destinations: "Alibeyköy Cep Otogarı, Eyüpsultan, Feshane" }
    ]
  },
  "Üsküdar": {
    pierName: "Üsküdar İskelesi",
    taxi: {
      standName: "Üsküdar Meydan Taksi",
      phone: "+902163412020",
      phoneDisplay: "0216 341 20 20",
      distanceMeters: 50,
      walkMinutes: 1,
      locationDescription: "Mihrimah Sultan Camii önü, Marmaray ana giriş kapısı"
    },
    buses: [
      { platformName: "Üsküdar Sahil Peronları", keyLines: ["15", "15F", "15KÇ"], destinations: "Beylerbeyi, Çengelköy, Kandilli, Beykoz" },
      { platformName: "Metro Hattı", keyLines: ["M5 Metro"], destinations: "Altunizade (Metrobüs), Ümraniye, Çekmeköy, Samandıra" }
    ]
  },
  "Beşiktaş": {
    pierName: "Beşiktaş İskelesi",
    taxi: {
      standName: "Beşiktaş İskele Taksi",
      phone: "+902122606060",
      phoneDisplay: "0212 260 60 60",
      distanceMeters: 60,
      walkMinutes: 1,
      locationDescription: "Barbaros Hayrettin Paşa Türbesi önü meydanı"
    },
    buses: [
      { platformName: "Beşiktaş Meydan Peronları", keyLines: ["27E", "29C", "62"], destinations: "Levent, Maslak, 4. Levent, Kağıthane" },
      { platformName: "Sahil Hattı", keyLines: ["22", "25E"], destinations: "Ortaköy, Kuruçeşme, Arnavutköy, Sarıyer" }
    ]
  }
};

export function getPierGroundTransit(pierName: string): PierGroundTransit | null {
  for (const [key, hub] of Object.entries(PIER_TRANSIT_GROUND_DATA)) {
    if (pierName.toLowerCase().includes(key.toLowerCase())) {
      return hub;
    }
  }
  return null;
}
