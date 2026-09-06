export interface RawStop {
  name: string;
  time: string;
}

export type FerryOperatorName = 
  | 'Şehir Hatları' 
  | 'İDO' 
  | 'Turyol' 
  | 'Mavi Marmara' 
  | 'Dentur Avrasya' 
  | 'Prens Tur';

export interface RawOfficialTrip {
  id: string;
  origin: string;
  destination: string;
  operator: FerryOperatorName;
  category?: 'ADALAR' | 'BOGAZ';

  departureTime: string;
  arrivalTime?: string;
  platform: string;
  price: string;
  stops?: RawStop[];
  isWeekendOnly?: boolean;
  isWeekdayOnly?: boolean;
}

export const OFFICIAL_SCHEDULES_DATA: RawOfficialTrip[] = [
  {
    "id": "sh-kab-wd-out-0",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "06:45",
    "arrivalTime": "08:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "07:10"
      },
      {
        "name": "Kınalıada",
        "time": "07:45"
      },
      {
        "name": "Burgazada",
        "time": "08:00"
      },
      {
        "name": "Heybeliada",
        "time": "08:15"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-1",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "08:00",
    "arrivalTime": "09:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "08:25"
      },
      {
        "name": "Kınalıada",
        "time": "09:00"
      },
      {
        "name": "Burgazada",
        "time": "09:15"
      },
      {
        "name": "Heybeliada",
        "time": "09:30"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-2",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "09:00",
    "arrivalTime": "10:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "09:25"
      },
      {
        "name": "Kınalıada",
        "time": "10:00"
      },
      {
        "name": "Burgazada",
        "time": "10:15"
      },
      {
        "name": "Heybeliada",
        "time": "10:30"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-3",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "10:05",
    "arrivalTime": "11:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "10:30"
      },
      {
        "name": "Kınalıada",
        "time": "11:05"
      },
      {
        "name": "Burgazada",
        "time": "11:20"
      },
      {
        "name": "Heybeliada",
        "time": "11:35"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-4",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "11:05",
    "arrivalTime": "12:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "11:30"
      },
      {
        "name": "Kınalıada",
        "time": "12:05"
      },
      {
        "name": "Burgazada",
        "time": "12:20"
      },
      {
        "name": "Heybeliada",
        "time": "12:35"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-5",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "12:00",
    "arrivalTime": "13:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "12:25"
      },
      {
        "name": "Kınalıada",
        "time": "13:00"
      },
      {
        "name": "Burgazada",
        "time": "13:15"
      },
      {
        "name": "Heybeliada",
        "time": "13:30"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-6",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "14:00",
    "arrivalTime": "15:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "14:25"
      },
      {
        "name": "Kınalıada",
        "time": "15:00"
      },
      {
        "name": "Burgazada",
        "time": "15:15"
      },
      {
        "name": "Heybeliada",
        "time": "15:30"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-7",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "16:30",
    "arrivalTime": "18:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "16:55"
      },
      {
        "name": "Kınalıada",
        "time": "17:30"
      },
      {
        "name": "Burgazada",
        "time": "17:45"
      },
      {
        "name": "Heybeliada",
        "time": "18:00"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-8",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "17:35",
    "arrivalTime": "19:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "18:00"
      },
      {
        "name": "Kınalıada",
        "time": "18:35"
      },
      {
        "name": "Burgazada",
        "time": "18:50"
      },
      {
        "name": "Heybeliada",
        "time": "19:05"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-9",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "18:25",
    "arrivalTime": "19:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:20"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-10",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "18:50",
    "arrivalTime": "20:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "19:25"
      },
      {
        "name": "Kınalıada",
        "time": "20:00"
      },
      {
        "name": "Burgazada",
        "time": "20:15"
      },
      {
        "name": "Heybeliada",
        "time": "20:30"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-11",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "19:20",
    "arrivalTime": "20:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:20"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-12",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "19:40",
    "arrivalTime": "21:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "20:05"
      },
      {
        "name": "Kınalıada",
        "time": "20:40"
      },
      {
        "name": "Burgazada",
        "time": "20:55"
      },
      {
        "name": "Heybeliada",
        "time": "21:10"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-13",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "21:40",
    "arrivalTime": "23:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "22:05"
      },
      {
        "name": "Kınalıada",
        "time": "22:40"
      },
      {
        "name": "Burgazada",
        "time": "22:55"
      },
      {
        "name": "Heybeliada",
        "time": "23:10"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-out-14",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "23:30",
    "arrivalTime": "01:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "23:55"
      },
      {
        "name": "Kınalıada",
        "time": "00:30"
      },
      {
        "name": "Burgazada",
        "time": "00:45"
      },
      {
        "name": "Heybeliada",
        "time": "01:00"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-0",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "05:45",
    "arrivalTime": "07:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "06:00"
      },
      {
        "name": "Burgazada",
        "time": "06:15"
      },
      {
        "name": "Kınalıada",
        "time": "06:30"
      },
      {
        "name": "Kadıköy",
        "time": "07:05"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-1",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "06:35",
    "arrivalTime": "08:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "06:50"
      },
      {
        "name": "Burgazada",
        "time": "07:05"
      },
      {
        "name": "Kınalıada",
        "time": "07:20"
      },
      {
        "name": "Kadıköy",
        "time": "07:55"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-2",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "07:40",
    "arrivalTime": "09:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "07:55"
      },
      {
        "name": "Burgazada",
        "time": "08:10"
      },
      {
        "name": "Kınalıada",
        "time": "08:25"
      },
      {
        "name": "Kadıköy",
        "time": "09:00"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-3",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "07:55",
    "arrivalTime": "09:05",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "08:10"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-4",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "09:00",
    "arrivalTime": "10:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "09:15"
      },
      {
        "name": "Burgazada",
        "time": "09:30"
      },
      {
        "name": "Kınalıada",
        "time": "09:45"
      },
      {
        "name": "Kadıköy",
        "time": "10:20"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-5",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "10:35",
    "arrivalTime": "12:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "10:50"
      },
      {
        "name": "Burgazada",
        "time": "11:05"
      },
      {
        "name": "Kınalıada",
        "time": "11:20"
      },
      {
        "name": "Kadıköy",
        "time": "11:55"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-6",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "12:05",
    "arrivalTime": "13:55",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "12:20"
      },
      {
        "name": "Burgazada",
        "time": "12:35"
      },
      {
        "name": "Kınalıada",
        "time": "12:50"
      },
      {
        "name": "Kadıköy",
        "time": "13:25"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-7",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "13:30",
    "arrivalTime": "15:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "13:45"
      },
      {
        "name": "Burgazada",
        "time": "14:00"
      },
      {
        "name": "Kınalıada",
        "time": "14:15"
      },
      {
        "name": "Kadıköy",
        "time": "14:50"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-8",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "15:00",
    "arrivalTime": "16:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "15:15"
      },
      {
        "name": "Burgazada",
        "time": "15:30"
      },
      {
        "name": "Kınalıada",
        "time": "15:45"
      },
      {
        "name": "Kadıköy",
        "time": "16:20"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-9",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "16:30",
    "arrivalTime": "18:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:45"
      },
      {
        "name": "Burgazada",
        "time": "17:00"
      },
      {
        "name": "Kınalıada",
        "time": "17:15"
      },
      {
        "name": "Kadıköy",
        "time": "17:50"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-10",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "17:35",
    "arrivalTime": "19:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:50"
      },
      {
        "name": "Burgazada",
        "time": "18:05"
      },
      {
        "name": "Kınalıada",
        "time": "18:20"
      },
      {
        "name": "Kadıköy",
        "time": "18:55"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-11",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "18:30",
    "arrivalTime": "20:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "18:45"
      },
      {
        "name": "Burgazada",
        "time": "19:00"
      },
      {
        "name": "Kınalıada",
        "time": "19:15"
      },
      {
        "name": "Kadıköy",
        "time": "19:50"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-12",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "19:35",
    "arrivalTime": "21:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:50"
      },
      {
        "name": "Burgazada",
        "time": "20:05"
      },
      {
        "name": "Kınalıada",
        "time": "20:20"
      },
      {
        "name": "Kadıköy",
        "time": "20:55"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-13",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "20:35",
    "arrivalTime": "22:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:50"
      },
      {
        "name": "Burgazada",
        "time": "21:05"
      },
      {
        "name": "Kınalıada",
        "time": "21:20"
      },
      {
        "name": "Kadıköy",
        "time": "21:55"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-wd-ret-14",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "21:45",
    "arrivalTime": "23:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "22:00"
      },
      {
        "name": "Burgazada",
        "time": "22:15"
      },
      {
        "name": "Kınalıada",
        "time": "22:30"
      },
      {
        "name": "Kadıköy",
        "time": "23:05"
      }
    ],
    "isWeekdayOnly": true
  },
  {
    "id": "sh-kab-we-out-0",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "07:30",
    "arrivalTime": "09:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "07:55"
      },
      {
        "name": "Kınalıada",
        "time": "08:30"
      },
      {
        "name": "Burgazada",
        "time": "08:45"
      },
      {
        "name": "Heybeliada",
        "time": "09:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-1",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "08:30",
    "arrivalTime": "10:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "08:55"
      },
      {
        "name": "Kınalıada",
        "time": "09:30"
      },
      {
        "name": "Burgazada",
        "time": "09:45"
      },
      {
        "name": "Heybeliada",
        "time": "10:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-2",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "09:05",
    "arrivalTime": "10:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "09:30"
      },
      {
        "name": "Kınalıada",
        "time": "10:05"
      },
      {
        "name": "Burgazada",
        "time": "10:20"
      },
      {
        "name": "Heybeliada",
        "time": "10:35"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-3",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "10:05",
    "arrivalTime": "11:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "10:30"
      },
      {
        "name": "Kınalıada",
        "time": "11:05"
      },
      {
        "name": "Burgazada",
        "time": "11:20"
      },
      {
        "name": "Heybeliada",
        "time": "11:35"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-4",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "11:05",
    "arrivalTime": "12:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "11:30"
      },
      {
        "name": "Kınalıada",
        "time": "12:05"
      },
      {
        "name": "Burgazada",
        "time": "12:20"
      },
      {
        "name": "Heybeliada",
        "time": "12:35"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-5",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "12:05",
    "arrivalTime": "13:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "12:30"
      },
      {
        "name": "Kınalıada",
        "time": "13:05"
      },
      {
        "name": "Burgazada",
        "time": "13:20"
      },
      {
        "name": "Heybeliada",
        "time": "13:35"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-6",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "14:00",
    "arrivalTime": "15:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "14:25"
      },
      {
        "name": "Kınalıada",
        "time": "15:00"
      },
      {
        "name": "Burgazada",
        "time": "15:15"
      },
      {
        "name": "Heybeliada",
        "time": "15:30"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-7",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "15:30",
    "arrivalTime": "16:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:30"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-8",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "16:30",
    "arrivalTime": "18:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "16:55"
      },
      {
        "name": "Kınalıada",
        "time": "17:30"
      },
      {
        "name": "Burgazada",
        "time": "17:45"
      },
      {
        "name": "Heybeliada",
        "time": "18:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-9",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "17:35",
    "arrivalTime": "19:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "18:00"
      },
      {
        "name": "Kınalıada",
        "time": "18:35"
      },
      {
        "name": "Burgazada",
        "time": "18:50"
      },
      {
        "name": "Heybeliada",
        "time": "19:05"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-10",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "18:25",
    "arrivalTime": "19:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-11",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "18:50",
    "arrivalTime": "20:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "19:25"
      },
      {
        "name": "Kınalıada",
        "time": "20:00"
      },
      {
        "name": "Burgazada",
        "time": "20:15"
      },
      {
        "name": "Heybeliada",
        "time": "20:30"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-12",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "19:20",
    "arrivalTime": "20:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-13",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "19:40",
    "arrivalTime": "21:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "20:05"
      },
      {
        "name": "Kınalıada",
        "time": "20:40"
      },
      {
        "name": "Burgazada",
        "time": "20:55"
      },
      {
        "name": "Heybeliada",
        "time": "21:10"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-14",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "21:40",
    "arrivalTime": "23:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "22:05"
      },
      {
        "name": "Kınalıada",
        "time": "22:40"
      },
      {
        "name": "Burgazada",
        "time": "22:55"
      },
      {
        "name": "Heybeliada",
        "time": "23:10"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-out-15",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "23:30",
    "arrivalTime": "01:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "23:55"
      },
      {
        "name": "Kınalıada",
        "time": "00:30"
      },
      {
        "name": "Burgazada",
        "time": "00:45"
      },
      {
        "name": "Heybeliada",
        "time": "01:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-0",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "06:15",
    "arrivalTime": "08:15",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "06:30"
      },
      {
        "name": "Burgazada",
        "time": "06:45"
      },
      {
        "name": "Kınalıada",
        "time": "07:00"
      },
      {
        "name": "Kadıköy",
        "time": "07:35"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-1",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "07:00",
    "arrivalTime": "08:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "07:15"
      },
      {
        "name": "Burgazada",
        "time": "07:30"
      },
      {
        "name": "Kınalıada",
        "time": "07:45"
      },
      {
        "name": "Kadıköy",
        "time": "08:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-2",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "07:35",
    "arrivalTime": "09:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "07:50"
      },
      {
        "name": "Burgazada",
        "time": "08:05"
      },
      {
        "name": "Kınalıada",
        "time": "08:20"
      },
      {
        "name": "Kadıköy",
        "time": "09:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-3",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "08:15",
    "arrivalTime": "09:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "08:30"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-4",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "09:00",
    "arrivalTime": "10:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "09:15"
      },
      {
        "name": "Burgazada",
        "time": "09:30"
      },
      {
        "name": "Kınalıada",
        "time": "09:45"
      },
      {
        "name": "Kadıköy",
        "time": "10:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-5",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "11:00",
    "arrivalTime": "12:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "11:15"
      },
      {
        "name": "Burgazada",
        "time": "11:30"
      },
      {
        "name": "Kınalıada",
        "time": "11:45"
      },
      {
        "name": "Kadıköy",
        "time": "12:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-6",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "12:05",
    "arrivalTime": "13:55",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "12:20"
      },
      {
        "name": "Burgazada",
        "time": "12:35"
      },
      {
        "name": "Kınalıada",
        "time": "12:50"
      },
      {
        "name": "Kadıköy",
        "time": "13:25"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-7",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "13:30",
    "arrivalTime": "15:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "13:45"
      },
      {
        "name": "Burgazada",
        "time": "14:00"
      },
      {
        "name": "Kınalıada",
        "time": "14:15"
      },
      {
        "name": "Kadıköy",
        "time": "14:50"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-8",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "15:00",
    "arrivalTime": "16:50",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "15:15"
      },
      {
        "name": "Burgazada",
        "time": "15:30"
      },
      {
        "name": "Kınalıada",
        "time": "15:45"
      },
      {
        "name": "Kadıköy",
        "time": "16:20"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-9",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "16:30",
    "arrivalTime": "18:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:45"
      },
      {
        "name": "Burgazada",
        "time": "17:00"
      },
      {
        "name": "Kınalıada",
        "time": "17:15"
      },
      {
        "name": "Kadıköy",
        "time": "17:50"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-10",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "17:00",
    "arrivalTime": "18:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:15"
      },
      {
        "name": "Kadıköy",
        "time": "18:00"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-11",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "17:35",
    "arrivalTime": "19:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:50"
      },
      {
        "name": "Burgazada",
        "time": "18:05"
      },
      {
        "name": "Kınalıada",
        "time": "18:20"
      },
      {
        "name": "Kadıköy",
        "time": "18:55"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-12",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "18:30",
    "arrivalTime": "20:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "18:45"
      },
      {
        "name": "Burgazada",
        "time": "19:00"
      },
      {
        "name": "Kınalıada",
        "time": "19:15"
      },
      {
        "name": "Kadıköy",
        "time": "19:50"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-13",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "19:35",
    "arrivalTime": "21:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:50"
      },
      {
        "name": "Burgazada",
        "time": "20:05"
      },
      {
        "name": "Kınalıada",
        "time": "20:20"
      },
      {
        "name": "Kadıköy",
        "time": "20:55"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-14",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "20:35",
    "arrivalTime": "22:25",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:50"
      },
      {
        "name": "Burgazada",
        "time": "21:05"
      },
      {
        "name": "Kınalıada",
        "time": "21:20"
      },
      {
        "name": "Kadıköy",
        "time": "21:55"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-kab-we-ret-15",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Şehir Hatları",
    "departureTime": "21:45",
    "arrivalTime": "23:35",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "22:00"
      },
      {
        "name": "Burgazada",
        "time": "22:15"
      },
      {
        "name": "Kınalıada",
        "time": "22:30"
      },
      {
        "name": "Kadıköy",
        "time": "23:05"
      }
    ],
    "isWeekendOnly": true
  },
  {
    "id": "sh-ring-out-0",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "02:00",
    "arrivalTime": "03:10",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "02:25"
      },
      {
        "name": "Burgazada",
        "time": "02:40"
      },
      {
        "name": "Heybeliada",
        "time": "02:55"
      }
    ]
  },
  {
    "id": "sh-ring-out-1",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "04:45",
    "arrivalTime": "05:55",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "05:10"
      },
      {
        "name": "Burgazada",
        "time": "05:25"
      },
      {
        "name": "Heybeliada",
        "time": "05:40"
      }
    ]
  },
  {
    "id": "sh-ring-out-2",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "08:20",
    "arrivalTime": "09:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "08:45"
      },
      {
        "name": "Burgazada",
        "time": "09:00"
      }
    ]
  },
  {
    "id": "sh-ring-out-3",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "15:10",
    "arrivalTime": "16:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "15:35"
      },
      {
        "name": "Burgazada",
        "time": "15:50"
      },
      {
        "name": "Heybeliada",
        "time": "16:05"
      }
    ]
  },
  {
    "id": "sh-ring-out-4",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Şehir Hatları",
    "departureTime": "21:45",
    "arrivalTime": "22:55",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "22:10"
      },
      {
        "name": "Burgazada",
        "time": "22:25"
      },
      {
        "name": "Heybeliada",
        "time": "22:40"
      }
    ]
  },
  {
    "id": "sh-ring-ret-0",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "06:45",
    "arrivalTime": "07:30",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "07:00"
      }
    ]
  },
  {
    "id": "sh-ring-ret-1",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "08:20",
    "arrivalTime": "08:55",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "08:35"
      }
    ]
  },
  {
    "id": "sh-ring-ret-2",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "10:00",
    "arrivalTime": "11:10",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "10:15"
      },
      {
        "name": "Burgazada",
        "time": "10:30"
      },
      {
        "name": "Kınalıada",
        "time": "10:45"
      }
    ]
  },
  {
    "id": "sh-ring-ret-3",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "11:35",
    "arrivalTime": "12:10",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "11:50"
      }
    ]
  },
  {
    "id": "sh-ring-ret-4",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "19:10",
    "arrivalTime": "20:20",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:25"
      },
      {
        "name": "Burgazada",
        "time": "19:40"
      },
      {
        "name": "Kınalıada",
        "time": "19:55"
      }
    ]
  },
  {
    "id": "sh-ring-ret-5",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Şehir Hatları",
    "departureTime": "00:35",
    "arrivalTime": "01:45",
    "platform": "Peron 2",
    "price": "₺45.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "00:50"
      },
      {
        "name": "Burgazada",
        "time": "01:05"
      },
      {
        "name": "Kınalıada",
        "time": "01:20"
      }
    ]
  },
  {
    "id": "mm-bos-out-0",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "07:10",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "07:40"
      }
    ]
  },
  {
    "id": "mm-bos-out-1",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "08:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "08:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-2",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "09:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "09:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-3",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "09:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "10:20"
      }
    ]
  },
  {
    "id": "mm-bos-out-4",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "10:45",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "11:15"
      }
    ]
  },
  {
    "id": "mm-bos-out-5",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "11:45",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "12:15"
      }
    ]
  },
  {
    "id": "mm-bos-out-6",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "12:40",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "13:10"
      }
    ]
  },
  {
    "id": "mm-bos-out-7",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "13:30",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "14:00"
      }
    ]
  },
  {
    "id": "mm-bos-out-8",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "14:30",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "15:00"
      }
    ]
  },
  {
    "id": "mm-bos-out-9",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "15:15",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "15:45"
      }
    ]
  },
  {
    "id": "mm-bos-out-10",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "15:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:20"
      }
    ]
  },
  {
    "id": "mm-bos-out-11",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "16:35",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:05"
      }
    ]
  },
  {
    "id": "mm-bos-out-12",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "17:15",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:45"
      }
    ]
  },
  {
    "id": "mm-bos-out-13",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "17:45",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "18:15"
      }
    ]
  },
  {
    "id": "mm-bos-out-14",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "18:20",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "18:50"
      }
    ]
  },
  {
    "id": "mm-bos-out-15",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "19:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-16",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "19:30",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:00"
      }
    ]
  },
  {
    "id": "mm-bos-out-17",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "20:15",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:45"
      }
    ]
  },
  {
    "id": "mm-bos-out-18",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "21:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "21:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-19",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "22:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "22:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-20",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "23:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "23:30"
      }
    ]
  },
  {
    "id": "mm-bos-out-21",
    "origin": "Bostancı",
    "destination": "Büyükada",
    "operator": "Mavi Marmara",
    "departureTime": "23:45",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "00:15"
      }
    ]
  },
  {
    "id": "mm-bos-ret-0",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "06:25",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-1",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "08:00",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-2",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "08:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-3",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "09:35",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-4",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "10:25",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-5",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "11:20",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-6",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "12:35",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-7",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "13:15",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-8",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "14:05",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-9",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "15:20",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-10",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "16:05",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-11",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "16:40",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-12",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "17:25",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-13",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "18:05",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-14",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "18:20",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-15",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "18:55",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-16",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "19:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-17",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "20:35",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-18",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "21:05",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-19",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "21:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "mm-bos-ret-20",
    "origin": "Büyükada",
    "destination": "Bostancı",
    "operator": "Mavi Marmara",
    "departureTime": "22:50",
    "platform": "Peron 1",
    "price": "₺65.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-0",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "06:20",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-1",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "07:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-2",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "08:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-3",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "09:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-4",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "10:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-5",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "11:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-6",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "12:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-7",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "13:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-8",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "14:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-9",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "15:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-10",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "16:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-11",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "17:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-12",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "18:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-13",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "19:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-out-14",
    "origin": "Kartal",
    "destination": "Büyükada",
    "operator": "Prens Tur",
    "departureTime": "20:30",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-0",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "07:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-1",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "08:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-2",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "09:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-3",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "10:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-4",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "11:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-5",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "12:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-6",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "13:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-7",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "14:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-8",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "15:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-9",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "16:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-10",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "17:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-11",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "18:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-12",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "19:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-13",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "20:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "pt-krt-ret-14",
    "origin": "Büyükada",
    "destination": "Kartal",
    "operator": "Prens Tur",
    "departureTime": "21:00",
    "platform": "Peron 1",
    "price": "₺50.00",
    "stops": []
  },
  {
    "id": "sh-kad-kar-0",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "06:45",
    "arrivalTime": "07:05",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-1",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:35",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-2",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "08:05",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-3",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:10",
    "arrivalTime": "08:30",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-4",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:35",
    "arrivalTime": "08:55",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-5",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-6",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:30",
    "arrivalTime": "09:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-7",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-8",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:30",
    "arrivalTime": "10:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-9",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-10",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:30",
    "arrivalTime": "11:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-11",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-12",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:30",
    "arrivalTime": "12:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-13",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-14",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:30",
    "arrivalTime": "13:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-15",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-16",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:30",
    "arrivalTime": "14:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-17",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-18",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:30",
    "arrivalTime": "15:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-19",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-20",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:30",
    "arrivalTime": "16:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-21",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-22",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:30",
    "arrivalTime": "17:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-23",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:00",
    "arrivalTime": "18:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-24",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:30",
    "arrivalTime": "18:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-25",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:00",
    "arrivalTime": "19:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-26",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:30",
    "arrivalTime": "19:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-27",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-28",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:30",
    "arrivalTime": "20:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-29",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:00",
    "arrivalTime": "21:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-30",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:30",
    "arrivalTime": "21:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-31",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:00",
    "arrivalTime": "22:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-32",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:30",
    "arrivalTime": "22:50",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-kar-33",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:00",
    "arrivalTime": "23:20",
    "platform": "Karaköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-0",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:10",
    "arrivalTime": "07:30",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-1",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:40",
    "arrivalTime": "08:00",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-2",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:10",
    "arrivalTime": "08:30",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-3",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:35",
    "arrivalTime": "08:55",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-4",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:20",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-5",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:25",
    "arrivalTime": "09:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-6",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:55",
    "arrivalTime": "10:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-7",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:25",
    "arrivalTime": "10:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-8",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:55",
    "arrivalTime": "11:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-9",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:25",
    "arrivalTime": "11:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-10",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:55",
    "arrivalTime": "12:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-11",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:25",
    "arrivalTime": "12:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-12",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:55",
    "arrivalTime": "13:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-13",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:25",
    "arrivalTime": "13:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-14",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:55",
    "arrivalTime": "14:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-15",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:25",
    "arrivalTime": "14:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-16",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:55",
    "arrivalTime": "15:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-17",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:25",
    "arrivalTime": "15:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-18",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:55",
    "arrivalTime": "16:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-19",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:25",
    "arrivalTime": "16:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-20",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:55",
    "arrivalTime": "17:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-21",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:25",
    "arrivalTime": "17:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-22",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:55",
    "arrivalTime": "18:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-23",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:25",
    "arrivalTime": "18:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-24",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:55",
    "arrivalTime": "19:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-25",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:25",
    "arrivalTime": "19:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-26",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:55",
    "arrivalTime": "20:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-27",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:25",
    "arrivalTime": "20:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-28",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:55",
    "arrivalTime": "21:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-29",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:25",
    "arrivalTime": "21:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-30",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:55",
    "arrivalTime": "22:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-31",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:25",
    "arrivalTime": "22:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-32",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:55",
    "arrivalTime": "23:15",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kar-kad-33",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:25",
    "arrivalTime": "23:45",
    "platform": "Kadıköy İskelesi (Peron 2)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-0",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:10",
    "arrivalTime": "07:35",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-1",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:35",
    "arrivalTime": "08:00",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-2",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:25",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-3",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:25",
    "arrivalTime": "08:50",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-4",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:50",
    "arrivalTime": "09:15",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-5",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-6",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "10:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-7",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-8",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "11:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-9",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-10",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "12:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-11",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-12",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "13:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-13",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-14",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "14:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-15",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-16",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "15:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-17",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-18",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "16:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-19",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:15",
    "arrivalTime": "16:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-20",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "17:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-21",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-22",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "18:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-23",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-24",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "19:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-25",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-26",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "20:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-27",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-28",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "21:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-29",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:15",
    "arrivalTime": "21:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-30",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:45",
    "arrivalTime": "22:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-31",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:15",
    "arrivalTime": "22:40",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-32",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:45",
    "arrivalTime": "23:10",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-em-33",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:10",
    "arrivalTime": "23:35",
    "platform": "Eminönü İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-0",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:35",
    "arrivalTime": "08:00",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-1",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:25",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-2",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:25",
    "arrivalTime": "08:50",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-3",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:50",
    "arrivalTime": "09:15",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-4",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:40",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-5",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:40",
    "arrivalTime": "10:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-6",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:10",
    "arrivalTime": "10:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-7",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:40",
    "arrivalTime": "11:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-8",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:10",
    "arrivalTime": "11:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-9",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:40",
    "arrivalTime": "12:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-10",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:10",
    "arrivalTime": "12:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-11",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:40",
    "arrivalTime": "13:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-12",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:10",
    "arrivalTime": "13:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-13",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:40",
    "arrivalTime": "14:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-14",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:10",
    "arrivalTime": "14:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-15",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:40",
    "arrivalTime": "15:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-16",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:10",
    "arrivalTime": "15:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-17",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:40",
    "arrivalTime": "16:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-18",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:10",
    "arrivalTime": "16:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-19",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:40",
    "arrivalTime": "17:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-20",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:10",
    "arrivalTime": "17:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-21",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:40",
    "arrivalTime": "18:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-22",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:10",
    "arrivalTime": "18:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-23",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:40",
    "arrivalTime": "19:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-24",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:10",
    "arrivalTime": "19:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-25",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:40",
    "arrivalTime": "20:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-26",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:10",
    "arrivalTime": "20:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-27",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:40",
    "arrivalTime": "21:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-28",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:10",
    "arrivalTime": "21:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-29",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:40",
    "arrivalTime": "22:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-30",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:10",
    "arrivalTime": "22:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-31",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:40",
    "arrivalTime": "23:05",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-32",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:10",
    "arrivalTime": "23:35",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-em-kad-33",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:35",
    "arrivalTime": "00:00",
    "platform": "Kadıköy İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-0",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-1",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "08:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-2",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-3",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "09:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-4",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-5",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "10:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-6",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-7",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "11:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-8",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-9",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "12:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-10",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-11",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "13:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-12",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-13",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "14:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-14",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-15",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "15:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-16",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-17",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "16:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-18",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:15",
    "arrivalTime": "16:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-19",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "17:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-20",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-21",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "18:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-22",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-23",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "19:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-24",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-25",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "20:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-26",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-27",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "21:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-28",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:15",
    "arrivalTime": "21:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-29",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:45",
    "arrivalTime": "22:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-30",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:15",
    "arrivalTime": "22:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-31",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:45",
    "arrivalTime": "23:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-32",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:15",
    "arrivalTime": "23:45",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-bes-kad-33",
    "origin": "Beşiktaş",
    "destination": "Kadıköy",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:45",
    "arrivalTime": "00:15",
    "platform": "Kadıköy İskelesi (Peron 3)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-0",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-1",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "08:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-2",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-3",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "09:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-4",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-5",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "10:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-6",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-7",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "11:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-8",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-9",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "12:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-10",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-11",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "13:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-12",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-13",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "14:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-14",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-15",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "15:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-16",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-17",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "16:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-18",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:15",
    "arrivalTime": "16:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-19",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "17:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-20",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-21",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "18:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-22",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-23",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "19:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-24",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-25",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "20:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-26",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-27",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "21:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-28",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:15",
    "arrivalTime": "21:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-29",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:45",
    "arrivalTime": "22:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-30",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:15",
    "arrivalTime": "22:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-31",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:45",
    "arrivalTime": "23:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-32",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:15",
    "arrivalTime": "23:45",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-kad-bes-33",
    "origin": "Kadıköy",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:45",
    "arrivalTime": "00:15",
    "platform": "Beşiktaş İskelesi (Peron 1)",
    "price": "₺32.00"
  },
  {
    "id": "sh-usk-bes-0",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "06:45",
    "arrivalTime": "06:55",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-1",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:05",
    "arrivalTime": "07:15",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-2",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:25",
    "arrivalTime": "07:35",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-3",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "07:55",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-4",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:05",
    "arrivalTime": "08:15",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-5",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:25",
    "arrivalTime": "08:35",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-6",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "08:55",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-7",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:05",
    "arrivalTime": "09:15",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-8",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:30",
    "arrivalTime": "09:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-9",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-10",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:30",
    "arrivalTime": "10:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-11",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-12",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:30",
    "arrivalTime": "11:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-13",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-14",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:30",
    "arrivalTime": "12:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-15",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-16",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:30",
    "arrivalTime": "13:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-17",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-18",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:30",
    "arrivalTime": "14:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-19",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-20",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:30",
    "arrivalTime": "15:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-21",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-22",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:30",
    "arrivalTime": "16:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-23",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-24",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:25",
    "arrivalTime": "17:35",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-25",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "17:55",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-26",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:05",
    "arrivalTime": "18:15",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-27",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:25",
    "arrivalTime": "18:35",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-28",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "18:55",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-29",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:05",
    "arrivalTime": "19:15",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-30",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:30",
    "arrivalTime": "19:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-31",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-32",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:30",
    "arrivalTime": "20:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-33",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:00",
    "arrivalTime": "21:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-34",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:30",
    "arrivalTime": "21:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-35",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:00",
    "arrivalTime": "22:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-36",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:30",
    "arrivalTime": "22:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-37",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:00",
    "arrivalTime": "23:10",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-usk-bes-38",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:30",
    "arrivalTime": "23:40",
    "platform": "Beşiktaş Motor İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-0",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "06:55",
    "arrivalTime": "07:05",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-1",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:25",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-2",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:35",
    "arrivalTime": "07:45",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-3",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "07:55",
    "arrivalTime": "08:05",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-4",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:25",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-5",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:35",
    "arrivalTime": "08:45",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-6",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "08:55",
    "arrivalTime": "09:05",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-7",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:25",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-8",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "09:40",
    "arrivalTime": "09:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-9",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:10",
    "arrivalTime": "10:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-10",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "10:40",
    "arrivalTime": "10:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-11",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:10",
    "arrivalTime": "11:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-12",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "11:40",
    "arrivalTime": "11:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-13",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:10",
    "arrivalTime": "12:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-14",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "12:40",
    "arrivalTime": "12:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-15",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:10",
    "arrivalTime": "13:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-16",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "13:40",
    "arrivalTime": "13:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-17",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:10",
    "arrivalTime": "14:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-18",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "14:40",
    "arrivalTime": "14:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-19",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:10",
    "arrivalTime": "15:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-20",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "15:40",
    "arrivalTime": "15:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-21",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:10",
    "arrivalTime": "16:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-22",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "16:40",
    "arrivalTime": "16:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-23",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:10",
    "arrivalTime": "17:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-24",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:35",
    "arrivalTime": "17:45",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-25",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "17:55",
    "arrivalTime": "18:05",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-26",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:25",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-27",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:35",
    "arrivalTime": "18:45",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-28",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "18:55",
    "arrivalTime": "19:05",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-29",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:25",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-30",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "19:40",
    "arrivalTime": "19:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-31",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:10",
    "arrivalTime": "20:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-32",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "20:40",
    "arrivalTime": "20:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-33",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:10",
    "arrivalTime": "21:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-34",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "21:40",
    "arrivalTime": "21:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-35",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:10",
    "arrivalTime": "22:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-36",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "22:40",
    "arrivalTime": "22:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-37",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:10",
    "arrivalTime": "23:20",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "sh-bes-usk-38",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Şehir Hatları",
    "category": "BOGAZ",
    "departureTime": "23:40",
    "arrivalTime": "23:50",
    "platform": "Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "tur-emi-kad-0",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-1",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "08:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-2",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-3",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "09:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-4",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-5",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "10:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-6",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-7",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "11:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-8",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-9",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "12:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-10",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-11",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "13:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-12",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-13",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "14:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-14",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-15",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "15:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-16",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-17",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "16:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-18",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:15",
    "arrivalTime": "16:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-19",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "17:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-20",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-21",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "18:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-22",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-23",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "19:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-24",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-25",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "20:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-26",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-27",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "21:05",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-kad-28",
    "origin": "Eminönü",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "21:15",
    "arrivalTime": "21:35",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-0",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:00",
    "arrivalTime": "07:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-1",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:30",
    "arrivalTime": "07:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-2",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-3",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:30",
    "arrivalTime": "08:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-4",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-5",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:30",
    "arrivalTime": "09:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-6",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-7",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:30",
    "arrivalTime": "10:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-8",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-9",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:30",
    "arrivalTime": "11:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-10",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-11",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:30",
    "arrivalTime": "12:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-12",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-13",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:30",
    "arrivalTime": "13:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-14",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-15",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:30",
    "arrivalTime": "14:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-16",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-17",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:30",
    "arrivalTime": "15:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-18",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-19",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:30",
    "arrivalTime": "16:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-20",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-21",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:30",
    "arrivalTime": "17:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-22",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:00",
    "arrivalTime": "18:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-23",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:30",
    "arrivalTime": "18:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-24",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:00",
    "arrivalTime": "19:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-25",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:30",
    "arrivalTime": "19:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-26",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-27",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:30",
    "arrivalTime": "20:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-emi-28",
    "origin": "Kadıköy",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "21:00",
    "arrivalTime": "21:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-0",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-1",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "08:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-2",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-3",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "09:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-4",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-5",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "10:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-6",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-7",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "11:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-8",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-9",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "12:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-10",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-11",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "13:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-12",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-13",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "14:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-14",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-15",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "15:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-16",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-17",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "16:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-18",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:15",
    "arrivalTime": "16:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-19",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "17:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-20",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-21",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "18:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-22",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-23",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "19:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-24",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-25",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "20:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-26",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:35",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kar-kad-27",
    "origin": "Karaköy",
    "destination": "Kadıköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "21:05",
    "platform": "Turyol Karaköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-0",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:00",
    "arrivalTime": "07:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-1",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "07:30",
    "arrivalTime": "07:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-2",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-3",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "08:30",
    "arrivalTime": "08:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-4",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-5",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "09:30",
    "arrivalTime": "09:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-6",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-7",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "10:30",
    "arrivalTime": "10:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-8",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-9",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "11:30",
    "arrivalTime": "11:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-10",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-11",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "12:30",
    "arrivalTime": "12:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-12",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-13",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "13:30",
    "arrivalTime": "13:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-14",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-15",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "14:30",
    "arrivalTime": "14:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-16",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-17",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "15:30",
    "arrivalTime": "15:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-18",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-19",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "16:30",
    "arrivalTime": "16:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-20",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-21",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "17:30",
    "arrivalTime": "17:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-22",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:00",
    "arrivalTime": "18:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-23",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "18:30",
    "arrivalTime": "18:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-24",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:00",
    "arrivalTime": "19:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-25",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "19:30",
    "arrivalTime": "19:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-26",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:20",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-kad-kar-27",
    "origin": "Kadıköy",
    "destination": "Karaköy",
    "operator": "Turyol",
    "category": "BOGAZ",
    "departureTime": "20:30",
    "arrivalTime": "20:50",
    "platform": "Turyol Kadıköy İskelesi",
    "price": "₺32.00"
  },
  {
    "id": "tur-emi-buy-0",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "08:30",
    "arrivalTime": "09:40",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "08:50"
      },
      {
        "name": "Kınalıada",
        "time": "08:15"
      },
      {
        "name": "Heybeliada",
        "time": "08:30"
      }
    ]
  },
  {
    "id": "tur-emi-buy-1",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "10:00",
    "arrivalTime": "11:10",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "10:20"
      },
      {
        "name": "Kınalıada",
        "time": "10:45"
      },
      {
        "name": "Heybeliada",
        "time": "11:00"
      }
    ]
  },
  {
    "id": "tur-emi-buy-2",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "11:30",
    "arrivalTime": "12:40",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "11:50"
      },
      {
        "name": "Kınalıada",
        "time": "11:15"
      },
      {
        "name": "Heybeliada",
        "time": "11:30"
      }
    ]
  },
  {
    "id": "tur-emi-buy-3",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "13:30",
    "arrivalTime": "14:40",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "13:50"
      },
      {
        "name": "Kınalıada",
        "time": "13:15"
      },
      {
        "name": "Heybeliada",
        "time": "13:30"
      }
    ]
  },
  {
    "id": "tur-emi-buy-4",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "15:30",
    "arrivalTime": "16:40",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "15:50"
      },
      {
        "name": "Kınalıada",
        "time": "15:15"
      },
      {
        "name": "Heybeliada",
        "time": "15:30"
      }
    ]
  },
  {
    "id": "tur-emi-buy-5",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "17:30",
    "arrivalTime": "18:40",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "17:50"
      },
      {
        "name": "Kınalıada",
        "time": "17:15"
      },
      {
        "name": "Heybeliada",
        "time": "17:30"
      }
    ]
  },
  {
    "id": "tur-emi-buy-6",
    "origin": "Eminönü",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "19:00",
    "arrivalTime": "20:10",
    "platform": "Turyol Eminönü İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Kadıköy",
        "time": "19:20"
      },
      {
        "name": "Kınalıada",
        "time": "19:45"
      },
      {
        "name": "Heybeliada",
        "time": "20:00"
      }
    ]
  },
  {
    "id": "tur-buy-emi-0",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "09:45",
    "arrivalTime": "10:55",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "09:55"
      },
      {
        "name": "Kınalıada",
        "time": "09:10"
      },
      {
        "name": "Kadıköy",
        "time": "09:35"
      }
    ]
  },
  {
    "id": "tur-buy-emi-1",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "11:15",
    "arrivalTime": "12:25",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "11:25"
      },
      {
        "name": "Kınalıada",
        "time": "11:40"
      },
      {
        "name": "Kadıköy",
        "time": "11:05"
      }
    ]
  },
  {
    "id": "tur-buy-emi-2",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "12:45",
    "arrivalTime": "13:55",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "12:55"
      },
      {
        "name": "Kınalıada",
        "time": "12:10"
      },
      {
        "name": "Kadıköy",
        "time": "12:35"
      }
    ]
  },
  {
    "id": "tur-buy-emi-3",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "14:45",
    "arrivalTime": "15:55",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "14:55"
      },
      {
        "name": "Kınalıada",
        "time": "14:10"
      },
      {
        "name": "Kadıköy",
        "time": "14:35"
      }
    ]
  },
  {
    "id": "tur-buy-emi-4",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "16:45",
    "arrivalTime": "17:55",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:55"
      },
      {
        "name": "Kınalıada",
        "time": "16:10"
      },
      {
        "name": "Kadıköy",
        "time": "16:35"
      }
    ]
  },
  {
    "id": "tur-buy-emi-5",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "18:45",
    "arrivalTime": "19:55",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "18:55"
      },
      {
        "name": "Kınalıada",
        "time": "18:10"
      },
      {
        "name": "Kadıköy",
        "time": "18:35"
      }
    ]
  },
  {
    "id": "tur-buy-emi-6",
    "origin": "Büyükada",
    "destination": "Eminönü",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "20:15",
    "arrivalTime": "21:25",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "20:25"
      },
      {
        "name": "Kınalıada",
        "time": "20:40"
      },
      {
        "name": "Kadıköy",
        "time": "20:05"
      }
    ]
  },
  {
    "id": "tur-bak-buy-0",
    "origin": "Bakırköy",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "09:00",
    "arrivalTime": "10:05",
    "platform": "Turyol Bakırköy İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "09:40"
      },
      {
        "name": "Heybeliada",
        "time": "09:50"
      }
    ]
  },
  {
    "id": "tur-bak-buy-1",
    "origin": "Bakırköy",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "11:00",
    "arrivalTime": "12:05",
    "platform": "Turyol Bakırköy İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "11:40"
      },
      {
        "name": "Heybeliada",
        "time": "11:50"
      }
    ]
  },
  {
    "id": "tur-bak-buy-2",
    "origin": "Bakırköy",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "13:30",
    "arrivalTime": "14:35",
    "platform": "Turyol Bakırköy İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "13:10"
      },
      {
        "name": "Heybeliada",
        "time": "13:20"
      }
    ]
  },
  {
    "id": "tur-bak-buy-3",
    "origin": "Bakırköy",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "16:00",
    "arrivalTime": "17:05",
    "platform": "Turyol Bakırköy İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "16:40"
      },
      {
        "name": "Heybeliada",
        "time": "16:50"
      }
    ]
  },
  {
    "id": "tur-bak-buy-4",
    "origin": "Bakırköy",
    "destination": "Büyükada",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "18:00",
    "arrivalTime": "19:05",
    "platform": "Turyol Bakırköy İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Kınalıada",
        "time": "18:40"
      },
      {
        "name": "Heybeliada",
        "time": "18:50"
      }
    ]
  },
  {
    "id": "tur-buy-bak-0",
    "origin": "Büyükada",
    "destination": "Bakırköy",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "10:15",
    "arrivalTime": "11:20",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "10:30"
      },
      {
        "name": "Kınalıada",
        "time": "10:40"
      }
    ]
  },
  {
    "id": "tur-buy-bak-1",
    "origin": "Büyükada",
    "destination": "Bakırköy",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "12:15",
    "arrivalTime": "13:20",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "12:30"
      },
      {
        "name": "Kınalıada",
        "time": "12:40"
      }
    ]
  },
  {
    "id": "tur-buy-bak-2",
    "origin": "Büyükada",
    "destination": "Bakırköy",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "14:45",
    "arrivalTime": "15:50",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "15:00"
      },
      {
        "name": "Kınalıada",
        "time": "14:10"
      }
    ]
  },
  {
    "id": "tur-buy-bak-3",
    "origin": "Büyükada",
    "destination": "Bakırköy",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "17:15",
    "arrivalTime": "18:20",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:30"
      },
      {
        "name": "Kınalıada",
        "time": "17:40"
      }
    ]
  },
  {
    "id": "tur-buy-bak-4",
    "origin": "Büyükada",
    "destination": "Bakırköy",
    "operator": "Turyol",
    "category": "ADALAR",
    "departureTime": "19:15",
    "arrivalTime": "20:20",
    "platform": "Turyol Büyükada İskelesi",
    "price": "₺60.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:30"
      },
      {
        "name": "Kınalıada",
        "time": "19:40"
      }
    ]
  },
  {
    "id": "den-bes-usk-0",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "06:40",
    "arrivalTime": "06:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-1",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:00",
    "arrivalTime": "07:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-2",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:20",
    "arrivalTime": "07:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-3",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:40",
    "arrivalTime": "07:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-4",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-5",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:20",
    "arrivalTime": "08:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-6",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:40",
    "arrivalTime": "08:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-7",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-8",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:20",
    "arrivalTime": "09:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-9",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:40",
    "arrivalTime": "09:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-10",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-11",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:30",
    "arrivalTime": "10:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-12",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-13",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:30",
    "arrivalTime": "11:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-14",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-15",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:30",
    "arrivalTime": "12:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-16",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-17",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:30",
    "arrivalTime": "13:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-18",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-19",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:30",
    "arrivalTime": "14:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-20",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-21",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:30",
    "arrivalTime": "15:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-22",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-23",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:20",
    "arrivalTime": "16:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-24",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:40",
    "arrivalTime": "16:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-25",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-26",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:20",
    "arrivalTime": "17:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-27",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:40",
    "arrivalTime": "17:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-28",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:00",
    "arrivalTime": "18:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-29",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:20",
    "arrivalTime": "18:30",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-30",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:40",
    "arrivalTime": "18:50",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-31",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:00",
    "arrivalTime": "19:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-32",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:30",
    "arrivalTime": "19:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-33",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-34",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "20:30",
    "arrivalTime": "20:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-35",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "21:00",
    "arrivalTime": "21:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-36",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "21:30",
    "arrivalTime": "21:40",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-bes-usk-37",
    "origin": "Beşiktaş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "22:00",
    "arrivalTime": "22:10",
    "platform": "Dentur Beşiktaş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-0",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "06:30",
    "arrivalTime": "06:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-1",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "06:50",
    "arrivalTime": "07:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-2",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:10",
    "arrivalTime": "07:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-3",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:30",
    "arrivalTime": "07:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-4",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:50",
    "arrivalTime": "08:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-5",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:10",
    "arrivalTime": "08:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-6",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:30",
    "arrivalTime": "08:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-7",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:50",
    "arrivalTime": "09:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-8",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:10",
    "arrivalTime": "09:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-9",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:30",
    "arrivalTime": "09:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-10",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:50",
    "arrivalTime": "10:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-11",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:15",
    "arrivalTime": "10:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-12",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "10:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-13",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:15",
    "arrivalTime": "11:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-14",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "11:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-15",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:15",
    "arrivalTime": "12:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-16",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "12:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-17",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:15",
    "arrivalTime": "13:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-18",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "13:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-19",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:15",
    "arrivalTime": "14:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-20",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "14:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-21",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:15",
    "arrivalTime": "15:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-22",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "15:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-23",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:10",
    "arrivalTime": "16:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-24",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:30",
    "arrivalTime": "16:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-25",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:50",
    "arrivalTime": "17:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-26",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:10",
    "arrivalTime": "17:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-27",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:30",
    "arrivalTime": "17:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-28",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:50",
    "arrivalTime": "18:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-29",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:10",
    "arrivalTime": "18:20",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-30",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:30",
    "arrivalTime": "18:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-31",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:50",
    "arrivalTime": "19:00",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-32",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:15",
    "arrivalTime": "19:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-33",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "19:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-34",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "20:15",
    "arrivalTime": "20:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-35",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "20:45",
    "arrivalTime": "20:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-36",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "21:15",
    "arrivalTime": "21:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-bes-37",
    "origin": "Üsküdar",
    "destination": "Beşiktaş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "21:45",
    "arrivalTime": "21:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-0",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:15",
    "arrivalTime": "07:25",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-1",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:45",
    "arrivalTime": "07:55",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-2",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:15",
    "arrivalTime": "08:25",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-3",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:45",
    "arrivalTime": "08:55",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-4",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:15",
    "arrivalTime": "09:25",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-5",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:00",
    "arrivalTime": "10:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-6",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:00",
    "arrivalTime": "11:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-7",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:00",
    "arrivalTime": "12:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-8",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:00",
    "arrivalTime": "13:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-9",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:00",
    "arrivalTime": "14:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-10",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:00",
    "arrivalTime": "15:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-11",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:00",
    "arrivalTime": "16:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-12",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:00",
    "arrivalTime": "17:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-13",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:30",
    "arrivalTime": "17:40",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-14",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:00",
    "arrivalTime": "18:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-15",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:30",
    "arrivalTime": "18:40",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-16",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:00",
    "arrivalTime": "19:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-usk-17",
    "origin": "Kabataş",
    "destination": "Üsküdar",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "20:00",
    "arrivalTime": "20:10",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-0",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:00",
    "arrivalTime": "07:10",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-1",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "07:30",
    "arrivalTime": "07:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-2",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:00",
    "arrivalTime": "08:10",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-3",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "08:30",
    "arrivalTime": "08:40",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-4",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:00",
    "arrivalTime": "09:10",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-5",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "09:45",
    "arrivalTime": "09:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-6",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "10:45",
    "arrivalTime": "10:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-7",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "11:45",
    "arrivalTime": "11:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-8",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "12:45",
    "arrivalTime": "12:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-9",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "13:45",
    "arrivalTime": "13:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-10",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "14:45",
    "arrivalTime": "14:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-11",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "15:45",
    "arrivalTime": "15:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-12",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "16:45",
    "arrivalTime": "16:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-13",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:15",
    "arrivalTime": "17:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-14",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "17:45",
    "arrivalTime": "17:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-15",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:15",
    "arrivalTime": "18:25",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-16",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "18:45",
    "arrivalTime": "18:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-usk-kab-17",
    "origin": "Üsküdar",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "BOGAZ",
    "departureTime": "19:45",
    "arrivalTime": "19:55",
    "platform": "Dentur Üsküdar İskelesi",
    "price": "₺27.00"
  },
  {
    "id": "den-kab-buy-0",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "09:00",
    "arrivalTime": "10:00",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "09:15"
      },
      {
        "name": "Kınalıada",
        "time": "09:40"
      },
      {
        "name": "Heybeliada",
        "time": "09:50"
      }
    ]
  },
  {
    "id": "den-kab-buy-1",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "10:30",
    "arrivalTime": "11:30",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "10:45"
      },
      {
        "name": "Kınalıada",
        "time": "10:10"
      },
      {
        "name": "Heybeliada",
        "time": "10:20"
      }
    ]
  },
  {
    "id": "den-kab-buy-2",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "12:00",
    "arrivalTime": "13:00",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "12:15"
      },
      {
        "name": "Kınalıada",
        "time": "12:40"
      },
      {
        "name": "Heybeliada",
        "time": "12:50"
      }
    ]
  },
  {
    "id": "den-kab-buy-3",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "13:30",
    "arrivalTime": "14:30",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "13:45"
      },
      {
        "name": "Kınalıada",
        "time": "13:10"
      },
      {
        "name": "Heybeliada",
        "time": "13:20"
      }
    ]
  },
  {
    "id": "den-kab-buy-4",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "15:00",
    "arrivalTime": "16:00",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "15:15"
      },
      {
        "name": "Kınalıada",
        "time": "15:40"
      },
      {
        "name": "Heybeliada",
        "time": "15:50"
      }
    ]
  },
  {
    "id": "den-kab-buy-5",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "16:30",
    "arrivalTime": "17:30",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "16:45"
      },
      {
        "name": "Kınalıada",
        "time": "16:10"
      },
      {
        "name": "Heybeliada",
        "time": "16:20"
      }
    ]
  },
  {
    "id": "den-kab-buy-6",
    "origin": "Kabataş",
    "destination": "Büyükada",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "18:00",
    "arrivalTime": "19:00",
    "platform": "Dentur Kabataş İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Beşiktaş",
        "time": "18:15"
      },
      {
        "name": "Kınalıada",
        "time": "18:40"
      },
      {
        "name": "Heybeliada",
        "time": "18:50"
      }
    ]
  },
  {
    "id": "den-buy-kab-0",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "10:15",
    "arrivalTime": "11:15",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "10:25"
      },
      {
        "name": "Kınalıada",
        "time": "10:35"
      },
      {
        "name": "Beşiktaş",
        "time": "10:00"
      }
    ]
  },
  {
    "id": "den-buy-kab-1",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "11:45",
    "arrivalTime": "12:45",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "11:55"
      },
      {
        "name": "Kınalıada",
        "time": "11:05"
      },
      {
        "name": "Beşiktaş",
        "time": "11:30"
      }
    ]
  },
  {
    "id": "den-buy-kab-2",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "13:15",
    "arrivalTime": "14:15",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "13:25"
      },
      {
        "name": "Kınalıada",
        "time": "13:35"
      },
      {
        "name": "Beşiktaş",
        "time": "13:00"
      }
    ]
  },
  {
    "id": "den-buy-kab-3",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "14:45",
    "arrivalTime": "15:45",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "14:55"
      },
      {
        "name": "Kınalıada",
        "time": "14:05"
      },
      {
        "name": "Beşiktaş",
        "time": "14:30"
      }
    ]
  },
  {
    "id": "den-buy-kab-4",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "16:15",
    "arrivalTime": "17:15",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "16:25"
      },
      {
        "name": "Kınalıada",
        "time": "16:35"
      },
      {
        "name": "Beşiktaş",
        "time": "16:00"
      }
    ]
  },
  {
    "id": "den-buy-kab-5",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "17:45",
    "arrivalTime": "18:45",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "17:55"
      },
      {
        "name": "Kınalıada",
        "time": "17:05"
      },
      {
        "name": "Beşiktaş",
        "time": "17:30"
      }
    ]
  },
  {
    "id": "den-buy-kab-6",
    "origin": "Büyükada",
    "destination": "Kabataş",
    "operator": "Dentur Avrasya",
    "category": "ADALAR",
    "departureTime": "19:15",
    "arrivalTime": "20:15",
    "platform": "Dentur Büyükada İskelesi",
    "price": "₺55.00",
    "stops": [
      {
        "name": "Heybeliada",
        "time": "19:25"
      },
      {
        "name": "Kınalıada",
        "time": "19:35"
      },
      {
        "name": "Beşiktaş",
        "time": "19:00"
      }
    ]
  }
];
