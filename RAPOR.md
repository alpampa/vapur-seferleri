# FerryFlow — Bağımsız Test Raporu

- **Tarih:** 18 Ekim 2026, ~23:40 (yerel saat, Europe/Istanbul)
- **Kapsam:** `apps/web` (Vapur / FerryFlow — İstanbul deniz ulaşımı PWA)
- **Ortam:** Windows, Chromium (Playwright), `next start` :3000, güncel production build (`npm run build`)
- **Yöntem:** Gerçek tarayıcıda uçtan uca davranış denetimi. Kaynak kodu **değiştirilmedi**; yalnızca yeni test dosyası eklendi.
- **Yeni test dosyası:** `apps/web/e2e/independent-audit.spec.ts`
- **Çalıştırma:** `npx playwright test e2e/independent-audit.spec.ts --reporter=list,html`
- **Kanıtlar:** `apps/web/playwright-report/` (ekran görüntüleri + JSON). Görüntüleme: `npx playwright show-report`

---

## 1. Özet

| Suite | Sonuç |
|---|---|
| **Bağımsız denetim** (`independent-audit.spec.ts`) | **20/20 geçti** (53,1 sn) |
| Smoke (`smoke.spec.ts`) | 5/5 |
| Birim (`src/**/__tests__`) | 188/188 |
| Typecheck | Temiz |

Bağımsız denetimde geçen/kalan test yok; bulunanlar aşağıda **kritik/dikkate değer** başlığında listelenmiştir. Üretim kodu üzerinde hiçbir değişiklik yapılmamıştır.

---

## 2. Geçen Testler

| # | Test | Sonuç / kanıt |
|---|---|---|
| 1 | Ana sayfa yüklenir — desktop 1280×800 | overflow=0, consoleErr=0, pageErr=0, 5xx=0 |
| 2 | Ana sayfa yüklenir — mob 320×640 | aynı |
| 3 | Ana sayfa yüklenir — mob 360×740 | aynı |
| 4 | Ana sayfa yüklenir — mob 390×844 | aynı |
| 5 | Ana sayfa yüklenir — mob 430×932 | aynı |
| 6 | Küçük dokunma hedefleri — her viewport | bkz. §4.4 |
| 7 | Arama (Büyükada) | Boş-durum: "…eşleşen aktif vapur seferi bulunamadı" (23:36 → zaman bağımlı) |
| 8 | İskele rehberi araması (Kadıköy, mob-360) | hasResult=true |
| 9 | Rota planlama (`/live-map`) | plannedDefault=true, selectCount=2, disabledSameName=true, changed=true |
| 10 | Sefer sonuçları: kart açılır + detay + Aktarma sekmesi | cardCount=5, walk=true, turnstile=true |
| 11 | Hata durumu: bilinmeyen yol | 404 döner |
| 12 | Duyurular API + banner | apiStatus=200, announcementCount=3, disruptionCount=687, bannerVisible=true |
| 13 | Hata dayanıklılığı (API abort) | Ana sayfa yine açılıyor (navVisible=true) |
| 14 | Çevrimdışı (mob-320) | controlled=true, offlineNav=true, bodyLen=3005 |
| 15 | Çevrimdışı (mob-390) | aynı |
| 16 | Çalışmayan buton taraması (profil) | bkz. §4.1 |

Tüm viewport'larda **yatay taşma yok**, konsol/sayfa hatası yok, 5xx yok.

---

## 3. Başarısız Testler

Nihai koşuda **başarısız test yoktur.**

İlk koşuda 1 yapay zaman aşımı görüldü:
- **Test:** `rota planlama: sonuç veya açık boş-durum (desktop)`
- **Belirti:** `Test timeout of 60000ms exceeded`
- **Kök neden:** *Uygulama hatası değil, test hatası.* `/live-map`'te hedef menüsünde kaynak iskelesiyle **aynı** iskele devre dışı bırakılıyor (doğru davranış). Test bu devre dışı seçeneği seçmeye çalışınca `selectOption` 30 sn bekledi, iki adımda 60 sn aşıldı.
- **Düzeltme:** Test, geçerli (etkin) bir hedef seçecek ve varsayılan seçimle sonuç/boş-durum doğrulayacak şekilde güncellendi. Sonuç: geçiyor.

---

## 4. Kritik / Dikkate Değer Bulgular

### 4.1 Çalışmayan butonlar — `/profile`
Tıklamada **hiçbir durum değişikliği olmayan** (dead/no-op) satırlar:

| Etiket | changed |
|---|---|
| Payment Methods | false |
| Notifications | false |
| Log Out | false |

`/profile` (ve ilgili `/pro`) işlevsiz bir ekran. Önceden envanter raporunda işaretlenen "ölü sayfa" bulgusu bağımsız testle **doğrulandı**.

**19 Ekim: düzeltildi.** Ekran gerçek işlevlere bağlandı: Notifications artık tarayıcı bildirim iznini isteyen gerçek bir anahtar; Payment Methods ölü buton olmaktan çıkarılıp dürüst "kayıtlı ödeme yöntemi yok" bilgisine dönüştürüldü; "Log Out" → "Clear Local Data" (favoriler/tercihler/önbellek temizleme). Sahte kimlik ("John Doe / john.doe@example.com / Verified") kaldırıldı; FavoritesList mock veriden gerçek `useFavoritesStore`'a bağlandı (bkz. §9).

### 4.2 Harita döşemesi hatası — `/live-map`
- **43 konsol hatası** ve **48 başarısız harici istek**; tamamı `tiles.openseamap.org/seamark/` → **HTTP 503**.
- Etki: gemisi/şamandıra (seamark) overlay katmanı çizilemiyor. ArcGIS taban haritası çalışıyor, sayfa hatası (pageerror) yok; harita temel işlevini sürdürüyor.
- Kaynak kod referansı: `server.arcgisonline.com` + `tiles.openseamap.org/seamark/` kaplama kullanımı.
- **19 Ekim: üst kaynak iyileşti** — `tiles.openseamap.org/seamark/...` şu an **HTTP 200** döndürüyor (denetim anındaki 503 geçiciydi). Kalıcı dayanıklılık için katman artık yoklanarak ekleniyor: erişilemezse katman hiç eklenmez ve dürüst bir "Deniz işaretleri katmanı kullanılamıyor — taban harita aktif" notu gösterilir (`src/lib/utils/seamark-layer.ts`).

### 4.3 Veri boşluğu — Şehir Hatları zaman çizelgesi  *(19 Ekim: doğrulandı — kod/veri hatası DEĞİL)*
- Toplam ŞH kaydı: **855**
- `stops` **boş**: **328 (%38)** → kategori dağılımı `{ BOGAZ: 320, ADALAR: 8 }`
- `arrivalTime` **boş**: **241** (tümü BOGAZ)
- **Düzeltme (kanıtlı):** İlk raporda "eksik veri" olarak işaretlenen bu kayıtlar resmî kaynakla **birebir uyumludur**, uydurma düzeltme gerekmez:
  - Boş `stops`, **iki iskeleli direkt hatlar** (İstinye↔Çubuklu, Kabataş↔Kadıköy, Beykoz↔Sarıyer — resmî sayfalarda yalnızca bu iki iskele vardır) ve **ring hatları** (dönüş iskelesini duraklarında içerir) içindir; arada iskele **yoktur**.
  - Boş `arrivalTime` yalnızca Boğaz hatlarındadır; resmî tablo "Kalkış" dışında "Varış" **yayınlamaz** (ör. `uskudar-asiyan-2015` → "Varış var mı: false"). Süre, rota motoru tarafından kestirilir.
  - **İlk rapordaki "Kabataş 21:40 → Bostancı ara durakları kayıp" iddiası YANLIŞTI.** `sh-2026-3116` kaydı ara durakları **tam** içerir: Kadıköy 22:05, Kınalıada 22:40, Burgazada 22:55, Heybeliada 23:10, Büyükada 23:30.
  - Regresyon testi: `src/lib/services/__tests__/route-planner-scraped-data.test.ts` (6 test) — sayımlar, Kabataş→Bostancı durakları, gece yarısı geçişi (23:30→01:15) doğrulanır.

### 4.4 Küçük dokunma hedefleri (<40px)

| Viewport | Hedef | Ölçü |
|---|---|---|
| Tüm mobil (320/360/390/430) | "Duyuru detayını aç" | 2041×**32**px |
| Desktop 1280 | Ayarlar | 84×**36** |
| Desktop 1280 | Tema seç | 72×**36** |
| Desktop 1280 | Sesli rehberi aç | 82×**36** |
| Desktop 1280 | Önbelleği temizle ve sayfayı yenile | 69×**36** |

Bilgilendirici; hard-fail eşiği değil.

### 4.5 Çevrimdışı — ilk açılış davranışı
- Service worker sayfayı kontrol **ettikten sonra** çevrimdışı yeniden yükleme: **çalışıyor** (`/` önbellekten geliyor, nav görünür, hata yok).
- İlk gezinmede (SW henüz kontrol etmezken) çevrimdışı olunursa `/` → **503 Service Unavailable** (cache miss). Bu, kullanıcı ilk kez çevrimdışı açtığında shell'in gelmemesi anlamına gelir.
- **19 Ekim: düzeltildi.** SW sayfayı kontrol eder etmez navigasyon kabuğu SW üzerinden bir kez ısıtılıyor; ayrıca navigasyon fallback'i `Vary` başlığı yüzünden oluşan eşleşme hatasını `ignoreVary` ile aşıyor (`public/sw.js`). Artık ilk çevrimdışı yenilemede de kabuk gelir (kanıt: `offline-320/390 → offlineNav=true, 5xx=0`). Önbellekte hiç yoksa düz metin 503 yerine Türkçe çevrimdışı sayfası gösterilir.

---

## 5. Resmî Kaynak Karşılaştırması (madde 7 — yapıldı)

Resmî kaynaklar erişilebilirdi (hepsi HTTP 200): `sehirhatlari.istanbul`, `turyol.com`, `denturavrasya.com`.

**Şehir Hatları — Kabataş–Adalar hattı** (`/tr/seferler/ic-hatlar/adalar-hatlari/kabatasadalar-177`) ile uygulama verisi karşılaştırıldı:

| Alan | Uygulama | Resmî | Sonuç |
|---|---|---|---|
| Kalkış (Kabataş) | 23:30 | 23:30 | ✅ |
| Kadıköy | 23:55 | 23:55 | ✅ |
| Kınalıada | 00:30 | 00:30 | ✅ |
| Burgazada | 00:45 | 00:45 | ✅ |
| Heybeliada | 01:00 | 01:00 | ✅ |
| Varış (Büyükada) | 01:15 | 01:15 | ✅ |
| Ücret (Adalar tam) | 151,23 ₺ | 151,23 ₺ | ✅ |

- Saatler ve durak sırası **birebir eşleşiyor**.
- Ücret: uygulama `official-fares` üzerinden **151,23 ₺** çözüyor; scrape'teki bayat `₺45.00` alanı yok sayılıyor → **doğru davranış**.
- Turyol ve Dentur ana sayfaları 200 döndü; içerik bazlı saat karşılaştırması bu turda yapılmadı.

---

## 6. Doğrulanamayan İddialar

Bu turda **doğrulanamadı** (kapsam/cihaz/ağ dışı):

- Gerçek iOS/Android cihaz davranışı ve gerçek PWA kurulumu
- Ekran okuyucu (VoiceOver / NVDA) ile gezinme
- Gerçek AIS canlı gemi verisi akışı
- Push bildirimleri
- Ödeme / cüzdan işlemleri (yalnızca görsel; bakiye sabit 35 ₺ simülasyon)
- Lighthouse saha (field) verileri / Core Web Vitals
- `/api/audit`'in "canlı denetim" iddiası
- Admin/API kimlik doğrulaması (gömülü varsayılan yönetici anahtarı **gözlemlendi**, sömürülmedi)

---

## 7. Değişmeyen Engeller

- Vercel'den Şehir Hatları / Mavi Marmara **canlı çekimi 403** (WAF) → snapshot'lı fallback zorunlu.
- GitHub Actions **fatura blokesi** → gece senkronu otomatik değil.

---

## 8. Not

- İlk denetim turunda (`1`–`7` bölümleri) üretim kodu **değiştirilmedi**; yalnızca `apps/web/e2e/independent-audit.spec.ts` eklendi. Bulgular olduğu gibi belgelenmiştir.
- Düzeltmeler ayrı ve onaylı bir turda yapıldı (bkz. §9).

---

## 9. Uygulanan Düzeltmeler ve Doğrulama (18–19 Ekim 2026, onaylı tur)

### 9.0 P0 — Gösterilen bayat iptal duyuruları (kriz)
- **Belirti:** Tarih değişince dünün iptal duyuruları gösterilmeye devam ediyordu.
- **Kök neden:** `announcement-filter.ts` iptal filtresinde off-by-one (`diffDays > 1`).
- **Düzeltme:** İptal duyuruları yalnızca **yayınlandığı takvim günü** geçerli (`pubDate < curDate` → dışla); tarihsiz kayıtlar tarama günüyle damgalanıyor (`announcements-agent.ts` `toTrDate`).
- **Kanıt (gerçek sunucu):** `disruptionCount` 687 → **151**, `announcementCount` 3 → **2**, dünün (18.10.2026) duyurusu kalktı. Test: `announcement-filter.test.ts` (7 test).

### 9.1 P1 — Güvenlik
- **Bulgular:** Gömülü varsayılan admin anahtarı (`ZKIO-2026`) `admin-auth.ts` ve `api/ads/route.ts`'te; `?key=` sorgu-parametresiyle sızıntı; `/api/cron/scan-announcements` **yetkisiz**; `/api/sync` ve `/api/cron/sync-tariffs` **`User-Agent: vercel-cron` taklidiyle bypass**.
- **Düzeltme:** Yeni `cron-auth.ts` (yalnızca `CRON_SECRET` bearer; UA güveni kaldırıldı); `admin-auth.ts` gömülü varsayılan + `?key=` kaldırıldı (sır env'den, yoksa erişim reddedilir); tüm cron/sync uçları `verifyCronAuth`/`verifyAdminAuth` ile korundu.
- **Runtime matrisi (env set):** no-key 401, `ZKIO-2026` 401, `?key=` 401, UA-taklit 401; doğru sır 200. İstemci paketinde sır **yok** (`.next/static` taraması). Test: `auth-guards.test.ts` (9 test).
- **Kalan risk:** `ZKIO-2026` git geçmişinde bulunduğundan üretimde **rotate edilmeli**; üretimde `ADMIN_SECRET`/`CRON_SECRET` mutlaka tanımlanmalı.

### 9.2 P2 — ŞH veri bütünlüğü
- Bağımsız denetimin "eksik veri" bulgusu **doğrulanmadı** (bkz. §4.3): boş `stops`/`arrivalTime` kayıtları resmî kaynakla uyumlu. Veri düzeltmesi **yapılmadı** (uydurma yok). Regresyon testi eklendi (6 test).

### 9.3 P3 — İşlevsel hatalar
- **`/profile`:** ölü butonlar gerçek işlevlere bağlandı, sahte kimlik kaldırıldı, mock favoriler gerçek depoya çevrildi (bkz. §4.1).
- **Çevrimdışı ilk yükleme 503:** kabuk ısıtma + `ignoreVary` fallback + Türkçe çevrimdışı sayfası (bkz. §4.5).
- **OpenSeaMap 503:** üst kaynak şu an 200; katman yoklama + dürüst fallback eklendi (bkz. §4.2).

### 9.4 Doğrulama (bu tur)
| Kontrol | Sonuç |
|---|---|
| `npm run typecheck` | Temiz |
| Birim testler (`vitest run`) | **210/210** (188 → +7 filtre, +9 auth, +6 veri) |
| Bağımsız denetim (`independent-audit.spec.ts`) | **20/20** |
| Değişen dosyalarda `eslint` | Yeni dosyalar temiz (mevcut desenlerdeki uyarılar korunmuştur) |

### 9.5 Değişen/eklenen dosyalar (özet)
- Güvenlik: `src/lib/utils/cron-auth.ts` (yeni), `src/lib/utils/admin-auth.ts`, `src/app/api/ads/route.ts`, `src/app/api/sync/route.ts`, `src/app/api/cron/sync-tariffs/route.ts`, `src/app/api/cron/scan-announcements/route.ts`, `src/lib/utils/__tests__/auth-guards.test.ts` (yeni).
- P0: `src/lib/utils/announcement-filter.ts`, `src/lib/agents/announcements-agent.ts`, `src/lib/utils/__tests__/announcement-filter.test.ts` (yeni).
- P3: `src/app/profile/page.tsx`, `src/components/profile/FavoritesList.tsx`, `src/store/usePreferencesStore.ts`, `src/components/pwa/ServiceWorkerRegister.tsx`, `public/sw.js`, `src/lib/utils/seamark-layer.ts` (yeni), `src/components/map/MarineAisRadarModal.tsx`, `src/components/map/PierLiveAisRadarModal.tsx`.
- Test/veri: `src/lib/services/__tests__/route-planner-scraped-data.test.ts` (yeni), `e2e/independent-audit.spec.ts` (profil + çevrimdışı testleri güncellendi).

### 9.6 Hâlâ geçerli engeller
- Vercel'den ŞH/MM **canlı çekimi 403** (WAF) → snapshot'lı fallback zorunlu.
- GitHub Actions **fatura blokesi** → gece senkronu otomatik değil.
- 4 bozuk ŞH scrape kaydı ücret tablosunda eşleşmez → "—" (veri düzeltmesi onay dışı).
