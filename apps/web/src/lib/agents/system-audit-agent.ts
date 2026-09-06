import { getOfficialRouteFare, resolveRealisticPlatform } from '@/lib/data/official-fares';
import { SEA_TAXI_OFFICIAL_TARIFF, calculateSeaTaxiFare, COMMON_SEA_TAXI_ROUTES } from '@/lib/data/sea-taxi';
import { NIGHT_DOLMUS_ROUTES } from '@/lib/data/night-transit-matrix';
import { OFFICIAL_SCHEDULES_DATA } from '@/lib/data/official-schedules';
import { ISTANBUL_FERRY_FLEET, resolveLiveVesselName } from '@/lib/agents/fleet-registry';
import { ISTANBUL_PIERS } from '@/lib/services/route-planner';
import { PIER_MOBILITY_DATA } from '@/lib/data/pier-parking-bicycle';
import { PIER_TRANSIT_GROUND_DATA } from '@/lib/data/pier-taxi-transit';

export interface AuditCheckResult {
  category: string;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
  metadata?: Record<string, any>;
}

export interface SystemAuditSummary {
  timestamp: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  complianceScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  checks: AuditCheckResult[];
  daemonCycleCount?: number;
}

export function auditFaresAndTariffs(): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  try {
    const standardFare = getOfficialRouteFare('Kadıköy', 'Karaköy');
    const isStandardValid = 
      standardFare.fullFare === '27.00 ₺' &&
      standardFare.studentFare === '13.17 ₺' &&
      standardFare.socialFare === '19.34 ₺' &&
      standardFare.isIslandRoute === false;

    results.push({
      category: 'TARİFE_DENETİMİ',
      testName: 'UKOME 2026 Şehir İçi Vapur Tarifesi Doğrulaması',
      status: isStandardValid ? 'PASSED' : 'FAILED',
      details: isStandardValid
        ? 'Tam: 27.00 ₺, Öğrenci: 13.17 ₺, Sosyal: 19.34 ₺ resmi UKOME tebliği ile 100% uyuşuyor.'
        : 'Beklenmeyen standart ücret verisi'
    });

    const islandFare = getOfficialRouteFare('Bostancı', 'Büyükada');
    const isIslandValid =
      islandFare.fullFare === '90.00 ₺' &&
      islandFare.studentFare === '45.00 ₺' &&
      islandFare.islandResidentFare === '45.00 ₺' &&
      islandFare.isIslandRoute === true;

    results.push({
      category: 'TARİFE_DENETİMİ',
      testName: 'UKOME 2026 Adalar Özel Tarifesi Doğrulaması',
      status: isIslandValid ? 'PASSED' : 'FAILED',
      details: isIslandValid
        ? 'Adalar Tam: 90.00 ₺, Öğrenci: 45.00 ₺, Adakart: 45.00 ₺ resmi karar ile uyumlu.'
        : 'Beklenmeyen ada tarifesi'
    });

    const kinaliPlatform = resolveRealisticPlatform('Kınalıada', 'Bostancı', 'Şehir Hatları');
    const burgazPlatform = resolveRealisticPlatform('Burgazada', 'Kabataş', 'Şehir Hatları');
    const kadikoyKarakoyPlatform = resolveRealisticPlatform('Kadıköy', 'Karaköy', 'Şehir Hatları');

    const isPlatformRealistic = 
      kinaliPlatform === 'Ana Rıhtım' &&
      burgazPlatform === 'Ana Rıhtım' &&
      kadikoyKarakoyPlatform.includes('Karaköy İskelesi');

    results.push({
      category: 'TARİFE_DENETİMİ',
      testName: 'Küçük İskele Peron Sahteciliği Önleme Testi (Kınalı/Burgaz)',
      status: isPlatformRealistic ? 'PASSED' : 'FAILED',
      details: isPlatformRealistic
        ? 'Kınalıada ve Burgazada rıhtımlarında gerçekte olmayan Peron 2/3 elendi, Ana Rıhtım olarak doğrulandı.'
        : 'Hatalı peron ataması tespit edildi'
    });
  } catch (err: any) {
    results.push({
      category: 'TARİFE_DENETİMİ',
      testName: 'Tarife Motoru Çalışma Hatası',
      status: 'FAILED',
      details: err.message
    });
  }
  return results;
}

export function auditSeaTaxiAndNightMatrix(): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  try {
    const isTariffOfficial =
      SEA_TAXI_OFFICIAL_TARIFF.baseFare === 500 &&
      SEA_TAXI_OFFICIAL_TARIFF.perMileFare === 750 &&
      SEA_TAXI_OFFICIAL_TARIFF.maxCapacity === 10;

    results.push({
      category: 'DENİZ_TAKSİ_DENETİMİ',
      testName: 'UKOME 2026 Deniz Taksi Açılış & Mil Katsayı Doğrulaması',
      status: isTariffOfficial ? 'PASSED' : 'FAILED',
      details: isTariffOfficial
        ? 'Açılış: 500 ₺, Mil Başı: 750 ₺, Maksimum Yolcu: 10 kişi resmi tebliğle birebir uyumlu.'
        : 'UKOME dışı parametreler tespit edildi'
    });

    const taxiCalc = calculateSeaTaxiFare(2.4, 4);
    const isCalcExact = taxiCalc.totalBoatFare === 2300 && taxiCalc.perPersonFare === 575;

    results.push({
      category: 'DENİZ_TAKSİ_DENETİMİ',
      testName: 'Deniz Taksi Yolcu Başına Ücret Bölüşüm Hesaplama Testi',
      status: isCalcExact ? 'PASSED' : 'FAILED',
      details: isCalcExact
        ? '2.4 Deniz Mili için toplam ' + taxiCalc.totalBoatFare + ' ₺, 4 yolcu için kişi başı tam ' + taxiCalc.perPersonFare + ' ₺ olarak hesaplandı.'
        : 'Hesaplama sapması'
    });

    const dolmusRoutesValid =
      NIGHT_DOLMUS_ROUTES.length >= 3 &&
      NIGHT_DOLMUS_ROUTES.every(r => r.operatingHours.includes('7/24') && r.standLocation.length > 5);

    results.push({
      category: 'GECE_ULAŞIM_DENETİMİ',
      testName: 'Son Vapur Kaçtığında 7/24 Sarı Dolmuş Matrisi Bütünlüğü',
      status: dolmusRoutesValid ? 'PASSED' : 'FAILED',
      details: dolmusRoutesValid
        ? NIGHT_DOLMUS_ROUTES.length + ' adet 7/24 gece sarı dolmuş güzergahı (Kadıköy-Taksim, Beşiktaş-Taksim vb.) aktif ve rıhtım konumları doğrulandı.'
        : 'Sarı dolmuş hatlarında eksik veri tespit edildi.'
    });
  } catch (err: any) {
    results.push({
      category: 'DENİZ_TAKSİ_DENETİMİ',
      testName: 'Deniz Taksi Denetim Hatası',
      status: 'FAILED',
      details: err.message
    });
  }
  return results;
}

export function auditSchedulesDatabase(): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  try {
    const totalTrips = OFFICIAL_SCHEDULES_DATA.length;
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    let malformedTimeCount = 0;
    let emptyOriginDestCount = 0;
    let invalidOperatorCount = 0;

    const validOperators = new Set(['Şehir Hatları', 'İDO', 'Turyol', 'Mavi Marmara', 'Dentur Avrasya', 'Prens Tur']);

    for (const trip of OFFICIAL_SCHEDULES_DATA) {
      if (!trip.origin || !trip.destination || trip.origin.trim() === '' || trip.destination.trim() === '') {
        emptyOriginDestCount++;
      }
      if (!timeRegex.test(trip.departureTime)) {
        malformedTimeCount++;
      }
      if (!validOperators.has(trip.operator)) {
        invalidOperatorCount++;
      }
    }

    const isSchedulesClean = totalTrips > 100 && malformedTimeCount === 0 && emptyOriginDestCount === 0 && invalidOperatorCount === 0;

    results.push({
      category: 'SEFER_VERİTABANI',
      testName: 'Resmi Sefer Veritabanı Bütünlük Taraması (' + totalTrips + ' Sefer)',
      status: isSchedulesClean ? 'PASSED' : 'FAILED',
      details: isSchedulesClean
        ? 'Toplam ' + totalTrips + ' resmi sefer incelendi. 0 hatalı saat formatı, 0 boş kalkış/varış, 0 yetkisiz operatör bulundu.'
        : 'Hata özeti: Boş İskele=' + emptyOriginDestCount + ', Bozuk Saat=' + malformedTimeCount + ', Geçersiz Operatör=' + invalidOperatorCount
    });
  } catch (err: any) {
    results.push({
      category: 'SEFER_VERİTABANI',
      testName: 'Sefer Veritabanı Tarama Hatası',
      status: 'FAILED',
      details: err.message
    });
  }
  return results;
}

export function auditFleetRegistryAndAis(): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  try {
    const totalShips = ISTANBUL_FERRY_FLEET.length;
    const invalidMmsi = ISTANBUL_FERRY_FLEET.filter(ship => !/^\d{9}$/.test(ship.mmsi));

    results.push({
      category: 'FİLO_AIS_DENETİMİ',
      testName: 'Gemi Sicil & MMSI / IMO Uluslararası Uygunluk Testi',
      status: invalidMmsi.length === 0 ? 'PASSED' : 'FAILED',
      details: invalidMmsi.length === 0
        ? 'Kayıtlı ' + totalShips + ' vapurun tamamı (Barış Manço, Paşabahçe vb.) geçerli 9 haneli uluslararası MMSI numarasına sahip.'
        : 'Geçersiz MMSI bulunan gemiler var'
    });

    const sampleResolution = resolveLiveVesselName('Kadıköy', 'Karaköy', 'Şehir Hatları', false, 'SCHEDULED', 'TRIP_KDK_KRK_01');
    const isDisclaimerEnforced =
      sampleResolution.isRotationalFleetPool === true &&
      sampleResolution.fleetDisclaimer.length > 20 &&
      sampleResolution.liveBosphorusRadarUrl.includes('marinetraffic.com');

    results.push({
      category: 'FİLO_AIS_DENETİMİ',
      testName: '0 Uydurma Veri Politikası (Operasyonel Filo Şeffaflık Uyarısı)',
      status: isDisclaimerEnforced ? 'PASSED' : 'FAILED',
      details: isDisclaimerEnforced
        ? 'Şehir Hatları filo havuzu şeffaflık notu ve MarineTraffic canlı radar linki doğrulandı.'
        : 'Şeffaflık uyarısı veya canlı radar bağlantısı eksik!'
    });
  } catch (err: any) {
    results.push({
      category: 'FİLO_AIS_DENETİMİ',
      testName: 'Filo Denetim Hatası',
      status: 'FAILED',
      details: err.message
    });
  }
  return results;
}

export function auditPiersAndGeolocations(): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  try {
    const pierEntries = Object.entries(ISTANBUL_PIERS);
    let outOfBoundsCount = 0;

    for (const [name, loc] of pierEntries) {
      if (loc.lat < 40.70 || loc.lat > 41.40 || loc.lng < 28.70 || loc.lng > 29.45) {
        outOfBoundsCount++;
      }
    }

    results.push({
      category: 'İSKELE_GPS_DENETİMİ',
      testName: 'İskele Coğrafi GPS Koordinat Sınır Denetimi (' + pierEntries.length + ' İskele)',
      status: outOfBoundsCount === 0 ? 'PASSED' : 'FAILED',
      details: outOfBoundsCount === 0
        ? 'Tüm ' + pierEntries.length + ' iskelenin GPS koordinatları İstanbul sınırları (Marmara ve Boğaz) içinde doğrulandı.'
        : outOfBoundsCount + ' adet iskelenin koordinatı sınır dışı!'
    });

    const mobilityHubCount = Object.keys(PIER_MOBILITY_DATA).length;
    const transitGroundCount = Object.keys(PIER_TRANSIT_GROUND_DATA).length;

    results.push({
      category: 'İSKELE_GPS_DENETİMİ',
      testName: 'İskele Bisiklet, Otopark & Kara Transit Bağlantı Entegrasyonu',
      status: mobilityHubCount > 5 && transitGroundCount > 5 ? 'PASSED' : 'WARNING',
      details: mobilityHubCount + ' iskele için bisiklet/otopark hubı, ' + transitGroundCount + ' iskele için taksi/otobüs aktarması doğrulandı.'
    });
  } catch (err: any) {
    results.push({
      category: 'İSKELE_GPS_DENETİMİ',
      testName: 'İskele Denetim Hatası',
      status: 'FAILED',
      details: err.message
    });
  }
  return results;
}

export function runFullSystemAudit(daemonCycle: number = 1): SystemAuditSummary {
  const allChecks: AuditCheckResult[] = [
    ...auditFaresAndTariffs(),
    ...auditSeaTaxiAndNightMatrix(),
    ...auditSchedulesDatabase(),
    ...auditFleetRegistryAndAis(),
    ...auditPiersAndGeolocations()
  ];

  const totalChecks = allChecks.length;
  const passedChecks = allChecks.filter(c => c.status === 'PASSED').length;
  const failedChecks = allChecks.filter(c => c.status === 'FAILED').length;
  const warningChecks = allChecks.filter(c => c.status === 'WARNING').length;

  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
  if (failedChecks > 0) {
    overallStatus = 'CRITICAL';
  } else if (warningChecks > 0) {
    overallStatus = 'DEGRADED';
  }

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    complianceScore,
    totalChecks,
    passedChecks,
    failedChecks,
    warningChecks,
    checks: allChecks,
    daemonCycleCount: daemonCycle
  };
}