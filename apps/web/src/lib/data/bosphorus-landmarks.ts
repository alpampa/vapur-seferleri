export interface BosphorusLandmark {
  id: string;
  name: string;
  side: "ANATOLIA" | "EUROPE" | "ISLANDS";
  sideLabel: string;
  lat: number;
  lng: number;
  builtYear: string;
  shortDesc: string;
  audioNarrationTr: string;
  audioNarrationEn: string;
  photoKeyword: string;
}

export const BOSPHORUS_LANDMARKS: BosphorusLandmark[] = [
  {
    id: "kiz_kulesi",
    name: "Kız Kulesi (Maiden's Tower)",
    side: "ANATOLIA",
    sideLabel: "Üsküdar Açıkları",
    lat: 41.0211,
    lng: 29.0041,
    builtYear: "M.Ö. 410 / 1110 Bizans",
    shortDesc: "İstanbul Boğazı'nın simgesi, küçük ada üzerinde yükselen tarihi deniz feneri ve gözetleme kulesi.",
    audioNarrationTr: "Kız Kulesi, Boğaz'ın güney girişinde, Üsküdar kıyısına iki yüz metre açıkta kayalık bir adacık üzerine kurulmuştur. İlk olarak M.Ö. 410 yılında Atinalı komutan Alkibiades tarafından Karadeniz'den gelen gemilerden vergi almak amacıyla kullanılmıştır. Bizans ve Osmanlı dönemlerinde deniz feneri, gümrük ve gözetleme istasyonu olarak hizmet veren kule, İstanbul'un en romantik efsanelerine ev sahipliği yapmaktadır.",
    audioNarrationEn: "The Maiden's Tower stands on a tiny islet off the coast of Üsküdar at the southern entrance of the Bosphorus. First built in 410 BC by Athenian general Alcibiades to control maritime taxation, it served as a watchtower, lighthouse, and quarantine station across the Byzantine and Ottoman empires.",
    photoKeyword: "Kız Kulesi"
  },
  {
    id: "topkapi_sarayi",
    name: "Topkapı Sarayı & Sarayburnu",
    side: "EUROPE",
    sideLabel: "Tarihi Yarımada",
    lat: 41.0115,
    lng: 28.9833,
    builtYear: "1478",
    shortDesc: "Fatih Sultan Mehmet tarafından inşa ettirilen, Osmanlı İmparatorluğu'nun 400 yıllık idare merkezi.",
    audioNarrationTr: "Sarayburnu burnunda yükselen Topkapı Sarayı, 1478 yılında Fatih Sultan Mehmet tarafından inşa ettirilmiştir. Marmara Denizi, Boğaziçi ve Haliç'in kesiştiği hakim tepede yer alan saray, 400 yıl boyunca Osmanlı padişahlarının yönetim merkezi ve ikametgahı olmuştur. Divan-ı Hümayun, Kutsal Emanetler ve görkemli avlularıyla UNESCO Dünya Mirası listesindedir.",
    audioNarrationEn: "Topkapı Palace, positioned prominently on the historic peninsula overlooking the meeting of the Bosphorus, Golden Horn, and Marmara Sea, was completed in 1478 by Sultan Mehmed the Conqueror. It served as the administrative and royal heart of the Ottoman Empire for nearly four centuries.",
    photoKeyword: "Topkapı Sarayı"
  },
  {
    id: "galata_kulesi",
    name: "Galata Kulesi",
    side: "EUROPE",
    sideLabel: "Karaköy / Beyoğlu",
    lat: 41.0256,
    lng: 28.9741,
    builtYear: "1348",
    shortDesc: "Cenevizliler tarafından inşa edilen, Haliç ve Boğaz'ı seyreden tarihi gözetleme kulesi.",
    audioNarrationTr: "Galata Kulesi, 1348 yılında Ceneviz kolonisi tarafından 'İsa Kulesi' adıyla Galata surlarının başkulesi olarak inşa edilmiştir. Osmanlı döneminde yangın gözetleme kulesi olarak kullanılmış, 1632 yılında Hezarfen Ahmed Çelebi'nin Üsküdar'a doğru gerçekleştirdiği tarihi kanatlı uçuş denemesinin başlangıç noktası olmuştur.",
    audioNarrationEn: "Galata Tower was erected in 1348 by the Genoese colony as the Christea Turris at the highest point of the Galata walls. In 1632, legendary aviator Hezarfen Ahmed Çelebi famously took off from this tower with artificial wings, gliding across the Bosphorus to Üsküdar.",
    photoKeyword: "Galata Kulesi"
  },
  {
    id: "dolmabahce_sarayi",
    name: "Dolmabahçe Sarayı",
    side: "EUROPE",
    sideLabel: "Beşiktaş Sahili",
    lat: 41.0391,
    lng: 29.0007,
    builtYear: "1856",
    shortDesc: "Sultan Abdülmecid tarafından inşa ettirilen, neobarok tarzda 600 metrelik anıtsal sahil sarayı.",
    audioNarrationTr: "Dolmabahçe Sarayı, Sultan Abdülmecid tarafından 1856 yılında Mimar Garabet Balyan'a yaptırılmıştır. Osmanlı'nın geleneksel saray yapısından Batılı barok ve neoklasik mimariye geçişinin en görkemli simgesidir. 600 metrelik mermer rıhtımı, 4.5 tonluk kristal avizeli Muayede Salonu ve Cumhuriyetimizin kurucusu Gazi Mustafa Kemal Atatürk'ün ebediyete intikal ettiği yer olması sebebiyle ulusal tarihimizin en kıymetli yapılarındandır.",
    audioNarrationEn: "Dolmabahçe Palace was built along the European shore between 1843 and 1856 by order of Sultan Abdülmecid I. Featuring an imposing 600-meter waterfront facade, it represents the synthesis of Ottoman grandeur with French baroque and neoclassical styles, and was the passing place of Mustafa Kemal Atatürk in 1938.",
    photoKeyword: "Dolmabahçe Sarayı"
  },
  {
    id: "ciragan_sarayi",
    name: "Çırağan Sarayı",
    side: "EUROPE",
    sideLabel: "Ortaköy - Beşiktaş",
    lat: 41.0433,
    lng: 29.0161,
    builtYear: "1871",
    shortDesc: "Sultan Abdülaziz tarafından Sarkis Balyan'a inşa ettirilen neoklasik mermer Boğaz sarayı.",
    audioNarrationTr: "Çırağan Sarayı, 1871 yılında Sultan Abdülaziz döneminde Mimar Sarkis Balyan tarafından tamamlanmıştır. İsmini Lale Devri'nde düzenlenen meşhur Çırağan eğlencelerinden alır. Dış cephesindeki ince işçilikli mermer oymaları ve Boğaz'a açılan görkemli saltanat kapısıyla bilinir.",
    audioNarrationEn: "Çırağan Palace was commissioned by Sultan Abdülaziz and designed by architect Sarkis Balyan, opening in 1871. Named after the historic torchlight festivals of the Tulip Era, it showcases intricate carved marble craftsmanship directly fronting the Bosphorus strait.",
    photoKeyword: "Çırağan Sarayı"
  },
  {
    id: "ortakoy_camii",
    name: "Ortaköy Camii (Büyük Mecidiye)",
    side: "EUROPE",
    sideLabel: "Ortaköy İskelesi",
    lat: 41.0472,
    lng: 29.0270,
    builtYear: "1854",
    shortDesc: "Boğaziçi Köprüsü'nün ayağında suyun üzerinde yükselen zarif neobarok cami.",
    audioNarrationTr: "Ortaköy Camii, resmi adıyla Büyük Mecidiye Camii, 1854 yılında Sultan Abdülmecid tarafından Nigoğos Balyan'a inşa ettirilmiştir. Geniş pencereleri sayesinde Boğaz'ın sularındaki dalga ışıklarını doğrudan ana kubbesine yansıtır. Boğaziçi Köprüsü ile birlikte İstanbul'un en çok fotoğraflanan kartpostal karesidir.",
    audioNarrationEn: "Ortaköy Mosque, officially the Grand Imperial Mosque of Sultan Abdülmecid, was built on an Ortaköy pier promontory in 1854. Its soaring neo-baroque arched windows illuminate the interior with water reflections, creating an iconic postcard composition beneath the Bosphorus Bridge.",
    photoKeyword: "Ortaköy Camii"
  },
  {
    id: "beylerbeyi_sarayi",
    name: "Beylerbeyi Sarayı",
    side: "ANATOLIA",
    sideLabel: "Üsküdar / Beylerbeyi",
    lat: 41.0425,
    lng: 29.0414,
    builtYear: "1865",
    shortDesc: "Osmanlı padişahlarının yazlık sarayı ve yabancı devlet başkanlarının kabul köşkü.",
    audioNarrationTr: "Boğaziçi Köprüsü'nün Anadolu ayağının hemen altında yer alan Beylerbeyi Sarayı, 1865 yılında Sultan Abdülaziz tarafından yazlık saray olarak yaptırılmıştır. Fransa İmparatoriçesi Eugenie ve Avusturya İmparatoru Franz Joseph gibi yabancı hükümdarları ağırlamıştır. Deniz kıyısındaki mermer deniz köşkleri ve bahçesindeki havuzlu salonuyla dikkat çeker.",
    audioNarrationEn: "Beylerbeyi Palace sits on the Asian shore directly beneath the Bosphorus Bridge. Commissioned by Sultan Abdülaziz in 1865 as a summer residence and royal guesthouse, it hosted illustrious state guests including French Empress Eugénie and Austrian Emperor Franz Joseph.",
    photoKeyword: "Beylerbeyi Sarayı"
  },
  {
    id: "kuleli_askeri_lisesi",
    name: "Kuleli Askeri Lisesi",
    side: "ANATOLIA",
    sideLabel: "Çengelköy Sahili",
    lat: 41.0583,
    lng: 29.0538,
    builtYear: "1845",
    shortDesc: "İki görkemli kulesiyle Çengelköy kıyısını süsleyen tarihi askeri eğitim anıtı.",
    audioNarrationTr: "Kuleli Askeri Lisesi, 1845 yılında süvari kışlası olarak temelleri atılan, 1872'de kuleleri eklenerek görkemli bugünkü görünümüne kavuşan neoklasik bir başyapıttır. Boğaz'dan vapurla geçerken Çengelköy ile Kandilli arasında yükselen kuleleri ve rıhtım siluetiyle Boğaz'ın en heybetli yapıları arasındadır.",
    audioNarrationEn: "Kuleli Military High School is an architectural landmark dominating the Asian shore between Çengelköy and Kandilli. With its commanding twin towers added in 1872, this historic academy is one of the most recognizable monumental facades on the Bosphorus.",
    photoKeyword: "Kuleli"
  },
  {
    id: "rumeli_hisari",
    name: "Rumeli Hisarı (Boğazkesen)",
    side: "EUROPE",
    sideLabel: "Sarıyer Sahili",
    lat: 41.0847,
    lng: 29.0572,
    builtYear: "1452",
    shortDesc: "İstanbul'un fethinden önce Boğaz'ın en dar noktasında 4 ayda inşa edilen fetih kalesi.",
    audioNarrationTr: "Rumeli Hisarı, Fatih Sultan Mehmet tarafından 1452 yılında, İstanbul'un fethinden hemen önce Boğaz'ın kuzeyden gelebilecek Bizans yardımlarını kesmek amacıyla sadece 4 ay gibi rekor bir sürede inşa ettirilmiştir. Boğaz'ın en dar kesiti olan 660 metrelik boğaz geçidinde yer alır. Halil Paşa, Zağanos Paşa ve Saruca Paşa kuleleriyle askeri mimarlığın zirvesidir.",
    audioNarrationEn: "Rumeli Fortress, or Boğazkesen (Strait-Cutter), was constructed in 1452 by Sultan Mehmed II in just four months prior to the siege of Constantinople. Situated at the narrowest 660-meter choke point of the Bosphorus, its massive towers represent a pinnacle of medieval military engineering.",
    photoKeyword: "Rumeli Hisarı"
  },
  {
    id: "anadolu_hisari",
    name: "Anadolu Hisarı (Güzelcehisar)",
    side: "ANATOLIA",
    sideLabel: "Beykoz / Göksu Deresi",
    lat: 41.0828,
    lng: 29.0664,
    builtYear: "1395",
    shortDesc: "Yıldırım Bayezid tarafından inşa edilen, Boğaz kıyısındaki en eski Türk hisarı.",
    audioNarrationTr: "Anadolu Hisarı, 1395 yılında Osmanlı Sultanı Yıldırım Bayezid tarafından Göksu Deresi'nin Boğaz'a döküldüğü noktaya inşa ettirilmiştir. Boğaziçi'ndeki ilk Türk yapısı olan hisar, daha sonra Fatih Sultan Mehmet tarafından Rumeli Hisarı yapılırken tahkim edilmiştir.",
    audioNarrationEn: "Anatolian Fortress was erected in 1395 by Ottoman Sultan Bayezid I at the mouth of Göksu creek. Representing the earliest Turkish architectural presence on the Bosphorus, it worked in tandem with Rumeli Fortress across the strait to control passage.",
    photoKeyword: "Anadolu Hisarı"
  },
  {
    id: "haydarpasa_gari",
    name: "Haydarpaşa Garı",
    side: "ANATOLIA",
    sideLabel: "Kadıköy Rıhtımı",
    lat: 41.0003,
    lng: 29.0194,
    builtYear: "1908",
    shortDesc: "Bağdat Demiryolu'nun başlangıç noktası, deniz üzerine kazıklarla inşa edilen anıtsal neorönesans gar.",
    audioNarrationTr: "Haydarpaşa Garı, 1908 yılında Alman mimarlar Otto Ritter ve Helmuth Cuno tarafından inşa edilmiştir. İstanbul'u Anadolu ve Orta Doğu'ya bağlayan tarihi Bağdat Demiryolu'nun başlangıç noktasıdır. Deniz tabanına çakılan 1100 adet meşe kazık üzerine kurulmuş olup, Kadıköy vapuruna binen herkesi karşılayan Boğaz'ın en simgesel kapısıdır.",
    audioNarrationEn: "Haydarpaşa Terminal was completed in 1908 by German architects Otto Ritter and Helmuth Cuno as the grand terminus of the Baghdad and Hedjaz railways. Built on 1,100 oak piles driven into the seabed, its neo-renaissance facade welcomes every ferry entering Kadıköy harbor.",
    photoKeyword: "Haydarpaşa Garı"
  }
];
