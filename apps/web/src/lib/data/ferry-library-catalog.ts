export interface FerryBook {
  title: string;
  author: string;
  category: "DENİZCİLİK" | "İSTANBUL_TARİHİ" | "EDEBİYAT" | "SÜRELİ_YAYIN";
  vesselName: string; // Hangi vapurda bulunuyor
  description: string;
}

export const FERRY_LIBRARY_BOOKS: FerryBook[] = [
  {
    title: "Boğaziçi Şıngır Mıngır",
    author: "Salâh Birsel",
    category: "EDEBİYAT",
    vesselName: "Paşabahçe & Moda Vapuru",
    description: "Boğaziçi yalıları, vapur sefaları ve tarihi İstanbul deniz yaşamının en renkli edebiyat şaheseri."
  },
  {
    title: "İstanbul'un Deniz Taşıtları ve Şirket-i Hayriye",
    author: "Murat Koraltürk",
    category: "DENİZCİLİK",
    vesselName: "Paşabahçe Vapuru",
    description: "1851'den günümüze Boğaziçi'nde buharlı vapurların kuruluşu, bacaları ve tarihi kaptanları."
  },
  {
    title: "Üç İstanbul",
    author: "Mithat Cemal Kuntay",
    category: "EDEBİYAT",
    vesselName: "Barış Manço Vapuru",
    description: "İstibdat, İttihat ve Terakki ve Milli Mücadele dönemlerinin İstanbul sosyolojisi ve Boğaz manzaraları."
  },
  {
    title: "Denizler ve Gemiler Ansiklopedisi",
    author: "İBB Kültür A.Ş.",
    category: "DENİZCİLİK",
    vesselName: "Moda Vapuru",
    description: "Türk denizcilik tarihi, fenerler, akıntılar ve tarihi yandan çarklı vapurların detaylı çizimleri."
  },
  {
    title: "Huzur",
    author: "Ahmet Hamdi Tanpınar",
    category: "EDEBİYAT",
    vesselName: "Ahmet H. Tanpınar & Paşabahçe",
    description: "Tanpınar'ın Boğaziçi'nde kandilli mehtapları ve vapur seyahatleriyle harmanlanan unutulmaz romanı."
  },
  {
    title: "Gemi Mühendisliği ve Deniz Mecmuası",
    author: "TMMOB GMO Süreli Yayın",
    category: "SÜRELİ_YAYIN",
    vesselName: "Paşabahçe Vapuru",
    description: "Modern Türk gemi inşa sanayisi ve Şehir Hatları vapurlarının restorasyon teknik bültenleri."
  }
];
