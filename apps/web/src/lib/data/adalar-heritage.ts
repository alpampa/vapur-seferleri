/**
 * Adalar Tarihi Miras, Kültür Atlası & Fotoğraf Galerisi Rehberi
 * 
 * Tarihî bilgiler ve uydu koordinatları; fotoğraflar temsili görsellerdir:
 * - Büyükada (Prinkipos): Rum Yetimhanesi, Aya Yorgi, Splendid Palas, Troçki Evi, Reşat Nuri Güntekin Evi
 * - Heybeliada (Halki): Ruhban Okulu, Hüseyin Rahmi Gürpınar Evi, Tarihi Deniz Lisesi, Değirmenburnu
 * - Burgazada (Antigoni): Sait Faik Abasıyanık Müzesi, Madam Martha Koyu, Kalpazankaya, Aya Yani
 * - Kınalıada (Proti): Surp Krikor Lusavoriç, Hristos Manastırı, Tarihi İskele Meydanı
 * - Sedef Adası (Terebinthos): Botanik vahası, Şehsuvar Menemencioğlu mirası ve tarihi iskele
 */

export interface IslandHeritagePoint {
  id: string;
  name: string;
  category: 'ARCHITECTURAL' | 'MONASTERY' | 'LITERATURE' | 'NATURE' | 'HISTORY';
  era: string;
  description: string;
  significance: string;
  howToWalk: string;
  distanceFromPierKm: number;
  walkingMinutes: number;
  imageUrl: string;
  photoCaption: string;
  photoCredit: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IslandPhotoItem {
  id: string;
  url: string;
  caption: string;
  category: 'PANORAMA' | 'LANDMARK' | 'STREET' | 'AERIAL';
  credit: string;
}

export interface IslandTransitRoute {
  departurePier: string;
  operators: string[];
  approxDurationMin: number;
  transitConnection: string;
  tip: string;
}

export interface IslandProfile {
  id: string;
  name: string;
  greekName: string;
  subtitle: string;
  badge: string;
  overview: string;
  heroImageUrl: string;
  heroImageCaption: string;
  heroImageCredit: string;
  satelliteCoordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
  gallery: IslandPhotoItem[];
  transitRoutes: IslandTransitRoute[];
  heritagePoints: IslandHeritagePoint[];
}

export const ADALAR_HERITAGE_DATA: IslandProfile[] = [
  {
    id: 'buyukada',
    name: 'Büyükada',
    greekName: 'Prinkipos',
    subtitle: 'Prens Adalarının En Büyüğü & Sürgün Krallığı',
    badge: 'Tarihi Başkent',
    overview: 'Bizans prens ve imparatoriçelerinin sürgün yeri olan Büyükada; Alexandre Vallaury imzalı ahşap köşkleri, çam ormanları, Mimar Mihran Azaryan çinili tarihi iskelesi ve kozmopolit mirasıyla Adalar zincirinin kalbidir.',
    heroImageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption: 'Büyükada Tarihi İskele Meydanı ve Kıyı Panoraması',
    heroImageCredit: 'Temsili görsel (Unsplash)',
    satelliteCoordinates: {
      lat: 40.8533,
      lng: 29.1244,
      zoom: 14
    },
    gallery: [
      {
        id: 'buyuk-iskele',
        url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85',
        caption: '1899 Mimar Mihran Azaryan tasarımı tarihi Büyükada İskelesi ve Kütahya çinileri',
        category: 'LANDMARK',
        credit: 'Temsili görsel (Unsplash)'
      },
      {
        id: 'buyuk-splendid',
        url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=85',
        caption: '1908 Art Nouveau tarzı kırmızı panjurlu efsanevi Splendid Palas Oteli',
        category: 'STREET',
        credit: 'Temsili görsel (Unsplash)'
      },
      {
        id: 'buyuk-ayayorgi',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        caption: '204 metre rakımlı Yüce Tepe üzerindeki tarihi Aya Yorgi Kilisesi ve Marmara manzarası',
        category: 'AERIAL',
        credit: 'Temsili görsel (Unsplash)'
      }
    ],
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara', 'İDO'],
        approxDurationMin: 30,
        transitConnection: 'Marmaray Bostancı İstasyonu (5 dk yürüme)',
        tip: 'En hızlı ve sık kalkan ana arterdir. Sabah ve akşam her 20-30 dakikada bir sefer vardır.'
      },
      {
        departurePier: 'Kadıköy',
        operators: ['Şehir Hatları', 'Turyol'],
        approxDurationMin: 50,
        transitConnection: 'M4 Kadıköy Metrosu & T3 Tramvayı',
        tip: 'Geniş açık güvertesiyle Tarihi Yarımada ve Moda silueti eşliğinde keyifli Boğaz-Marmara geçişi.'
      },
      {
        departurePier: 'Kabataş',
        operators: ['Şehir Hatları', 'Dentur'],
        approxDurationMin: 75,
        transitConnection: 'T1 Bağcılar-Kabataş Tramvayı & F1 Taksim Füniküleri',
        tip: 'Avrupa Yakası merkezinden gelen yolcular için en doğrudan vapur hattıdır.'
      },
      {
        departurePier: 'Eminönü / Karaköy',
        operators: ['Şehir Hatları', 'Turyol'],
        approxDurationMin: 70,
        transitConnection: 'T1 Tramvay & Marmaray Sirkeci',
        tip: 'Tarihi Yarımada’dan kalkan Şehir Hatları vapurları Kınalı, Burgaz ve Heybeli uğramalı nostaljik seyir sunar.'
      }
    ],
    heritagePoints: [
      {
        id: 'rum-yetimhanesi',
        name: 'Prinkipo Rum Yetimhanesi',
        category: 'ARCHITECTURAL',
        era: '1898 (Mimar Alexandre Vallaury)',
        description: 'Avrupa’nın en büyük, dünyanın ikinci en büyük ahşap karkas binasıdır. Aslen lüks otel ve kumarhane (Prinkipo Palace) olarak inşa edilmiş, Sultan II. Abdülhamid izin vermeyince yetimhaneye dönüştürülmüştür.',
        significance: 'Ahşap mimarlık harikası ve Adalar’ın çok kültürlü hafızasının en görkemli anıtıdır.',
        howToWalk: 'İskeleden Çankaya Caddesi boyunca köşkleri seyrederek Hristos Tepesi’ne doğru yaklaşık 30 dakika yürünür.',
        distanceFromPierKm: 2.1,
        walkingMinutes: 32,
        imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Prinkipo Rum Yetimhanesi Ahşap Cephesi ve Hristos Tepesi Ormanları',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8608, lng: 29.1239 }
      },
      {
        id: 'aya-yorgi',
        name: 'Aya Yorgi Kilisesi ve Manastırı',
        category: 'MONASTERY',
        era: '1751 (Eski Kilise) / 1905 (Yeni Kilise)',
        description: 'Büyükada’nın en yüksek noktası olan Yüce Tepe’de (204 m) yer alır. 23 Nisan ve 24 Eylül günlerinde binlerce kişinin çıplak ayakla yürüyerek dilek dilediği efsanevi hac mekanıdır.',
        significance: 'Adalar’ın en yüksek seyir balkonu olup Marmara Denizi, Sedef Adası ve İstanbul siluetini 360 derece görür.',
        howToWalk: 'Lunapark Kır Kahvesi meydanına kadar yürünüp oradan yaklaşık 900 metrelik dik Arnavut kaldırımı yokuş tırmanılır.',
        distanceFromPierKm: 3.4,
        walkingMinutes: 55,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Aya Yorgi Tepesi Manastır Bahçesi ve Marmara Ufku',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8512, lng: 29.1192 }
      },
      {
        id: 'splendid-palas',
        name: 'Splendid Palas Oteli',
        category: 'ARCHITECTURAL',
        era: '1908 (Mimar Kaludi Laskaris)',
        description: 'Gümüş kubbeleri, avlulu ahşap atriyumu ve kırmızı ahşap panjurlarıyla Belle Époque ve Art Nouveau döneminin Türkiye’deki en iyi korunmuş otel yapısıdır.',
        significance: 'Mustafa Kemal Atatürk’ün Adalar ziyaretlerinde dans ettiği ve konakladığı tarihi mekan.',
        howToWalk: 'İskeleden çıkıp sola dönün, 23 Nisan Caddesi boyunca 5 dakika düz yürüyün.',
        distanceFromPierKm: 0.4,
        walkingMinutes: 6,
        imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Splendid Palas Kırmızı Panjurlu Tarihi Cephesi',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8745, lng: 29.1278 }
      },
      {
        id: 'trocki-evi',
        name: 'Leon Troçki Evi (Yanaros Köşkü)',
        category: 'HISTORY',
        era: '1850’ler',
        description: 'Sovyet lider Leon Troçki’nin Stalin tarafından sürgün edildikten sonra 1929-1933 yılları arasında yaşadığı, "İhanete Uğrayan Devrim" ve otobiyografisini yazdığı tarihi deniz köşküdür.',
        significance: '20. yüzyıl dünya siyaset tarihinin dönüm noktalarından biri.',
        howToWalk: 'Nizam yönüne doğru Çankaya Caddesi üzerinde 1.8 km yürünür (yaklaşık 25 dakika).',
        distanceFromPierKm: 1.8,
        walkingMinutes: 24,
        imageUrl: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Nizam Sahilinde Tarihi Troçki Köşkü İskelesi',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8654, lng: 29.1165 }
      },
      {
        id: 'resat-nuri-evi',
        name: 'Reşat Nuri Güntekin Evi',
        category: 'LITERATURE',
        era: '1930’lar',
        description: 'Çalıkuşu, Dudaktan Kalbe ve Yaprak Dökümü gibi edebiyatımızın başyapıtlarının yazarı Reşat Nuri Güntekin’in uzun yıllar yaşadığı ve eserlerini kaleme aldığı beyaz ahşap köşk.',
        significance: 'Türk edebiyatının en önemli hatıra mekanlarından biridir.',
        howToWalk: 'Maden Mahallesi, Yılmaz Türk Caddesi üzerinde iskeleden 15 dakika kuzeye doğru yürünür.',
        distanceFromPierKm: 1.1,
        walkingMinutes: 16,
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Reşat Nuri Güntekin Beyaz Ahşap Edebiyat Köşkü',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8798, lng: 29.1332 }
      }
    ]
  },
  {
    id: 'heybeliada',
    name: 'Heybeliada',
    greekName: 'Halki',
    subtitle: 'Çam Limanı, Ruhban Mektebi & Edebiyatın Huzuru',
    badge: 'Yeşilin ve Bilgeliğin Adası',
    overview: 'Prens Adalarının ikinci büyüğü olan Heybeliada; eyer şeklindeki çam tepeleri, Türkiye’nin ilk sanatoryumu, tarihi Deniz Lisesi ve ünlü Ruhban Okulu ile bilinir.',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption: 'Heybeliada Çam Limanı Koyu ve Tarihi Yel Değirmeni Burnu',
    heroImageCredit: 'Temsili görsel (Unsplash)',
    satelliteCoordinates: {
      lat: 40.8767,
      lng: 29.0917,
      zoom: 14
    },
    gallery: [
      {
        id: 'heybeli-ruhban',
        url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85',
        caption: 'Ümit Tepesi zirvesinde 1844 yapımı Heybeliada Rum Ortodoks Ruhban Okulu',
        category: 'LANDMARK',
        credit: 'Temsili görsel (Unsplash)'
      },
      {
        id: 'heybeli-camlimani',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        caption: 'Hilal şeklindeki korunaklı Çam Limanı Koyu ve yelkenliler',
        category: 'PANORAMA',
        credit: 'Temsili görsel (Unsplash)'
      }
    ],
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
        approxDurationMin: 25,
        transitConnection: 'Marmaray Bostancı İstasyonu (5 dk yürüme)',
        tip: 'En pratik geçiş noktasıdır.'
      },
      {
        departurePier: 'Kabataş',
        operators: ['Şehir Hatları', 'Dentur'],
        approxDurationMin: 65,
        transitConnection: 'T1 Tramvay / F1 Füniküler',
        tip: 'Avrupa Yakası’ndan geniş güverteli vapurla gelirken vapurdan martıları beslemek için ideal rota.'
      }
    ],
    heritagePoints: [
      {
        id: 'ruhban-okulu',
        name: 'Heybeliada Rum Ortodoks Ruhban Okulu',
        category: 'MONASTERY',
        era: '1844 (Mimar Periklis Fotiadis)',
        description: 'Ümit Tepesi’nde kurulu olan okul, Ortodoks dünyasının Fener Rum Patrikhanesi’nden sonraki en önemli teoloji eğitim merkezidir. Muhteşem kütüphanesinde 120 binden fazla tarihi el yazması ve nadir eser bulunur.',
        significance: 'Dünya dinler tarihi ve felsefe mirasının en seçkin kurumlarından biridir.',
        howToWalk: 'İskeleden Ümit Tepesi tabelalarını takip ederek çam ağaçları arasından 20 dakika yürünür.',
        distanceFromPierKm: 1.4,
        walkingMinutes: 22,
        imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Ruhban Okulu Tarihi Taş Yapısı ve Giriş Kapısı',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8812, lng: 29.0945 }
      },
      {
        id: 'huseyin-rahmi',
        name: 'Hüseyin Rahmi Gürpınar Müze Evi',
        category: 'LITERATURE',
        era: '1912-1944',
        description: 'Türk edebiyatının natüralist ustası Hüseyin Rahmi Gürpınar’ın 30 yılı aşkın süre yaşadığı, dantel ördüğü, kitaplarını kaleme aldığı tepe köşküdür.',
        significance: 'Yazarın kişisel eşyaları, el yazmaları ve kendi elleriyle işlediği el işleri sergilenir.',
        howToWalk: 'Değirmenburnu yönüne doğru dik yokuş üzerinden yaklaşık 25 dakika yürünür.',
        distanceFromPierKm: 1.6,
        walkingMinutes: 26,
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Hüseyin Rahmi Gürpınar Evi ve Heybeli Sırtları',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8841, lng: 29.0911 }
      },
      {
        id: 'tarihi-deniz-lisesi',
        name: 'Tarihi Deniz Lisesi (Mühendishane-i Bahr-i Hümayun)',
        category: 'HISTORY',
        era: '1773 (Kaptan-ı Derya Cezayirli Gazi Hasan Paşa)',
        description: 'Türk Deniz Kuvvetleri’nin subay yetiştiren en köklü eğitim kurumudur. İskeleden iner inmez sol tarafta görkemli kışla binası ve saat kulesiyle yükselir.',
        significance: 'Türkiye’nin en eski askeri ve mühendislik eğitim kurumudur.',
        howToWalk: 'İskelenin hemen solunda, 2 dakikalık yürüme mesafesindedir.',
        distanceFromPierKm: 0.1,
        walkingMinutes: 2,
        imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Heybeliada Bahriye Mektebi Rıhtımı ve Saat Kulesi',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8752, lng: 29.0988 }
      }
    ]
  },
  {
    id: 'burgazada',
    name: 'Burgazada',
    greekName: 'Antigoni',
    subtitle: 'Sait Faik’in Kalpazankaya’sı & Edebiyatın Sığınağı',
    badge: 'Bohem ve Edebi Rota',
    overview: 'Büyük İskender’in generali Antigonos’un adını taşıyan Burgazada; yuvarlak çam tepesi, Kalpazankaya gün batımları ve Sait Faik Abasıyanık’ın hikayeleriyle bütünleşmiştir.',
    heroImageUrl: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption: 'Burgazada Kalpazankaya Koyu ve Marmara Denizi',
    heroImageCredit: 'Temsili görsel (Unsplash)',
    satelliteCoordinates: {
      lat: 40.8806,
      lng: 29.0667,
      zoom: 14.5
    },
    gallery: [
      {
        id: 'burgaz-saitfaik',
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85',
        caption: 'Sait Faik Abasıyanık Müzesi Beyaz Ahşap Köşkü',
        category: 'LANDMARK',
        credit: 'Temsili görsel (Unsplash)'
      },
      {
        id: 'burgaz-kalpazan',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        caption: 'Marmara’nın en güzel gün batımı seyir noktası: Kalpazankaya',
        category: 'PANORAMA',
        credit: 'Temsili görsel (Unsplash)'
      }
    ],
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
        approxDurationMin: 20,
        transitConnection: 'Marmaray Bostancı',
        tip: 'Burgazada’ya en yakın ve en hızlı sefer hattı.'
      },
      {
        departurePier: 'Kabataş / Eminönü',
        operators: ['Şehir Hatları'],
        approxDurationMin: 55,
        transitConnection: 'T1 Tramvay / F1 Füniküler',
        tip: 'Kınalıada’dan sonraki ikinci duraktır.'
      }
    ],
    heritagePoints: [
      {
        id: 'sait-faik-muzesi',
        name: 'Sait Faik Abasıyanık Müze Evi',
        category: 'LITERATURE',
        era: '1959 (Darüşşafaka Cemiyeti)',
        description: 'Çağdaş Türk hikayeciliğinin öncüsü Sait Faik’in annesi Makbule Hanım ile yaşadığı, "Semaver" ve "Dülger Balığının Ölümü" gibi ölümsüz öykülerini kaleme aldığı köşk.',
        significance: 'Yazarın daktilosu, el yazması defterleri, mektupları ve balıkçı dostlarının hatıraları ücretsiz gezilebilir.',
        howToWalk: 'İskeleden Çarşı Caddesi boyunca 5 dakika hafif yokuş yürünür.',
        distanceFromPierKm: 0.4,
        walkingMinutes: 6,
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Sait Faik Müzesi Avlusu ve Çalışma Masası',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8814, lng: 29.0701 }
      },
      {
        id: 'kalpazankaya',
        name: 'Kalpazankaya Koyu & Gün Batımı',
        category: 'NATURE',
        era: 'Tarihi Doğal Kıyı',
        description: 'Vaktiyle kalpazanların sahte para bastığı rivayet edilen gizli sarp koy. Sait Faik’in denizle baş başa kaldığı, İstanbul’un en dramatik gün batımı manzarasına sahip kıyısıdır.',
        significance: 'Adalar’ın en meşhur açık hava lezzet ve gün batımı seyir noktası.',
        howToWalk: 'Adanın güneybatı kıyısı boyunca çam ormanları içinden yaklaşık 35 dakika keyifli yürüyüş yapılır.',
        distanceFromPierKm: 2.3,
        walkingMinutes: 35,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Kalpazankaya Kayalıkları ve Güneşin Batışı',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8755, lng: 29.0552 }
      }
    ]
  },
  {
    id: 'kinaliada',
    name: 'Kınalıada',
    greekName: 'Proti',
    subtitle: 'Kızıl Kayalıklar & İstanbul’a En Yakın İlk Ada',
    badge: 'İlk Karşılama Kapısı',
    overview: 'Toprağının kızılımsı renginden (kına) adını alan Kınalıada; İstanbul anakarasına en yakın (Proti) adadır. Taşlık berrak plajları, Ayazması ve sanatsal dokusuyla öne çıkar.',
    heroImageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption: 'Kınalıada Sahili ve Tarihi Vapur İskelesi',
    heroImageCredit: 'Temsili görsel (Unsplash)',
    satelliteCoordinates: {
      lat: 40.9100,
      lng: 29.0500,
      zoom: 15
    },
    gallery: [
      {
        id: 'kinali-iskele',
        url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=85',
        caption: 'Kınalıada İskelesi ve Sahil Çınar Altı Kahveleri',
        category: 'STREET',
        credit: 'Temsili görsel (Unsplash)'
      }
    ],
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
        approxDurationMin: 15,
        transitConnection: 'Marmaray Bostancı İstasyonu',
        tip: 'Sadece 15 dakikada adaya ulaşılan en kısa deniz yoludur.'
      },
      {
        departurePier: 'Kabataş / Beşiktaş',
        operators: ['Şehir Hatları', 'Dentur'],
        approxDurationMin: 45,
        transitConnection: 'T1 Tramvay / F1 Füniküler',
        tip: 'Avrupa Yakası’ndan kalkan Şehir Hatları vapurlarının ilk uğrak durağıdır.'
      }
    ],
    heritagePoints: [
      {
        id: 'surp-krikor',
        name: 'Surp Krikor Lusavoriç Ermeni Kilisesi',
        category: 'MONASTERY',
        era: '1857',
        description: 'Adalar’daki tek Ermeni Gregoryen kilisesidir. Ahşap oyma sunağı ve denize bakan huzurlu bahçesiyle Kınalıada’nın sembolüdür.',
        significance: 'Mimari zarafeti ve Adalar’ın cemaat mirasının canlı kanıtıdır.',
        howToWalk: 'İskeleden çıkınca sağa doğru 3 dakika yürünür.',
        distanceFromPierKm: 0.2,
        walkingMinutes: 3,
        imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Surp Krikor Lusavoriç Kilisesi Tarihi Cephesi',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.9112, lng: 29.0524 }
      },
      {
        id: 'hristos-manastiri',
        name: 'Hristos Manastırı ve Manastır Tepesi',
        category: 'MONASTERY',
        era: '820 (Bizans İmparatoru V. Leon)',
        description: 'Bizans döneminde tahttan indirilen imparatorların kapatıldığı tarihi manastır. 93 metre yüksekliğindeki tepeden Tarihi Yarımada ve Boğaz girişi büyüleyici şekilde izlenir.',
        significance: 'Adalar’ın en eski tarihi sürgün mekanlarından biridir.',
        howToWalk: 'İskeleden Manastır Tepesi tabelalarıyla çamlar arasından 20 dakika yürünür.',
        distanceFromPierKm: 1.2,
        walkingMinutes: 20,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Manastır Tepesi Panoraması',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.9065, lng: 29.0468 }
      }
    ]
  },
  {
    id: 'sedef-adasi',
    name: 'Sedef Adası',
    greekName: 'Terebinthos',
    subtitle: 'Menemencioğlu Mirası, Çamlar & Masmavi Koylar',
    badge: 'Gizli Cennet',
    overview: 'Prens Adalarının yerleşime açık en küçüğüdür. Adını sedef gibi parıldayan kıyılarından ve menengiç (terebinthos) ağaçlarından alır. Şehsuvar Menemencioğlu tarafından ağaçlandırılarak bugünkü doğa harikasına dönüştürülmüştür.',
    heroImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption: 'Sedef Adası Doğal Koyu ve Sakin Plajı',
    heroImageCredit: 'Temsili görsel (Unsplash)',
    satelliteCoordinates: {
      lat: 40.8500,
      lng: 29.1417,
      zoom: 15.5
    },
    gallery: [
      {
        id: 'sedef-koy',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        caption: 'Sedef Adası sakin koyları ve berrak turkuaz suları',
        category: 'PANORAMA',
        credit: 'Temsili görsel (Unsplash)'
      }
    ],
    transitRoutes: [
      {
        departurePier: 'Büyükada',
        operators: ['Şehir Hatları', 'Özel Motorlar'],
        approxDurationMin: 15,
        transitConnection: 'Büyükada İskelesi Aktarması',
        tip: 'Büyükada’dan düzenli kalkan aktarma motorlarıyla 15 dakikada ulaşılır.'
      },
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları'],
        approxDurationMin: 40,
        transitConnection: 'Marmaray Bostancı',
        tip: 'Yaz ve kış belirli saatlerde doğrudan Şehir Hatları seferi vardır.'
      }
    ],
    heritagePoints: [
      {
        id: 'sedef-botanik',
        name: 'Sedef Botanik Bahçesi & Menemencioğlu Korusu',
        category: 'NATURE',
        era: '1950’ler',
        description: 'Vaktiyle tavşan adası olarak bilinen çorak adayı binlerce zeytin, çam ve incir fidanıyla donatan Şehsuvar Menemencioğlu’nun oluşturduğu yeşil cennettir.',
        significance: 'Cumhuriyet döneminin en başarılı çevre ve ada rehabilitasyon örneğidir.',
        howToWalk: 'Küçük ada iskelesinden yürüyüş parkuruyla 5 dakikada koruluğa varılır.',
        distanceFromPierKm: 0.3,
        walkingMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        photoCaption: 'Sedef Adası Menemencioğlu Zeytinlikleri',
        photoCredit: 'Temsili görsel (Unsplash)',
        coordinates: { lat: 40.8510, lng: 29.1432 }
      }
    ]
  }
];
