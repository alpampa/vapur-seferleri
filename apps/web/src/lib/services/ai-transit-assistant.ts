/**
 * AI TRANSIT SEYAHAT ASİSTANI (NLP Intent & Semantic Query Parser)
 * 
 * Kullanıcının doğal Türkçe cümlelerini (ör. "Bostancı'dan Büyükada'ya akşam 8'den sonra", 
 * "Kadıköy'e en yakın vapur", "Prens tur Kartal seferleri") anında yapılandırılmış
 * arama filtrelerine dönüştüren kural-destekli doğal dil anlama motoru.
 */

export interface AiParsedQuery {
  origin?: string;
  destination?: string;
  operator?: string;
  category?: "ADALAR" | "BOGAZ" | "ALL";
  afterTime?: string;
  onlyImminent?: boolean;
  highlightedKeyword?: string;
  interpretationMessage: string;
  isAiUnderstood: boolean;
}

const PIERS_SYNONYMS: Record<string, string[]> = {
  "Bostancı": ["bostanci", "bostancı"],
  "Kadıköy": ["kadikoy", "kadıköy", "kadiköy"],
  "Kabataş": ["kabatas", "kabataş"],
  "Beşiktaş": ["besiktas", "beşiktaş"],
  "Eminönü": ["eminonu", "eminönü"],
  "Karaköy": ["karakoy", "karaköy"],
  "Üsküdar": ["uskudar", "üsküdar"],
  "Büyükada": ["buyukada", "büyükada", "büyük ada", "buyuk ada", "adalar"],
  "Heybeliada": ["heybeliada", "heybeli", "heybeli ada"],
  "Burgazada": ["burgazada", "burgaz", "burgaz ada"],
  "Kınalıada": ["kinaliada", "kınalıada", "kınalı ada", "kinali ada"],
  "Kartal": ["kartal"],
  "Maltepe": ["maltepe"],
  "Yenikapı": ["yenikapi", "yenikapı"],
  "Bakırköy": ["bakirkoy", "bakırköy"],
};

const OPERATOR_SYNONYMS: Record<string, string[]> = {
  "Şehir Hatları": ["şehir hatları", "sehir hatlari", "şehir", "vapur"],
  "Mavi Marmara": ["mavi marmara", "mavi", "mavimarmara"],
  "Dentur Avrasya": ["dentur", "dentur avrasya", "denturavrasya"],
  "Prens Tur": ["prens tur", "prenstur", "prens"],
  "Turyol": ["turyol", "turyol motoru"],
};

export function parseNaturalTransitQuery(query: string): AiParsedQuery {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      interpretationMessage: "",
      isAiUnderstood: false,
    };
  }

  let matchedOrigin: string | undefined;
  let matchedDestination: string | undefined;
  let matchedOperator: string | undefined;
  let matchedCategory: "ADALAR" | "BOGAZ" | "ALL" | undefined;
  let afterTime: string | undefined;
  let onlyImminent = false;

  // 1. İskele Tespiti (Nereden / Nereye ayrıştırması)
  // Türkçe "den/dan", "e/a", "ye/ya" ekleri analizi
  for (const [canonicalPier, synonyms] of Object.entries(PIERS_SYNONYMS)) {
    for (const syn of synonyms) {
      const fromPattern = new RegExp(`${syn}['’]?(?:dan|den|tan|ten)`, "i");
      const toPattern = new RegExp(`${syn}['’]?(?:a|e|ya|ye)`, "i");

      if (fromPattern.test(q) && !matchedOrigin) {
        matchedOrigin = canonicalPier;
      } else if (toPattern.test(q) && !matchedDestination) {
        matchedDestination = canonicalPier;
      }
    }
  }

  // Eğer ek tespiti olamadıysa düz eşleşme tara
  if (!matchedOrigin || !matchedDestination) {
    const foundPiers: string[] = [];
    for (const [canonicalPier, synonyms] of Object.entries(PIERS_SYNONYMS)) {
      if (synonyms.some((syn) => q.includes(syn))) {
        if (!foundPiers.includes(canonicalPier)) {
          foundPiers.push(canonicalPier);
        }
      }
    }
    if (foundPiers.length >= 2) {
      if (!matchedOrigin) matchedOrigin = foundPiers[0];
      if (!matchedDestination) matchedDestination = foundPiers[1];
    } else if (foundPiers.length === 1 && !matchedOrigin && !matchedDestination) {
      // Tek iskele varsa origin veya destination olarak değerlendir
      if (q.includes("gitmek") || q.includes("varış") || q.includes("nereye")) {
        matchedDestination = foundPiers[0];
      } else {
        matchedOrigin = foundPiers[0];
      }
    }
  }

  // 2. Operatör Tespiti
  for (const [canonicalOp, synonyms] of Object.entries(OPERATOR_SYNONYMS)) {
    if (synonyms.some((syn) => q.includes(syn))) {
      matchedOperator = canonicalOp;
      break;
    }
  }

  // 3. Saat / Zaman Tespiti ("akşam 8", "19:00", "sonra", "en yakın", "acil")
  if (q.includes("acil") || q.includes("en yakın") || q.includes("hemen") || q.includes("ilk vapur") || q.includes("az kaldı")) {
    onlyImminent = true;
  }

  // Saat formatı (ör: 20:30 veya 8 sonra veya 19dan sonra)
  const timeMatch = q.match(/(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    const h = String(parseInt(timeMatch[1], 10)).padStart(2, "0");
    const m = timeMatch[2];
    afterTime = `${h}:${m}`;
  } else {
    const hourOnlyMatch = q.match(/(?:saat\s*)?(\d{1,2})(?:['’]?(?:de|da|ten|tan|den|dan))?\s*(?:sonra|itibaren)/);
    if (hourOnlyMatch) {
      let h = parseInt(hourOnlyMatch[1], 10);
      if (q.includes("akşam") && h < 12) h += 12;
      afterTime = `${String(h).padStart(2, "0")}:00`;
    }
  }

  // 4. Kategori Tespiti
  if (
    matchedDestination === "Büyükada" ||
    matchedDestination === "Heybeliada" ||
    matchedDestination === "Burgazada" ||
    matchedDestination === "Kınalıada" ||
    matchedOrigin === "Büyükada" ||
    matchedOrigin === "Heybeliada" ||
    q.includes("ada") ||
    q.includes("adalar")
  ) {
    matchedCategory = "ADALAR";
  } else if (q.includes("boğaz") || q.includes("bogaz")) {
    matchedCategory = "BOGAZ";
  }

  const isAiUnderstood = Boolean(matchedOrigin || matchedDestination || matchedOperator || afterTime || onlyImminent);

  let message = "";
  if (isAiUnderstood) {
    const parts: string[] = [];
    if (matchedOrigin && matchedDestination) parts.push(`🎯 ${matchedOrigin} ➔ ${matchedDestination}`);
    else if (matchedOrigin) parts.push(`⚓ Kalkış: ${matchedOrigin}`);
    else if (matchedDestination) parts.push(`🏝️ Varış: ${matchedDestination}`);

    if (matchedOperator) parts.push(`🏢 Firma: ${matchedOperator}`);
    if (afterTime) parts.push(`⏰ ${afterTime} sonrası`);
    if (onlyImminent) parts.push(`⚡ En yakın kalkışlar`);

    message = `Yapay Zeka Analizi: ${parts.join(" • ")}`;
  } else {
    message = `Arama terimi: "${query}"`;
  }

  return {
    origin: matchedOrigin,
    destination: matchedDestination,
    operator: matchedOperator,
    category: matchedCategory,
    afterTime,
    onlyImminent,
    highlightedKeyword: matchedOrigin || matchedDestination || matchedOperator,
    interpretationMessage: message,
    isAiUnderstood,
  };
}
