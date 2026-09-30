import { RawOfficialTrip } from "./official-schedules";

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function generateSupplementarySchedules(): RawOfficialTrip[] {
  const trips: RawOfficialTrip[] = [];

  // 1. MAVI MARMARA: Bostancı ➔ Kınalıada ➔ Burgazada ➔ Heybeliada ➔ Büyükada
  const mmBostanciTimes = [
    "06:30", "07:15", "08:00", "08:45", "09:30", "10:15", "11:00", "11:45",
    "12:30", "13:15", "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
    "18:30", "19:15", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"
  ];

  mmBostanciTimes.forEach((dep, i) => {
    trips.push({
      id: `mm-bos-ada-${i}`,
      origin: "Bostancı",
      destination: "Büyükada",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 75),
      platform: "Bostancı Mavi Marmara İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Kınalıada", time: addMinutes(dep, 30) },
        { name: "Burgazada", time: addMinutes(dep, 45) },
        { name: "Heybeliada", time: addMinutes(dep, 60) }
      ]
    });
  });

  // MAVI MARMARA: Büyükada ➔ Heybeliada ➔ Burgazada ➔ Kınalıada ➔ Bostancı
  const mmBuyukadaTimes = [
    "06:30", "07:15", "08:00", "08:45", "09:30", "10:15", "11:00", "11:45",
    "12:30", "13:15", "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
    "18:30", "19:15", "20:00", "21:00", "22:00", "23:00"
  ];

  mmBuyukadaTimes.forEach((dep, i) => {
    trips.push({
      id: `mm-ada-bos-${i}`,
      origin: "Büyükada",
      destination: "Bostancı",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 75),
      platform: "Büyükada Mavi Marmara İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Heybeliada", time: addMinutes(dep, 15) },
        { name: "Burgazada", time: addMinutes(dep, 30) },
        { name: "Kınalıada", time: addMinutes(dep, 45) }
      ]
    });
  });

  // MAVI MARMARA: Kabataş ➔ Kınalıada ➔ Heybeliada ➔ Büyükada
  const mmKabatasTimes = [
    "07:15", "08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"
  ];

  mmKabatasTimes.forEach((dep, i) => {
    trips.push({
      id: `mm-kab-ada-${i}`,
      origin: "Kabataş",
      destination: "Büyükada",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 75),
      platform: "Kabataş Mavi Marmara İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Kınalıada", time: addMinutes(dep, 40) },
        { name: "Heybeliada", time: addMinutes(dep, 60) }
      ]
    });
  });

  // MAVI MARMARA: Büyükada ➔ Heybeliada ➔ Kınalıada ➔ Kabataş
  const mmBuyukadaToKabatasTimes = [
    "07:00", "08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"
  ];

  mmBuyukadaToKabatasTimes.forEach((dep, i) => {
    trips.push({
      id: `mm-ada-kab-${i}`,
      origin: "Büyükada",
      destination: "Kabataş",
      operator: "Mavi Marmara",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 75),
      platform: "Büyükada Mavi Marmara İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Heybeliada", time: addMinutes(dep, 15) },
        { name: "Kınalıada", time: addMinutes(dep, 35) }
      ]
    });
  });

  // 2. PRENS TUR: Kartal ➔ Büyükada ➔ Heybeliada
  const prensKartalTimes = [
    "06:45", "07:30", "08:15", "09:00", "09:45", "10:30", "11:30", "12:30",
    "13:30", "14:30", "15:30", "16:30", "17:15", "18:00", "18:45", "19:30", "20:30", "21:30"
  ];

  prensKartalTimes.forEach((dep, i) => {
    trips.push({
      id: `pt-kar-ada-${i}`,
      origin: "Kartal",
      destination: "Heybeliada",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 40),
      platform: "Kartal Prens Tur İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Büyükada", time: addMinutes(dep, 25) }
      ]
    });
  });

  // PRENS TUR: Heybeliada ➔ Büyükada ➔ Kartal
  const prensAdaTimes = [
    "07:15", "08:00", "08:45", "09:30", "10:15", "11:15", "12:15", "13:15",
    "14:15", "15:15", "16:15", "17:00", "17:45", "18:30", "19:15", "20:15", "21:15", "22:15"
  ];

  prensAdaTimes.forEach((dep, i) => {
    trips.push({
      id: `pt-ada-kar-${i}`,
      origin: "Heybeliada",
      destination: "Kartal",
      operator: "Prens Tur",
      category: "ADALAR",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 40),
      platform: "Heybeliada Prens Tur İskelesi",
      price: "₺90.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true,
      stops: [
        { name: "Büyükada", time: addMinutes(dep, 15) }
      ]
    });
  });

  // 3. TURYOL: Eminönü ➔ Kadıköy
  const turyolEminonuKadikoyTimes = [
    "06:40", "07:00", "07:20", "07:40", "08:00", "08:20", "08:40", "09:00", "09:20", "09:40",
    "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00", "12:20", "12:40", "13:00",
    "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20",
    "16:40", "17:00", "17:20", "17:40", "18:00", "18:20", "18:40", "19:00", "19:20", "19:40",
    "20:00", "20:20", "20:40", "21:00", "21:20", "21:40", "22:00", "22:20", "22:40"
  ];

  turyolEminonuKadikoyTimes.forEach((dep, i) => {
    trips.push({
      id: `tur-em-kad-${i}`,
      origin: "Eminönü",
      destination: "Kadıköy",
      operator: "Turyol",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 25),
      platform: "Eminönü Turyol İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
  });

  // TURYOL: Kadıköy ➔ Eminönü
  turyolEminonuKadikoyTimes.forEach((dep, i) => {
    trips.push({
      id: `tur-kad-em-${i}`,
      origin: "Kadıköy",
      destination: "Eminönü",
      operator: "Turyol",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 25),
      platform: "Kadıköy Turyol İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
  });

  // TURYOL: Karaköy ➔ Kadıköy
  const turyolKarakoyTimes = [
    "07:10", "07:30", "07:50", "08:10", "08:30", "08:50", "09:10", "09:30", "09:50",
    "10:10", "10:30", "10:50", "11:10", "11:30", "11:50", "12:10", "12:30", "12:50",
    "13:10", "13:30", "13:50", "14:10", "14:30", "14:50", "15:10", "15:30", "15:50",
    "16:10", "16:30", "16:50", "17:10", "17:30", "17:50", "18:10", "18:30", "18:50",
    "19:10", "19:30", "19:50", "20:10", "20:30", "20:50", "21:10", "21:30", "21:50", "22:10"
  ];

  turyolKarakoyTimes.forEach((dep, i) => {
    trips.push({
      id: `tur-kar-kad-${i}`,
      origin: "Karaköy",
      destination: "Kadıköy",
      operator: "Turyol",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 25),
      platform: "Karaköy Turyol İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
    trips.push({
      id: `tur-kad-kar-${i}`,
      origin: "Kadıköy",
      destination: "Karaköy",
      operator: "Turyol",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 25),
      platform: "Kadıköy Turyol İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
  });

  // 4. DENTUR AVRASYA: Beşiktaş ➔ Üsküdar
  const denturBesiktasTimes = [
    "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45",
    "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15",
    "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15",
    "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45",
    "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:20",
    "21:40", "22:00", "22:20", "22:40", "23:00", "23:30"
  ];

  denturBesiktasTimes.forEach((dep, i) => {
    trips.push({
      id: `den-bes-usk-${i}`,
      origin: "Beşiktaş",
      destination: "Üsküdar",
      operator: "Dentur Avrasya",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 10),
      platform: "Beşiktaş Dentur İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
    trips.push({
      id: `den-usk-bes-${i}`,
      origin: "Üsküdar",
      destination: "Beşiktaş",
      operator: "Dentur Avrasya",
      category: "BOGAZ",
      departureTime: dep,
      arrivalTime: addMinutes(dep, 10),
      platform: "Üsküdar Dentur İskelesi",
      price: "₺27.00",
      runsWeekday: true,
      runsSaturday: true,
      runsSunday: true
    });
  });

  return trips;
}
