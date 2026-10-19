# Vapur — Projeyi Sıfırdan Yapma Talimatı (Master Blueprint)

> **Bu doküman bir TALİMAT'tır, rapor değildir.** Amacı: İstanbul deniz ulaşımı uygulamasını (vapur + şehir hatları + deniz motorları) **sıfırdan** kurabilmek için izlenecek adımları, kuralları ve kabul kriterlerini tek yerde vermek.
> **Kullanım:** Fazları sırayla uygula. Her fazın sonunda "Kabul Kriteri"ni sağlamadan sonraki faza geçme. Köşeli parantezli `[...]` değerler karar/parametredir; sen belirleyeceksin.
> **Kural dili:** "yap", "oluştur", "şart" — bunlar zorunlu adımlardır.
> **Referans:** Bu talimat, `Vapur` deposundaki gerçek mimariye dayanır; ancak sıfırdan yapımı tarif eder, mevcut kodu kopyalamaz.

---

## 0. Değişmez İlkeler (her fazda geçerli)

1. **ASLA uydurma sefer saati veya ücret gösterme.** Bir veri doğrulanabilir resmî kaynaktan gelmiyorsa ya "Saatler doğrulanamıyor" ya da ücret için `"—"` göster ve rapora işle.
2. **Her önemli iddia kanıta bağlı olsun:** dosya yolu, fonksiyon adı, test sonucu.
3. **Gerçek zamanlı veri ile tahmini veriyi ayır.** Tahmin edilen her değer arayüzde "tahmini" etiketi taşısın (örn. seyir oranı, varış süresi).
4. **Gizli anahtarları koda gömme.** Yalnızca ortam değişkeni; istemciye yalnızca `NEXT_PUBLIC_*`.
5. **Mobil öncelikli tasarla; masaüstünü genişlet, daraltma değil.**
6. **Kod içine yorum yazma** (ürün kuralı) — istisna: karmaşık algoritmalarda kısa gerekçe.
7. **Kullanıcı dilinde, erişilebilir metin;** Türkçe büyük "İ"/"ı" normalizasyonunu her aramada uygula.

---

## 1. Vizyon ve Kapsam

**Ürün:** İstanbul'da Boğaz ve Adalar'a sefer yapan tüm operatörlerin (vapur, şehir hatları, deniz motoru) seferlerini; canlı durum, ücret, rota ve duyurularla birlikte tek bir PWA'da sunan uygulama.

**Kapsam içi:** İç hatlar, Boğaz hatları, Adalar hatları, iskele kalkış panosu, rota planlama (aktarmalı), ücret gösterimi, iptal/duyuru, hava durumu, favoriler, PWA/offline.
**Kapsam dışı (v1):** Bilet ödeme/satın alma, dış hatlar (Çınarcık/Esenköy), uluslararası hatlar, gerçek AIS/GPS sahipliği (link/entegrasyon ile sınırlı).

**Başarı ölçütü (v1):** Kullanıcı, kalkışa 5 dk kala doğru iskelenin saatini görebiliyor; doğrudan ve aktarmalı rota bulabiliyor; ücreti resmî kaynaktan görebiliyor; iptal seferi görebiliyor; internet kesildiğinde son görüntüyü açabiliyor.

---

## 2. Temel Kullanıcı Hikâyeleri (kabul için referans)

- Kullanıcı bir kalkış ve varış iskelesi seçip bugün/yarın seferleri listeleyebilmeli.
- Kullanıcı bir seferin kalkışına ≤5 dk kala geri sayımı ve ≤60 sn "SON ÇAĞRI"yı görebilmeli.
- Kullanıcı gemi seyir hâlindeyken "şu an hangi iskeleler arasında" ve tahmini varışı görebilmeli.
- Kullanıcı aktarmalı rota görebilmeli (bekleme süreleriyle).
- Kullanıcı sefer ücretini görebilmeli; resmî kaynak yoksa "—" görmeli.
- Kullanıcı favori iskele/hat kaydedip alarm kurabilmeli.
- Kullanıcı iptal edilen seferleri duyuru bandında görebilmeli.
- Kullanıcı çevrimdışıyken son yüklenen listeyi açabilmeli.

---

## 3. Teknoloji Yığını (kesin seçimler + gerekçe)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Dil | **TypeScript** (strict) | Tip güvenliği, veri şemaları |
| Frontend | **Next.js (App Router) + React** | SSR/RSC, PWA, tek repo |
| Stil | **Tailwind CSS v4** (PostCSS eklentisi) | Hızlı, tutarlı; ayrı config dosyası gerektirmez |
| İkon/animasyon | **lucide-react**, **framer-motion** (reduced-motion desteğiyle) | Tutarlılık |
| Durum | **zustand** (+ `localStorage` kalıcılığı) | Basit, küçük |
| Harita | **Leaflet** (birincil) + isteğe bağlı **Mapbox** | Ücretsiz tile, token opsiyonel |
| Harici hava | **Open-Meteo** (ücretsiz, anahtarsız) | Kota/maliyet yok |
| Kazıma/ayrıştırma | **regex tabanlı HTML ayrıştırma** (sunucu tarafı) | Bağımlılık az; `cheerio` kullanma |
| Test | **Vitest** (birim), **Playwright** (e2e) | Hızlı |
| Deploy | **Vercel** (web) + isteğe bağlı Docker (workers) | Basit |
| Zamanlama | Vercel Cron + GitHub Actions | Ücretsiz |

**Yasaklar:** `axios` ve `cheerio` **kurmayın** (kullanılmayacak; gereksiz bağımlılık). İstemciye iş sunucusu mantığı koymayın.

---

## 4. Depo ve Klasör Yapısı

Monorepo (npm workspaces) kur:

```
proje/
├─ package.json                # workspaces: apps/*, packages/*
├─ .env.example                # SADECE değişken ADLARI (değer yok)
├─ .github/workflows/{ci,gitleaks,nightly}.yml
├─ scripts/{secret-scan.mjs, scrape-*.mjs}
└─ apps/
   └─ web/
      ├─ next.config.ts        # output: standalone, güvenlik başlıkları
      ├─ vercel.json           # region + cron
      ├─ vitest.config.ts      # env: node, include: src/**/*.test.ts
      ├─ playwright.config.ts  # workers: 3 (12 çekirdekte stabil)
      ├─ public/{manifest.json, sw.js, logos/*}
      ├─ e2e/smoke.spec.ts
      └─ src/
         ├─ app/               # sayfalar + api rotaları
         ├─ components/        # UI bileşenleri
         ├─ lib/
         │  ├─ data/           # statik veri + ücret + operatör kayıt defteri
         │  ├─ agents/         # kazıma, senkron, denetim (deterministik)
         │  ├─ services/       # rota planlayıcı, hava, lobi
         │  ├─ utils/          # dynamic-trip, istanbul-time, normalizasyon
         │  ├─ types/
         │  └─ constants.ts    # tüm sabitler tek yerde
         ├─ store/             # zustand
         └─ hooks/
```

**Kural:** İş verisi ve algoritma `lib/` içinde (test edilebilir, saf fonksiyon ağırlıklı); UI `components/` içinde ince kalır.

---

## 5. FAZ 0 — Ortam Kurulumu

1. Node `>=20` kullan. Monorepo `package.json` oluştur (workspaces).
2. `apps/web` Next.js + TS + Tailwind v4 kur.
3. `.env.example` dosyasını yalnızca değişken adlarıyla oluştur:
   - İstemci: `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_ADSENSE_CLIENT`
   - Sunucu: `CRON_SECRET`, `ADMIN_SECRET`/`ADMIN_PIN`, `VERCEL_DEPLOYMENT_ID`
4. `.gitignore` (env, .next, node_modules), `.gitleaks.toml`, `scripts/secret-scan.mjs` ekle.
5. `tsconfig.json`: `strict: true`, `jsx: react-jsx`, path alias `@/* → src/*`.
6. Kök scriptler: `qa`, `qa:web`, `scan:secrets`.

**Kabul Kriteri:** `npm run dev` ile boş bir sayfa açılıyor; `npx tsc --noEmit` temiz; `scan:secrets` çalışıyor.

---

## 6. FAZ 1 — Veri Katmanı (temel)

### 6.1 Operatör Kayıt Defteri (tek doğruluk kaynağı)
Oluştur: `lib/data/operator-registry.ts`
- Alanlar: `name, shortName, officialWebsite, timetableEndpoints[], announcementEndpoints[], logoPath, brandColor, category (ADALAR|BOGAZ|HEPSI), dataStatus (REAL|UNAVAILABLE|IMAGE_ONLY|STANDBY), statusNote, fareNote?`.
- Tüm UI, ajan ve cron bu kayıttan beslenir.
- **Şart:** `dataStatus` dürüstçe doldurulur; `UNAVAILABLE`/`IMAGE_ONLY` olanlar için sahte saat üretilmez.

### 6.2 Ham Sefer Modeli
Oluştur: `lib/data/official-schedules.ts`
```ts
interface RawStop { name: string; time: string; }
interface RawOfficialTrip {
  id: string; origin: string; destination: string;
  operator: 'Şehir Hatları'|'İDO'|'Turyol'|'Mavi Marmara'|'Dentur Avrasya'|'Prens Tur';
  category?: 'ADALAR'|'BOGAZ';
  departureTime: string; arrivalTime?: string; platform: string; price: string;
  stops?: RawStop[]; runsWeekday?: boolean; runsSaturday?: boolean; runsSunday?: boolean;
  isContinuous?: boolean; continuousUntil?: string; lineName?: string;
}
```
- Tüm operatör modüllerini tek dizide birleştir (`OFFICIAL_SCHEDULES_DATA`).
- **Şart:** Şema doğrulaması yapan bir test yaz (zorunlu alanlar, `HH:mm`, `arrival > departure`).

### 6.3 Operatör Bazlı Sefer Modülleri
Her operatör için ayrı modül + test:
- Şehir Hatları → JSON (resmî döküm).
- Mavi Marmara, Dentur, Turyol, Prens Tur → kendi modülleri.
- **Turyol kuralı:** Aynı `origin + departureTime + gün bayrakları` içindeki kayıtları **tek karta** birleştir; hedef = en uzak varış; ara iskeleler `stops`; hat adı "… (uğramalı)". Ada ve Boğaz hatları ayrı kalır.
- **Prens Tur:** Yalnızca görsel (JPEG) tarife varsa ve fiyat doğrulanamıyorsa `price = "İstanbul Kart"` (rezervasyon ücreti gösterilmez).

**Kabul Kriteri:** Her operatör modülü için sayı/format/tutarlılık testi geçiyor; mükerrer `origin+dest+time` yok.

---

## 7. FAZ 2 — Canlı Sefer Motoru (çekirdek algoritma)

Oluştur: `lib/utils/dynamic-trip.ts`. **Bu ürünün kalbidir; önce şartnameyi yaz, sonra kodla.**

### Şartname
- **Sabitler** (`lib/constants.ts`):
  `DEPARTED_GRACE_MS=30_000`, `LIVE_COUNTDOWN_WINDOW_MS=5*60_000`, `BOARDING_THRESHOLD_MS=2*60_000`, `ESTIMATED_TRAVEL_MIN_PER_HOP=20`, `MAX_ROUTE_RESULTS=10`, `TURNSTILE_GANGWAY_BUFFER_MIN=3`, `WALKING_METERS_PER_MINUTE=80`, `LAST_ENTRY_WARNING_WINDOW_MIN=10`.
- **Girdi:** sefer DTO (origin, destination, departureTime, stops) + şu anki İstanbul saati.
- **Çıktı (`DynamicTripResolution`):** `currentOrigin, destination, currentDepartureTime, isDeparted, countdown|null, minutesUntilDeparture|null, status, isExpired, waypoints[], activeChain[], activeLegIndex, underway|null, boardingDeadline?`.
- **Durum geçişleri:**
  1. Kalkışa >5 dk → `ON_TIME`.
  2. ≤5 dk → `countdown` başlar, durum `DEPARTING_SOON`.
  3. ≤2 dk → `BOARDING`.
  4. Kalkıştan sonra 30 sn → `isDeparted=true`, durum `IN_TRANSIT`.
  5. Son kalkıştan 30 sn sonra → `isExpired=true` (kart listeden kaldırılır).
- **Seyir tahmini (`underway`):** `fromIndex/toIndex/fromName/toName/ratio(0..1)/minutesToArrival/isApproaching(≤3dk)/hasArrived`. `ratio` **zamana göre doğrusaldır; gerçek GPS değildir** — UI'da "tahmini" de.
- **Zorunlu sınır durumları:** gece devri (00:00 geçişi), durak gün kayması, `arrivalTime` yoksa +20 dk fallback, `origin==destination` koruması, ardışık mükerrer durak temizliği.
- **İptal tespiti:** `isTripCancelled()` tek kaynak; Türkçe "İptal" için **büyük İ normalizasyonu** şart.
- **Yaz saat dilimi:** Tüm hesap **Europe/Istanbul** üzerinden; `nightRolloverDayOffset` tek kaynak.

**Kabul Kriteri:** Yukarıdaki tüm sınır durumları için birim testi (en az ~20 test) yeşil.

---

## 8. FAZ 3 — Ücret Motoru

Oluştur: `lib/data/official-fares.ts`
- **Kaynak:** yalnızca resmî tarife sayfası (URL koda yazılır, tarih damgası eklenir).
- **Yapı:** `FARE_CLASSES` (sınıf → full/öğrenci/indirimli) + `SH_PAIR_CLASS` (iskele çifti → sınıf).
- **Anahtar üretimi:** `farePairKey(a,b)` → iki isim normalize edilip **alfabetik sıralanıp `|` ile birleştirilir**. **Şart:** anahtarlar bu kurala göre yazılmalı (yanlış sıra = eşleşme hatası).
- **Ada yolu:** isimde ada geçiyorsa sabit Adalar tarifesi döner.
- **Gece tarifesi:** kalkış 00:30–05:29 ise **×2** (ada hattı hariç).
- **Eşleşme yoksa:** tüm alanlar `"—"` + "resmî tarifede yayınlanmamıştır" gerekçesi.
- **Kural:** yeni hat eklendiğinde ücret **tahmin edilmez**; onaya sunulur.
- Bonus: `resolveRealisticPlatform()` (küçük adalarda "Peron 2" olmaz → "Ana Rıhtım").

**Kabul Kriteri:** Bilinen çiftler doğru tutarı, bilinmeyen çiftler `"—"`, gece 2× doğru; bu üç durum için test.

---

## 9. FAZ 4 — UI İskeleti

1. `app/layout.tsx`: metadata (başlık, `manifest:"/manifest.json"`, viewport `themeColor`), **tema FOUC koruması** (inline script `localStorage` okur, `<html data-theme>`), font (Inter), `ServiceWorkerRegister`, `ReducedMotionProvider`, hata/toast.
2. **Üst çubuk:** canlı İstanbul saati, logo, önbellek-temizle rozeti, dil/ayar/tema.
3. **Alt menü (mobil):** 5 sekme — Seferler, Pano, İskeleler, Hava, Favoriler; `activeTab` state ile.
4. **Sekme kabuğu:** `MainAppShell`; `?view=` PWA kısayolunu oku.
5. **i18n:** `store/useLanguageStore` + sözlük; `PreferenceEffects` dil/font ölçeğini `<html>`'e uygular.

**Kabul Kriteri:** Tema seçimi reload sonrası korunuyor; alt menü mobilde sabit; e2e: sekme geçişi.

---

## 10. FAZ 5 — Sefer Listesi, Kart ve Şematik Şerit

- `ScheduleListClient.tsx`: arama (Türkçe normalizasyon), isletme/kategori/tarih filtreleri, konuma göre sıralama, sponsorlu satır, tüm sheet/modal yönetimi.
- `ScheduleCard.tsx`: saat + geri sayım rozeti, statü, favori/alarm, doluluk.
  - ≤5 dk: saat amber "yanıp sönme"; ≤60 sn: kırmızı + "SON ÇAĞRI".
  - Kalkış sonrası 30 sn "HAREKET ETTİ".
- `TransitRouteSchematic.tsx` (çok duraklı, alt şerit):
  - Durak adları **tam** (kısaltma yok).
  - Gemi bir iskeleden hareket edince o iskele **sola yaslanır**; geçmiş duraklar ekrandan çıkar; elle kaydırma 6 sn duraklar; otomatik kaydırma asla "sola" (geçmişe) yapılmaz.
  - İskelede beklerken (varış tamam) bir sonraki kalkış iskelesine yaslanır.
  - **Kalkışa ≤5 dk kalan iskelenin saati + adı amber yanıp söner** — `<ScheduleList>` kartından `soonDeparturePier` prop'u ile besle.

**Kabul Kriteri:** e2e ana sayfa + arama; görsel/şerit davranışı en az bir kart için manuel doğrulanır.

---

## 11. FAZ 6 — Detay Çekmecesi ve Aktarma

- `TripDetailsSheet.tsx`: 3 sekme — **BİLET** (ücret, resmi kaynak linki), **AKTARMA** (dikey `DepartureTimeline` + yürüme süresi + turnike/biniş emniyeti), **REHBER**.
- Ücret doğrulanamıyorsa üst etiket "Tam Ücret" yerine "Resmi ücret sitede yayınlanmıyor".
- `boarding-deadline.ts`: son giriş penceresi (turnike+rampa payı, yürüme 80 m/dk) — **tahmini** etiketli.

**Kabul Kriteri:** e2e: çekmece açılıyor, Aktarma sekmesinde yürüme takibi görünüyor.

---

## 12. FAZ 7 — Pano, İskele Rehberi, Hava, Favoriler

- **İskele Kalkış Panosu (FIDS):** `PierDepartureBoard` + `BoardTvMode` (`?tv=1`).
- **İskele Rehberi:** arama + bölge filtresi + rehber/park/aktarma verileri.
- **Deniz Hava/Güvenlik:** Open-Meteo (`revalidate:300`); hata → sabit "NORMAL" varsayılan.
- **Favoriler & Alarmlar:** `useFavoritesStore` + `AlarmManager` (bildirim sesi) — cihaz yerel.

**Kabul Kriteri:** Her sekme boş veri ve hata durumunu gösteriyor; e2e: Pano açılıyor.

---

## 13. FAZ 8 — Rota Planlayıcı ve Harita

- `services/route-planner.ts`: **DIRECT** ve **aktarmalı**; aktarma bekleme `10–120 dk`; geçmiş kalkış toleransı `5 dk`; gece yarısı normalizasyonu; en fazla `10` sonuç.
- Harita: Leaflet (ücretsiz tile). Mapbox opsiyonel; token yoksa **demo grid**.
- Canlı gemi konumu varsa WebSocket (`NEXT_PUBLIC_WS_URL`); yoksa gizle/demo göster — **sahte "canlı" gösterme**.

**Kabul Kriteri:** Rota planlayıcı testleri (doğrudan/aktarmalı/yanlış yön/gece/limit) yeşil.

---

## 14. FAZ 9 — Duyurular / İptal Seferler (kazıma)

- `agents/scraper-agent.ts`: `fetchHtml(url, ua, {timeoutMs, fresh})` — `fresh` → `cache:"no-store"`, aksi hâlde `next:{revalidate:3600}`; zaman aşımı `AbortSignal.timeout`.
- `agents/announcements-agent.ts`: operatör bazlı ayrıştırıcı (regex). Her kaynak için **fixture HTML** ile test (canlı ağ olmadan).
- `app/api/announcements/route.ts`: canlı tarama + **snapshot fallback**; yalnızca CANCELLATION kayıtları; `matchAnnouncementsToTrips`.
- **Önbellek:** 10 dk bellek içi (`live-scan-cache`).
- **Cron:** `/api/cron/scan-announcements` — **ŞART: `CRON_SECRET` yetkisi ekle** (yetkisiz bırakma).
- Snapshot tazeliği: `data-freshness.ts` (FRESH/AGING/STALE) + UI güven şeridi.

**Kabul Kriteri:** Fixture testleri yeşil; canlı kaynak erişilemezse uygulama snapshot ile çalışıyor.

---

## 15. FAZ 10 — PWA ve Çevrimdışı

- `public/manifest.json`: `name, short_name, display:standalone, background_color, theme_color, orientation:portrait-primary`, geçerli **ikonlar** (favicon dosyasını mutlaka ekle!), kısayollar.
- `public/sw.js`:
  - Cache adı sürümlü: `vapur-cache-v1-network-first`.
  - **Network-first**; GET dışını geçirme; navigasyon başarısızsa önbellekteki `/`'a düş; diğerleri önbellek veya 503 metni.
  - `skipWaiting()`, `clients.claim()`, eski cache temizliği.
  - Mesajlar: `SKIP_WAITING`, `CLEAR_ALL_CACHES`.
- `components/pwa/ServiceWorkerRegister.tsx`:
  - `/sw.js` kaydı `updateViaCache:"none"`; `controllerchange` **ilk kurulumda reload etmesin** (`hadController` guard).
  - `/api/version` ile sürüm izleme (periyodik + sekme görünür olunca); yeni sürümde önbelleği temizleyip reload.
  - `ChunkLoadError` yakalayıp kurtarma.
- **Kural:** `'/'`'ı precache'e koyma (donmuş HTML servis etmemek için).

**Kabul Kriteri:** Offline'da son görüntü açılıyor; güncelleme sonrası sayfa otomatik yenileniyor (tek sefer).

---

## 16. FAZ 11 — Admin ve Telemetri

- Birinci taraf **anonim** telemetri: `analytics-tracker.ts` (`sendBeacon`), `/api/telemetry/event` (POST, anonim), `/api/telemetry/stats` (GET, **admin yetkili**).
- `/admin`: PIN korumalı; telemetri/ads/audit sekmeleri.
- **ŞART (dürüstlük):** Bellek içi/demo veriyi "canlı" gibi göstermeyesin. Veri kalıcı değilse UI bunu belirtsin.
- **/api/audit gerçek denetim yapsın** (canlı HTTP/veri kontrolü); sabit `PASSED` döndürme.

**Kabul Kriteri:** Admin yalnızca doğru anahtarla erişir; audit sonuçları gerçek kontrole dayanır.

---

## 17. FAZ 12 — Test ve QA

1. **Birim (Vitest):** tüm `lib/` fonksiyonları — özellikle `dynamic-trip`, `official-fares`, `route-planner`, `istanbul-time`, `boarding-deadline`, kazıma ayrıştırıcıları (fixture'lı).
2. **e2e (Playwright):** ana sayfa/nav, Pano, sefer detayı + aktarma, arama, tema kalıcılığı. `workers: 3` (12 çekirdekte 5 işçi takılır).
3. **Mobil audit betiği:** iPhone 390×844 + Android 360×740'ta **yatay taşma yok**, alt menü görünür, dokunma hedefi **<40px değil**.
4. **QA zinciri:** kök `npm run qa` = `scan:secrets` + `qa:api` + `qa:web` (`typecheck` + `test` + `build` + `test:e2e`).

**Kabul Kriteri:** `qa` tamamen yeşil; kritik modüller için test yoksa faz tamamlanmış sayılmaz.

---

## 18. FAZ 13 — Güvenlik Sertleştirme (yayın öncesi zorunlu)

1. Tüm `/api/cron/*` ve `/api/sync` rotalarına `CRON_SECRET` doğrulaması ekle.
2. **Kod içine gömülü varsayılan yönetici anahtarını kaldır**; anahtar yoksa erişimi reddet.
3. Public POST rotalarına (`telemetry/event`, `taxishare/lobby`, `ads`) **şema doğrulaması (zod)** + **rate limit** ekle.
4. `next.config.ts` başlıkları: CSP (script/style/connect/frame), HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy (geolocation=(self))`.
5. `/api/*` ve `/sw.js` için `Cache-Control: no-store`.
6. `gitleaks` + `secret-scan.mjs` CI'da zorunlu.

**Kabul Kriteri:** Yetkisiz cron isteği 401; gömülü anahtar kalmadı; gizli tarama temiz.

---

## 19. FAZ 14 — Deploy

1. Web: Vercel — `region: fra1`, `output: standalone`, `vercel.json` içinde cron tanımı.
2. `/api/version` ile canlı sürüm kimliği (`VERCEL_DEPLOYMENT_ID`).
3. Deploy sonrası: ana sayfa 200, kritik metin başlıkları (operatör/ücret) mevcut, `sw.js` erişilebilir ve `no-store`.
4. İsteğe bağlı Docker Compose (API + web) self-host.

**Kabul Kriteri:** Canlı `/api/version` yeni deploy kimliğini döndürüyor; PWA kurulabiliyor.

---

## 20. Özellik Kabul Kriterleri (Definition of Done — özet)

| Özellik | Bitti sayılır eğer |
|---|---|
| Sefer listesi | Doğrudan/aktarmalı listelenir; boş/hata durumları var; test var |
| Canlı motor | Tüm durum geçişleri + gece devri + sınır durumları testli |
| Ücret | Resmî kaynaklı; bilinmeyen `"—"`; gece 2× testli |
| Şematik şerit | Sola yaslama + 5 dk yanıp sönme; isimler tam |
| Detay/Aktarma | 3 sekme; yürüme süresi; e2e geçiyor |
| Duyurular | Fixture testli; snapshot fallback çalışıyor |
| PWA/offline | Offline son görüntü; güncelleme tek reload |
| Güvenlik | Yetkisiz erişim yok; gömülü sır yok; tarama temiz |
| QA | `npm run qa` tamamen yeşil |

---

## 21. Yapılmaması Gerekenler (Anti-Pattern)

- ❌ Uydurma sefer saati/ücret. ❌ Tahmini değeri gerçek gibi göstermek.
- ❌ Bellekte tutulan veriyi kalıcı/canlı sanmak. ❌ Demo veriyi "gerçek" sunmak.
- ❌ Yetkisiz cron/public yazma uçları. ❌ Koda gömülü anahtar/parola.
- ❌ İstemciye iş mantığı/sır koymak. ❌ `axios`/`cheerio` gibi kullanılmayan bağımlılık eklemek.
- ❌ Önbelleğe `'/'` koymak (PWA'da donmuş belge riski).
- ❌ Test edilmeden "tamamlandı" demek; test edilmeyen özelliği tamam saymak.

---

## 22. Ek — Kritik Sabitler ve Şema Özetleri

**Zaman/güvenlik sabitleri:** `DEPARTED_GRACE_MS=30000`, `LIVE_COUNTDOWN_WINDOW_MS=300000`, `BOARDING_THRESHOLD_MS=120000`, `ESTIMATED_TRAVEL_MIN_PER_HOP=20`, `TRANSFER_MIN_WAIT_MIN=10`, `TRANSFER_MAX_WAIT_MIN=120`, `PAST_DEPARTURE_TOLERANCE_MIN=5`, `MAX_ROUTE_RESULTS=10`, `NIGHT_DEPARTURE_END_HOUR=5`, gece tarifesi penceresi **00:30–05:29**.

**Veri şemaları:** `RawOfficialTrip`, `RawStop`, `OfficialFareInfo`, `DynamicTripResolution`, `UnderwaySegment`, `OperatorRecord`.

**Test dosyası isimlendirme:** `lib/**/__tests__/*.test.ts` (Vitest), `e2e/*.spec.ts` (Playwright).

**Dosya adları (tutarlılık için önerilen):** `official-schedules.ts`, `official-fares.ts`, `operator-registry.ts`, `dynamic-trip.ts`, `istanbul-time.ts`, `route-planner.ts`, `boarding-deadline.ts`, `ServiceWorkerRegister.tsx`, `TransitRouteSchematic.tsx`, `ScheduleCard.tsx`, `TripDetailsSheet.tsx`.

---

### Bu talimatla ilgili son not
- Fazları sırayla uyguladığında elinde **test edilebilir, kanıta dayalı, dürüst** bir v1 olur.
- Herhangi bir fazda "veri doğrulanamıyor" durumuyla karşılaşırsan: **tahmin etme, `"—"`/`"doğrulanamıyor"` göster ve onaya sun.**
- Bu talimat mevcut `Vapur` deposunun gerçek mimarisinden türetilmiştir; mevcut kodda değişiklik yapılmamıştır.
