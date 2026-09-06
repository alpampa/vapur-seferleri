/**
 * İstanbul Gece Seferleri & Geç Saat Kurtarma Matrisi
 * 
 * Son Vapur Kaçtığında (00:30 - 05:30 Arası) 100% Resmi ve Gerçek Alternatifler:
 * 1. Sarı Dolmuşlar (7/24 Kesintisiz Rıhtım Hatları)
 * 2. 24 Saat Çalışan Metrobüs Gece Hattı (Söğütlüçeşme - Zincirlikuyu - Beylikdüzü)
 * 3. 15 Temmuz Şehitler Köprüsü & Avrasya Tüneli Taksi Tahmini Gece Matrisi
 */

export interface NightDolmusRoute {
  id: string;
  departurePierHub: string;
  destination: string;
  standLocation: string;
  operatingHours: string;
  approxFareTl: string;
  approxDurationMin: number;
  frequency: string;
  tip: string;
}

export interface NightTaxiEstimate {
  fromPier: string;
  toPier: string;
  routeVia: string;
  distanceKm: number;
  estimatedCostRangeTl: string;
  bridgeOrTunnelToll: string;
  approxDurationMin: number;
}

export const NIGHT_DOLMUS_ROUTES: NightDolmusRoute[] = [
  {
    id: 'kadikoy-taksim',
    departurePierHub: 'Kadıköy',
    destination: 'Taksim Meydanı / Gümüşsuyu',
    standLocation: 'Kadıköy Rıhtım Haldun Taner Sahnesi Karşısı Dolmuş Peronları',
    operatingHours: '7/24 Gece Boyu Kesintisiz',
    approxFareTl: '45 - 55 ₺',
    approxDurationMin: 25,
    frequency: 'Doldukça kalkar (Gece 5-10 dk aralıkla)',
    tip: '15 Temmuz Şehitler Köprüsü\'nü kullanarak Beşiktaş ve Taksim\'e en hızlı geçiş yöntemidir.'
  },
  {
    id: 'kadikoy-bostanci',
    departurePierHub: 'Kadıköy',
    destination: 'Bostancı İskele & Bağdat Caddesi',
    standLocation: 'Rıhtım Otobüs Durakları Yanı',
    operatingHours: '7/24 Gece Boyu Kesintisiz',
    approxFareTl: '35 - 45 ₺',
    approxDurationMin: 20,
    frequency: 'Her 5 dakikada bir',
    tip: 'Adalar\'dan son motorla dönüp Anadolu Yakası boyunca ilerlemek için idealdir.'
  },
  {
    id: 'besiktas-taksim',
    departurePierHub: 'Beşiktaş',
    destination: 'Taksim (AKM & The Marmara Önü)',
    standLocation: 'Beşiktaş İskele Karşısı Dolmuş Çıkışı',
    operatingHours: '7/24 Gece Boyu Kesintisiz',
    approxFareTl: '30 - 35 ₺',
    approxDurationMin: 12,
    frequency: 'Her 3-5 dakikada bir',
    tip: 'Gece vapur bitiminde Taksim metrosuna ve gece merkezine doğrudan bağlar.'
  },
  {
    id: 'besiktas-kadikoy',
    departurePierHub: 'Beşiktaş',
    destination: 'Kadıköy Rıhtım',
    standLocation: 'Beşiktaş Çarşı / Akaretler Köprü Girişi',
    operatingHours: 'Gece 00:30 - 05:00 Arası',
    approxFareTl: '50 - 60 ₺',
    approxDurationMin: 20,
    frequency: 'Gece 10-15 dakikada bir',
    tip: 'Köprü üzerinden Anadolu Yakası\'na doğrudan geçiş sağlar.'
  },
  {
    id: 'karakoy-sisli',
    departurePierHub: 'Karaköy / Eminönü',
    destination: 'Şişli / Mecidiyeköy & Taksim',
    standLocation: 'Karaköy Rıhtım Caddesi Meydan Durağı',
    operatingHours: '00:00 - 04:30',
    approxFareTl: '35 - 40 ₺',
    approxDurationMin: 18,
    frequency: 'Doldukça kalkar',
    tip: 'Tarihi Yarımada\'dan gece Beyoğlu ve Şişli\'ye güvenli ulaşım.'
  },
  {
    id: 'uskudar-kadikoy',
    departurePierHub: 'Üsküdar',
    destination: 'Kadıköy Rıhtım',
    standLocation: 'Marmaray Üsküdar İstasyon Çıkışı Sahil Yolu',
    operatingHours: '7/24 Gece Boyu',
    approxFareTl: '30 - 35 ₺',
    approxDurationMin: 15,
    frequency: 'Her 10 dakikada bir',
    tip: 'Harem sahil yolu üzerinden kesintisiz seyreder.'
  }
];

export const NIGHT_TAXI_ESTIMATES: NightTaxiEstimate[] = [
  {
    fromPier: 'Kadıköy Rıhtım',
    toPier: 'Karaköy / Eminönü',
    routeVia: '15 Temmuz Şehitler Köprüsü & Sahil Yolu',
    distanceKm: 18.5,
    estimatedCostRangeTl: '420 - 490 ₺',
    bridgeOrTunnelToll: 'Köprü Ücreti Dahil',
    approxDurationMin: 22
  },
  {
    fromPier: 'Kadıköy Rıhtım',
    toPier: 'Beşiktaş İskelesi',
    routeVia: '15 Temmuz Şehitler Köprüsü & Barbaros Bulvarı',
    distanceKm: 15.2,
    estimatedCostRangeTl: '350 - 410 ₺',
    bridgeOrTunnelToll: 'Köprü Ücreti Dahil',
    approxDurationMin: 18
  },
  {
    fromPier: 'Üsküdar İskelesi',
    toPier: 'Kabataş / Beşiktaş',
    routeVia: '15 Temmuz Şehitler Köprüsü',
    distanceKm: 12.8,
    estimatedCostRangeTl: '300 - 360 ₺',
    bridgeOrTunnelToll: 'Köprü Ücreti Dahil',
    approxDurationMin: 15
  },
  {
    fromPier: 'Bostancı İskelesi',
    toPier: 'Kadıköy Rıhtım',
    routeVia: 'Bağdat Caddesi & Sahil Bulvarı',
    distanceKm: 9.4,
    estimatedCostRangeTl: '220 - 270 ₺',
    bridgeOrTunnelToll: 'Şehir İçi Ücretsiz Geçiş',
    approxDurationMin: 15
  }
];

export const METROBUS_NIGHT_INFO = {
  service: 'Metrobüs 7/24 Kesintisiz Gece Seferi',
  coverage: 'Beylikdüzü Son Durak ➔ Zincirlikuyu ➔ Söğütlüçeşme (Kadıköy)',
  nightInterval: '01:00 - 05:30 arası her 8-12 dakikada bir',
  pierHubConnection: 'Kadıköy İskelesi\'nden Söğütlüçeşme Metrobüs İstasyonu\'na 12 dk yürüyüş veya sarı dolmuş.',
  fareInfo: 'İstanbulkart Gece Tarifesi Geçerlidir (Gece Çift Tarife Kuralı Uygulanmaz).'
};
