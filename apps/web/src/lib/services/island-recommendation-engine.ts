/**
 * ADA TURİZM, KÜLTÜR & TİCARİ REKLAM ÖNERİ MOTORU (Contextual Recommendation Engine)
 * 
 * Yolcunun bindiği/hedeflediği ada veya iskeleye göre:
 * 1. Tarihi ve kültürel gezilecek yerler
 * 2. Meşhur ada gastronomisi (tarihi fırınlar, dondurmacılar, balıkçılar)
 * 3. Sefer bazlı sponsorlu ticari indirim kuponları
 */

export interface IslandAttraction {
  id: string;
  title: string;
  category: "TARİH" | "MANZARA" | "SANAT" | "PLAJ";
  description: string;
  walkMinutesFromPier: number;
  highlightTag: string;
}

export interface GastronomySpot {
  id: string;
  name: string;
  specialty: string;
  priceLevel: "₺" | "₺₺" | "₺₺₺";
  badge: string;
}

export interface CommercialSponsorDeal {
  id: string;
  businessName: string;
  dealTitle: string;
  discountBadge: string;
  couponCode: string;
  description: string;
  whatsappBookingUrl?: string;
}

export interface IslandGuidePackage {
  islandName: string;
  heroStory: string;
  attractions: IslandAttraction[];
  gastronomy: GastronomySpot[];
  deals: CommercialSponsorDeal[];
}

const ISLAND_DATABASE: Record<string, IslandGuidePackage> = {
  "Büyükada": {
    islandName: "Büyükada (Prinkipo)",
    heroStory: "Prens Adaları'nın en büyüğü olan Büyükada; görkemli köşkleri, çam ormanları ve tarihi manastırlarıyla İstanbul'un en özel kültür rotasıdır.",
    attractions: [
      {
        id: "aya-yorgi",
        title: "Aya Yorgi Kilisesi ve Tepesi",
        category: "MANZARA",
        description: "202 metre rakımlı Yüce Tepe üzerinde 1751 yılından kalan tarihi kilise ve panoramik İstanbul manzarası.",
        walkMinutesFromPier: 35,
        highlightTag: "En İyi Günbatımı",
      },
      {
        id: "rum-yetimhanesi",
        title: "Tarihi Rum Yetimhanesi",
        category: "TARİH",
        description: "Avrupa'nın en büyük, dünyanın ikinci en büyük ahşap yapısı olan mimari anıt.",
        walkMinutesFromPier: 25,
        highlightTag: "Dünya Mirası",
      },
      {
        id: "resat-nuri",
        title: "Reşat Nuri Güntekin Evi",
        category: "SANAT",
        description: "Türk edebiyatının usta kaleminin Çalıkuşu romanını yazdığı Maden bölgesindeki tarihi köşkü.",
        walkMinutesFromPier: 18,
        highlightTag: "Edebiyat Rotası",
      },
    ],
    gastronomy: [
      {
        id: "buyukada-firini",
        name: "Tarihi Büyükada Pastanesi",
        specialty: "Meşhur sakızlı kurabiye ve paskalya çöreği",
        priceLevel: "₺₺",
        badge: "Tarihi Lezzet (1938)",
      },
      {
        id: "prinkipo-dondurma",
        name: "Prinkipo Dondurmacısı",
        specialty: "Doğal kavunlu, krokanlı ve sakızlı dondurma",
        priceLevel: "₺",
        badge: "İskele Meydanı",
      },
      {
        id: "milto-balik",
        name: "Milto Balık Restoranı",
        specialty: "Günlük taze Ege mezeleri ve mevsim balıkları",
        priceLevel: "₺₺₺",
        badge: "Deniz Kenarı",
      },
    ],
    deals: [
      {
        id: "deal-buyukada-1",
        businessName: "Büyükada İskele Restaurant",
        dealTitle: "Vapur Yolcularına Özel Akşam Yemeğinde %15 İndirim",
        discountBadge: "%15 İNDİRİM",
        couponCode: "VAPUR15",
        description: "İskele çıkışında yer alan restoranda deniz manzaralı masalarda geçerlidir.",
        whatsappBookingUrl: "https://wa.me/905000000000?text=VapurCanli15Kuponu",
      },
      {
        id: "deal-buyukada-2",
        businessName: "Ada Rüzgarı Bisiklet Kiralama",
        dealTitle: "2 Saat Kiralayana 1 Saat Ücretsiz Ada Turu",
        discountBadge: "+1 SAAT HEDİYE",
        couponCode: "ADATUR2026",
        description: "Saat Kulesi arkasındaki merkez şubemizde turnike biletinizi göstererek yararlanabilirsiniz.",
      },
    ],
  },
  "Heybeliada": {
    islandName: "Heybeliada (Halki)",
    heroStory: "Huzurlu koyları, tarihi Ruhban Okulu ve yemyeşil Değirmenburnu Tabiat Parkı ile Adalar'ın en sakin ve entelektüel adası.",
    attractions: [
      {
        id: "ruhban-okulu",
        title: "Heybeliada Ruhban Okulu",
        category: "TARİH",
        description: "Ümit Tepesi'nde yer alan, köklü kütüphanesi ve neoklasik mimarisiyle ünlü anıt yapı.",
        walkMinutesFromPier: 20,
        highlightTag: "Tarihi Miras",
      },
      {
        id: "inonu-muzesi",
        title: "İsmet İnönü Müze Evi",
        category: "SANAT",
        description: "Cumhuriyet tarihinin önemli dönüm noktalarına tanıklık etmiş tarihi köşk.",
        walkMinutesFromPier: 12,
        highlightTag: "Müze",
      },
      {
        id: "degirmenburnu",
        title: "Değirmenburnu Tabiat Parkı",
        category: "PLAJ",
        description: "Tarihi yel değirmeni kalıntısı, piknik alanları ve temiz kumsalıyla doğayla iç içe dinlenme noktası.",
        walkMinutesFromPier: 15,
        highlightTag: "Koy & Doğa",
      },
    ],
    gastronomy: [
      {
        id: "nazli-pastanesi",
        name: "Nazlı Pastanesi",
        specialty: "Geleneksel vişneli turta ve badem ezmesi",
        priceLevel: "₺₺",
        badge: "Tarihi Fırın",
      },
      {
        id: "heybeli-balik",
        name: "Heyamola Balıkçısı",
        specialty: "Lakerda, ada otları kavurması ve fava",
        priceLevel: "₺₺₺",
        badge: "Ada Gurmesi",
      },
    ],
    deals: [
      {
        id: "deal-heybeli-1",
        businessName: "Heybeli Butik Kafe & Restoran",
        dealTitle: "Kahve ve Tatlı Menüsünde %20 İndirim",
        discountBadge: "%20 İNDİRİM",
        couponCode: "HEYBELI20",
        description: "İskele caddesindeki kafemizde gün boyu geçerlidir.",
      },
    ],
  },
  "Burgazada": {
    islandName: "Burgazada (Antigoni)",
    heroStory: "Sait Faik'in hikayelerine hayat veren, Kalpazankaya günbatımı ve Madam Martha Koyu ile meşhur edebiyat adası.",
    attractions: [
      {
        id: "sait-faik-muzesi",
        title: "Sait Faik Abasıyanık Müzesi",
        category: "SANAT",
        description: "Usta yazarın yaşadığı, kişisel eşyalarının ve elyazmalarının korunduğu köşk.",
        walkMinutesFromPier: 8,
        highlightTag: "Ücretsiz Müze",
      },
      {
        id: "kalpazankaya",
        title: "Kalpazankaya Koyu ve Kayalıkları",
        category: "MANZARA",
        description: "Adanın batı ucunda, Marmara'nın en etkileyici günbatımı seyir noktası.",
        walkMinutesFromPier: 30,
        highlightTag: "Efsanevi Günbatımı",
      },
    ],
    gastronomy: [
      {
        id: "erguni-burgaz",
        name: "Ergün Pastanesi",
        specialty: "Milföy pasta ve frambuazlı tart",
        priceLevel: "₺₺",
        badge: "Tarihi Ada Tadı",
      },
    ],
    deals: [
      {
        id: "deal-burgaz-1",
        businessName: "Kalpazankaya Bahçe Restoran",
        dealTitle: "Günbatımı Rezervasyonlarında Özel İkram",
        discountBadge: "ÖZEL İKRAM",
        couponCode: "BURGAZIKRAM",
        description: "Vapur Canlı üzerinden gelen misafirlere özel ada tatlısı ikramı.",
      },
    ],
  },
  "Kınalıada": {
    islandName: "Kınalıada (Proti)",
    heroStory: "İstanbul'a en yakın ada olan Kınalıada; kızıl killi toprakları, berrak plajları ve Ayazma Koyu ile bilinir.",
    attractions: [
      {
        id: "hristos-manastiri",
        title: "Dönüşüm (Hristos) Manastırı",
        category: "TARİH",
        description: "Manastır Tepesi üzerinde Bizans döneminden kalma tarihi ibadethane.",
        walkMinutesFromPier: 20,
        highlightTag: "Tarihi Tepe",
      },
      {
        id: "ayazma-plaji",
        title: "Ayazma Plajı",
        category: "PLAJ",
        description: "Adanın arka cephesinde rüzgar almayan sakin ve temiz çakıl plajı.",
        walkMinutesFromPier: 15,
        highlightTag: "Yüzme Rotası",
      },
    ],
    gastronomy: [
      {
        id: "jale-pastanesi",
        name: "Kınalı Jale Pastanesi",
        specialty: "Ada böreği ve sakızlı kurabiye",
        priceLevel: "₺",
        badge: "İskele Karşısı",
      },
    ],
    deals: [
      {
        id: "deal-kinali-1",
        businessName: "Ayazma Sahil Tesisleri",
        dealTitle: "Şezlong ve Şemsiye Kiralamada %25 İndirim",
        discountBadge: "%25 İNDİRİM",
        couponCode: "KINALI25",
        description: "Hafta içi tüm girişlerde Vapur Canlı kodu geçerlidir.",
      },
    ],
  },
};

export function getIslandGuidePackage(destinationName: string): IslandGuidePackage | null {
  for (const [key, pkg] of Object.entries(ISLAND_DATABASE)) {
    if (destinationName.toLowerCase().includes(key.toLowerCase())) {
      return pkg;
    }
  }
  return null;
}
