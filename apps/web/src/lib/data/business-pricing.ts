export interface BusinessPackage {
  id: string;
  name: string;
  tagline: string;
  priceLabel: string;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
}

export const BUSINESS_MAILTO =
  "mailto:iletisim@adalarseferasistani.com?subject=%C4%B0%C5%9Fletme%20Vitrin%20%2F%20Sponsorluk%20Ba%C5%9Fvurusu";

/**
 * B2B vitrin / sponsorluk paketleri (satış sayfası verisi).
 * Fiyatlar tanıtım amaçlı başlangıç seviyesidir; kesin teklif iletişimle verilir.
 */
export const BUSINESS_PACKAGES: BusinessPackage[] = [
  {
    id: "native-row",
    name: "Native Sponsor Satırı",
    tagline: "Sefer listesinin içinde, vapur saatiyle karışmayan doğal sponsor kartınız.",
    priceLabel: "₺2.900 / ay",
    priceNote: "başlangıç · yıllık anlaşmada %20 indirim",
    features: [
      "Sefer listesinde ~1/10 oranında gösterim",
      "Kupon kodu ve WhatsApp rezervasyon butonu",
      "Tıklama ve lead istatistikleri (ajans raporu)",
      "Ada ve hat bazlı hedefleme"
    ],
    highlighted: true,
    ctaLabel: "Teklif İste"
  },
  {
    id: "board-tv",
    name: "Pano TV Lisansı",
    tagline: "İşletmenizin ekranında tam ekran kalkış panosu (FIDS) — reklamsız, kesintisiz.",
    priceLabel: "₺1.900 / yıl",
    priceNote: "işletme başına · ?tv=1 tam ekran modu",
    features: [
      "Tam ekran, otomatik güncellenen kalkış tablosu",
      "Sefer detayıyla bağlantılı temiz arayüz",
      "Turist yoğun bölgelerde müşteri çekme etkisi",
      "Kurulum desteği (TV/kiosk yönlendirmesi)"
    ],
    ctaLabel: "Lisans Al"
  },
  {
    id: "coupon-partner",
    name: "Kupon Ortaklığı",
    tagline: "Ada rehberinde fırsat kuponu yayınlayın, satıştan pay verin.",
    priceLabel: "Komisyon %10",
    priceNote: "kupon kullanımı başına · sabit ücret yok",
    features: [
      "Ada Rehberi sekmesinde fırsat kartı",
      "Kupon kodu takibi ve kullanım raporu",
      "Sezonluk kampanya kurgusu",
      "Sabit ücret yok, riski yok"
    ],
    ctaLabel: "Başvur"
  }
];
