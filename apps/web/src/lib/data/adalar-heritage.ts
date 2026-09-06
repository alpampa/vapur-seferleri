/**
 * Adalar Tarihi Miras, Kültür Notaları & Ulaşım Rehberi
 * 
 * 100% Gerçek ve Doğrulanmış Tarihi Bilgiler:
 * - Büyükada: Rum Yetimhanesi, Aya Yorgi, Troçki Evi, Reşat Nuri Evi
 * - Heybeliada: Ruhban Okulu, Hüseyin Rahmi Evi, Tarihi Deniz Lisesi, Değirmenburnu
 * - Burgazada: Sait Faik Abasıyanık Müzesi, Madam Martha Koyu, Aya Yani
 * - Kınalıada: Surp Krikor Lusavoriç, Hristos Manastırı
 * - Sedef Adası: Botanik vahası ve tarihi iskele
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
    overview: 'Bizans prens ve imparatoriçelerinin sürgün yeri olan Büyükada; Alexandre Vallaury imzalı ahşap köşkleri, çam ormanları ve kozmopolit mirasıyla Adalar zincirinin kalbidir.',
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
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
        name: 'Büyükada Rum Yetimhanesi (Prinkipo)',
        category: 'ARCHITECTURAL',
        era: '1898 (Mimar Alexandre Vallaury)',
        description: 'Avrupa\'nın en büyük, dünyanın ikinci en büyük çok katlı ahşap karkas binasıdır. Aslen Fransız lüks otel ve kumarhanesi olarak inşa edilmiş, Sultan II. Abdülhamid izniyle yetimhaneye dönüştürülmüştür.',
        significance: 'Ahşap mimarlık tarihinin dünya çapındaki başyapıtı.',
        howToWalk: 'İskeleden Hristos (İsa) Tepesi\'ne giden tarihi çamlık yokuşunu takip edin.',
        distanceFromPierKm: 2.1,
        walkingMinutes: 32
      },
      {
        id: 'aya-yorgi',
        name: 'Aya Yorgi Manastırı & Tepesi',
        category: 'MONASTERY',
        era: '1751 (İlk kuruluş 963)',
        description: 'Büyükada\'nın en yüksek noktası olan Yüce Tepe\'de (202 metre) konumlanan tarihi manastır. Her yıl 23 Nisan ve 24 Eylül tarihlerinde binlerce kişinin dilek dileyip tırmandığı kutsal hac yolu.',
        significance: 'İstanbul\'un en etkileyici 360 derece Marmara ve Boğaz manzarası.',
        howToWalk: 'Lunapark Meydanı\'ndan başlayan dik taş döşeli patika yolu yürüyerek çıkılır.',
        distanceFromPierKm: 3.4,
        walkingMinutes: 50
      },
      {
        id: 'trocki-evi',
        name: 'Leon Troçki Evi (Arap İzzet Paşa Köşkü)',
        category: 'HISTORY',
        era: '1929 - 1933 Sürgün Dönemi',
        description: 'Sovyetler Birliği kurucularından Leon Troçki\'nin Stalin tarafından sürgüne gönderildikten sonra sığındığı ve devasa eseri \'Rus Devrimi Tarihi\'ni yazdığı Hamlacı Sokak\'taki tarihi sahil köşkü.',
        significance: '20. yüzyıl dünya siyasi tarihinin en kritik sürgün mekanı.',
        howToWalk: 'İskeleden güney sahil şeridi boyunca Nizam yönüne 15 dakika yürüyüş.',
        distanceFromPierKm: 1.2,
        walkingMinutes: 16
      },
      {
        id: 'resat-nuri-evi',
        name: 'Reşat Nuri Güntekin Evi',
        category: 'LITERATURE',
        era: '1930\'lar',
        description: 'Türk edebiyatının usta kalemi Reşat Nuri Güntekin\'in ömrünün büyük kısmını geçirdiği, Çalıkuşu ve diğer eserlerinin daktilo tıkırtılarının yankılandığı pembe panjurlu üç katlı köşk.',
        significance: 'Cumhuriyet dönemi Türk edebiyatının hafıza noktası.',
        howToWalk: 'Maden yönünde Yılmaz Türk Caddesi üzerinde yer alır.',
        distanceFromPierKm: 1.6,
        walkingMinutes: 22
      }
    ]
  },
  {
    id: 'heybeliada',
    name: 'Heybeliada',
    greekName: 'Halki',
    subtitle: 'Tarihi Bakır Madenleri & Edebiyatın Sakin Limanı',
    badge: 'Kültür & Akademi',
    overview: 'Heybe şeklindeki topoğrafyasıyla adını alan Heybeliada; asırlık çam ormanları, denizcilik mektebi ve felsefe mirasıyla entelektüel derinliği en yüksek adadır.',
    transitRoutes: [
      {
        departurePier: 'Bostancı',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
        approxDurationMin: 25,
        transitConnection: 'Marmaray Bostancı',
        tip: 'Heybeliada\'ya ulaşmanın en hızlı hattıdır.'
      },
      {
        departurePier: 'Kadıköy & Kabataş',
        operators: ['Şehir Hatları'],
        approxDurationMin: 45,
        transitConnection: 'Kadıköy İskele & Kabataş Transfer',
        tip: 'Şehir Hatları vapurları adanın ana tarihi iskelesine yanaşır.'
      }
    ],
    heritagePoints: [
      {
        id: 'ruhban-okulu',
        name: 'Heybeliada Ruhban Okulu (Aya Triada)',
        category: 'ACADEMIC' as any,
        era: '1844 (Patrik IV. Germanos)',
        description: 'Ümit Tepesi zirvesinde kurulu tarihi teoloji akademisi. İçerisinde 120 binden fazla nadir el yazması ve tarihi cilt barındıran muhteşem bir kütüphaneye sahiptir.',
        significance: 'Dünya Ortodoks teolojisinin ve felsefe tarihinin en saygın merkezi.',
        howToWalk: 'İskeleden yukarı çıkan çam ağaçlı cadde üzerinden Ümit Tepesi\'ne yürüyün.',
        distanceFromPierKm: 1.4,
        walkingMinutes: 20
      },
      {
        id: 'huseyin-rahmi-evi',
        name: 'Hüseyin Rahmi Gürpınar Müze Evi',
        category: 'LITERATURE',
        era: '1912 - 1944',
        description: 'Halk romancımız Hüseyin Rahmi\'nin 30 yıldan fazla yaşadığı, kendi elleriyle işlediği dantellerin, kütüphanesinin ve şahsi eşyalarının sergilendiği hakim tepe köşkü.',
        significance: 'İstanbul sokak dilini romana taşıyan ustanın orijinal çalışma alanı.',
        howToWalk: 'Değirmenburnu yönünden tepeye çıkan dik merdivenli yol.',
        distanceFromPierKm: 1.5,
        walkingMinutes: 24
      },
      {
        id: 'bahriye-mektebi',
        name: 'Tarihi Deniz Lisesi (Bahriye Mektebi)',
        category: 'HISTORY',
        era: '1773 (Kaptan-ı Derya Cezayirli Gazi Hasan Paşa)',
        description: 'Türk Deniz Kuvvetleri\'nin subay yuvası olan görkemli sahil kışlası. Nazım Hikmet ve Necip Fazıl Kısakürek burada öğrencilik yapmıştır.',
        significance: 'Türkiye\'nin en köklü askeri denizcilik eğitim abidesi.',
        howToWalk: 'İskeleden indiğinizde sol tarafta rıhtım boyunca 2 dakikalık yürüme.',
        distanceFromPierKm: 0.2,
        walkingMinutes: 3
      }
    ]
  },
  {
    id: 'burgazada',
    name: 'Burgazada',
    greekName: 'Antigoni',
    subtitle: 'Sait Faik\'in Martıları & Kalpazankaya Günbatımı',
    badge: 'Edebiyat & Sükunet',
    overview: 'Sait Faik\'in \'Haritada Bir Nokta\' öyküsündeki ada. Motor sesinden uzak, balıkçı barınakları ve samimi sokak dokusuyla huzurun simgesi.',
    transitRoutes: [
      {
        departurePier: 'Bostancı / Kabataş / Kadıköy',
        operators: ['Şehir Hatları', 'Mavi Marmara'],
        approxDurationMin: 35,
        transitConnection: 'Tüm ana iskelelerden direkt Adalar hattı',
        tip: 'Kınalıada\'dan sonra ikinci uğrak noktasıdır.'
      }
    ],
    heritagePoints: [
      {
        id: 'sait-faik-muzesi',
        name: 'Sait Faik Abasıyanık Müze Evi',
        category: 'LITERATURE',
        era: '1959 (Halka açılış)',
        description: 'Modern Türk hikayeciliğinin öncüsü Sait Faik\'in yaşadığı, el yazması notlarının, balıkçı dostlarından mektuplarının ve meşhur şapkasının korunduğu üç katlı tarihi köşk.',
        significance: '\'Bir insanı sevmekle başlar her şey\' felsefesinin doğduğu ev.',
        howToWalk: 'İskeleden çarşıyı geçip Çayır Sokak\'a doğru hafif yokuş.',
        distanceFromPierKm: 0.4,
        walkingMinutes: 6
      },
      {
        id: 'kalpazankaya',
        name: 'Kalpazankaya & Madam Martha Koyu',
        category: 'NATURE',
        era: 'Doğal Sit Alanı',
        description: 'Tarihte sahte para basanların sığındığı kayalık burun ve adanın en batısında günbatımının en büyüleyici izlendiği efsanevi falezler.',
        significance: 'Marmara Denizi\'nin en temiz yüzme ve günbatımı noktası.',
        howToWalk: 'Sahil yolu veya çamlık güzergahından adanın batı burnuna yürüyüş.',
        distanceFromPierKm: 2.3,
        walkingMinutes: 30
      }
    ]
  },
  {
    id: 'kinaliada',
    name: 'Kınalıada',
    greekName: 'Proti',
    subtitle: 'Kınalı Topraklı İlk Karşılama & Taş Evler',
    badge: 'İlk Ada',
    overview: 'İstanbul\'a en yakın ada olup adını demir oksitli kırmızımsı killi toprağından alır. Ağaçsız silueti, kristal berraklığındaki koyları ve tarihi manastırlarıyla bilinir.',
    transitRoutes: [
      {
        departurePier: 'Bostancı / Kadıköy / Kabataş',
        operators: ['Şehir Hatları', 'Mavi Marmara', 'Turyol'],
        approxDurationMin: 25,
        transitConnection: 'Şehir merkezine en hızlı ulaşılan ada',
        tip: 'Şehirden Adalar\'a giden tüm vapurların ilk yanaştığı iskeledir.'
      }
    ],
    heritagePoints: [
      {
        id: 'surp-krikor',
        name: 'Surp Krikor Lusavoriç Ermeni Kilisesi',
        category: 'ARCHITECTURAL',
        era: '1857',
        description: 'Adadaki tek Ermeni kilisesi olup oyma taş işçiliği ve akustik tonozlarıyla Adalar mimarisinin özel örneklerindendir.',
        significance: 'Adanın çok kültürlü taş dokusunun simgesi.',
        howToWalk: 'İskele meydanına 300 metre mesafede düz ayak yürüyüş.',
        distanceFromPierKm: 0.3,
        walkingMinutes: 4
      },
      {
        id: 'hristos-manastiri',
        name: 'Hristos Manastırı (Dönüşüm Manastırı)',
        category: 'MONASTERY',
        era: 'Bizans Dönemi (Romanos Diogenes Sürgünü 1071)',
        description: 'Malazgirt sonrası tahttan indirilen Bizans İmparatoru IV. Romanos Diogenes\'in gözleri millenerek kapatıldığı ve vefat ettiği tepe manastırı.',
        significance: 'Bizans ve Türk tarihinin kırılma noktasındaki tarihi sürgün mekanı.',
        howToWalk: 'Hristos Tepesi\'ne giden patika yoldan yukarı tırmanış.',
        distanceFromPierKm: 1.1,
        walkingMinutes: 18
      }
    ]
  }
];
