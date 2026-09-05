export interface MarineWeatherStatus {
  temperature: number;
  windSpeedKnots: number;
  windGustsKnots: number;
  windDirectionDeg: number;
  windName: string;
  visibilityKm: number;
  alertType: 'NORMAL' | 'LODOS_WARNING' | 'STORM_WARNING' | 'FOG_WARNING';
  alertTitle: string;
  alertDescription: string;
  isFerryDisruptionRisk: boolean;
}

export function getIstanbulWindName(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'Yıldız (Kuzey)';
  if (normalized >= 22.5 && normalized < 67.5) return 'Poyraz (Kuzeydoğu)';
  if (normalized >= 67.5 && normalized < 112.5) return 'Gündoğusu (Doğu)';
  if (normalized >= 112.5 && normalized < 157.5) return 'Keşişleme (Güneydoğu)';
  if (normalized >= 157.5 && normalized < 202.5) return 'Kıble (Güney)';
  if (normalized >= 202.5 && normalized < 247.5) return 'Lodos (Güneybatı)';
  if (normalized >= 247.5 && normalized < 292.5) return 'Günbatısı (Batı)';
  return 'Karayel (Kuzeybatı)';
}

export async function fetchLiveMarineWeather(): Promise<MarineWeatherStatus> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=40.95&longitude=29.05&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,visibility&wind_speed_unit=kn&timezone=Europe%2FIstanbul',
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      throw new Error("Open-Meteo API error: " + res.status);
    }

    const data = await res.json();
    const curr = data.current;

    const temp = Math.round(curr.temperature_2m ?? 20);
    const speed = Math.round(curr.wind_speed_10m ?? 8);
    const gusts = Math.round(curr.wind_gusts_10m ?? 12);
    const deg = curr.wind_direction_10m ?? 45;
    const visibilityM = curr.visibility ?? 10000;
    const visibilityKm = Math.round((visibilityM / 1000) * 10) / 10;
    const windName = getIstanbulWindName(deg);

    // Analyze Risk Criteria
    const isLodos = deg >= 195 && deg <= 255;
    const isFog = visibilityM < 1200;

    let alertType: 'NORMAL' | 'LODOS_WARNING' | 'STORM_WARNING' | 'FOG_WARNING' = 'NORMAL';
    let alertTitle = 'Deniz Ulaşımı Elverişli';
    let alertDescription = 'Marmara Denizi ve Boğaz genelinde seferler normal akışında sürdürülmektedir.';
    let isFerryDisruptionRisk = false;

    if (isFog) {
      alertType = 'FOG_WARNING';
      alertTitle = '⚠️ Yoğun Sis Sefer Uyarısı';
      alertDescription = 'Görüş mesafesi ' + visibilityKm + ' km seviyesine inmiştir. Şehir Hatları ve Adalar seferlerinde yavaşlama ve geçici askıya almalar görülebilir.';
      isFerryDisruptionRisk = true;
    } else if (isLodos && (speed >= 18 || gusts >= 24)) {
      alertType = 'LODOS_WARNING';
      alertTitle = '⚠️ Marmara Lodos Uyarısı';
      alertDescription = 'Marmara\'da ' + speed + ' knot (' + gusts + ' knot hamleli) Lodos etkili. Bostancı-Adalar, Kabataş-Adalar ve Kartal seferlerinde aksama riski yüksektir.';
      isFerryDisruptionRisk = true;
    } else if (speed >= 25 || gusts >= 32) {
      alertType = 'STORM_WARNING';
      alertTitle = '⚠️ Şiddetli Fırtına Uyarısı';
      alertDescription = 'Rüzgar hamleleri ' + gusts + ' knot seviyesine ulaşmıştır. Deniz otobüsü ve motor seferlerinde gecikmeler yaşanabilir.';
      isFerryDisruptionRisk = true;
    }

    return {
      temperature: temp,
      windSpeedKnots: speed,
      windGustsKnots: gusts,
      windDirectionDeg: deg,
      windName,
      visibilityKm,
      alertType,
      alertTitle,
      alertDescription,
      isFerryDisruptionRisk
    };
  } catch (err) {
    console.warn('Live marine weather fetch failed, returning default normal status:', err);
    return {
      temperature: 20,
      windSpeedKnots: 8,
      windGustsKnots: 12,
      windDirectionDeg: 45,
      windName: 'Poyraz (Kuzeydoğu)',
      visibilityKm: 15,
      alertType: 'NORMAL',
      alertTitle: 'Deniz Ulaşımı Elverişli',
      alertDescription: 'Marmara Denizi ve Boğaz\'da rüzgar normal limitlerde seyretmektedir.',
      isFerryDisruptionRisk: false
    };
  }
}
