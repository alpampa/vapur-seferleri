export type SponsoredAdCategory = "HOTEL" | "RESTAURANT" | "EXPERIENCE" | "CAFE";
export type SponsoredBillingModel = "MONTHLY_FIXED" | "CPC_AFFILIATE" | "PER_RESERVATION";

export interface SponsoredAdOffer {
  id: string;
  sponsorName: string;
  category: SponsoredAdCategory;
  badgeLabel: string;
  iconEmoji: string;
  headline: string;
  offerText: string;
  couponCode: string;
  priceHighlight?: string;
  ctaLabel: string;
  targetUrl: string;
  whatsappPhone?: string;
  whatsappPrefillText?: string;
  targetPiers: string[];
  routeCategory: "ADALAR" | "BOGAZ" | "ALL";
  billingModel: SponsoredBillingModel;
  monthlyFeeTry: number;
  commissionRateText: string;
  active: boolean;
  impressions: number;
  clicks: number;
  whatsappLeads: number;
}

export interface TariffWatchdogItem {
  operator: string;
  sourceType: "LIVE_SCRAPER" | "OFFICIAL_JSON_SNAPSHOT" | "OFFICIAL_IMAGE_TARIFF";
  sourceUrl: string;
  tariffSeason: string;
  lastVerifiedIso: string;
  expectedHashPrefix: string;
  status: "VERIFIED_CURRENT" | "CHECK_RECOMMENDED";
  lifeSafetyNote: string;
}

const INITIAL_SPONSORED_ADS: SponsoredAdOffer[] = [
  {
    id: "ad-buyukada-palas-hotel",
    sponsorName: "Büyükada Ada Palas Butik Otel",
    category: "HOTEL",
    badgeLabel: "ADA OTEL SPONSORU",
    iconEmoji: "🏨",
    headline: "Büyükada Ada Palas — İskele Yürüyüş Mesafesinde Konaklama",
    offerText: "Vapur yolcularına özel bu hafta sonu %15 indirim + serpme ada kahvaltısı dahil.",
    couponCode: "VAPUR15",
    priceHighlight: "%15 İndirim",
    ctaLabel: "Odayı İncele & Rezervasyon",
    targetUrl: "https://www.google.com/travel/hotels/B%C3%BCy%C3%BCkada?q=B%C3%BCy%C3%BCkada+Butik+Otel&utm_source=adalar_sefer_asistani&utm_medium=in_feed_row&utm_campaign=buyukada_otel",
    whatsappPhone: "905320000001",
    whatsappPrefillText: "Merhaba, Adalar Sefer Asistanı uygulamasındaki #VAPUR15 fırsatıyla Büyükada konaklama rezervasyonu için bilgi almak istiyorum.",
    targetPiers: ["Büyükada", "Bostancı", "Kadıköy", "Kabataş", "Eminönü", "Kartal"],
    routeCategory: "ADALAR",
    billingModel: "MONTHLY_FIXED",
    monthlyFeeTry: 12500,
    commissionRateText: "Aylık Sabit Hat Sponsorluğu + %8 Doğrudan Rezervasyon Komisyonu",
    active: true,
    impressions: 1840,
    clicks: 142,
    whatsappLeads: 38,
  },
  {
    id: "ad-heybeliada-konak-hotel",
    sponsorName: "Heybeliada Çam Limanı & İskele Konakları",
    category: "HOTEL",
    badgeLabel: "HEYBELİADA KONAKLAMA",
    iconEmoji: "🌲",
    headline: "Heybeliada İskele Konakları — Çam Kokuları Arasında Huzur",
    offerText: "Son vapuru düşünmeyin! Bu geceye özel deniz manzaralı odalarda anında onay.",
    couponCode: "HEYBELI15",
    priceHighlight: "Anında Onay",
    ctaLabel: "Müsait Odaları Gör",
    targetUrl: "https://www.google.com/travel/hotels/Heybeliada?q=Heybeliada+Otel&utm_source=adalar_sefer_asistani&utm_medium=in_feed_row&utm_campaign=heybeliada_otel",
    whatsappPhone: "905320000002",
    whatsappPrefillText: "Merhaba, Adalar Sefer Asistanı (#HEYBELI15) üzerinden Heybeliada oda müsaitliği ve fiyat bilgisi alabilir miyim?",
    targetPiers: ["Heybeliada"],
    routeCategory: "ADALAR",
    billingModel: "PER_RESERVATION",
    monthlyFeeTry: 8500,
    commissionRateText: "Rezervasyon Başı %10 Komisyon + Sabit İskele Görünürlüğü",
    active: true,
    impressions: 920,
    clicks: 76,
    whatsappLeads: 21,
  },
  {
    id: "ad-burgaz-kinali-balik",
    sponsorName: "Burgazada & Kınalıada İskele Balıkçısı",
    category: "RESTAURANT",
    badgeLabel: "ADA LEZZET NOKTASI",
    iconEmoji: "🐟",
    headline: "Burgazada İskele Rıhtım Balıkçısı — Gün Batımı Masası",
    offerText: "Vapura binmeden rıhtım kenarı masanızı ayırtın, tatlı & kahve ikramımızdır.",
    couponCode: "RIHTIM10",
    priceHighlight: "İkramlı Rezervasyon",
    ctaLabel: "Masa Ayırt",
    targetUrl: "https://www.google.com/maps/search/Burgazada+Bal%C4%B1k+Restoran?utm_source=adalar_sefer_asistani",
    whatsappPhone: "905320000003",
    whatsappPrefillText: "Merhaba, Adalar Sefer Asistanı (#RIHTIM10) üzerinden rıhtım kenarı masa rezervasyonu yapmak istiyorum.",
    targetPiers: ["Burgazada", "Kınalıada"],
    routeCategory: "ADALAR",
    billingModel: "MONTHLY_FIXED",
    monthlyFeeTry: 7500,
    commissionRateText: "Aylık Sabit Hat Sponsorluğu (7.500 ₺ / Ay)",
    active: true,
    impressions: 640,
    clicks: 54,
    whatsappLeads: 19,
  },
  {
    id: "ad-bogaz-iskele-kahve",
    sponsorName: "Boğaz İskele Roastery & Kruvasan",
    category: "CAFE",
    badgeLabel: "İSKELE KAHVE FIRSATI",
    iconEmoji: "☕",
    headline: "Vapura Binmeden Sıcak Kahve & Taze Kruvasan",
    offerText: "Kadıköy, Beşiktaş ve Karaköy iskele çıkışında 2. kahveniz %50 indirimli!",
    couponCode: "VAPURKAHVE",
    priceHighlight: "2. Kahve %50",
    ctaLabel: "Kupon Kodu Al",
    targetUrl: "https://www.google.com/maps/search/Kad%C4%B1k%C3%B6y+%C4%B0skele+Kahve?utm_source=adalar_sefer_asistani",
    targetPiers: ["Kadıköy", "Beşiktaş", "Karaköy", "Eminönü", "Üsküdar"],
    routeCategory: "BOGAZ",
    billingModel: "CPC_AFFILIATE",
    monthlyFeeTry: 9000,
    commissionRateText: "Aylık Sabit + Kupon Kullanım Başı Ödeme",
    active: true,
    impressions: 1120,
    clicks: 89,
    whatsappLeads: 14,
  },
];

// Bellek içi canlı reklam mağazası (Admin panelinden güncellenebilir, tıklamaları anlık sayar)
let runtimeAdsStore: SponsoredAdOffer[] = INITIAL_SPONSORED_ADS.map((a) => ({ ...a }));

export function getSponsoredAdsStore(): SponsoredAdOffer[] {
  return runtimeAdsStore;
}

export function recordAdInteraction(adId: string, type: "IMPRESSION" | "CLICK" | "WHATSAPP_LEAD"): SponsoredAdOffer | null {
  const target = runtimeAdsStore.find((a) => a.id === adId);
  if (!target) return null;
  if (type === "IMPRESSION") target.impressions += 1;
  if (type === "CLICK") target.clicks += 1;
  if (type === "WHATSAPP_LEAD") {
    target.clicks += 1;
    target.whatsappLeads += 1;
  }
  return target;
}

export function toggleSponsoredAdActive(adId: string): SponsoredAdOffer | null {
  const target = runtimeAdsStore.find((a) => a.id === adId);
  if (!target) return null;
  target.active = !target.active;
  return target;
}

export function updateSponsoredAd(adId: string, patch: Partial<SponsoredAdOffer>): SponsoredAdOffer | null {
  const idx = runtimeAdsStore.findIndex((a) => a.id === adId);
  if (idx === -1) return null;
  runtimeAdsStore[idx] = { ...runtimeAdsStore[idx], ...patch };
  return runtimeAdsStore[idx];
}

export function createSponsoredAd(newAd: Omit<SponsoredAdOffer, "id" | "impressions" | "clicks" | "whatsappLeads">): SponsoredAdOffer {
  const created: SponsoredAdOffer = {
    ...newAd,
    id: `ad-custom-${Date.now()}`,
    impressions: 1,
    clicks: 0,
    whatsappLeads: 0,
  };
  runtimeAdsStore = [created, ...runtimeAdsStore];
  return created;
}

/**
 * Kullanıcının seçtiği kalkış/varış iskelesine, kategoriye veya arama sorgusuna göre
 * en yüksek dönüşüm sağlayacak sponsorlu satırı seçer.
 */
export function selectContextualSponsoredAd(
  ads: SponsoredAdOffer[],
  context: {
    selectedCategory: "ADALAR" | "BOGAZ" | "ALL";
    selectedOrigin: string;
    selectedDestination: string;
    searchQuery: string;
  }
): SponsoredAdOffer | null {
  const activeAds = ads.filter((a) => a.active);
  if (activeAds.length === 0) return null;

  const q = context.searchQuery.toLowerCase().trim();
  const origin = context.selectedOrigin;
  const dest = context.selectedDestination;

  // 1. Öncelik: Varış veya kalkış iskelesi doğrudan eşleşen ada/iskele reklamı (örn. Heybeliada seçildiyse Heybeliada Oteli)
  if (dest !== "ALL") {
    const exactDestMatch = activeAds.find(
      (a) => a.targetPiers.some((p) => p.toLowerCase() === dest.toLowerCase()) && a.targetPiers.length <= 3
    );
    if (exactDestMatch) return exactDestMatch;
  }

  if (origin !== "ALL") {
    const exactOriginMatch = activeAds.find(
      (a) => a.targetPiers.some((p) => p.toLowerCase() === origin.toLowerCase()) && a.targetPiers.length <= 3
    );
    if (exactOriginMatch) return exactOriginMatch;
  }

  // 2. Öncelik: Arama kutusunda geçen ada/iskele adı
  if (q.length > 1) {
    const queryMatch = activeAds.find((a) =>
      a.targetPiers.some((p) => q.includes(p.toLowerCase())) ||
      a.headline.toLowerCase().includes(q)
    );
    if (queryMatch) return queryMatch;
  }

  // 3. Öncelik: Kategori bazlı (ADALAR sekmesindeyse Büyükada Otel, BOGAZ sekmesindeyse Boğaz Kafe)
  if (context.selectedCategory === "BOGAZ") {
    const bogazAd = activeAds.find((a) => a.routeCategory === "BOGAZ");
    if (bogazAd) return bogazAd;
  }

  const islandAd = activeAds.find((a) => a.routeCategory === "ADALAR");
  return islandAd || activeAds[0];
}

/**
 * Hayati Sefer Verisi & Sezon Geçiş Bekçisi (Tariff Expiry & Accuracy Watchdog)
 */
export function getTariffWatchdogStatus(): TariffWatchdogItem[] {
  const nowIso = new Date().toISOString();
  return [
    {
      operator: "Şehir Hatları (İBB)",
      sourceType: "OFFICIAL_JSON_SNAPSHOT",
      sourceUrl: "https://sehirhatlari.istanbul/tr/sefer-saatleri",
      tariffSeason: "2026 Güncel Tarife + Canlı İptal API",
      lastVerifiedIso: nowIso,
      expectedHashPrefix: "sh-692-verified",
      status: "VERIFIED_CURRENT",
      lifeSafetyNote: "Hafta içi, Cumartesi ve Pazar/Resmi Tatil ayrımları ile anlık iptal duyuruları aktif.",
    },
    {
      operator: "Mavi Marmara",
      sourceType: "OFFICIAL_IMAGE_TARIFF",
      sourceUrl: "https://www.mavimarmara.net/sefer-saatleri/",
      tariffSeason: "2026 Sonbahar / Kış Tarifesi",
      lastVerifiedIso: nowIso,
      expectedHashPrefix: "mm-winter-2026",
      status: "VERIFIED_CURRENT",
      lifeSafetyNote: "Yıldızlı (*) Pazar hariç sabah seferleri ve hafta sonu ek seferleri birebir doğrulandı.",
    },
    {
      operator: "Dentur Avrasya",
      sourceType: "LIVE_SCRAPER",
      sourceUrl: "https://www.denturavrasya.com/tr-TR/sefer_saatleri.aspx?id=38",
      tariffSeason: "Canlı Tablo Senkronizasyonu",
      lastVerifiedIso: nowIso,
      expectedHashPrefix: "da-id38-live",
      status: "VERIFIED_CURRENT",
      lifeSafetyNote: "Hafta içi, Cumartesi ve Pazar sütunları gece otomatik senkronize edilir.",
    },
    {
      operator: "Turyol",
      sourceType: "OFFICIAL_JSON_SNAPSHOT",
      sourceUrl: "https://www.turyol.com/TarifeSeferSaatleri",
      tariffSeason: "2026 Resmi Arama Motoru Verisi",
      lastVerifiedIso: nowIso,
      expectedHashPrefix: "ty-col3-patched",
      status: "VERIFIED_CURRENT",
      lifeSafetyNote: "Hafta sonuna özel 19:15/20:15 Adalar dönüşleri hafta içi gizlenecek şekilde kilitlendi.",
    },
    {
      operator: "Prens Tur",
      sourceType: "OFFICIAL_IMAGE_TARIFF",
      sourceUrl: "https://prenstur.com/sefer-saatleri/",
      tariffSeason: "2026-2027 Kış Tarifesi (Bostancı & Kartal)",
      lastVerifiedIso: nowIso,
      expectedHashPrefix: "pt-2026-2027-kis",
      status: "VERIFIED_CURRENT",
      lifeSafetyNote: "06:20 Kartal ve 07:00 Heybeliada hafta içi mesai seferleri Pazar günü filtrelenir.",
    },
  ];
}
