/**
 * İskele Çevresi Yerel İşletme Sponsorlukları & Ticari Gelir Modeli
 * 
 * Vapur yolcusuna değer katan, rahatsız etmeyen NATIVE Sponsorluk Ağı:
 * 1. İskele Çevresi Tarihi & Nitelikli İşletmeler (Kafeler, Fırınlar, Balıkçılar)
 * 2. Adalar Ulaşım & Bisiklet Kiralama Ayrıcalıkları
 * 3. Vapur İçi BELTUR & Büfe İkram Kuponları
 * 4. Kurumsal Hat & Sefer Sponsorlukları ('Kadıköy-Karaköy Hattı X Markası İle Taşınıyor')
 * 5. İşletmeler için 'İskele Sponsoru Olun' Başvuru Modeli
 */

export interface SponsoredDeal {
  id: string;
  pierName: string;
  businessName: string;
  category: 'CAFE' | 'BAKERY' | 'RESTAURANT' | 'MOBILITY' | 'CULTURE' | 'BELTUR';
  badge: string;
  dealTitle: string;
  dealDescription: string;
  promoCode?: string;
  discountRate?: string;
  distanceFromPier: string;
  isVerifiedPartner: boolean;
  actionUrl?: string;
}

export const SPONSORED_PIER_DEALS: SponsoredDeal[] = [
  {
    id: 'deal-beltur-ferry',
    pierName: 'Tüm Şehir Hatları Vapurları',
    businessName: 'BELTUR Vapur Büfesi',
    category: 'BELTUR',
    badge: 'Resmi Vapur İkramı',
    dealTitle: 'Tavşan Kanı Vapur Çayı & Taze Simit',
    dealDescription: 'Boğaz havasında vapur seyrinin vazgeçilmez ikilisi. Her vapurda yer alan BELTUR büfelerinde geçerli.',
    discountRate: 'Özel Menü',
    distanceFromPier: 'Vapur İçi Ana Salon & Üst Güverte',
    isVerifiedPartner: true
  },
  {
    id: 'deal-buyukada-bike',
    pierName: 'Büyükada',
    businessName: 'Ada Bisiklet & Akülü Araç Kiralama',
    category: 'MOBILITY',
    badge: 'Ada İçi Ulaşım Sponsoru',
    dealTitle: 'Tüm Günlük Bisiklet Kiralamada %15 İndirim',
    dealDescription: 'Vapurdan indiğinizde Saat Meydanı\'na 1 dakika mesafede kasksız ve kilitli bisiklet teslimatı.',
    promoCode: 'VAPURBICI15',
    discountRate: '%15 İndirim',
    distanceFromPier: 'İskeleden 80 metre (Saat Meydanı)',
    isVerifiedPartner: true
  },
  {
    id: 'deal-kadikoy-tea',
    pierName: 'Kadıköy',
    businessName: 'Kadıköy Rıhtım Tarihi Çay Bahçesi',
    category: 'CAFE',
    badge: 'Rıhtım Geleneği',
    dealTitle: 'Vapur Bekleme Kahvesi & Deniz Manzarası',
    dealDescription: 'Haydarpaşa ve Tarihi Yarımada\'ya karşı vapurunuzu beklerken taze demlenmiş çay ve Türk kahvesi.',
    discountRate: 'Yolcu İkramı',
    distanceFromPier: 'Şehir Hatları İskelesi Yanı',
    isVerifiedPartner: true
  },
  {
    id: 'deal-eminonu-simit',
    pierName: 'Eminönü',
    businessName: 'Tarihi Boğaz Simit Fırını',
    category: 'BAKERY',
    badge: 'Geleneksel Lezzet',
    dealTitle: 'Fırından Yeni Çıkmış Martı Simidi & Peynir',
    dealDescription: 'Vapura binmeden önce martılara atmak ve kahvaltı yapmak için sıcak susamlı taş fırın simidi.',
    promoCode: 'MARTI2026',
    discountRate: '2. Simit İndirimli',
    distanceFromPier: 'Eminönü 1 No\'lu Vapur İskelesi Karşısı',
    isVerifiedPartner: true
  },
  {
    id: 'deal-karakoy-coffee',
    pierName: 'Karaköy',
    businessName: 'Karaköy Liman Roast Coffee',
    category: 'CAFE',
    badge: '3. Nesil Kahve',
    dealTitle: 'Take-Away Vapur Boyu Filtre Kahve',
    dealDescription: 'Vapurda seyahat ederken sıcak kahveniz yanınızda olsun. Vapur bileti veya İstanbulkart gösterenlere %10 indirim.',
    promoCode: 'FERRYCOFFEE',
    discountRate: '%10 İndirim',
    distanceFromPier: 'Karaköy İskelesi\'nden 2 dk yürüyüş',
    isVerifiedPartner: true
  }
];
