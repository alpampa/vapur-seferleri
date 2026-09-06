/**
 * Istanbul Passenger Fleet Visual Registry & Architectural Silhouette Profiles
 * Scaled vector silhouettes and verified technical specifications for Istanbul passenger vessels.
 */

export type VesselCategory = "HISTORIC_STEAMER" | "MODERN_TWIN_END" | "PASSENGER_MOTOR";

export interface VesselVisualProfile {
  id: string;
  category: VesselCategory;
  categoryTitle: string;
  categoryBadge: string;
  description: string;
  lengthMeters: number;
  beamMeters: number;
  draftMeters: number;
  speedKnots: number;
  capacityPax: number;
  shipyard: string;
  hullType: string;
  features: string[];
  photoUrl: string;
  photoCaption: string;
}

export const VESSEL_VISUAL_PROFILES: Record<VesselCategory, VesselVisualProfile> = {
  HISTORIC_STEAMER: {
    id: "historic-steamer",
    category: "HISTORIC_STEAMER",
    categoryTitle: "Tarihi Buharlı & Klasik Şehir Hatları Vapuru",
    categoryBadge: "Nostaljik Boğaz Efsanesi",
    description: "İstanbul Boğazı'nın simgesi olan çift katlı ahşap salonlu, klasik sarı-siyah bacalı ve geniş açık kıç güverteli nostaljik yolcu vapuru.",
    lengthMeters: 67.5,
    beamMeters: 10.5,
    draftMeters: 2.8,
    speedKnots: 14.5,
    capacityPax: 1450,
    shipyard: "Camialtı & Haliç Tersaneleri",
    hullType: "Geleneksel Çelik Perçinli Deplasman Gövde",
    features: [
      "Geleneksel Ahşap Lüks Salon",
      "Kıç Güverte Martı Besleme Alanı",
      "Nostaljik Vapur Çanı ve Pirinç Lumbuzlar",
      "Çay & Simit Büfesi",
      "Geniş Rüzgaraltı Seyir Balkonları"
    ],
    photoUrl: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80",
    photoCaption: "Klasik Şehir Hatları Vapuru Tarihi Yarımada & Boğaz Seyrinde"
  },
  MODERN_TWIN_END: {
    id: "modern-twin-end",
    category: "MODERN_TWIN_END",
    categoryTitle: "Modern Panoramik Şehir Hatları Vapuru",
    categoryBadge: "Yeni Nesil Çevreci Vapur",
    description: "Panoramik ısıcamlı geniş salonları, çift yönlü azimut iticileri ve engelli yolcular için hidrolik düzayak rampalarıyla donatılmış modern Boğaz gemisi.",
    lengthMeters: 68.0,
    beamMeters: 13.0,
    draftMeters: 2.5,
    speedKnots: 13.0,
    capacityPax: 1450,
    shipyard: "Tuzla & Yalova Türk Tersaneleri",
    hullType: "Çift Başlı (Double-Ended) Çelik Katamaran/Tekne",
    features: [
      "Tam Panoramik Isıcamlı Salonlar",
      "Engelli Düzayak Hidrolik Rampa",
      "Kapalı Bisiklet & Bebek Arabası Parkı",
      "Düşük Emisyonlu Azimut İticiler",
      "Dijital Bilgilendirme Ekranları"
    ],
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80",
    photoCaption: "Yeni Nesil Panoramik Şehir Hatları Vapuru İskele Yanaşmasında"
  },
  PASSENGER_MOTOR: {
    id: "passenger-motor",
    category: "PASSENGER_MOTOR",
    categoryTitle: "Yolcu Motoru (Mavi Marmara / Turyol / Dentur)",
    categoryBadge: "Hızlı Deniz Dolmuşu",
    description: "Yüksek manevra kabiliyetli çift deniz dizeli motorlarıyla Adalar ve Boğaz hatlarında hızlı ve sık sefer sağlayan çevik yolcu motoru.",
    lengthMeters: 42.0,
    beamMeters: 8.5,
    draftMeters: 1.9,
    speedKnots: 15.5,
    capacityPax: 650,
    shipyard: "Karadeniz & Yalova Özel Tersaneleri",
    hullType: "Yarı Deplasman Hızlı Çelik Yolcu Motoru",
    features: [
      "Hızlı İskele Yanaşma & Palamar Manevrası",
      "Üst Açık Havadar Seyir Güvertesi",
      "Geniş Yolcu Giriş Kapıları",
      "Kısa Mesafe Seri Boğaz Geçişi",
      "Yüksek Denizcilik Karinası"
    ],
    photoUrl: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?auto=format&fit=crop&w=1000&q=80",
    photoCaption: "Adalar ve Boğaz Hattında Seyir Eden Hızlı Yolcu Motoru"
  }
};

/**
 * Resolves the visual category and profile based on vessel name and operator
 */
export function getVesselVisualProfile(vesselName?: string, operator?: string): VesselVisualProfile {
  const nameNorm = (vesselName || "").toLowerCase();
  const opNorm = (operator || "").toLowerCase();

  // 1. Motor operators
  if (
    opNorm.includes("turyol") ||
    opNorm.includes("mavi marmara") ||
    opNorm.includes("dentur") ||
    opNorm.includes("prens tur") ||
    nameNorm.includes("turyol") ||
    nameNorm.includes("mavi marmara") ||
    nameNorm.includes("avrasya") ||
    nameNorm.includes("prens tur") ||
    nameNorm.includes("şevket mert") ||
    nameNorm.includes("cansu")
  ) {
    return VESSEL_VISUAL_PROFILES.PASSENGER_MOTOR;
  }

  // 2. Modern twin-end ferries
  if (
    nameNorm.includes("aykut barka") ||
    nameNorm.includes("hulusi yıldırım") ||
    nameNorm.includes("alptoğan") ||
    nameNorm.includes("fatih") ||
    nameNorm.includes("kadıköy") ||
    nameNorm.includes("beyoğlu") ||
    nameNorm.includes("maltepe") ||
    nameNorm.includes("sarıyer")
  ) {
    return VESSEL_VISUAL_PROFILES.MODERN_TWIN_END;
  }

  // 3. Historic / classic steamers (Paşabahçe, Barış Manço, Moda, Fahri Korutürk, Sami Akbulut, etc.)
  return VESSEL_VISUAL_PROFILES.HISTORIC_STEAMER;
}
