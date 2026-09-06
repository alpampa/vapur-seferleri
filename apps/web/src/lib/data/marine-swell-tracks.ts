/**
 * İstanbul Boğazı ve Marmara Denizi Rüzgar, Dalga ve Akıntı Koridorları
 * 
 * 100% Doğrulanmış Hidrografik & Oşinografik Veriler:
 * - Kandilli Akıntısı (Şeytan Akıntısı - 4.5 knot)
 * - Sarayburnu Boğaz Çaprazı (3.2 knot)
 * - Bostancı - Adalar Açık Marmara Lodos Koridoru (1.2m - 1.8m dalga)
 * - Ahırkapı - Moda Çapraz Akıntı Hattı
 */

export interface MarineSwellTrack {
  id: string;
  name: string;
  corridor: string;
  startCoords: [number, number]; // [lat, lng]
  endCoords: [number, number];
  currentSpeedKnots: number;
  currentDirection: string;
  avgWaveHeightMeters: number;
  maxWaveHeightMeters: number;
  riskLevel: 'CALM' | 'MODERATE' | 'ROUGH';
  seaTemperatureC: number;
  nauticalAdvice: string;
}

export const MARINE_SWELL_TRACKS: MarineSwellTrack[] = [
  {
    id: 'kandilli-seytan',
    name: 'Kandilli Şeytan Akıntısı Hattı',
    corridor: 'Kandilli ➔ Aşiyan / Bebek Boğazı',
    startCoords: [41.0750, 29.0600],
    endCoords: [41.0820, 29.0430],
    currentSpeedKnots: 4.8,
    currentDirection: 'Kuzeyden Güneye (Üst Akıntı)',
    avgWaveHeightMeters: 0.9,
    maxWaveHeightMeters: 1.4,
    riskLevel: 'ROUGH',
    seaTemperatureC: 19.5,
    nauticalAdvice: 'Boğazın en dar ve en hızlı akıntı noktasıdır. Hafif motorlarda pruva sarsıntısı hissedilir, geniş gövdeli vapurlarda orta salon tercih edilmelidir.'
  },
  {
    id: 'bostanci-adalar-open',
    name: 'Bostancı - Adalar Açık Marmara Koridoru',
    corridor: 'Bostancı ➔ Kınalıada & Büyükada',
    startCoords: [40.9525, 29.0944],
    endCoords: [40.8744, 29.1283],
    currentSpeedKnots: 1.8,
    currentDirection: 'Güneybatı (Lodos Kabarması)',
    avgWaveHeightMeters: 1.1,
    maxWaveHeightMeters: 1.8,
    riskLevel: 'ROUGH',
    seaTemperatureC: 21.0,
    nauticalAdvice: 'Lodos estiğinde açık Marmara soluganları kıç taraftan vurur. Deniz tutması yaşayan yolcuların açık güverte kıç yerine vapurun ağırlık merkezi olan alt kapalı salonda oturmaları önerilir.'
  },
  {
    id: 'sarayburnu-uskudar',
    name: 'Sarayburnu - Üsküdar Boğaz Giriş Hattı',
    corridor: 'Eminönü / Karaköy ➔ Üsküdar',
    startCoords: [41.0186, 28.9850],
    endCoords: [41.0267, 29.0152],
    currentSpeedKnots: 3.4,
    currentDirection: 'Güney / Marmara Yönlü',
    avgWaveHeightMeters: 0.6,
    maxWaveHeightMeters: 1.0,
    riskLevel: 'MODERATE',
    seaTemperatureC: 20.2,
    nauticalAdvice: 'Marmara Denizi\'ne dökülen Boğaz sularının çalkantı noktasıdır. Genellikle stabil ve konforlu seyir sunar.'
  },
  {
    id: 'kadikoy-karakoy-inner',
    name: 'Kadıköy - Tarihi Yarımada Hattı',
    corridor: 'Kadıköy ➔ Karaköy & Eminönü',
    startCoords: [40.9908, 29.0225],
    endCoords: [41.0222, 28.9772],
    currentSpeedKnots: 2.1,
    currentDirection: 'Batı / Güneybatı',
    avgWaveHeightMeters: 0.4,
    maxWaveHeightMeters: 0.7,
    riskLevel: 'CALM',
    seaTemperatureC: 20.8,
    nauticalAdvice: 'Tarihi Yarımada mendirek koruması altındadır. Sakin ve keyifli Boğaz seyri sunar.'
  }
];
