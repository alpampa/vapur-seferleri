/**
 * TRAFFIC RESTRICTION: "İSTANBUL DENİZ ULAŞIMI FIRMA AJANI" TİPLERİ
 */

/** Duyuru tipi */
export type AnnouncementType = "CANCELLATION" | "CANCELLED_TRIPS" | "SCHEDULE_CHANGE" | "INFO" | "EXTRA_SERVICE" | "WEATHER";

export interface OperatorAnnouncement {
  id: string;
  operator: string;
  title: string;
  /** Duyuru özeti / gövdeden çıkarılan ilk paragraf */
  body?: string;
  type: AnnouncementType;
  /** Etkilenen hat adları (bilinen isimlerle eşleşirse) */
  affectedLines?: string[];
  /** Metinde geçen sefer saatleri (ör. iptal duyurusundaki saatler) */
  mentionedTimes?: string[];
  /** Metinde geçen iskele / güzergâh adları */
  mentionedPiers?: string[];
  publishedAt?: string;
  /**
   * `publishedAt` kaynağı:
   *  - SOURCE: tarih resmî sayfadan okundu (güvenilir).
   *  - SCAN_DAY: kaynak tarih vermediği için tarama günü damgalandı; arşivden
   *    okunurken bugüne taşınır (bayat iptal gösterilmez, geçerli iptal kaybolmaz).
   */
  publishedAtSource?: "SOURCE" | "SCAN_DAY";
  sourceUrl: string;
  /** Canlı çekimde görülen flag (uydurma değil, kaynaktan geliyor) */
  sourceVerified: boolean;
}

/** Duyuru → sefer eşleştirme sonucu (uygulamaya işlenir) */
export type DisruptionKind = "CANCELLED" | "DELAYED" | "EXTRA" | "SCHEDULE_CHANGE";

/**
 * Eşleştirme güven düzeyi.
 *  - CONFIRMED: duyuru resmî "İptal Seferler:" hat listesiyle birebir eşleşti.
 *  - UNCERTAIN: yalnızca iskele/saat sezgisiyle bağlandı (belirsiz — yolcuya
 *    "kesin iptal" gibi gösterilmez, "olası" olarak işaretlenir).
 * YANLIŞ İPTAL ÖNLEME: belirsiz eşleşmeler kullanıcıya iptal diye sunulmaz.
 */
export type DisruptionConfidence = "CONFIRMED" | "UNCERTAIN";

/**
 * Bozulmanın kaynak tazeliği.
 *  - FRESH: canlı taramadan bu turda doğrulandı.
 *  - STALE: kaynak bu turda erişilemedi; son doğrulanmış snapshot gösteriliyor.
 *  - UNKNOWN: tazelik bilinmiyor.
 */
export type DisruptionFreshness = "FRESH" | "STALE" | "UNKNOWN";

export interface TripDisruption {
  operator: string;
  /** Eşleşen RawOfficialTrip.id */
  tripId: string;
  kind: DisruptionKind;
  /** Duyuru başlığı/özeti */
  announcementTitle: string;
  announcementId: string;
  /** Ek açıklama (örn. neden) */
  reason?: string;
  /** Duyurunun geçerlilik tarihi/tarihi aralığı (YYYY-MM-DD) */
  validDate?: string;
  /** Eşleştirme güveni (yoksa CONFIRMED kabul edilir) */
  confidence?: DisruptionConfidence;
  /** Kaynak tazeliği (yoksa UNKNOWN) */
  freshness?: DisruptionFreshness;
}

export interface AnnouncementsSnapshot {
  operator: string;
  fetchedAt: string;
  sourceUrl: string;
  announcements: OperatorAnnouncement[];
}

export interface DisruptionsStore {
  updatedAt: string;
  disruptions: TripDisruption[];
}
