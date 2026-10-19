# FerryFlow — Her Dakika İptal Takip Ajanı (Final Rapor)

**Tarih:** 19.10.2026
**Kapsam:** İstanbul deniz ulaşımı — mevcut 5 operatör (Şehir Hatları, Dentur Avrasya, Mavi Marmara, Turyol, Prens Tur)
**Karar özeti:** Kalıcılık = Upstash/Vercel KV (REST, yeni npm bağımlılığı yok) · Zamanlama = Vercel Pro `* * * * *` (gerçek 60 sn) · Firma kapsamı = mevcut 5 firma

---

## 1. Kapsam ve dinamik firma tespiti

- Tek doğruluk kaynağı `OPERATOR_REGISTRY` (+ `ANNOUNCEMENT_SOURCES` / `OPERATOR_SCAN_COVERAGE`) korunarak genişletildi.
- Kaynağı olan 4 firma adaptörle taranır; kaynağı olmayan **Prens Tur** sessizce atlanmaz, `NO_SOURCE` + kanıtlı not olarak raporlanır.
- `OPERATOR_SCAN_COVERAGE`, registry'den türetildiği için yeni firma eklendiğinde UI, API, cron ve izleme otomatik kapsar.
- Her firma için ayrı parser/adaptör vardır; HTML yapılarının aynı olduğu varsayılmaz.

## 2. Kaynak adaptörleri ve görsel ibare yorumlama

Mevcut, gerçek sayfalarla doğrulanmış parser'lar korunup izleme hattına bağlandı:

| Firma | Kaynak | Yorumlanan ibare |
|---|---|---|
| Şehir Hatları | `sehirhatlari.istanbul/tr/iptal-seferler` | `iptal`, `gerçekleştirilemeyecektir`, `İptal Seferler:` hat listesi, tarih |
| Dentur Avrasya | `denturavrasya.com/tr-TR/duyurular` | duyuru slug'ından tip sınıflandırma |
| Mavi Marmara | `durum.mavimarmara.net/feed.json` | `running` / `disrupted` / `cancelled` |
| Turyol | `turyol.com/Home/AktifPopupDuyurulari` | birebir popup metni; `İPTAL EDİLMİŞTİR` |
| Prens Tur | — | kaynak yok (`NO_SOURCE`, 404 kanıtlı) |

- Metin hiçbir zaman üretilmez; yalnızca resmî sayfadaki ifade işlenir.
- Tarihsiz kaynaklar tarama günüyle damgalanır (`publishedAtSource: "SCAN_DAY"`), arşivden okunurken bugüne taşınır. Böylece geçerli iptal kaybolmaz, dünkü iptal bugüne taşınmaz.

## 3. 60 saniyelik sunucu zamanlaması ve gerçek kısıt

- `api/cron/monitor` uç noktası 60 sn'lik turları çalıştırmaya hazırdır.
- **Gerçek kısıt (doğrulandı):** Vercel hesabı **Hobby**; `* * * * *` cron deploy'u reddediyor ("Hobby accounts are limited to daily cron jobs"). Bu nedenle per-minute cron `vercel.json`'dan çıkarıldı ve deploy tamamlandı; günlük 21:05 taraması korundu.
- 60 sn'lik tur için iki yol:
  1. **Vercel Pro'ya geç** ve `vercel.json`'a `{"path": "/api/cron/monitor", "schedule": "* * * * *"}` satırını geri ekle.
  2. **Harici tetikleyici** (Pro'suz): cron-job.org / benzeri bir servisle her 60 sn `GET https://vapur-seferleri.vercel.app/api/cron/monitor` + `Authorization: Bearer <CRON_SECRET>`. `CRON_SECRET` Vercel'de tanımlıdır; harici servise girmek için değeri sizin belirlemeniz gerekir (`vercel env rm CRON_SECRET production` → `vercel env add CRON_SECRET production`).
- `CRON_SECRET` tanımlıysa Vercel cron `Authorization: Bearer <secret>` başlığını otomatik ekler; harici tetikleyici de aynı başlığı göndermelidir. Yetkisiz istek **401** alır.
- Cron tetiklenmesi ile başarılı kontrol AYRI ölçülür (`checksAttempted` / `checksSucceeded` / `checksFailed`).
- Kaynak dostu davranış: başarısız kaynak için üstel backoff (1 dk → 2 dk → 4 dk … üst sınır 15 dk). Backoff sırasında kaynak taranmaz (`skippedByBackoff`).

## 4. Duyuru → sefer eşleştirme ve güven düzeyi

- `matchAnnouncementToTrips` korunarak güven etiketi eklendi:
  - **CONFIRMED** — resmî `İptal Seferler:` hat zinciriyle birebir eşleşme.
  - **UNCERTAIN** — yalnızca iskele/saat sezgisi.
- `ScheduleListClient` artık **yalnızca CONFIRMED** eşleşmeleri kartlarda `CANCELLED` yapar. Belirsiz eşleşme yanlış iptal üretmez; duyuru metni yine bantta görünür.
- Eşleşme yoksa boş dizi döner (uydurma yok).

## 5. Kaynak arşivi + değişiklik geçmişi

- Kalıcı depo: `vapur:monitor:state` (tek anahtar). İçinde:
  - `health` — firma sağlığı
  - `prev` — önceki duyuru id/hash/cancel set'i
  - `history` — son 200 değişiklik olayı
  - `last` — son tur özeti
  - `archives` — firma → son doğrulanmış duyuru kümesi
- Olay tipleri: `ANNOUNCED`, `UPDATED`, `REMOVED`, `CANCELLATION_REMOVED`, `RECOVERED`, `UNREACHABLE`.
- **“İptal kaldırıldı”** ayrı olaydır: iptal duyurusu kaynaktan kalkarsa `CANCELLATION_REMOVED`.
- Yazma verimliliği: tur başına **1** durum yazımı; arşiv yalnızca içerik değiştiğinde güncellenir. Tur başına **1** okuma.
- Upstash REST `fetch` ile çağrılır → **yeni paket/lockfile değişikliği yok**. Env yoksa süreç-içi yedeğe düşer (uygulama çökmez).

## 6. Kullanıcıya güvenilir durum

`/api/announcements` yanıtına eklendi:

- `sourceHealth` — firma bazlı `OK / UNREACHABLE / NO_SOURCE / DEGRADED`
- `recentChanges` — son değişiklik olayları
- her iptal kaydında `freshness`: `FRESH / STALE / UNKNOWN`
- `confidence`: `CONFIRMED / UNCERTAIN`

Davranış:
- Kaynak bu turda doğrulandıysa arşivden **FRESH** veri sunulur.
- Kaynak erişilemezse son doğrulanmış veri **STALE** olarak işaretlenir; duyuru bandında **“DOĞRULANAMADI”** rozeti görünür.
- Kaynak hiç yoksa `NO_SOURCE` + kanıtlı not.
- Veri sessizce kaybolmaz; sahte iptal üretilmez.

## 7. Sağlık izleme ve ölçüm

- `GET /api/source-health` (herkese açık, tarama tetiklemez): `persistent`, `storage`, `intervalMs`, `operators[]`, `lastTick`, `recentChanges`.
- `GET /api/cron/monitor`: `CRON_SECRET` bearer zorunlu; tur sonucunu döner. Tüm kaynaklar başarısızsa **502**, en az biri başarılıysa 200.
- `lastTick` içinde: `triggeredAt`, `durationMs`, `checksAttempted/Succeeded/Failed`, `noSource`, `skippedByBackoff`, `operators[]`, `changes[]`, `persisted`, `storage`.
- Sağlık kaydı: `consecutiveFailures`, `lastOkAt`, `lastError`, `backoffUntil`, `latencyMs`, `announcementCount`.

## 8. Testler (gerçek kaynak fixture'larıyla)

Yeni testler (**20 yeni** → güncel toplam **230/230**):

- `src/lib/agents/__tests__/kv-store.test.ts` (5): set/get, TTL, JSON, bozuk JSON.
- `src/lib/agents/__tests__/announcement-monitor.test.ts` (15):
  - diff: ANNOUNCED / UPDATED / REMOVED / CANCELLATION_REMOVED / idempotent
  - hash determinizmi
  - `restampSyntheticDates` (SCAN_DAY → bugün, SOURCE'a dokunmaz)
  - backoff: 1 dk → 2 dk, başarıda sıfırlama, NO_SOURCE başarısızlık saymaz
  - uçtan uca: 4/4 başarı, kalıcı yazım, ikinci tur idempotent
  - kaynak çökünce UNREACHABLE + backoff + sonraki tur atlanır
  - operatör filtresi
  - kaynak sonradan çökse de **arşiv korunur**

Testler gerçek resmî sayfa fixture'larını kullanır: `sehirhatlari-iptal-seferler-17102026.html`, `dentur-duyurular.html`, `mavi-marmara-durum-feed.json`, `turyol-aktif-popup.html`.

## 9. Uçtan uca doğrulama (gerçek çalıştırma)

`npm run build` → başarılı. `npx next start` ile üretim sunucusu ayağa kaldırıldı:

| Kontrol | Sonuç |
|---|---|
| Yetkisiz cron | `401` |
| Yetkili cron (canlı ağ) | `checksAttempted=4`, `checksSucceeded=4`, `checksFailed=0`, `persisted=true`, 23 değişiklik |
| Sağlık | 4 firma `OK`, Prens Tur `NO_SOURCE` |
| `/api/announcements` (arşivden) | `200`, **163 ms**, 3 duyuru, 277 iptal, `freshness=FRESH`, coverage notu “Dakikalık izleme arşivi” |
| Ağ kapalıyken cron | `502`, `attempted=4`, `succeeded=0`, `failed=4`, `noSource=1` — yanlış iptal YOK |
| Ağ kapalıyken `/api/announcements` | `200`, fallback, coverage `FAILED(fallback)`, `freshness=STALE` |
| Backoff | üst üste hatalarda `backoffUntil` + `skippedByBackoff` doğrulandı |

> Not: “Test dosyasının geçmesi canlı takibi kanıtlamaz” ilkesine uyularak cron uç noktası gerçekten çalıştırıldı; başarı ve başarısızlık yolları ayrı ayrı gözlendi. Canlı başarı turu 19.10.2026 15:16 UTC'de 4/4 kaynakla alındı.

Mevcut Playwright denetim paketi (`e2e/independent-audit.spec.ts`): **20/20**. Bu sırada testteki bir `.or()` birleşiminin birden fazla karta eşleşip strict-mode ihlali verdiği görüldü; `.first()` birleşimin sonuna taşındı (uygulama değil, assertion düzeltildi).

## 10. Kurulum, bilinen sınırlar ve yapılacaklar

### Üretim kurulumu (zorunlu)
1. Upstash Redis (veya Vercel KV) oluştur.
2. Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` **veya** `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
3. Env: `CRON_SECRET` — **production'a eklendi** (değer gizli).
4. 60 sn'lik tur için **Vercel Pro** + per-minute cron satırını geri ekle **veya** harici 60 sn tetikleyici kullan (bkz. §3).
5. Deploy sonrası doğrula:
   - `GET /api/source-health` → `persistent: true`, `lastTick.checksSucceeded > 0`
   - `GET /api/version`
6. Mevcut `ZKIO-2026` değeri git geçmişinde göründüğü için **rotate edilmeli**.

### Bilinen sınırlar
- Vercel'de in-memory yedek örnek başınadır; **kalıcı geçmiş için KV env zorunludur** (`persistent:false` bunu açıkça gösterir).
- Kaynak istek bütçesi: dakikada ~4 kaynak isteği (+ yalnızca yeni iptal gövdesi geldiğinde en fazla 3 detay isteği). Backoff ve 1 yazma/tur ile makul sınırda tutuldu.
- Canlı başarı testi bu ortamda ağ açıkken alındı; ağ kapalı ortamda başarısızlık yolu doğrulandı.
- Prens Tur için web'de makine-okunur iptal kaynağı yok; `NO_SOURCE` olarak kalır (uydurma yok).
- Tarihsiz kaynaklarda (MM/Turyol) yayın günü kuralı, kaynak aynı içeriği günlerce yayınlarsa arşiv re-stamp ile korunur; yine de “kaynak gerçeği” sınırı geçerlidir.

### Bu görevde eklenen/değişen dosyalar
**Yeni:** `src/lib/agents/kv-store.ts`, `monitor-types.ts`, `announcement-monitor.ts`, `src/app/api/cron/monitor/route.ts`, `src/app/api/source-health/route.ts`, `__tests__/kv-store.test.ts`, `__tests__/announcement-monitor.test.ts`, `IPTAL_TAKIP_RAPORU.md`.
**Değişen:** `src/lib/agents/announcements-agent.ts`, `announcement-trip-matcher.ts`, `src/lib/types/announcement.ts`, `src/app/api/announcements/route.ts`, `src/store/useAnnouncementStore.ts`, `src/hooks/useAnnouncements.ts`, `src/components/announcements/AnnouncementBanner.tsx`, `src/components/schedule/ScheduleListClient.tsx`, `vercel.json`.

### Komutlar
```powershell
cd apps/web
npm run typecheck   # temiz
npm test            # 230/230
npm run build       # başarılı
```
