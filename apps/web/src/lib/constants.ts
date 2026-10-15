/**
 * Uygulama genelindeki kritik eşik değerleri — tek kaynak.
 * Magic number yerine anlamlı isimler; davranış değişikliği buradan yönetilir.
 */

/** Kalkıştan sonra seferin "kalktı" olarak gösterildiği süre (ms) */
export const DEPARTED_GRACE_MS = 30_000;

/** Canlı MM:SS geri sayım çipinin gösterildiği son pencere (ms) */
export const LIVE_COUNTDOWN_WINDOW_MS = 5 * 60_000;

/** "Biniyor" (BOARDING) durumuna geçilen eşik (ms) */
export const BOARDING_THRESHOLD_MS = 2 * 60_000;

/** Bir dakikanın milisaniye cinsinden değeri (tek kaynak) */
export const MS_PER_MINUTE = 60_000;

/**
 * Turnike + rampa geçiş payı (dk).
 *
 * Bu bir RESMÎ kapı kapanış saati DEĞİLDİR; yolcunun turnikeden geçip
 * rampadan vapura inmesi için önerilen güvenlik payıdır. Uydurma operasyonel
 * veri üretmemek için "son giriş" hesabı bu pay üzerinden yapılır ve arayüzde
 * her zaman "tahmini" olarak etiketlenir.
 *
 * Not: Bu değer daha önce `CatchFerryWalkingTimer` içinde gömülüydü (3 dk);
 * tek doğruluk kaynağı olması için buraya taşındı.
 */
export const TURNSTILE_GANGWAY_BUFFER_MIN = 3;

/** Yürüme hızı varsayımı: 4.8 km/sa ≈ 80 metre/dk (tek kaynak) */
export const WALKING_METERS_PER_MINUTE = 80;

/** "Son giriş" uyarısının gösterildiği son pencere (dk) */
export const LAST_ENTRY_WARNING_WINDOW_MIN = 10;

/** "Yaklaşan seferler" (≤15 dk) filtresi eşiği (ms) */
export const IMMINENT_DEPARTURE_MS = 15 * 60_000;

/** Varış saati bilinmiyorsa duraklar arası tahmini yolculuk süresi (dk) */
export const ESTIMATED_TRAVEL_MIN_PER_HOP = 20;

/** Aktarma planlaması: aktarma iskelesine tahmini varış süresi (dk) */
export const TRANSFER_HUB_TRAVEL_MIN = 35;

/** Aktarma planlaması: minimum bekleme süresi (dk) */
export const TRANSFER_MIN_WAIT_MIN = 10;

/** Aktarma planlaması: maksimum bekleme süresi (dk) */
export const TRANSFER_MAX_WAIT_MIN = 120;

/** Planlamaya alınmayacak kadar geçmiş kalkışlar için tolerans (dk) */
export const PAST_DEPARTURE_TOLERANCE_MIN = 5;

/** Bir günün dakika cinsinden uzunluğu (gün sarması ve gece kaydırma hesapları için tek kaynak) */
export const MINUTES_PER_DAY = 1440;

/**
 * Y4 — İki kademe tick (two-tier tick):
 * Ana liste sakin modda 15 sn'de bir yeniden hesaplanır; yalnızca canlı MM:SS
 * geri sayım penceresine (LIVE_COUNTDOWN_WINDOW_MS + tampon) giren görünür sefer
 * varken saniyelik kademeye geçilir. Dakika hassasiyeti için 15 sn yeterlidir.
 */
export const SLOW_TICK_INTERVAL_MS = 15_000;

/** Hızlı kademeye geçiş eşiği: bu kadar dakikadan az kalan sefer varken 1 sn tick (canlı pencere + 1 dk tampon) */
export const FAST_TICK_THRESHOLD_MIN = Math.ceil(LIVE_COUNTDOWN_WINDOW_MS / 60_000) + 1;

/** Gece seferi kalkış aralığının sonu: 00:00–04:59 kalkışlar "gece" sayılır */
export const NIGHT_DEPARTURE_END_HOUR = 5;

/** Gece yarısı kaydırmasının devreye girdiği akşam saati (20:00 ve sonrası) */
export const EVENING_ROLLOVER_START_HOUR = 20;

/** Rota planlayıcının döndürdüğü maksimum sonuç sayısı */
export const MAX_ROUTE_RESULTS = 10;
