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
  sourceUrl: string;
  /** Canlı çekimde görülen flag (uydurma değil, kaynaktan geliyor) */
  sourceVerified: boolean;
}

/** Duyuru → sefer eşleştirme sonucu (uygulamaya işlenir) */
export type DisruptionKind = "CANCELLED" | "DELAYED" | "EXTRA" | "SCHEDULE_CHANGE";

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
