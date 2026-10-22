/**
 * İSTANBUL İSKELELERİ VE SEMT KÜLTÜR ATLASI
 *
 * İskelelerin mimari özellikleri, inşa tarihleri, mimarları, tarihi hikayeleri,
 * 15 dakikalık yürüme mesafesindeki kültürel/tarihi noktalar ve semte özel
 * yerel işletme avantajları (Hyper-Local Cultural B2B Showcase).
 */

export interface DistrictHighlight {
  id: string;
  title: string;
  category: "MUSEUM" | "HISTORIC_ARCHITECTURE" | "CULINARY_HERITAGE" | "PARK_VIEWPOINT";
  walkMinutes: number;
  description: string;
  sourceUrl?: string;
  highlightBadge: string;
}

export interface PierLocalPartner {
  id: string;
  businessName: string;
  category: "HISTORIC_PASTRY" | "SEAFOOD" | "BOUTIQUE_HOTEL" | "ISLAND_BICYCLE" | "ROASTERY";
  offerTitle: string;
  dealDescription: string;
  couponCode: string;
  distanceMeters: number;
  phoneOrWhatsapp?: string;
  badge: string;
}

export interface PierCulturalAtlas {
  pierName: string;
  region: "Adalar" | "Avrupa" | "Anadolu";
  architect?: string;
  builtYear?: number;
  architecturalStyle: string;
  heritageStory: string;
  architectureHighlights: string[];
  photoUrl: string;
  districtHighlights: DistrictHighlight[];
  curatedLocalPartners: PierLocalPartner[];
}

export const PIER_CULTURAL_ATLAS: Record<string, PierCulturalAtlas> = {
  "Moda": {
    pierName: "Moda",
    region: "Anadolu",
    architect: "Mimar Vedat Tek",
    builtYear: 1917,
    architecturalStyle: "Birinci Ulusal Mimarlık Akımı (Neoklasik Türk Üslubu)",
    heritageStory:
      "Mimar Vedat Tek tarafından 1916-1917 yıllarında inşa edilen Moda İskelesi, İstanbul'un denizle buluştuğu en zarif neoklasik yapılarından biridir. Kütahya çinileriyle süslü kemerleri, geniş deniz terası ve ahşap tavan işlemeleriyle Moda burnunda suya konmuş bir mücevher gibidir. Uzun yıllar vapur seferlerine kapalı kaldıktan sonra İBB tarafından aslına uygun restore edilerek kütüphane, kafe ve vapur iskelesi olarak yeniden şehre kazandırılmıştır.",
    architectureHighlights: [
      "Fasatlardaki el yapımı kobalt mavisi Kütahya çini panoları.",
      "Geniş balkonlu üst kat kütüphanesi ve Marmara Denizi seyir terası.",
      "Klasik Osmanlı sivri kemerleri ve pirinç döküm lamba aplikleri.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1572979261074-1422b4041d57?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "moda-baris-manco-evi",
        title: "Barış Manço Müze Evi",
        category: "MUSEUM",
        walkMinutes: 6,
        description: "Sanatçının 19. yüzyıl Viktorya tarzı tarihi köşkü; Manço'nun piyanosu, kıyafetleri ve şahsi eşyaları sergilenmektedir.",
        highlightBadge: "MÜZE"
      },
      {
        id: "moda-tarihi-dondurmaci",
        title: "Tarihi Moda Dondurmacısı Ali Usta",
        category: "CULINARY_HERITAGE",
        walkMinutes: 5,
        description: "1969'dan beri Moda Caddesi'nde taze meyvelerle yapılan geleneksel Roma usulü ada dondurması.",
        highlightBadge: "ASIRLIK LEZZET"
      },
      {
        id: "moda-sahil-parki",
        title: "Moda Sahil Parkı & Çay Bahçesi",
        category: "PARK_VIEWPOINT",
        walkMinutes: 2,
        description: "Tarihi çınar ağaçları altında Adalar ve Kalamış Koyu gün batımını izlemek için İstanbul'un en sakin kıyısıdır.",
        highlightBadge: "GÜN BATIMI"
      }
    ],
    curatedLocalPartners: []
  },
  "Büyükada": {
    pierName: "Büyükada",
    region: "Adalar",
    architecturalStyle: "Adalar iskele mimarisi",
    heritageStory:
      "Büyükada İskelesi, Adalar hattının ana kapısıdır. Vapur yolcularını ada meydanına ve tarihi saat kulesine açan iskele, adanın 19. yüzyıl sonundan itibaren gelişen sayfiye dokusunun merkezinde yer alır. Çevredeki ahşap köşkler, manastırlar ve sahil yürüyüşü adanın kültürel mirasını birlikte sunar.",
    architectureHighlights: [
      "İskele meydanındaki 1923 yapımı neoklasik saat kulesi.",
      "Rum Yetimhanesi ve Troçki Evi'ne uzanan tarihi ada dokusu.",
      "Aya Yorgi Manastırı'na çıkan yürüyüş rotasının başlangıcı.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "buyukada-saat-meydani",
        title: "Tarihi Saat Kulesi & İskele Meydanı",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 1,
        description: "1923 yapımı neoklasik saat kulesi; ada turlarının ve nostaljik yürüyüşlerin başlangıç merkezidir.",
        highlightBadge: "MEYDAN"
      },
      {
        id: "buyukada-rum-yetimhanesi",
        title: "Büyükada Rum Yetimhanesi (Prinkipo)",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 20,
        description: "Mimar Alexandre Vallaury eseri (1898); dünyanın en büyük ahşap yapılarından biridir.",
        highlightBadge: "ANITSAL AHŞAP"
      },
      {
        id: "buyukada-trocki-evi",
        title: "Leon Troçki Sürgün Evi (Yanaros Köşkü)",
        category: "MUSEUM",
        walkMinutes: 15,
        description: "Troçki'nin 1929–1933 yılları arasında sürgünde yaşadığı ve 'İhanete Uğrayan Devrim'i yazdığı köşk.",
        highlightBadge: "TARİH"
      },
      {
        id: "buyukada-aya-yorgi",
        title: "Aya Yorgi Manastırı & Yücetepe",
        category: "PARK_VIEWPOINT",
        walkMinutes: 35,
        description: "Adanın 202 metredeki zirvesinde 1751 yapımı tarihi manastır ve tüm Marmara'yı gören eşsiz manzara.",
        highlightBadge: "ZİRVE MANZARA"
      }
    ],
    curatedLocalPartners: []
  },
  "Heybeliada": {
    pierName: "Heybeliada",
    region: "Adalar",
    architecturalStyle: "Adalar iskele mimarisi",
    heritageStory:
      "Heybeliada İskelesi, adanın ana ulaşım kapısı ve Ruhban Okulu'na uzanan yürüyüşlerin başlangıcıdır. İskele meydanı, adanın tarihi eğitim kurumları, ahşap evleri ve çam ormanıyla çevrili kültürel dokusunu yolcuya ilk adımda gösterir.",
    architectureHighlights: [
      "1844'te kurulan Heybeliada Ruhban Okulu'na giden güzergâh.",
      "İnönü Evi Müzesi ve Hüseyin Rahmi Gürpınar Müze Evi yakın çevrede.",
      "Ada meydanını çevreleyen tarihi ahşap ve taş yapı dokusu.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "heybeli-ruhban-okulu",
        title: "Heybeliada Ruhban Okulu (Halki Semineri)",
        category: "MUSEUM",
        walkMinutes: 18,
        description: "1844 yılında kurulan tarihi teoloji okulu, muazzam kütüphanesi ve botanik bahçesiyle Ümit Tepesi'nde yer alır.",
        highlightBadge: "TARİHİ AKADEMİ"
      },
      {
        id: "heybeli-ismet-inonu-evi",
        title: "İnönü Evi Müzesi (Mavikent)",
        category: "MUSEUM",
        walkMinutes: 8,
        description: "Türkiye Cumhuriyeti'nin 2. Cumhurbaşkanı İsmet İnönü'nün ailesiyle yaz aylarını geçirdiği köşk müze.",
        highlightBadge: "MÜZE KÖŞK"
      },
      {
        id: "heybeli-huseyin-rahmi",
        title: "Hüseyin Rahmi Gürpınar Müze Evi",
        category: "MUSEUM",
        walkMinutes: 20,
        description: "Ünlü Türk romancısının 1912–1944 yılları arasında yaşadığı, daktilosu ve el yazmalarıyla korunan tepedeki evi.",
        highlightBadge: "EDEBİYAT"
      }
    ],
    curatedLocalPartners: []
  },
  "Kadıköy": {
    pierName: "Kadıköy",
    region: "Anadolu",
    architecturalStyle: "Modern ulaşım terminali",
    heritageStory:
      "Kadıköy İskelesi, Anadolu yakasının en yoğun vapur kapılarından biridir. Haydarpaşa Garı ile tarihi çarşı arasındaki konumu, deniz ulaşımını kentin tren ve ticaret aksıyla buluşturur. İskele çevresi, liman kenti hafızasını gündelik hayatla birlikte taşır.",
    architectureHighlights: [
      "Haydarpaşa Garı'nın tarihi taş cephesi ve liman aksı.",
      "Kadıköy Tarihi Balıkçılar Çarşısı'nın gündelik kent dokusu.",
      "Süreyya Operası ve Bahariye'nin kültür-sanat hattı.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "kadikoy-haydarpasa",
        title: "Tarihi Haydarpaşa Garı",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 8,
        description: "1908 yapımı neorönesans Alman mimarisi anıt yapı; arkeolojik kazı parkı ve deniz kenarı silüetiyle Kadıköy'ün tacıdır.",
        highlightBadge: "ANIT YAPI"
      },
      {
        id: "kadikoy-tarihi-carsi",
        title: "Kadıköy Tarihi Balıkçılar Çarşısı",
        category: "CULINARY_HERITAGE",
        walkMinutes: 4,
        description: "Asırlık turşucular, baharatçılar, taze deniz ürünleri ve meşhur lezzet duraklarıyla dolu yaşayan çarşı.",
        highlightBadge: "GASTRONOMİ"
      },
      {
        id: "kadikoy-sureyya-operasi",
        title: "Süreyya Operası (Bahariye)",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 10,
        description: "1927 yılında Süreyya İlmen tarafından Paris tiyatrolarından esinlenerek yaptırılan sanat mabedi.",
        highlightBadge: "SANAT"
      }
    ],
    curatedLocalPartners: []
  },
  "Kabataş": {
    pierName: "Kabataş",
    region: "Avrupa",
    architecturalStyle: "Modern aktarma terminali",
    heritageStory:
      "Kabataş İskelesi, Avrupa yakasının deniz ulaşımı ve aktarma merkezidir. Dolmabahçe Sarayı'nın tarihi silueti ile modern terminal yapısı aynı sahil hattında buluşur; vapur, füniküler ve tramvay bağlantıları yolcuyu kentin merkezine taşır.",
    architectureHighlights: [
      "Dolmabahçe Sarayı'nın Boğaz'a bakan tarihi cephesi.",
      "MSGSÜ İstanbul Resim ve Heykel Müzesi'nin sahil konumu.",
      "Beşiktaş ve Karaköy hatlarına aktarma imkânı.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "kabatas-dolmabahce-sarayi",
        title: "Dolmabahçe Sarayı",
        category: "MUSEUM",
        walkMinutes: 5,
        description: "Sultan Abdülmecid tarafından 1856'da açılan, kristal avizeleri ve Saltanat Kapısı ile ünlü imparatorluk sarayı.",
        highlightBadge: "SARAY"
      },
      {
        id: "kabatas-resim-heykel",
        title: "MSGSÜ İstanbul Resim ve Heykel Müzesi",
        category: "MUSEUM",
        walkMinutes: 7,
        description: "Türkiye'nin en kapsamlı modern sanat koleksiyonunu barındıran tarihi antrepo müze.",
        highlightBadge: "MÜZE"
      }
    ],
    curatedLocalPartners: []
  },
  "Eminönü": {
    pierName: "Eminönü",
    region: "Avrupa",
    architecturalStyle: "Tarihi liman ve çarşı dokusu",
    heritageStory:
      "Eminönü İskelesi, tarihi yarımadanın vapur kapısı ve Haliç-Boğaz hatlarının kesişme noktasıdır. Yeni Cami, Mısır Çarşısı ve Rüstem Paşa Camii'ne açılan sokaklarıyla Osmanlı liman kentinin ticaret ve ibadet dokusunu bugün de sürdürür.",
    architectureHighlights: [
      "Yeni Cami ve Hünkar Kasrı'nın iskele meydanına bakan cephesi.",
      "Mısır Çarşısı'nın tarihi çarşı aksı.",
      "Rüstem Paşa Camii'nin çinili cephesi ve han sokakları.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "eminonu-misir-carsisi",
        title: "Tarihi Mısır Çarşısı",
        category: "CULINARY_HERITAGE",
        walkMinutes: 2,
        description: "1664 yapımı baharat, şifalı otlar, ada çayı ve geleneksel lokumların tarihi ticaret merkezi.",
        highlightBadge: "KAPALI ÇARŞI"
      },
      {
        id: "eminonu-yeni-cami",
        title: "Yeni Cami & Hünkar Kasrı",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 2,
        description: "Valide Turhan Sultan tarafından tamamlatılan, muazzam çinileriyle Boğaz kıyısını taçlandıran cami.",
        highlightBadge: "ANITSAL CAMİ"
      },
      {
        id: "eminonu-rustem-pasa",
        title: "Rüstem Paşa Camii",
        category: "MUSEUM",
        walkMinutes: 5,
        description: "Mimar Sinan şaheseri; İznik çinilerinin dünya üzerindeki en yoğun ve göz alıcı koleksiyonu.",
        highlightBadge: "MİMAR SİNAN"
      }
    ],
    curatedLocalPartners: []
  },
  "Beşiktaş": {
    pierName: "Beşiktaş",
    region: "Avrupa",
    architecturalStyle: "Modern iskele ve sahil dokusu",
    heritageStory:
      "Beşiktaş İskelesi, Boğaz'ın Avrupa yakasında deniz müzesi ve tarihi sahil hattına açılır. İskele çevresi, Osmanlı denizcilik mirasını taşıyan türbe ve müzelerle, Yıldız Parkı'nın yeşil dokusunu aynı yürüyüş ağında buluşturur.",
    architectureHighlights: [
      "İstanbul Deniz Müzesi'nin denizcilik koleksiyonu.",
      "Barbaros Hayrettin Paşa Türbesi'nin iskele yakınındaki konumu.",
      "Yıldız Parkı ve Çırağan Sarayı'na uzanan sahil rotası.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1572979261074-1422b4041d57?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "besiktas-deniz-muzesi",
        title: "İstanbul Deniz Müzesi",
        category: "MUSEUM",
        walkMinutes: 1,
        description: "Türkiye'nin en büyük denizcilik müzesi; padişah saltanat kayıkları ve tarihi kadırgaların dünyadaki tek orijinal koleksiyonu.",
        highlightBadge: "DENİZ MÜZESİ"
      },
      {
        id: "besiktas-barbaros-turbesi",
        title: "Barbaros Hayrettin Paşa Türbesi",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 2,
        description: "Mimar Sinan tarafından 1541'de yapılan büyük Türk amiralinin ebedi istirahatgahı.",
        highlightBadge: "MİMAR SİNAN"
      },
      {
        id: "besiktas-yildiz-parki",
        title: "Tarihi Yıldız Korusu & Çırağan Sarayı",
        category: "PARK_VIEWPOINT",
        walkMinutes: 10,
        description: "Asırlık ağaçlar, Malta Köşkü ve Boğaz manzaralı tarihi saray bahçesi yürüyüş rotası.",
        highlightBadge: "SARAY PARKI"
      }
    ],
    curatedLocalPartners: []
  },
  "Üsküdar": {
    pierName: "Üsküdar",
    region: "Anadolu",
    architecturalStyle: "Tarihi iskele ve külliye dokusu",
    heritageStory:
      "Üsküdar İskelesi, Anadolu yakasının tarihi vapur kapısı ve Kız Kulesi manzarasına açılan meydandır. Mihrimah Sultan ve Şemsi Paşa külliyeleri, Salacak sahil yürüyüşü ve vapur hattı, semtin Osmanlı'dan bugüne uzanan kıyı kültürünü birlikte taşır.",
    architectureHighlights: [
      "Mihrimah Sultan Camii ve iskele meydanındaki külliye dokusu.",
      "Şemsi Paşa Camii ve kütüphanesinin denize sıfır konumu.",
      "Salacak sahilinden Kız Kulesi'ne bakan yürüyüş hattı.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
    districtHighlights: [
      {
        id: "uskudar-kiz-kulesi",
        title: "Tarihi Kız Kulesi (Salacak)",
        category: "MUSEUM",
        walkMinutes: 8,
        description: "2500 yıllık efsaneleriyle Boğaz'ın ortasında yükselen anıt kule; Salacak sahilinden teknelerle ulaşılır.",
        highlightBadge: "İSTANBUL SİMGESİ"
      },
      {
        id: "uskudar-mihrimah-sultan",
        title: "Mihrimah Sultan (İskele) Camii",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 1,
        description: "Mimar Sinan'ın Kanuni'nin kızı için 1548'de inşa ettiği, iskele meydanını taçlandıran külliye.",
        highlightBadge: "MİMAR SİNAN"
      },
      {
        id: "uskudar-semsi-pasa",
        title: "Şemsi Paşa Camii & Kütüphanesi",
        category: "HISTORIC_ARCHITECTURE",
        walkMinutes: 3,
        description: "Kuşların kubbesine konmadığı rivayet edilen, denizin dalgalarının duvarlarını yıkadığı huzur mekanı.",
        highlightBadge: "DENİZE SIFIR"
      }
    ],
    curatedLocalPartners: []
  },
};

export function getPierCulturalAtlas(pierName: string): PierCulturalAtlas | undefined {
  if (!pierName) return undefined;
  const match = Object.entries(PIER_CULTURAL_ATLAS).find(
    ([key]) => pierName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(pierName.toLowerCase())
  );
  return match ? match[1] : undefined;
}
