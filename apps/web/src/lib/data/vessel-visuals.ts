/**
 * Istanbul Passenger Fleet Visual Registry & Architectural Silhouette Profiles
 * Yerel yüksek çözünürlüklü fotoğraflar (/images/pasabahce-hero.jpg ve /images/adalar-aerial.jpg)
 * ve doğrulanmış teknik filo spesifikasyonları.
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
    photoUrl: "/images/pasabahce-hero.jpg",
    photoCaption: "Klasik Şehir Hatları Vapuru (Paşabahçe Sınıfı) Tarihi Yarımada & Boğaz Seyrinde"
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
    photoUrl: "/images/pasabahce-hero.jpg",
    photoCaption: "Şehir Hatları Yolcu Vapuru İstanbul Boğazı Seyrinde"
  },
  PASSENGER_MOTOR: {
    id: "passenger-motor",
    category: "PASSENGER_MOTOR",
    categoryTitle: "Yolcu Motoru & Hızlı Deniz Aracı (Mavi Marmara / Turyol / Dentur / İDO)",
    categoryBadge: "Hızlı Deniz Ulaşımı",
    description: "Yüksek manevra kabiliyetli çift deniz dizeli motorlarıyla Adalar ve Boğaz hatlarında hızlı ve sık sefer sağlayan çevik deniz ulaşım aracı.",
    lengthMeters: 42.0,
    beamMeters: 8.5,
    draftMeters: 1.9,
    speedKnots: 18.5,
    capacityPax: 650,
    shipyard: "Yalova & Karadeniz Özel Tersaneleri",
    hullType: "Yarı Deplasman Hızlı Çelik / Alüminyum Gövde",
    features: [
      "Hızlı İskele Yanaşma & Palamar Manevrası",
      "Üst Açık Havadar Seyir Güvertesi",
      "Geniş Yolcu Giriş Kapıları",
      "Kısa Mesafe Seri Boğaz & Adalar Geçişi",
      "Yüksek Denizcilik Karinası"
    ],
    photoUrl: "/images/adalar-aerial.jpg",
    photoCaption: "Prens Adaları (Büyükada & Heybeliada) Deniz Koridorunda Seyir"
  }
};

export function getVesselVisualProfile(vesselName?: string, operator?: string): VesselVisualProfile {
  const opNorm = (operator || "").toLowerCase();
  if (
    opNorm.includes("turyol") ||
    opNorm.includes("dentur") ||
    opNorm.includes("mavi marmara") ||
    opNorm.includes("prens tur") ||
    opNorm.includes("ido")
  ) {
    return VESSEL_VISUAL_PROFILES.PASSENGER_MOTOR;
  }

  const vNorm = (vesselName || "").toLowerCase();
  if (vNorm.includes("muhsin") || vNorm.includes("durusu") || vNorm.includes("fuat")) {
    return VESSEL_VISUAL_PROFILES.MODERN_TWIN_END;
  }

  return VESSEL_VISUAL_PROFILES.HISTORIC_STEAMER;
}
