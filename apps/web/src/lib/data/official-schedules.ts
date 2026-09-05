export interface RawStop {
  name: string;
  time: string;
}

export interface RawOfficialTrip {
  id: string;
  origin: string;
  destination: string;
  operator: 'Şehir Hatları' | 'Mavi Marmara' | 'Prens Tur';

  departureTime: string;
  arrivalTime?: string;
  platform: string;
  price: string;
  stops?: RawStop[];
  isWeekendOnly?: boolean;
  isWeekdayOnly?: boolean;
}

export const OFFICIAL_SCHEDULES_DATA: RawOfficialTrip[] = [
  // =============================================================
  // 1. ŞEHİR HATLARI: KABATAŞ <-> ADALAR (HAFTA İÇİ)
  // =============================================================
  {
    id: 'sh-kab-wd-out-0',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '06:45',
    arrivalTime: '08:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"07:10"},{"name":"Kınalıada","time":"07:45"},{"name":"Burgazada","time":"08:00"},{"name":"Heybeliada","time":"08:15"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-1',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '08:00',
    arrivalTime: '09:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"08:25"},{"name":"Kınalıada","time":"09:00"},{"name":"Burgazada","time":"09:15"},{"name":"Heybeliada","time":"09:30"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-2',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '09:00',
    arrivalTime: '10:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"09:25"},{"name":"Kınalıada","time":"10:00"},{"name":"Burgazada","time":"10:15"},{"name":"Heybeliada","time":"10:30"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-3',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '10:05',
    arrivalTime: '11:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"10:30"},{"name":"Kınalıada","time":"11:05"},{"name":"Burgazada","time":"11:20"},{"name":"Heybeliada","time":"11:35"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-4',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '11:05',
    arrivalTime: '12:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"11:30"},{"name":"Kınalıada","time":"12:05"},{"name":"Burgazada","time":"12:20"},{"name":"Heybeliada","time":"12:35"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-5',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '12:00',
    arrivalTime: '13:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"12:25"},{"name":"Kınalıada","time":"13:00"},{"name":"Burgazada","time":"13:15"},{"name":"Heybeliada","time":"13:30"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-6',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '14:00',
    arrivalTime: '15:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"14:25"},{"name":"Kınalıada","time":"15:00"},{"name":"Burgazada","time":"15:15"},{"name":"Heybeliada","time":"15:30"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-7',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '16:30',
    arrivalTime: '18:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"16:55"},{"name":"Kınalıada","time":"17:30"},{"name":"Burgazada","time":"17:45"},{"name":"Heybeliada","time":"18:00"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-8',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '17:35',
    arrivalTime: '19:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"18:00"},{"name":"Kınalıada","time":"18:35"},{"name":"Burgazada","time":"18:50"},{"name":"Heybeliada","time":"19:05"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-9',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '18:25',
    arrivalTime: '19:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"19:20"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-10',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '18:50',
    arrivalTime: '20:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"19:25"},{"name":"Kınalıada","time":"20:00"},{"name":"Burgazada","time":"20:15"},{"name":"Heybeliada","time":"20:30"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-11',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '19:20',
    arrivalTime: '20:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"20:20"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-12',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '19:40',
    arrivalTime: '21:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"20:05"},{"name":"Kınalıada","time":"20:40"},{"name":"Burgazada","time":"20:55"},{"name":"Heybeliada","time":"21:10"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-13',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '21:40',
    arrivalTime: '23:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"22:05"},{"name":"Kınalıada","time":"22:40"},{"name":"Burgazada","time":"22:55"},{"name":"Heybeliada","time":"23:10"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-out-14',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '23:30',
    arrivalTime: '01:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"23:55"},{"name":"Kınalıada","time":"00:30"},{"name":"Burgazada","time":"00:45"},{"name":"Heybeliada","time":"01:00"}],
    isWeekdayOnly: true
  },

  {
    id: 'sh-kab-wd-ret-0',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '05:45',
    arrivalTime: '07:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"06:00"},{"name":"Burgazada","time":"06:15"},{"name":"Kınalıada","time":"06:30"},{"name":"Kadıköy","time":"07:05"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-1',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '06:35',
    arrivalTime: '08:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"06:50"},{"name":"Burgazada","time":"07:05"},{"name":"Kınalıada","time":"07:20"},{"name":"Kadıköy","time":"07:55"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-2',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '07:40',
    arrivalTime: '09:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"07:55"},{"name":"Burgazada","time":"08:10"},{"name":"Kınalıada","time":"08:25"},{"name":"Kadıköy","time":"09:00"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-3',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '07:55',
    arrivalTime: '09:05',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"08:10"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-4',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '09:00',
    arrivalTime: '10:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"09:15"},{"name":"Burgazada","time":"09:30"},{"name":"Kınalıada","time":"09:45"},{"name":"Kadıköy","time":"10:20"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-5',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '10:35',
    arrivalTime: '12:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"10:50"},{"name":"Burgazada","time":"11:05"},{"name":"Kınalıada","time":"11:20"},{"name":"Kadıköy","time":"11:55"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-6',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '12:05',
    arrivalTime: '13:55',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"12:20"},{"name":"Burgazada","time":"12:35"},{"name":"Kınalıada","time":"12:50"},{"name":"Kadıköy","time":"13:25"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-7',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '13:30',
    arrivalTime: '15:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"13:45"},{"name":"Burgazada","time":"14:00"},{"name":"Kınalıada","time":"14:15"},{"name":"Kadıköy","time":"14:50"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-8',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '15:00',
    arrivalTime: '16:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"15:15"},{"name":"Burgazada","time":"15:30"},{"name":"Kınalıada","time":"15:45"},{"name":"Kadıköy","time":"16:20"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-9',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '16:30',
    arrivalTime: '18:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"16:45"},{"name":"Burgazada","time":"17:00"},{"name":"Kınalıada","time":"17:15"},{"name":"Kadıköy","time":"17:50"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-10',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '17:35',
    arrivalTime: '19:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"17:50"},{"name":"Burgazada","time":"18:05"},{"name":"Kınalıada","time":"18:20"},{"name":"Kadıköy","time":"18:55"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-11',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '18:30',
    arrivalTime: '20:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"18:45"},{"name":"Burgazada","time":"19:00"},{"name":"Kınalıada","time":"19:15"},{"name":"Kadıköy","time":"19:50"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-12',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '19:35',
    arrivalTime: '21:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"19:50"},{"name":"Burgazada","time":"20:05"},{"name":"Kınalıada","time":"20:20"},{"name":"Kadıköy","time":"20:55"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-13',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '20:35',
    arrivalTime: '22:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"20:50"},{"name":"Burgazada","time":"21:05"},{"name":"Kınalıada","time":"21:20"},{"name":"Kadıköy","time":"21:55"}],
    isWeekdayOnly: true
  },
  {
    id: 'sh-kab-wd-ret-14',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '21:45',
    arrivalTime: '23:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"22:00"},{"name":"Burgazada","time":"22:15"},{"name":"Kınalıada","time":"22:30"},{"name":"Kadıköy","time":"23:05"}],
    isWeekdayOnly: true
  },

  // =============================================================
  // 2. ŞEHİR HATLARI: KABATAŞ <-> ADALAR (HAFTA SONU)
  // =============================================================
  {
    id: 'sh-kab-we-out-0',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '07:30',
    arrivalTime: '09:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"07:55"},{"name":"Kınalıada","time":"08:30"},{"name":"Burgazada","time":"08:45"},{"name":"Heybeliada","time":"09:00"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-1',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '08:30',
    arrivalTime: '10:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"08:55"},{"name":"Kınalıada","time":"09:30"},{"name":"Burgazada","time":"09:45"},{"name":"Heybeliada","time":"10:00"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-2',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '09:05',
    arrivalTime: '10:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"09:30"},{"name":"Kınalıada","time":"10:05"},{"name":"Burgazada","time":"10:20"},{"name":"Heybeliada","time":"10:35"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-3',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '10:05',
    arrivalTime: '11:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"10:30"},{"name":"Kınalıada","time":"11:05"},{"name":"Burgazada","time":"11:20"},{"name":"Heybeliada","time":"11:35"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-4',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '11:05',
    arrivalTime: '12:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"11:30"},{"name":"Kınalıada","time":"12:05"},{"name":"Burgazada","time":"12:20"},{"name":"Heybeliada","time":"12:35"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-5',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '12:05',
    arrivalTime: '13:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"12:30"},{"name":"Kınalıada","time":"13:05"},{"name":"Burgazada","time":"13:20"},{"name":"Heybeliada","time":"13:35"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-6',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '14:00',
    arrivalTime: '15:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"14:25"},{"name":"Kınalıada","time":"15:00"},{"name":"Burgazada","time":"15:15"},{"name":"Heybeliada","time":"15:30"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-7',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '15:30',
    arrivalTime: '16:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"16:30"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-8',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '16:30',
    arrivalTime: '18:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"16:55"},{"name":"Kınalıada","time":"17:30"},{"name":"Burgazada","time":"17:45"},{"name":"Heybeliada","time":"18:00"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-9',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '17:35',
    arrivalTime: '19:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"18:00"},{"name":"Kınalıada","time":"18:35"},{"name":"Burgazada","time":"18:50"},{"name":"Heybeliada","time":"19:05"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-10',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '18:25',
    arrivalTime: '19:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"19:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-11',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '18:50',
    arrivalTime: '20:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"19:25"},{"name":"Kınalıada","time":"20:00"},{"name":"Burgazada","time":"20:15"},{"name":"Heybeliada","time":"20:30"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-12',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '19:20',
    arrivalTime: '20:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"20:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-13',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '19:40',
    arrivalTime: '21:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"20:05"},{"name":"Kınalıada","time":"20:40"},{"name":"Burgazada","time":"20:55"},{"name":"Heybeliada","time":"21:10"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-14',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '21:40',
    arrivalTime: '23:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"22:05"},{"name":"Kınalıada","time":"22:40"},{"name":"Burgazada","time":"22:55"},{"name":"Heybeliada","time":"23:10"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-out-15',
    origin: 'Kabataş',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '23:30',
    arrivalTime: '01:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kadıköy","time":"23:55"},{"name":"Kınalıada","time":"00:30"},{"name":"Burgazada","time":"00:45"},{"name":"Heybeliada","time":"01:00"}],
    isWeekendOnly: true
  },

  {
    id: 'sh-kab-we-ret-0',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '06:15',
    arrivalTime: '08:15',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"06:30"},{"name":"Burgazada","time":"06:45"},{"name":"Kınalıada","time":"07:00"},{"name":"Kadıköy","time":"07:35"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-1',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '07:00',
    arrivalTime: '08:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"07:15"},{"name":"Burgazada","time":"07:30"},{"name":"Kınalıada","time":"07:45"},{"name":"Kadıköy","time":"08:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-2',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '07:35',
    arrivalTime: '09:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"07:50"},{"name":"Burgazada","time":"08:05"},{"name":"Kınalıada","time":"08:20"},{"name":"Kadıköy","time":"09:00"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-3',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '08:15',
    arrivalTime: '09:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"08:30"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-4',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '09:00',
    arrivalTime: '10:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"09:15"},{"name":"Burgazada","time":"09:30"},{"name":"Kınalıada","time":"09:45"},{"name":"Kadıköy","time":"10:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-5',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '11:00',
    arrivalTime: '12:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"11:15"},{"name":"Burgazada","time":"11:30"},{"name":"Kınalıada","time":"11:45"},{"name":"Kadıköy","time":"12:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-6',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '12:05',
    arrivalTime: '13:55',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"12:20"},{"name":"Burgazada","time":"12:35"},{"name":"Kınalıada","time":"12:50"},{"name":"Kadıköy","time":"13:25"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-7',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '13:30',
    arrivalTime: '15:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"13:45"},{"name":"Burgazada","time":"14:00"},{"name":"Kınalıada","time":"14:15"},{"name":"Kadıköy","time":"14:50"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-8',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '15:00',
    arrivalTime: '16:50',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"15:15"},{"name":"Burgazada","time":"15:30"},{"name":"Kınalıada","time":"15:45"},{"name":"Kadıköy","time":"16:20"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-9',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '16:30',
    arrivalTime: '18:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"16:45"},{"name":"Burgazada","time":"17:00"},{"name":"Kınalıada","time":"17:15"},{"name":"Kadıköy","time":"17:50"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-10',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '17:00',
    arrivalTime: '18:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"17:15"},{"name":"Kadıköy","time":"18:00"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-11',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '17:35',
    arrivalTime: '19:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"17:50"},{"name":"Burgazada","time":"18:05"},{"name":"Kınalıada","time":"18:20"},{"name":"Kadıköy","time":"18:55"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-12',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '18:30',
    arrivalTime: '20:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"18:45"},{"name":"Burgazada","time":"19:00"},{"name":"Kınalıada","time":"19:15"},{"name":"Kadıköy","time":"19:50"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-13',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '19:35',
    arrivalTime: '21:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"19:50"},{"name":"Burgazada","time":"20:05"},{"name":"Kınalıada","time":"20:20"},{"name":"Kadıköy","time":"20:55"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-14',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '20:35',
    arrivalTime: '22:25',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"20:50"},{"name":"Burgazada","time":"21:05"},{"name":"Kınalıada","time":"21:20"},{"name":"Kadıköy","time":"21:55"}],
    isWeekendOnly: true
  },
  {
    id: 'sh-kab-we-ret-15',
    origin: 'Büyükada',
    destination: 'Kabataş',
    operator: 'Şehir Hatları',

    departureTime: '21:45',
    arrivalTime: '23:35',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"22:00"},{"name":"Burgazada","time":"22:15"},{"name":"Kınalıada","time":"22:30"},{"name":"Kadıköy","time":"23:05"}],
    isWeekendOnly: true
  },

  // =============================================================
  // 3. ŞEHİR HATLARI: BOSTANCI - ADALAR RİNG HATTI (770)
  // =============================================================
  {
    id: 'sh-ring-out-0',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '02:00',
    arrivalTime: '03:10',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kınalıada","time":"02:25"},{"name":"Burgazada","time":"02:40"},{"name":"Heybeliada","time":"02:55"}]
  },
  {
    id: 'sh-ring-out-1',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '04:45',
    arrivalTime: '05:55',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kınalıada","time":"05:10"},{"name":"Burgazada","time":"05:25"},{"name":"Heybeliada","time":"05:40"}]
  },
  {
    id: 'sh-ring-out-2',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '08:20',
    arrivalTime: '-',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kınalıada","time":"08:45"},{"name":"Burgazada","time":"09:00"}]
  },
  {
    id: 'sh-ring-out-3',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '15:10',
    arrivalTime: '16:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kınalıada","time":"15:35"},{"name":"Burgazada","time":"15:50"},{"name":"Heybeliada","time":"16:05"}]
  },
  {
    id: 'sh-ring-out-4',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Şehir Hatları',

    departureTime: '21:45',
    arrivalTime: '22:55',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Kınalıada","time":"22:10"},{"name":"Burgazada","time":"22:25"},{"name":"Heybeliada","time":"22:40"}]
  },

  {
    id: 'sh-ring-ret-0',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '06:45',
    arrivalTime: '07:30',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"07:00"}]
  },
  {
    id: 'sh-ring-ret-1',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '08:20',
    arrivalTime: '-',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"08:35"}]
  },
  {
    id: 'sh-ring-ret-2',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '10:00',
    arrivalTime: '11:10',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"10:15"},{"name":"Burgazada","time":"10:30"},{"name":"Kınalıada","time":"10:45"}]
  },
  {
    id: 'sh-ring-ret-3',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '11:35',
    arrivalTime: '-',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"11:50"}]
  },
  {
    id: 'sh-ring-ret-4',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '19:10',
    arrivalTime: '20:20',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"19:25"},{"name":"Burgazada","time":"19:40"},{"name":"Kınalıada","time":"19:55"}]
  },
  {
    id: 'sh-ring-ret-5',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Şehir Hatları',

    departureTime: '00:35',
    arrivalTime: '01:45',
    platform: 'Peron 2',
    price: '₺45.00',
    stops: [{"name":"Heybeliada","time":"00:50"},{"name":"Burgazada","time":"01:05"},{"name":"Kınalıada","time":"01:20"}]
  },

  // =============================================================
  // 4. MAVİ MARMARA: BOSTANCI <-> HEYBELİADA / BÜYÜKADA
  // =============================================================
  {
    id: 'mm-bos-out-0',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '07:10',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"07:40"}]
  },
  {
    id: 'mm-bos-out-1',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '08:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"08:30"}]
  },
  {
    id: 'mm-bos-out-2',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '09:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"09:30"}]
  },
  {
    id: 'mm-bos-out-3',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '09:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"10:20"}]
  },
  {
    id: 'mm-bos-out-4',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '10:45',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"11:15"}]
  },
  {
    id: 'mm-bos-out-5',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '11:45',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"12:15"}]
  },
  {
    id: 'mm-bos-out-6',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '12:40',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"13:10"}]
  },
  {
    id: 'mm-bos-out-7',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '13:30',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"14:00"}]
  },
  {
    id: 'mm-bos-out-8',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '14:30',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"15:00"}]
  },
  {
    id: 'mm-bos-out-9',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '15:15',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"15:45"}]
  },
  {
    id: 'mm-bos-out-10',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '15:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"16:20"}]
  },
  {
    id: 'mm-bos-out-11',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '16:35',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"17:05"}]
  },
  {
    id: 'mm-bos-out-12',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '17:15',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"17:45"}]
  },
  {
    id: 'mm-bos-out-13',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '17:45',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"18:15"}]
  },
  {
    id: 'mm-bos-out-14',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '18:20',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"18:50"}]
  },
  {
    id: 'mm-bos-out-15',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '19:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"19:30"}]
  },
  {
    id: 'mm-bos-out-16',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '19:30',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"20:00"}]
  },
  {
    id: 'mm-bos-out-17',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '20:15',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"20:45"}]
  },
  {
    id: 'mm-bos-out-18',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '21:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"21:30"}]
  },
  {
    id: 'mm-bos-out-19',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '22:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"22:30"}]
  },
  {
    id: 'mm-bos-out-20',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '23:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"23:30"}]
  },
  {
    id: 'mm-bos-out-21',
    origin: 'Bostancı',
    destination: 'Büyükada',
    operator: 'Mavi Marmara',

    departureTime: '23:45',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: [{"name":"Heybeliada","time":"00:15"}]
  },

  {
    id: 'mm-bos-ret-0',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '06:25',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-1',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '08:00',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-2',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '08:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-3',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '09:35',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-4',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '10:25',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-5',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '11:20',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-6',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '12:35',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-7',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '13:15',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-8',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '14:05',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-9',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '15:20',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-10',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '16:05',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-11',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '16:40',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-12',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '17:25',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-13',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '18:05',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-14',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '18:20',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-15',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '18:55',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-16',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '19:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-17',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '20:35',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-18',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '21:05',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-19',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '21:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },
  {
    id: 'mm-bos-ret-20',
    origin: 'Büyükada',
    destination: 'Bostancı',
    operator: 'Mavi Marmara',

    departureTime: '22:50',
    platform: 'Peron 1',
    price: '₺65.00',
    stops: []
  },

  // =============================================================
  // 5. PRENS TUR: KARTAL <-> BÜYÜKADA
  // =============================================================
  {
    id: 'pt-krt-out-0',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '06:20',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-1',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '07:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-2',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '08:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-3',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '09:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-4',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '10:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-5',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '11:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-6',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '12:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-7',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '13:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-8',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '14:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-9',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '15:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-10',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '16:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-11',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '17:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-12',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '18:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-13',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '19:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-out-14',
    origin: 'Kartal',
    destination: 'Büyükada',
    operator: 'Prens Tur',

    departureTime: '20:30',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },

  {
    id: 'pt-krt-ret-0',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '07:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-1',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '08:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-2',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '09:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-3',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '10:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-4',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '11:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-5',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '12:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-6',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '13:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-7',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '14:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-8',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '15:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-9',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '16:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-10',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '17:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-11',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '18:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-12',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '19:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-13',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '20:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
  {
    id: 'pt-krt-ret-14',
    origin: 'Büyükada',
    destination: 'Kartal',
    operator: 'Prens Tur',

    departureTime: '21:00',
    platform: 'Peron 1',
    price: '₺50.00',
    stops: []
  },
];
