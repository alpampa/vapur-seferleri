/**
 * Resmi İBB UKOME (Ulaşım Koordinasyon Merkezi) Toplu Deniz Ulaşımı Fiyat Tarifesi
 * Yasal Dayanak: İBB UKOME Toplu Ulaşım Ücret Tarifesi Kararı & Şehir Hatları A.Ş. Tebliği
 * Resmi Doğrulama: https://sehirhatlari.istanbul/tr/ucret-tarifeleri
 */

export interface OfficialFareInfo {
  fullFare: string;        // Tam İstanbulkart
  studentFare: string;     // Öğrenci
  socialFare: string;      // Öğretmen / 60+ Yaş Sosyal
  islandResidentFare?: string; // Adakart (Ada İkametgahı)
  freeFare: string;        // 65+ Yaş & Engelli
  legalCitation: string;   // Yasal Karar Metni
  officialSourceUrl: string; // Tıklanabilir resmi kaynak
  isIslandRoute: boolean;
}

export function getOfficialRouteFare(origin: string, destination: string): OfficialFareInfo {
  const normO = (origin || '').toLowerCase();
  const normD = (destination || '').toLowerCase();
  const isIsland = normO.includes('ada') || normD.includes('ada') || 
                   normO.includes('büyükada') || normD.includes('büyükada') ||
                   normO.includes('heybeliada') || normD.includes('heybeliada') ||
                   normO.includes('kınalıada') || normD.includes('kınalıada') ||
                   normO.includes('burgazada') || normD.includes('burgazada') ||
                   normO.includes('sedef') || normD.includes('sedef');

  if (isIsland) {
    return {
      fullFare: '90.00 ₺',
      studentFare: '45.00 ₺',
      socialFare: '63.00 ₺',
      islandResidentFare: '45.00 ₺',
      freeFare: 'Ücretsiz (0.00 ₺)',
      legalCitation: 'İBB UKOME Adalar Deniz Ulaşımı Resmi Tarifesi',
      officialSourceUrl: 'https://sehirhatlari.istanbul/tr/ucret-tarifeleri',
      isIslandRoute: true
    };
  }

  // Standart Şehir İçi Boğaz ve Haliç Hatları
  return {
    fullFare: '27.00 ₺',
    studentFare: '13.17 ₺',
    socialFare: '19.34 ₺',
    islandResidentFare: undefined,
    freeFare: 'Ücretsiz (0.00 ₺)',
    legalCitation: 'İBB UKOME Şehir İçi Vapur Hatları Resmi Tarifesi',
    officialSourceUrl: 'https://sehirhatlari.istanbul/tr/ucret-tarifeleri',
    isIslandRoute: false
  };
}

/**
 * Kınalıada ve küçük iskelelerdeki peron karmaşasını çözen gerçek iskele rıhtım çözümleyici.
 * Kınalıada, Burgazada gibi küçük iskelelerde asla Peron 2 veya Peron 3 yoktur, Ana Rıhtım vardır!
 */
export function resolveRealisticPlatform(origin: string, destination: string, operator: string): string {
  const normO = (origin || '').toLowerCase();
  const normD = (destination || '').toLowerCase();

  // Adalar İskeleleri: Asla Peron 2 veya Peron 3 yoktur!
  if (normO.includes('kınalıada') || normO.includes('burgazada') || normO.includes('heybeliada')) {
    return 'Ana Rıhtım';
  }
  if (normO.includes('büyükada')) {
    return 'Tarihi İskele Rıhtımı';
  }

  // Kadıköy
  if (normO.includes('kadıköy')) {
    if (normD.includes('beşiktaş')) return 'Kadıköy Beşiktaş İskelesi';
    if (normD.includes('karaköy')) return 'Kadıköy Karaköy İskelesi';
    if (normD.includes('eminönü')) return 'Kadıköy Eminönü İskelesi';
    if (normD.includes('ada')) return 'Kadıköy Adalar İskelesi';
    return 'Kadıköy Rıhtım (Peron 1)';
  }

  // Eminönü
  if (normO.includes('eminönü')) {
    if (normD.includes('kadıköy')) return 'Eminönü 2 Nolu İskele (Kadıköy)';
    if (normD.includes('üsküdar')) return 'Eminönü 1 Nolu İskele (Üsküdar)';
    if (normD.includes('boğaz') || normD.includes('sarıyer')) return 'Eminönü Boğaz İskelesi';
    if (normD.includes('ada')) return 'Eminönü Adalar İskelesi';
    return 'Eminönü Şehir Hatları İskelesi';
  }

  // Bostancı
  if (normO.includes('bostancı')) {
    if (operator.toLowerCase().includes('mavi marmara') || operator.toLowerCase().includes('motor')) {
      return 'Bostancı Mavi Marmara Motor İskelesi';
    }
    return 'Bostancı Şehir Hatları İskelesi';
  }

  // Kabataş
  if (normO.includes('kabataş')) {
    if (normD.includes('ada')) return 'Kabataş Adalar İskelesi';
    return 'Kabataş Şehir Hatları Terminali';
  }

  // Beşiktaş
  if (normO.includes('beşiktaş')) {
    if (normD.includes('kadıköy')) return 'Beşiktaş Kadıköy İskelesi';
    if (normD.includes('üsküdar')) return 'Beşiktaş Üsküdar İskelesi';
    return 'Beşiktaş Şehir Hatları İskelesi';
  }

  // Üsküdar
  if (normO.includes('üsküdar')) {
    return 'Üsküdar Rıhtım İskelesi';
  }

  // Karaköy
  if (normO.includes('karaköy')) {
    return 'Karaköy Şehir Hatları İskelesi';
  }

  return 'Ana Rıhtım';
}
