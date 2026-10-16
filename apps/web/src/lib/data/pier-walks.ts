export interface PierWalkFact {
  id: string;
  title: string;
  walkMinutes: number;
  description: string;
  sourceUrl: string;
}

export interface PierWalkGuide {
  pierName: string;
  facts: PierWalkFact[];
}

const WIKI = "https://en.wikipedia.org/wiki";

const GUIDES: PierWalkGuide[] = [
  {
    pierName: "Karaköy",
    facts: [
      {
        id: "karakoy-galata-koprusu",
        title: "Galata Köprüsü",
        walkMinutes: 1,
        description:
          "Bugünkü köprü 1994'te açıldı; üst katından tramvay geçer, alt katında balık restoranları sıralanır.",
        sourceUrl: `${WIKI}/Galata_Bridge`
      },
      {
        id: "karakoy-galata-kulesi",
        title: "Galata Kulesi",
        walkMinutes: 6,
        description:
          "1348'de Cenevizliler tarafından inşa edildi; tepesinden İstanbul panoraması izlenir.",
        sourceUrl: `${WIKI}/Galata_Tower`
      },
      {
        id: "karakoy-tunel",
        title: "Tünel (1875)",
        walkMinutes: 4,
        description:
          "1875'te açıldı; Londra'dan sonra dünyanın en eski ikinci metro hattı kabul edilir.",
        sourceUrl: `${WIKI}/Tünel`
      }
    ]
  },
  {
    pierName: "Eminönü",
    facts: [
      {
        id: "eminonu-misir-carsisi",
        title: "Mısır Çarşısı",
        walkMinutes: 2,
        description:
          "1664'te Yeni Cami külliyesi içinde açıldı; baharat, kuruyemiş ve Türk lokumu satılan tarihî çarşıdır.",
        sourceUrl: `${WIKI}/Spice_Bazaar`
      },
      {
        id: "eminonu-yeni-cami",
        title: "Yeni Cami",
        walkMinutes: 2,
        description:
          "17. yüzyılda tamamlandı; Eminönü Meydanı'nın siluetini belirleyen camidir.",
        sourceUrl: `${WIKI}/New_Mosque,_Istanbul`
      },
      {
        id: "eminonu-gulhane",
        title: "Gülhane Parkı",
        walkMinutes: 10,
        description:
          "Osmanlı döneminde sarayın has bahçesiydi; bugün ücretsiz gezilebilen tarihî parktır.",
        sourceUrl: `${WIKI}/Gülhane_Park`
      }
    ]
  },
  {
    pierName: "Üsküdar",
    facts: [
      {
        id: "uskudar-kiz-kulesi",
        title: "Kız Kulesi",
        walkMinutes: 4,
        description:
          "Bizans dönemine uzanan kule, Boğaz'ın ortasındaki kayalıkta yükselir; 2021-2023 restorasyonunun ardından yeniden ziyarete açıldı.",
        sourceUrl: `${WIKI}/Maiden's_Tower`
      },
      {
        id: "uskudar-semsi-ahmet-pasa",
        title: "Şemsi Ahmet Paşa Külliyesi",
        walkMinutes: 2,
        description:
          "Mimar Sinan'ın 1581'de tamamladığı külliye, denize sıfır konumuyla ünlüdür.",
        sourceUrl: `${WIKI}/Şemsi_Pasha_Mosque`
      }
    ]
  },
  {
    pierName: "Beşiktaş",
    facts: [
      {
        id: "besiktas-dolmabahce",
        title: "Dolmabahçe Sarayı",
        walkMinutes: 10,
        description:
          "1856'da Sultan Abdülmecid için tamamlandı; Atatürk'ün vefat ettiği saraydır.",
        sourceUrl: `${WIKI}/Dolmabahçe_Palace`
      },
      {
        id: "besiktas-deniz-muzesi",
        title: "İstanbul Deniz Müzesi",
        walkMinutes: 8,
        description:
          "1897'de açıldı; Osmanlı denizcilik tarihine adanmış Türkiye'nin en büyük deniz müzesidir.",
        sourceUrl: `${WIKI}/Istanbul_Naval_Museum`
      },
      {
        id: "besiktas-barbaros-turbesi",
        title: "Barbaros Hayreddin Paşa Türbesi",
        walkMinutes: 7,
        description:
          "Kaptan-ı Derya Barbaros 1546'da buraya defnedildi; türbe Mimar Sinan'ın eseridir.",
        sourceUrl: `${WIKI}/Hayreddin_Barbarossa`
      }
    ]
  },
  {
    pierName: "Kadıköy",
    facts: [
      {
        id: "kadikoy-haydarpasa",
        title: "Haydarpaşa Garı",
        walkMinutes: 15,
        description:
          "1908'de hizmete açıldı; Bağdat Demiryolu'nun başlangıç istasyonu olarak Anadolu'ya açılan kapıydı.",
        sourceUrl: `${WIKI}/Haydarpaşa_railway_station`
      }
    ]
  },
  {
    pierName: "Kabataş",
    facts: [
      {
        id: "kabatas-dolmabahce",
        title: "Dolmabahçe Sarayı",
        walkMinutes: 8,
        description:
          "1856'da Sultan Abdülmecid için tamamlandı; Atatürk'ün vefat ettiği saraydır.",
        sourceUrl: `${WIKI}/Dolmabahçe_Palace`
      }
    ]
  }
];

export function getPierWalkGuide(pierName: string | null | undefined): PierWalkGuide | null {
  if (!pierName) return null;
  const normalized = pierName.trim();
  return GUIDES.find((guide) => guide.pierName === normalized) ?? null;
}
