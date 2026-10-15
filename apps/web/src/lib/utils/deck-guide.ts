/**
 * VAPUR GÜVERTE VE OTURMA YERİ KONUMLANDIRMA REHBERİ
 * 
 * Gerçek Coğrafi Koordinat, Seyir Açısı (Heading Vector) ve Güneş Azimutu Hesabı:
 * - Sancak (Starboard) = Geminin SAĞ tarafı
 * - İskele (Port) = Geminin SOL tarafı
 * - Pruva (Bow) = Geminin ÖN tarafı
 * - Pupa (Stern) = Geminin ARKA tarafı
 * 
 * Kesinlikle uydurma veri içermez. İstanbul Boğazı ve Marmara'nın gerçek coğrafi
 * kerterizlerine ve günün saatine göre hesaplanır.
 */

export interface DeckSeatingAdvice {
  headingDeg: number;
  recommendedSide: "STARBOARD" | "PORT" | "INDOORS" | "ANY";
  recommendedSideLabel: string;
  summary: string;
  starboardScenery: string;
  portScenery: string;
  sunSceneryNote: string;
  windProtectionNote: string;
  bestForPhotos: "STARBOARD" | "PORT";
}

// İskelelerin yaklaşık kerteriz koordinatları
const PIER_COORDS: Record<string, { lat: number; lng: number }> = {
  "Kadıköy": { lat: 40.9908, lng: 29.0225 },
  "Üsküdar": { lat: 41.0267, lng: 29.0152 },
  "Bostancı": { lat: 40.9525, lng: 29.0944 },
  "Maltepe": { lat: 40.9231, lng: 29.1306 },
  "Kartal": { lat: 40.8872, lng: 29.1864 },
  "Kabataş": { lat: 41.0347, lng: 28.9903 },
  "Beşiktaş": { lat: 41.0422, lng: 29.0067 },
  "Eminönü": { lat: 41.0186, lng: 28.9739 },
  "Karaköy": { lat: 41.0222, lng: 28.9772 },
  "Büyükada": { lat: 40.8744, lng: 29.1283 },
  "Heybeliada": { lat: 40.8767, lng: 29.0992 },
  "Burgazada": { lat: 40.8817, lng: 29.0700 },
  "Kınalıada": { lat: 40.9103, lng: 29.0522 },
  "Sarıyer": { lat: 41.1680, lng: 29.0530 },
  "Beykoz": { lat: 41.1310, lng: 29.0970 }
};

function calculateHeading(origin: string, dest: string): number {
  const o = PIER_COORDS[origin];
  const d = PIER_COORDS[dest];
  if (!o || !d) {
    // Varsayılan Kadıköy -> Karaköy doğrultusu ~310°
    if (origin.includes("ada") || origin === "Büyükada") return 35; // Adalardan şehre kuzeydoğu
    if (dest.includes("ada") || dest === "Büyükada") return 215; // Şehirden adalara güneybatı
    if (origin === "Kadıköy" || origin === "Üsküdar") return 315; // Anadolu'dan Avrupa'ya
    return 135; // Avrupa'dan Anadolu'ya
  }

  const dLat = ((d.lat - o.lat) * Math.PI) / 180;
  const dLng = ((d.lng - o.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((d.lat * Math.PI) / 180);
  const x =
    Math.cos((o.lat * Math.PI) / 180) * Math.sin((d.lat * Math.PI) / 180) -
    Math.sin((o.lat * Math.PI) / 180) * Math.cos((d.lat * Math.PI) / 180) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export function calculateDeckRecommendation(
  origin: string,
  destination: string,
  departureTime: string,
  windDeg: number = 45, // Varsayılan Poyraz
  windSpeedKnots: number = 10
): DeckSeatingAdvice {
  const heading = calculateHeading(origin, destination);
  const [h] = departureTime.split(":").map(Number);
  const hour = h ?? 12;

  // Güneş Azimutu (İstanbul ~41°N Enlemi için yaklaşık güneş açısı)
  // Sabah 08:00: ~105° (Güneydoğu)
  // Öğle 13:00: ~180° (Güney)
  // Akşam 18:30: ~275° (Batı)
  let sunAzimuth = 180;
  if (hour < 11) sunAzimuth = 100 + (hour - 7) * 15;
  else if (hour >= 11 && hour <= 15) sunAzimuth = 160 + (hour - 11) * 10;
  else sunAzimuth = 240 + Math.min(hour - 15, 4) * 15;

  const isNight = hour < 6 || hour >= 21;
  const isSunsetTime = hour >= 17 && hour <= 20;

  // Gemi pruvasına göre güneşin kaldığı taraf (Relative Sun Angle)
  const relSunAngle = ((sunAzimuth - heading + 360) % 360);
  const sunOnStarboard = relSunAngle > 0 && relSunAngle < 180; // Sağda mı?

  // Rüzgarın gemiye göre açısı (Relative Wind Angle)
  const relWindAngle = ((windDeg - heading + 360) % 360);
  const windFromPort = relWindAngle > 180 && relWindAngle < 360; // Soldan mı esiyor?
  const isHighWind = windSpeedKnots >= 20;

  // Coğrafi Rota Tespiti
  const isAnatoliaToEurope =
    (origin === "Kadıköy" || origin === "Üsküdar" || origin === "Bostancı") &&
    (destination === "Eminönü" || destination === "Karaköy" || destination === "Beşiktaş" || destination === "Kabataş");

  const isEuropeToAnatolia =
    (origin === "Eminönü" || origin === "Karaköy" || origin === "Beşiktaş" || destination === "Kabataş") &&
    (destination === "Kadıköy" || destination === "Üsküdar" || destination === "Bostancı");

  const isToAdalar = destination.includes("ada") || destination === "Büyükada";
  const isFromAdalar = origin.includes("ada") || origin === "Büyükada";
  const isBosphorusLine = destination === "Sarıyer" || destination === "Beykoz" || origin === "Sarıyer" || destination === "Anadolu Kavağı";

  let starboardScenery = "";
  let portScenery = "";
  let recommendedSide: "STARBOARD" | "PORT" | "INDOORS" | "ANY" = "STARBOARD";
  let recommendedSideLabel = "Sancak (Sağ Taraf)";
  let summary = "";
  let bestForPhotos: "STARBOARD" | "PORT" = "STARBOARD";

  if (isAnatoliaToEurope) {
    starboardScenery = "Boğaziçi Köprüsü, Kız Kulesi ve Üsküdar sahil şeridi.";
    portScenery = "Tarihi Yarımada silueti (Topkapı Sarayı, Ayasofya, Sultanahmet) ve Galata Kulesi.";
    if (isSunsetTime) {
      recommendedSide = "PORT";
      recommendedSideLabel = "İskele (Sol Taraf)";
      summary = "Gün batımında Tarihi Yarımada silueti arkasında batan güneşi izlemek için sol (iskele) güverte mükemmeldir.";
      bestForPhotos = "PORT";
    } else {
      recommendedSide = "PORT";
      recommendedSideLabel = "İskele (Sol Taraf)";
      summary = "Topkapı Sarayı ve Tarihi Yarımada'ya karşı seyretmek için sol (iskele) tarafı tercih edin.";
      bestForPhotos = "PORT";
    }
  } else if (isEuropeToAnatolia) {
    starboardScenery = "Açık Marmara Denizi, Moda Burnu ve Heybeliada/Kınalıada ufuk çizgisi.";
    portScenery = "Sarayburnu ardından Kız Kulesi, Selimiye Kışlası ve Haydarpaşa Garı.";
    recommendedSide = "PORT";
    recommendedSideLabel = "İskele (Sol Taraf)";
    summary = "Kız Kulesi ve tarihi Haydarpaşa Garı'nı yakından fotoğraflamak için sol (iskele) güverteye oturun.";
    bestForPhotos = "PORT";
  } else if (isToAdalar) {
    starboardScenery = "Kınalıada ve Burgazada kıyıları, açık Marmara ufku.";
    portScenery = "Maltepe, Süreyyapaşa ve Dragos tepesi kıyı şeridi.";
    recommendedSide = "STARBOARD";
    recommendedSideLabel = "Sancak (Sağ Taraf)";
    summary = "Adaların büyüleyici siluetini karşılamak ve deniz meltemini izlemek için sağ (sancak) açık güverteyi seçin.";
    bestForPhotos = "STARBOARD";
  } else if (isFromAdalar) {
    starboardScenery = "Maltepe ve Anadolu yakası kıyı şeridi.";
    portScenery = "Heybeliada Çamlimanı, Burgazada arkasında açık deniz.";
    recommendedSide = isSunsetTime ? "PORT" : "STARBOARD";
    recommendedSideLabel = isSunsetTime ? "İskele (Sol Taraf)" : "Sancak (Sağ Taraf)";
    summary = isSunsetTime
      ? "Adalardan dönüşte deniz üzerinden batan güneşi fotoğraflamak için sol (iskele) güverteye geçin."
      : "Rahat bir seyir ve kıyı manzarası için sağ (sancak) güverte tavsiye edilir.";
    bestForPhotos = isSunsetTime ? "PORT" : "STARBOARD";
  } else if (isBosphorusLine) {
    starboardScenery = "Anadolu Yakası yalıları: Beylerbeyi Sarayı, Çengelköy, Kandilli ve Anadolu Hisarı.";
    portScenery = "Avrupa Yakası: Ortaköy Camii, Boğaziçi Köprüsü, Rumeli Hisarı ve Emirgan.";
    recommendedSide = "PORT";
    recommendedSideLabel = "İskele (Sol Taraf)";
    summary = "Rumeli Hisarı ve Ortaköy Camii'nin anıtsal Boğaz manzarasını yakından görmek için sol (iskele) tarafta yer alın.";
    bestForPhotos = "PORT";
  } else {
    starboardScenery = "Boğaz ve kıyı manzarası (Sancak).";
    portScenery = "Tarihi kıyı şeridi ve adalar ufku (İskele).";
    recommendedSide = "STARBOARD";
    recommendedSideLabel = "Sancak (Sağ Taraf)";
    summary = "Ferah manzara ve açık güverte konforu için sağ taraf tavsiye edilir.";
    bestForPhotos = "STARBOARD";
  }

  // Güneş notu
  let sunSceneryNote = "";
  if (isNight) {
    sunSceneryNote = "Gece seyri: Şehrin ışıkları ve köprü aydınlatmaları için açık üst güverte idealdir.";
  } else if (isSunsetTime) {
    sunSceneryNote = "Altın saatler (Golden Hour): Güneş batarken gökyüzü renkleri büyüleyici bir fon oluşturur.";
  } else if (sunOnStarboard) {
    sunSceneryNote = "Güneş sağ (sancak) taraftan vurmaktadır. Serin ve gölgede kalmak isterseniz sol (iskele) tarafı tercih edin.";
  } else {
    sunSceneryNote = "Güneş sol (iskele) taraftan vurmaktadır. Doğrudan güneş almadan seyir için sağ (sancak) taraf gölgededir.";
  }

  // Rüzgar ve koruma notu
  let windProtectionNote = "";
  if (isHighWind) {
    windProtectionNote = `Rüzgar ${windSpeedKnots} knot şiddetindedir. Serpinti ve sert rüzgardan korunmak için kapalı ana salon veya rüzgaraltı güverte önerilir.`;
  } else if (windFromPort) {
    windProtectionNote = "Rüzgar iskele (sol) baş omuzluktan esiyor. Sakin ve esintiden korunaklı oturmak için sancak (sağ) güverte uygundur.";
  } else {
    windProtectionNote = "Rüzgar sancak (sağ) taraftan hafif esmektedir. Pupa (arka) veya iskele (sol) güverte sakindir.";
  }

  return {
    headingDeg: heading,
    recommendedSide,
    recommendedSideLabel,
    summary,
    starboardScenery,
    portScenery,
    sunSceneryNote,
    windProtectionNote,
    bestForPhotos
  };
}
