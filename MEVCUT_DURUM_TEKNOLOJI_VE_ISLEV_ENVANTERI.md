# Vapur (FerryFlow) — Mevcut Durum, Teknoloji ve İşlev Envanteri

> **Rapor tipi:** Devralma amaçlı, kanıta dayalı durum tespiti (salt okuma).
> **Hazırlanma yöntemi:** Kaynak kodu, yapılandırmalar, veri dosyaları, testler ve çalıştırılabilir doğrulamalar.
> **Kod değişikliği yapılmadı.** Yalnızca bu rapor dosyası oluşturuldu.
> **Not:** Bu doküman, projeyi devralacak başka bir yapay zekânın/geliştiricinin bağımsız değerlendirme yapabileceği düzeyde teknik ayrıntı içerir. Doğrulanamayan davranışlar "doğrulanmamış" olarak açıkça işaretlenmiştir.

## Kapsam, Yöntem ve Doğrulama Sınırları

**İncelenen alanlar**
- Monorepo yapısı: kök `package.json`, `apps/web` (Next.js), `apps/api` (NestJS), `packages/` (boş), `scripts/`, `.github/workflows/`, Docker.
- `apps/web/src/app` (sayfalar, layout, tüm API rotaları), `apps/web/src/components` (60 `.tsx`), `apps/web/src/lib/{data,agents,utils,services,types,ui}`, `src/store`, `src/hooks`, `public/`.
- Tüm test dosyaları (`vitest`, `playwright`, `jest`), CI/deploy, PWA (manifest + service worker).

**Kod tabanı büyüklüğü (ölçüldü)**
- `apps/web/src` altında **187** `.ts/.tsx` dosyası, toplam ~**1.252.144** bayt.
- `apps/web/src/components` altında **60** `.tsx` dosyası (tamamı `"use client"` — `FavoritesList.tsx` hariç, o server component).

**Çalıştırılan doğrulamalar (bu ortamda, bu makinede)**
| Komut | Sonuç |
|---|---|
| `npm run test -w apps/web` (Vitest) | **19 dosya / 188 test geçti** (3.59 sn) |
| `npm run typecheck -w apps/web` (`tsc --noEmit`) | **Temiz** (hata yok) |
| `npm run test:e2e -w apps/web` (Playwright, chromium) | **5/5 test geçti** (20.1 sn) |
| `npm run test -w apps/web` kapsamındaki ağ | Ağ isteyen 2 test (`generate-dentur-data`, `generate-announcements`) env bayrağı (`GENERATE_*`) yoksa **no-op** çalıştı; canlı ağ kullanılmadı |

**Çalıştırılmayan / doğrulanamayan kontroller (açıkça belirtilir)**
- `npm run qa:api` (NestJS lint/test/build): `qa:web` ile birlikte tam `npm run qa` çalıştırılmadı; API testleri bu raporda **kaynak incelemesi** ile değerlendirildi, **çalıştırılmadı**.
- **Gerçek cihaz testi (fiziksel telefon/tablet) yapılmadı.**
- **Harici servislerin canlı çalıştığı ve verinin güncel olduğu doğrulanmadı** (ağ çağrıları yapılmadı); yalnızca kod ve depolanmış anlık görüntüler (snapshot) incelendi.
- **Üretim (prod) ortamda uçtan uca davranış** test edilmedi (repo dışı Vercel kurulumuna bağımlı).
- Görsel/işitsel öğelerin gerçek render'ı yalnızca Playwright smoke testleriyle sınırlı doğrulandı.

**Ortam**
- İşletim sistemi: Windows; Node `>=20`; git `main` dalı; en son commit `29940c1`.
- Git durumu: yalnızca `apps/web/src/lib/data/operator-tariffs.ts` **izlenmeyen (untracked)** dosya (içeriği dolu, bkz. §C/§F).

---

## A. Yönetici Özeti ve Projenin Mevcut Durumu

### A.1 Amaç
Vapur (kök adı `ferryflow` — `package.json:2`), İstanbul Boğazı ve Adalar'daki **vapur / şehir hatları / deniz motoru** seferlerini tek arayüzde toplamayı hedefleyen bir **PWA + Next.js web uygulamasıdır**. Manifest adı "Vapur Seferleri — İstanbul Canlı Deniz Ulaşımı" (`public/manifest.json:2`). Anlatısal hedef, `FERRYFLOW — MASTER PROJECT SPECIFICATION.md` ve `PRODUCT.md`'de tanımlıdır ancak bu hedeflerin önemli bir kısmı **koddan bağımsız/aspirasyonel** içeriktir (bkz. §L).

### A.2 Fiilen hangi işleri yapabiliyor (kanıtlı)
- **Sefer listesi gösterimi:** 6 operatörün seferleri tek listede, canlı geri sayım/statü/doluluk/yolculuk ilerlemesiyle gösterilir (`src/app/page.tsx` → `ScheduleListClient.tsx`).
- **Sefer arama & filtreleme:** doğal arama (Türkçe normalizasyonlu), kategori/isletme/tarih filtreleri (`ScheduleListClient.tsx:142`).
- **İskele kalkış panosu** (FIDS benzeri), **iskele rehberi**, **deniz meteorolojisi/güvenlik merkezi**, **favoriler & alarmlar** sekmeleri (`views/*`).
- **Sefer detay çekmecesi:** bilet/ücret, aktarmalı güzergâh (dikey timeline + yürüme takibi), rehber sekmeleri (`TripDetailsSheet.tsx`).
- **Canlı statü türetme (motor):** zamana göre kalkış/seyir/varış, "≤5 dk geri sayım", "≤60 sn SON ÇAĞRI", gece devri (rollover), canlı segment ilerlemesi (`lib/utils/dynamic-trip.ts`).
- **Harita:** Leaflet tabanlı deniz haritası + AIS radar modalları (bağlantı/iframe; kendi AIS sunucusu YOK). İzleme (WebSocket) istemcisi var ama backend `apps/api`'ye bağlanır (`store/useTrackingStore.ts:34`).
- **Duyurular/iptal seferler:** resmî sitelerden **sunucu tarafı canlı kazıma** (scraping) + snapshot yedekleme (`app/api/announcements/route.ts`).
- **PWA:** manifest + network-first service worker + sürüm izleyici (`public/sw.js`, `components/pwa/ServiceWorkerRegister.tsx`).

### A.3 Genel mimari ve çalışma biçimi
- **Monorepo (npm workspaces):** `apps/*`, `packages/*` (`package.json:8-11`). Turborepo/Nx **yok**.
- **Web (birincil):** Next.js 16 (App Router, RSC), React 19, Tailwind v4; çoğu sayfa `force-dynamic`.
- **API (ikincil/soğuk):** NestJS 11 + Prisma + SQLite + JWT + Socket.IO (`apps/api`). Web uygulaması **veri kaynağı olarak bu API'yi kullanmaz**; zaman çizelgesi verisi `apps/web/src/lib/...` içindeki **statik modüller + JSON**'dan gelir.
- **Barındırma:** Üretim `vercel` CLI ile deploy edilir (region `fra1`, `output: standalone`). Docker Compose ile self-host senaryosu da mevcut.

### A.4 Olgunluk düzeyi
**Orta-ileri (frontend ve statik veri katmanı olgun; canlı/gerçek-zamanlı ve kalıcılık katmanı zayıf).**
- Kanıt (güçlü): 188 birim testinin geçmesi, typecheck temizliği, 5 e2e testi, statik veri modüllerinin ayrıntılı ve test edilmiş olması, CSP/güvenlik başlıkları, PWA altyapısı, git geçmişinde düzenli ücret doğrulama düzeltmeleri.
- Kanıt (zayıf): gerçek zamanlı verilerin (telemetri, ilanlar, taksi lobisi, kendi kendini iyileştirme) **yalnızca bellekte** tutulması ve demo verilerle dolu olması; `/api/audit`'in canlı denetim yapmaması; dış veri kaynaklarının gerçekliğinin bu raporda doğrulanamaması.

---

## B. Teknoloji Envanteri

Aksi belirtilmedikçe kaynak: `apps/web/package.json`, `apps/api/package.json`, kök `package.json`.

### B.1 Diller
- **TypeScript** `^5` (web), `^5.7.3` (api) — `apps/web/package.json:47`, `apps/api/package.json:77`.
- **JavaScript/Node.js** — betikler (`scripts/*.mjs`), `sw.js`.
- İşaretleme/stil: **TSX (React)**, **CSS** (Tailwind v4).

### B.2 Frontend
| Teknoloji | Sürüm | Kullanım / Kanıt |
|---|---|---|
| Next.js | `^16.4.0` | `apps/web/package.json:28`; App Router, `output:"standalone"` (`next.config.ts:16`) |
| React / ReactDOM | `19.2.8` | `apps/web/package.json:29-30` |
| Tailwind CSS | `^4` | `apps/web/package.json:45`, `postcss.config.mjs` (`@tailwindcss/postcss`) |
| lucide-react | `^1.34.0` | İkonlar (yaygın import) |
| framer-motion | `^13.1.1` | Animasyon; `ReducedMotionProvider` (`components/providers/ReducedMotionProvider.tsx`) |
| zustand | `^5.0.15` | Global state (`src/store/*`) |
| clsx + tailwind-merge | `^2.1.1` / `^3.6.0` | Sınıf birleştirme |

> **Not:** `axios` (`^1.20.0`) ve `cheerio` (`^1.2.0`) bağımlılıkları **tanımlı ama `apps/web/src` içinde hiç kullanılmıyor** (kaynak taramasında import bulunamadı). Ölü bağımlılık.

### B.3 Harita ve coğrafi veri
| Teknoloji | Sürüm | Kullanım |
|---|---|---|
| Leaflet | `^1.9.4` | `components/map/InteractiveMarineMap.tsx`, AIS radar modalları |
| mapbox-gl | `^3.29.0` | `components/schedule/LiveMap.tsx` (token yoksa demo grid'e düşer) |
| react-map-gl | `^8.1.2` | Mapbox harita bileşenleri |
| @types/leaflet | `^1.9.22` | Tip tanımları |

- Döşeme (tile) kaynakları: OpenStreetMap/CartoCDN/OpenSeaMap/ArcGIS (istemci tarafı, `PierLiveAisRadarModal.tsx`, `InteractiveMarineMap.tsx`).
- **Kendi GPS/AIS veri kaynağı yok.** Gemi konumu `NEXT_PUBLIC_WS_URL` üzerinden `apps/api` Socket.IO'ya bağlıdır; bu backend çalışmıyorsa harita demo grid gösterir (`LiveMap.tsx:27`).

### B.4 Backend
| Teknoloji | Sürüm | Kullanım / Kanıt |
|---|---|---|
| NestJS (`@nestjs/*`) | `^11.x` | `apps/api` — `main`/modüller |
| Prisma + `@prisma/client` | `^5.22.0` | `apps/api/prisma`; SQLite |
| SQLite | — | `DATABASE_URL=file:...` (Docker'da `file:/app/data/vapur.db`) |
| Socket.IO | `^4.8.3` | `apps/api` WebSocket gateway; istemci `socket.io-client@^4.8.3` |
| JWT (`@nestjs/jwt`), bcryptjs | `^11.0.2`, `^3.0.3` | Kimlik doğrulama |
| zod / class-validator | `^4.6.7` / `^0.15.1` | Doğrulama |
| helmet, @nestjs/throttler | `^8.3.0`, `^6.5.0` | Güvenlik başlıkları / hız sınırı (API'de) |

### B.5 Veri saklama
- **Web tarafı:** statik TS modülleri + JSON (`src/lib/data/*.json`), `localStorage` (tema, favoriler, önbellek anahtarları), `sessionStorage` (anonim telemetri oturumu).
- **API tarafı:** SQLite (Prisma).
- **Sunucu belleği (web API rotaları):** telemetri, taksi lobisi, sponsorlu ilanlar, self-healing zaman çizelgesi — **kalıcı değil**, cold start'ta sıfırlanır (bkz. §L).

### B.6 Kimlik doğrulama / yetkilendirme
- **Web:** `/admin` sayfası PIN/kod korumalı (`app/admin/page.tsx` + `lib/utils/admin-auth.ts`); `/api/*` yönetim rotaları `x-admin-key` başlığı ile `verifyAdminAuth`. Cron rotaları `CRON_SECRET` bearer veya `vercel-cron` UA ile `verifySyncAuth`.
- **API:** JWT access/refresh (`apps/api/.env.example` değişken adları).
- **RİSK:** `admin-auth.ts` ve `api/ads/route.ts` içinde **kod içine gömülü varsayılan bir yönetici anahtarı** bulunmaktadır (değeri bu raporda paylaşılmaz). Detay §L.

### B.7 Önbellekleme ve çevrimdışı
- **Service Worker:** network-first, `vapur-cache-v5-network-first` (`public/sw.js:12`). Offline'da navigasyon istekleri önbellekteki `/`'a, diğerleri önbelleğe veya 503 metnine düşer (`sw.js:74-89`).
- **API:** `/api/*` için `Cache-Control: no-store` (`vercel.json`, `next.config.ts:38-46`). Duyuru taraması için 10 dk'lık bellek içi önbellek (`lib/services/live-scan-cache.ts`).
- **Next fetch cache:** scraper `next:{revalidate:3600}`, marine-weather `revalidate:300`.

### B.8 PWA özellikleri
- Manifest: `standalone`, dikey, 4 kısayol (`public/manifest.json:17-66`).
- **Kurulum istemi (A2HS / `beforeinstallprompt`) YOK** (kaynak taraması boş).
- SW kaydı + sürüm izleme + chunk-load-error kurtarma: `components/pwa/ServiceWorkerRegister.tsx`.

### B.9 Derleme / dağıtım / sürüm
- Web: `next build` (standalone). Deploy: Vercel (`apps/web/.vercel/project.json` — proje adı `adalar-sefer-asistani`).
- API: `nest build` + Docker.
- Sürüm uç noktası: `/api/version` (`app/api/version/route.ts`) → `VERCEL_DEPLOYMENT_ID`/`BUILD_ID`.
- CI: `.github/workflows/ci.yml` (web vitest+tsc+build+playwright, api prisma+lint+jest+build), `gitleaks.yml`, `nightly-tariff-sync.yml`.

### B.10 Test / analitik / izleme
- **Test:** Vitest (birim), Playwright (e2e). (`vitest.config.ts`, `playwright.config.ts`)
- **Analitik:** Vercel Web Vitals (CSP'de izinli), koşullu Google AdSense (`layout.tsx:68`), **birinci taraf anonim telemetri** (`lib/utils/analytics-tracker.ts` → `/api/telemetry/event`).
- **Hata izleme:** Özel `app/error.tsx` hata sınırı + `NotificationContainer`; harici APM/Datadog/Sentry **yok**.

---

## C. Dosya ve Klasör Envanteri

### C.1 Kök düzey (özet ağaç, derinlik ≤3)
```
Vapur/
├─ package.json                # ferryflow, workspaces, qa scriptleri
├─ docker-compose.yml          # api(SQLite) + web
├─ README.md / PRODUCT.md / DESIGN.md
├─ FERRYFLOW — MASTER PROJECT SPECIFICATION.md   # aspirasyonel hedef dokümanı
├─ .env / .env.example / .gitleaks.toml / .secret-scan-allowlist / .gitignore / .cursorrules
├─ .github/workflows/{ci,gitleaks,nightly-tariff-sync}.yml
├─ scripts/{scrape-turyol.mjs, secret-scan.mjs}
├─ reference/ferryflow-reference.jpg
├─ packages/                    # BOŞ
└─ apps/
   ├─ api/                      # NestJS + Prisma(SQLite) + JWT + Socket.IO
   │  ├─ prisma/  src/  test/  Dockerfile  nest-cli.json
   └─ web/                      # Next.js 16 PWA (birincil ürün)
      ├─ next.config.ts  vercel.json  playwright.config.ts  vitest.config.ts
      ├─ public/{manifest.json, sw.js, logos/*.png, system-audit-report.json}
      ├─ e2e/smoke.spec.ts
      ├─ scripts/{mobile-audit.mjs, audit-daemon.mjs, security-audit-agent.mjs, ...}
      ├─ src/app/       # sayfalar + api rotaları
      ├─ src/components/  # 60 .tsx
      ├─ src/lib/{data,agents,utils,services,types,ui}
      ├─ src/store/     # zustand
      └─ src/hooks/
```

### C.2 Giriş noktaları ve kritik dosyalar
| Dosya | Rol |
|---|---|
| `apps/web/src/app/layout.tsx` | Kök layout: metadata, PWA manifest bağlantısı, tema FOUC koruması, font (Inter), AdSense (koşullu), `ServiceWorkerRegister`, `ReducedMotionProvider`, `NotificationContainer` |
| `apps/web/src/app/page.tsx` | Ana sayfa (RSC, `force-dynamic`): canlı/resmî seferleri + deniz havası meta + duyuru meta yükler |
| `apps/web/src/components/views/MainAppShell.tsx` | Sekme denetleyici (schedules/board/piers/weather/favorites) |
| `apps/web/src/lib/utils/dynamic-trip.ts` | **Canlı statü motoru** (kalkış/seyir/varış/geri sayım/rollover) |
| `apps/web/src/lib/agents/timetable-engine.ts` | Sefer listesi + ücret çözümleme (`resolvedPrice`) |
| `apps/web/src/lib/data/official-fares.ts` | **Tek ücret doğruluk kaynağı** (Şehir Hatları) |
| `apps/web/src/lib/data/official-schedules.ts` | Tüm operatör seferlerini birleştiren kayıt defteri |
| `apps/web/src/lib/data/operator-registry.ts` | Operatör tek kaynak (site, tarife URL, logo, veri durumu) |
| `apps/web/src/app/api/*/route.ts` | API uç noktaları (bkz. §G) |
| `apps/web/public/sw.js` | Service worker (network-first) |

### C.3 Veri katmanı (`src/lib/data/`) — 24 kaynak dosya + 4 test + 3 JSON
| Dosya | İçerik (özet) |
|---|---|
| `official-scraped-schedules.json` | **855** Şehir Hatları kaydı (en büyük veri, ~504 KB) |
| `official-schedules.ts` | Yukarıdakileri + Mavi Marmara + Dentur + Prens Tur + Turyol + `supplementary` ile birleştirir |
| `official-fares.ts` | Şehir Hatları ücret tablosu (`FARE_CLASSES`, `SH_PAIR_CLASS`), gece 2×, "—" |
| `mavi-marmara-schedules.ts` | Mavi Marmara (~109 kayıt; test doğrular) |
| `turyol-schedules.ts` + `turyol-scraped.json` | Turyol: çok-kart birleştirme mantığı |
| `dentur-schedules.ts` + `dentur-schedules.json` | Dentur: **569 satır** (canlı parse) |
| `prens-tur-schedules.ts` | Prens Tur (JPEG afişten; `PRICE_UNVERIFIED="İstanbul Kart"`) |
| `supplementary-schedules.ts` | Şu an `return []` (boş üretici) |
| `operator-registry.ts` | 6 operatör, veri durumu (`REAL`/`UNAVAILABLE`/`IMAGE_ONLY`) |
| `operator-tariffs.ts` | **İzlenmeyen (untracked)** — operatör tarife URL kayıt defteri + `getTariffSource` |
| `piers.ts` | `ISTANBUL_PIERS`, koordinatlar, `isIslandPier`, `calculateDistanceKm` |
| `pier-walks.ts`, `pier-transit-connections.ts`, `pier-taxi-transit.ts`, `pier-parking-bicycle.ts` | İskele çevresi rehber/aktarma/parkur verileri |
| `night-transit-matrix.ts` | Gece ulaşım matrisi (dolmuş/taksi/metrobüs) |
| `sea-taxi.ts` | Deniz taksi sabit bağlantı/veri |
| `sponsored-ads.ts` | Sponsorlu ilan deposu (bellek içi, demo tohumlu) |
| `business-pricing.ts`, `commercial-sponsorships.ts` | İşletme paketleri / sponsorluklar |
| `bosphorus-landmarks.ts`, `adalar-heritage.ts`, `vessel-visuals.ts`, `marine-swell-tracks.ts`, `ferry-library-catalog.ts` | Rehber/görsel/meteoroloji katalogları |

### C.4 Ajanlar (`src/lib/agents/`) — 14 dosya + 5 test + snapshot'lar
`timetable-engine`, `route-planner` (services'te), `missed-ferry-engine`, `self-healing-engine`, `visual-diff-recorder`, `system-audit-agent`, `announcements-agent`, `dentur-scraper`, `scraper-agent`, `daily-sync-job`, `data-snapshot-store`, `passenger-telemetry-agent`, `fleet-registry`, `generate-*` üretici testleri.
> **Önemli:** Bu "ajanlar"ın hiçbiri çalışma zamanında **LLM'e bağlı değildir**; deterministik TypeScript kodu + regex tabanlı HTML ayrıştırıcılardır. (Kaynak incelemesi.)

### C.5 Yardımcılar (`src/lib/utils/`) — 19 dosya + 6 test
`dynamic-trip.ts`, `istanbul-time.ts`, `search-normalizer.ts`, `boarding-deadline.ts`, `service-day-info.ts`, `data-freshness.ts`, `announcement-body.ts`, `admin-auth.ts`, `analytics-tracker.ts`, `sound.ts` vb.

### C.6 Store (`src/store/`) — 9 dosya (zustand)
`useFavoritesStore`, `useLanguageStore`, `useThemeStore`, `usePreferencesStore`, `useTrackingStore`, `useWalletStore` (varsa) vb. Kalıcı anahtarlar `localStorage`'da (ör. `vapur_app_theme_v2`).

### C.7 Kullanılmayan / özel dosyalar
- `packages/` — **boş**.
- `apps/web/src/lib/data/operator-tariffs.ts` — **untracked** (commit edilmemiş; build/e2e'de kullanılmıyor gibi görünüyor).
- `apps/web/audit-daemon.log`, `daemon_out.log`, `daemon_err.log`, `tsconfig.tsbuildinfo`, `test-results/` — çalışma zamanı artefaktları.
- Bağımlılıkları olup kullanılmayan: `axios`, `cheerio` (bkz. §B.2).

---

## D. Kullanıcı Arayüzü ve Bütün Ekranlar

> Yöntem: `src/app` sayfa dosyaları + `src/components` taraması. Görsel doğrulama sınırlı (yalnızca e2e smoke + kod).

### D.1 Sayfalar (URL bazında)
| URL | Dosya | D/Y (SSR/CSR) | Gösterdikleri | Ağ/veri |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Sunucu, `force-dynamic` | `TopBar` + `MainAppShell` (5 sekme) | `getLiveOrOfficialSchedules()`, `fetchLiveMarineWeather()`, `getStoredAnnouncementsMeta()` |
| `/live-map` | `app/live-map/page.tsx` | Sunucu, `force-dynamic` | Rota planlayıcı + deniz haritası | `getLiveOrOfficialSchedules()` |
| `/profile` | `app/profile/page.tsx` | Sunucu (statik) | **Sahte** profil (John Doe) + `FavoritesList` (mock) | Yok |
| `/pro` | `app/pro/page.tsx` | Sunucu | Pro tanıtım kartı + yerel toggle | Yok |
| `/isletmeler` | `app/isletmeler/page.tsx` | Sunucu | İşletme paketleri (`business-pricing`) | mailto CTA |
| `/admin` | `app/admin/page.tsx` | **İstemci** | PIN ekranı → 3 sekmeli panel | `/api/telemetry/stats`, `/api/audit`, `/api/ads` (admin key) |

> **İşlevsiz/görsel öğeler:**
> - `/profile`: kullanıcı verileri **tamamen sahte** (sabit "John Doe"); Ödeme/Bildirimler/Çıkış satırları **çalışmıyor** (yalnızca görsel).
> - `/pro`: satın alma entegrasyonu yok; yalnızca **yerel bir açma/kapama toggle'ı** (gerçek ödeme yok).
> - `admin/layout.tsx:12-37`: kenar çubuğundaki "Kullanıcılar" ve "Uyarılar" bağlantıları da `/admin`'e gider (alt sayfaları YOK).

### D.2 Alt menü (mobil)
`components/navigation/BottomNav.tsx:11-17` — 5 sekme: `schedules` (Seferler), `board` (Pano), `piers` (İskeleler), `weather` (Hava), `favorites` (Favoriler). `MainAppShell` tarafından yönetilir. PWA kısayolu `?view=` ile sekme açılabilir (`MainAppShell.tsx:28-36`).

### D.3 Üst çubuk
`TopBar.tsx` — canlı İstanbul saati, VAPUR logosu + "CANLI" önbellek-temizleme rozeti, dil değiştirici, hızlı araçlar menüsü, ayarlar/tema/rehber/yenile; modalları açar.

### D.4 Sekmeler / çekmeceler / modallar (özet)
- **Sefer listesi** (`ScheduleListClient.tsx`, 1037 satır) — arama, filtre, konum, sponsorlu satır, tüm sheet/modal yönetimi.
- **Sefer kartı** (`ScheduleCard.tsx`, 657 satır) — saat, geri sayım, statü rozeti, favori/alarm, doluluk, şematik güzergâh şeridi (`TransitRouteSchematic`).
- **Detay çekmecesi** (`TripDetailsSheet.tsx`) — 3 sekme: BİLET / AKTARMA / REHBER; ücret, yürüme süresi, TTS rehber, deniz taksi.
- **Araçlar & Filtreler** (`ScheduleToolsSheet.tsx`) — bottom sheet (portal).
- **Diğer modallar:** `SettingsSheet`, `ThemeSelectorModal`, `BosphorusAudioGuideModal`, `MarineAisRadarModal`, `PierLiveAisRadarModal`, `SharedSeaTaxiModal`, `MissedFerryAssistantModal`, `IstanbulkartWalletModal`, `OnboardVoyageModal`, `LateNightTransitModal`, `SponsoredDealsModal`, `IslandHopPickerModal` vb. (~25 adet).

### D.5 Etkileşim öğeleri — durum matrisi
| Öğe | İşlev | Gerçek mi? |
|---|---|---|
| Arama kutusu | Listeyi Türkçe-normalize filtreler | **Çalışır** (test: e2e "Büyükada") |
| Tema seçici | Tema kalıcılığı (`localStorage`) | **Çalışır** (e2e `sun-contrast`) |
| Dil değiştirici | i18n string'leri (`useLanguageStore`) | Çalışır (kapsamı i18n sözlüğüne bağlı) |
| Favori/alarm | `useFavoritesStore` + `AlarmManager` | Kısmi (cihaz yerel) |
| Doluluk göstergesi | `crowd` bileşenleri | **Doğrulanmamış** (statik/tahmini olabilir) |
| Deniz taksi lobisi | `/api/taxishare/lobby` | **Demo** (sahte katılımcılar) |
| Pro satın al | — | **İşlevsiz** (yerel toggle) |
| Profil ödeme/bildirim/çıkış | — | **İşlevsiz** |
| Admin ads/audit/telemetry | `/api/*` | **Çalışır ama veriler bellekte/demo** |

---

## E. Deniz Ulaşımı ve Sefer Özellikleri (22 madde)

> Her madde için: veri kaynağı, format, güncelleme, doğrulama durumu, sınırlamalar.

1. **Kapsam (vapur/şehir hatları/deniz motoru).** İstanbul iç hatlar, Boğaz ve Adalar. Kaynak: `official-scraped-schedules.json` (855 ŞH kaydı) + 5 operatör modülü. **Durum: mevcut.** Sınırlama: dış hatlar (Çınarcık/Esenköy) ve uluslararası hatlar **yok**.
2. **İşletme/operatör kapsamı.** 6 operatör: Şehir Hatları, Mavi Marmara, Dentur Avrasya, Prens Tur, Turyol (+ kayıt defterinde İDO tipi). `operator-registry.ts:52-129`. **Durum: mevcut.** Veri durumları `REAL` işaretli; ancak gerçekliği bu raporda doğrulanmadı.
3. **İskele/terminal/durak/hat bilgileri.** `piers.ts` (koordinatlar, ada tespiti), `pier-*` rehber modülleri. **Durum: mevcut (statik).**
4. **Sefer saatleri ve hareket-varış.** `departureTime`/`arrivalTime`/`stops[]`. **Durum: mevcut.** Varış çoğu kayıtta türetilmiş/tahmini olabilir (bkz. §H).
5. **Gidiş-dönüş.** Her satır tek yön; dönüş ayrı kayıt. **Durum: mevcut (ayrı kayıtlar).**
6. **Hafta içi/hafta sonu/tatil tarifeleri.** `runsWeekday/runsSaturday/runsSunday`, `service-day-info.ts` (tatil/arefe). **Durum: kısmi** — tatil takvimi sınırlı, resmî tatil listesinin kapsamı `service-day-info.ts` ile sınırlı.
7. **Tarih/saat seçimi.** Filtre/tarih bağlamı `service-day-info` + `useTransitClock`; **tam gelişmiş tarih seçici yok** (bugün/yarın odaklı). **Durum: kısmi.**
8. **Kalkış/varış noktası seçimi.** `TripPlannerWithMap` (rota planlayıcı). **Durum: mevcut.**
9. **Doğrudan sefer arama.** `route-planner.ts` DIRECT yolu. **Durum: mevcut** (test edilmiş: `route-planner.test.ts`).
10. **Aktarmalı rota bulma.** Transfer mantığı (`TRANSFER_HUB_TRAVEL_MIN=35`, min/max bekleme). **Durum: mevcut** (test edilmiş).
11. **Alternatif rota sıralama.** `MAX_ROUTE_RESULTS=10`; sıralama `route-planner.test.ts` (ordering) ile doğrulanır. **Durum: mevcut.**
12. **Sefer süresi & aktarma bekleme.** `ESTIMATED_TRAVEL_MIN_PER_HOP=20` (tahmin). **Durum: kısmi/tahmini** (gerçek seyir süresi değil).
13. **Ücret/bilet/indirim/ödeme.** `official-fares.ts` (tam/öğrenci/sosyal/Adakart/ücretsiz), gece 2×. Ödeme entegrasyonu **yok** (yalnızca gösterim). **Durum: kısmi** — ücret gösterimi var, ödeme yok.
14. **Gerçek zamanlı konum/gecikme/iptal.** İptal: `announcements-agent` (kazıma). Gecikme: statik/türetilen. Konum: `useTrackingStore` (backend yoksa demo). **Durum: kısmi & büyük ölçüde doğrulanmamış.**
15. **Hava/fırtına/iptal bildirimleri.** `marine-weather.ts` (Open-Meteo); iptal duyuruları kazımayla. Push bildirim altyapısı: **yok** (yalnızca yerel alarm). **Durum: kısmi.**
16. **Harita/iskele konumları/rota çizimi.** Leaflet + Mapbox (token opsiyonel). **Durum: mevcut (statik konum + tile).**
17. **Favori iskele/hat/kayıtlı arama.** `useFavoritesStore`, `FavoritesAlarmsView`, `AlarmManager`. **Durum: mevcut (cihaz yerel).**
18. **Konuma göre yakın iskele.** Geolocation izni + mesafe hesabı (`calculateDistanceKm`). **Durum: mevcut (izin gerektirir).**
19. **Duyurular/bildirimler.** `AnnouncementBanner`, `/api/announcements`. Background push **yok**. **Durum: kısmi.**
20. **Paylaşım/bağlantı/dış navigasyon.** QR (`PierSharingQrCard`), MarineTraffic/VesselFinder linkleri, Google Maps. **Durum: mevcut.**
21. **Arama geçmişi/kişiselleştirme.** Arama normalizasyonu var; **arama geçmişi kalıcılığı doğrulanmadı** (sınırlı). **Durum: kısmi/doğrulanmamış.**
22. **Erişilebilirlik/dil/tercihler.** `useLanguageStore`, `PreferencesStore` (font ölçeği, tourist mode), `aria-label` kullanımı yaygın. **Durum: kısmi** (kapsamlı WCAG denetimi yapılmadı).

---

## F. Veri Kaynakları ve Veri Akışı

### F.1 Kaynak envanteri
| Kaynak | Tür | Veri | Güncelleme | Doğrulama |
|---|---|---|---|---|
| `official-scraped-schedules.json` | Yerel JSON | 855 ŞH kaydı | Elle/script | Statik (repoda) |
| `mavi-marmara-schedules.ts` | Yerel TS | ~109 kayıt | Elle | Test: `mavi-marmara-schedules.test.ts` (16 test) |
| `dentur-schedules.json` | Yerel JSON | 569 satır | Nightly GH Action | Test yok (parser testi: `dentur-scraper.test.ts`) |
| `turyol-scraped.json` + modül | Yerel JSON/TS | 21 grup → birleştirme | Elle | Test: `turyol-schedules.test.ts` |
| `prens-tur-schedules.ts` | Yerel TS | Afişten çıkarılmış | Elle | Test yok |
| `sehirhatlari.istanbul` | Canlı kazıma | İptal seferler | İstek üzerine (10 dk cache) | `announcements-agent.test.ts` (fixture) |
| `denturavrasya.com` | Canlı kazıma | Tarife + duyuru | Nightly | Fixture testleri |
| `durum.mavimarmara.net/feed.json` | Canlı feed | Durum | İstek üzerine | — |
| `turyol.com` | Canlı popup | Duyuru | İstek üzerine | — |
| `api.open-meteo.com` | API | Deniz havası | `revalidate:300` | Kod; canlı doğrulanmadı |
| Kullanıcı konumu (geolocation) | Cihaz | Mesafe | Anlık | — |
| `localStorage`/`sessionStorage` | Cihaz | Tema/favori/telemetri | Anlık | — |

### F.2 Uçtan uca akış örneği (sefer listesi)
1. `app/page.tsx:25` → `getLiveOrOfficialSchedules()` (`lib/agents/timetable-engine.ts`).
2. Motor, `OFFICIAL_SCHEDULES_DATA` (`lib/data/official-schedules.ts:62`) kayıtlarını okur; ücreti `getOfficialRouteFare` ile çözer.
3. Kayıtlar `ScheduleListClient`'a DTO olarak geçer; her kart `resolveDynamicTrip` (`dynamic-trip.ts:101`) ile canlı statü hesaplar (istemci saatine göre).
4. `useTransitClock`, `/api/version` üzerinden sunucu saat farkını alır (`useTransitClock.ts:93`).

### F.3 Uçtan uca akış örneği (iptal duyurusu)
`/api/announcements` → `getLiveScan()` → (cache bayatsa) `scrapeAllAnnouncements()` → 4 kaynak regex ayrıştırma → canlı sonuç + snapshot birleştirme → yalnızca CANCELLATION kayıtları → `matchAnnouncementsToTrips` ile seferlere eşleme.

### F.4 Çelişkiler / birleştirme / sınır durumlar
- **Veri birleştirme:** Modüller yan yana eklenir; **dedupe yok** (Turyol'da yalnızca kendi içinde birleştirme var).
- **Saat dilimi / gece devri:** `istanbul-time.ts` + `nightRolloverDayOffset` tek kaynak; gece tarifesi 00:30–05:29 (ada hariç) — `official-fares.ts:147`.
- **Mükerrer/bozuk veriler:** Raporda ayrıca bilinen 4 bozuk scrape kaydı (Eminönü↔Kabataş, Kadıköy↔Bostancı) ücret tablosunda eşleşmez → "—" (`official-fares.ts:119-121`).
- **Güncellik:** Snapshot'ların yaşı `data-freshness.ts` (FRESH/AGING/STALE) ile ölçülür; UI'da `ServiceDataTrustBar` ile gösterilir.

---

## G. API ve Entegrasyon Envanteri

### G.1 Kendi API rotaları (`apps/web/src/app/api/**/route.ts`)
| Rota | Metod | Yetki | Harici çağrı | Önbellek | Hata davranışı |
|---|---|---|---|---|---|
| `/api/sync` | GET | `CRON_SECRET` / `vercel-cron` UA / dev | Dentur + duyuru kazıma, HEAD denetim | `force-dynamic` | 401 / 500 |
| `/api/version` | GET | Yok | Yok | `no-store` | — |
| `/api/announcements` | GET | Yok | 4 canlı kazıma | 10 dk bellek + `no-store` | Snapshot'a düşer |
| `/api/audit` | GET | `verifyAdminAuth` | **Yok** (saf hesap) | `force-dynamic` | 401 / 500 |
| `/api/telemetry/event` | POST | **Yok (public)** | Yok (bellek) | `no-store` | 400 / 500 |
| `/api/telemetry/stats` | GET | `verifyAdminAuth` | Yok | `no-store` | 401 / 500 |
| `/api/taxishare/lobby` | GET/POST | **Yok (public)** | Yok (bellek) | `no-store` | 400 / 500 |
| `/api/ads` | GET/POST | GET public/admin; POST admin key | Yok | `force-dynamic` | 400 / 401 / 500 |
| `/api/cron/scan-announcements` | GET | **YOK (kritik)** | 4 canlı kazıma (zorunlu) | Cache bypass | 502 / 500 |
| `/api/cron/sync-tariffs` | GET | `CRON_SECRET` / `vercel-cron` | Dentur + duyuru | `force-dynamic` | 401 / 500 |

- **Rate limiting yok** (kaynak taramasında `429/throttle/rate-limit` bulunamadı). `middleware.ts` **yok**.
- **axios/cheerio kullanılmıyor**; tüm HTML ayrıştırma regex ile.

### G.2 Harici entegrasyonlar (istemci tarafı)
- **MarineTraffic / VesselFinder:** yalnızca link/iframe (CSP `frame-src` izinli, `next.config.ts:83`).
- **Open-Meteo:** sunucu tarafı hava durumu (`marine-weather.ts:28`), `revalidate:300`, hata → sabit "NORMAL" varsayılan.
- **Google AdSense:** koşullu, `NEXT_PUBLIC_ADSENSE_CLIENT` varsa (`layout.tsx:68`).
- **Mapbox/Leaflet tile'ları:** istemci tarafı.
- **Socket.IO:** `NEXT_PUBLIC_WS_URL` → `apps/api` (çalışmıyorsa demo grid).

### G.3 Programatik zamanlama
- **Vercel Cron:** `5 21 * * *` UTC (00:05 TR) → `/api/cron/scan-announcements` (`vercel.json:3-8`).
- **GitHub Actions:** `nightly-tariff-sync.yml` `0 20 * * *` UTC → Dentur/duyuru üretici testlerini çalıştırıp snapshot commit eder (**bu rotayı curl ETMEZ**; rota içindeki yorum aspire eder).
- **Yerel daemon:** `scripts/audit-daemon.mjs` (60 sn döngü, canlı URL dener, rapor yazar).

---

## H. İş Kuralları ve Algoritmalar

### H.1 Canlı sefer motoru — `lib/utils/dynamic-trip.ts`
- **Sabitler** (`lib/constants.ts`): `DEPARTED_GRACE_MS=30_000`, `LIVE_COUNTDOWN_WINDOW_MS=300_000` (5 dk), `BOARDING_THRESHOLD_MS=120_000` (2 dk), `ESTIMATED_TRAVEL_MIN_PER_HOP=20`, `MAX_ROUTE_RESULTS=10`.
- **Durum geçişleri:** `ON_TIME` → (≤5 dk) `countdown` + `DEPARTING_SOON` → (≤2 dk) `BOARDING` → (kalkış sonrası 30 sn) `IN_TRANSIT` → `COMPLETED`; son kalkıştan 30 sn sonra `isExpired` (kart kaldırılır) — `dynamic-trip.ts:231-347`.
- **Seyir segmenti (`UnderwaySegment`):** `fromIndex/toIndex/ratio/…`; `ratio` **zamana göre doğrusal tahmindir, gerçek GPS değildir** (`dynamic-trip.ts:38-46`).
- **Sınır durumları:** gece devri, durak gün kayması, varış yoksa +20 dk fallback, `origin==destination` koruması, mükerrer durak dedupe — hepsi `dynamic-trip.test.ts` (26 test) ile doğrulanır.

### H.2 Rota planlama — `lib/services/route-planner.ts`
- DIRECT + transfer; `TRANSFER_HUB_TRAVEL_MIN=35`, bekleme 10–120 dk; 5 dk geçmiş kalkış toleransı (`PAST_DEPARTURE_TOLERANCE_MIN`); gece yarısı normalizasyonu; en fazla 10 sonuç. **`route-planner.test.ts` (14 test).**

### H.3 Ücret çözümleme — `lib/data/official-fares.ts`
- Ada yolu tespiti → sabit Adalar tarifesi (151,23 / Adakart 90,70) (`:170-181`).
- Değilse `farePairKey(origin, dest)` → `SH_PAIR_CLASS`; eşleşme yoksa **"—"** (`:184-196`).
- Gece penceresi (00:30–05:29) → **2×** (`:199`).
- **Sınır durum:** `SH_PAIR_CLASS` anahtarları normalize isimle **sıralı** olmalı; sıralama hatası geçmişte 4 anahtarda düzeltildi (git geçmişi `53fd229` öncesi).

### H.4 Turyol birleştirme — `lib/data/turyol-schedules.ts`
- Aynı `origin|departureTime|gün bayrakları` + kategori grubunda tek kart; hedef = en uzak varış; ara iskeleler `stops` (arrivalTime sıralı); başlık "… (uğramalı)". Boğaz hatları ayrı kalır. **`turyol-schedules.test.ts` (4 test).**

### H.5 Diğer algoritmalar
- **Ücret/saat biçimlendirme:** `formatTry`, `istanbul-time.ts`.
- **Türkçe normalizasyon:** `search-normalizer.ts` (`İ`/`ı` sorunları; `isTripCancelled` bu yüzden `normalizeTurkishText` kullanır — `dynamic-trip.ts:80-89`).
- **Biniş son giriş penceresi:** `boarding-deadline.ts` (turnike+rampa 3 dk, yürüme 80 m/dk, uyarı 10 dk). **`boarding-deadline.test.ts` (21 test).**
- **Self-healing / audit / visual-diff:** deterministik, **bellek içi ve demo tohumlu** (bkz. §L). `/api/audit` **canlı HTTP denetimi yapmaz** (`system-audit-agent.ts` içinde açıkça belirtilir).

---

## I. Mobil Uyumluluk ve Kullanıcı Deneyimi

> **UYARI: Fiziksel cihaz testi yapılmadı.** Değerlendirme kod + sınırlı e2e + mevcut audit betiği okumasına dayanır.

- **Küçük telefonlar:** `mobile-audit.mjs` iPhone 390×844 ve Android 360×740 viewport'larında yatay taşma / alt menü / <40px dokunma hedefi kontrolü yap **acak şekilde yazılmış** (`scripts/mobile-audit.mjs:7-10`). **Çalıştırılmadı** (canlı sunucu gerekir) → sonuç doğrulanamadı.
- **Kart davranışı:** Uzun iskele adları mobilde alt satıra sarılır (kırpılmaz); şematik şerit (`TransitRouteSchematic`) hareket edilen iskeleye sola yaslanır ve ≤5 dk kalan kalkış saati/adı amber yanıp söner — en son commit `29940c1` ile eklendi (bu rapor sırasında kod okundu; **gerçek cihazda görsel doğrulama yapılmadı**).
- **Masaüstü:** `sm:` breakpoint ile iki sütunlu kart düzeni; admin kenar çubuğu.
- **TV modu:** `BoardTvMode.tsx` + `?tv=1` (`DepartureBoardView.tsx`) — B2B tam ekran pano.
- **Yatay/dikey:** manifest dikey-kilitli (`portrait-primary`); yatay için özel düzen **doğrulanmadı**.
- **Yükleniyor/boş/hata:** `app/loading.tsx` (iskelet), boş liste durumu arama testinde doğrulanır (e2e), `app/error.tsx` hata sınırı + "Tarife Yenileniyor" + önbellek temizleyerek yeniden dene.
- **Erişilebilirlik:** yaygın `aria-label`; kapsamlı WCAG denetimi yapılmadı.

---

## J. Performans, Güvenilirlik ve Güvenlik

### J.1 Performans (ölçülen / ölçülmeyen)
- **Ölçülen:** `next build` **~2.9 sn derleme / ~10 sn TypeScript** (önceki oturum logları); birim testleri 3.59 sn. Çalışma zamanı performansı (LCP/TTI) **ölçülmedi** — tahmin verilmez.
- **Paket boyutu/hafıza:** ölçülmedi.
- En büyük istemci yükü: `official-scraped-schedules.json` (~504 KB) — statik veri, istemciye gömülme şekli doğrulanmadı.

### J.2 Güvenilirlik riskleri
- **Bellek içi durum:** telemetri, taksi lobisi, sponsorlu ilanlar, self-healing → cold start'ta **sıfırlanır**; çoklu örnekte tutarsız.
- **Harici kazıma bağımlılığı:** HTML düzeni değişince ayrıştırıcılar sessizce boş dönebilir (fixture testleri son düzeni yansıtır, geleceği garanti etmez).
- **Cron çakışması:** hem Vercel Cron hem audit-daemon hem GH Action üç farklı zamanlama; tutarsızlık riski.

### J.3 Güvenlik bulguları
| Bulgu | Kanıt | Risk |
|---|---|---|
| `/api/cron/scan-announcements` **yetkisiz** | `app/api/cron/scan-announcements/route.ts` (yetki kontrolü yok) | Herkes canlı kazımayı tetikleyebilir (DoS/kaynak tüketimi) |
| **Kod içine gömülü** varsayılan yönetici anahtarı | `lib/utils/admin-auth.ts:8`, `app/api/ads/route.ts:14` (değer paylaşılmaz) | Anahtar sızarsa admin işlemleri açık |
| Commitment edilmiş OIDC token dosyası | `apps/web/.env.local:9` (`VERCEL_OIDC_TOKEN`; dosya gitignore'lu) | Yanlışlıkla commit riski |
| Public telemetri + lobby yazma | `/api/telemetry/event`, `/api/taxishare/lobby` | Spam/veri kirliliği (rate limit yok) |
| Güvenlik başlıkları | `next.config.ts` (CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy) | Güçlü yön |
| Gizli tarama | `.github/workflows/gitleaks.yml`, `scripts/secret-scan.mjs` | Güçlü yön |

- **Girdi doğrulama:** telemetri/lobby/ads POST gövdeleri kısmen doğrulanıyor (uzunluk kırpma, alan zorunluluğu); kapsamlı şema doğrulaması sınırlı.
- **Kişisel veri:** taksi lobisinde telefon **maskeleniyor** (`maskPhoneNumber`, testli); telemetri anonim (`vapur_anon_sid`).

---

## K. Testler ve Fiilî Doğrulama

### K.1 Çalıştırılan (bu rapor sırasında)
| Test grubu | Komut | Sonuç |
|---|---|---|
| Web birim testleri | `npm run test -w apps/web` | **188/188 geçti** (19 dosya, 3.59 sn) |
| Tip kontrolü | `npm run typecheck -w apps/web` | **Temiz** |
| E2E (chromium) | `npm run test:e2e -w apps/web` | **5/5 geçti** (20.1 sn): ana sayfa/nav, pano, sefer detayı+aktarma, arama, tema kalıcılığı |

### K.2 Birim test envanteri (19 dosya)
- `lib/utils`: `dynamic-trip` (26), `istanbul-time` (9 blok), `boarding-deadline` (21), `service-day-info`, `data-freshness`, `announcement-body`.
- `lib/services`: `route-planner` (14), `taxi-lobby-service`, `passenger-analytics-service`.
- `lib/data`: `mavi-marmara-schedules` (16), `turyol-schedules` (4), `piers` (4), `pier-walks` (4).
- `lib/agents`: `announcements-agent` (24, fetch mock'lu), `passenger-telemetry-agent`, `dentur-scraper`; `generate-dentur-data` & `generate-announcements` (**env bayraklı** — bayrak yoksa no-op → canlı ağ **kullanılmadı**).
- `lib/__tests__/theme-ids`.

### K.3 E2E (`e2e/smoke.spec.ts`, 5 test)
Ana sayfa/nav/güven şeridi/alt menü; Pano sekmesi; sefer detay çekmecesi + Aktarma yürüme takibi; doğal arama; tema kalıcılığı (reload sonrası).

### K.4 Çalıştırılmayan testler (başarı sayılmaz)
- `npm run qa:api` (NestJS jest + lint + build) — **çalıştırılmadı.**
- `npm run scan:secrets` — **çalıştırılmadı** (bu bağlamda).
- `scripts/mobile-audit.mjs`, `scripts/audit-daemon.mjs` — **çalıştırılmadı** (canlı sunucu/ağ gerekir).
- Fiziksel cihaz / gerçek tarayıcı matrisi — **yapılmadı.**

---

## L. Eksikler, Riskler ve Teknik Borç

### KRİTİK
1. **Çok sayıda özellik gerçek değil, demo/istisnai.**
   - *Kanıt:* `taxi-lobby-service.ts:38-74` (sahte "Murat T.", "Zeynep & Arkadaşları"); `passenger-analytics-service.ts` tohumlu sayılar; `self-healing-engine.ts:17-59` tohumlu zaman çizelgesi; `visual-diff-recorder.ts:14-51` tohumlu geçmiş.
   - *Etki:* Admin panelinde ve taksi paylaşımında **yanıltıcı canlı görünüm**. *Risk:* Yüksek — güven/güvenilirlik algısı. *Zorluk:* Orta (gerçek kalıcılık gerektirir).
2. **`/api/audit` canlı denetim yapmıyor.**
   - *Kanıt:* `system-audit-agent.ts` "canlı HTTP denetimi bu döngüde gerçekleştirilmedi" + sabit `PASSED` değerleri.
   - *Etki:* "Sistem sağlıklı" raporu gerçek durumu yansıtmayabilir. *Risk:* Yüksek. *Zorluk:* Orta.

### YÜKSEK
3. **`/api/cron/scan-announcements` yetkisiz** (DoS/kaynak tüketimi). *Kanıt:* route dosyasında yetki kontrolü yok. *Zorluk:* Kolay (düşük).
4. **Kod içine gömülü yönetici anahtarı** (`admin-auth.ts:8`, `api/ads/route.ts:14`). *Risk:* Yüksek. *Zorluk:* Kolay.
5. **Kalıcılık yokluğu / cold start sıfırlaması** (telemetri, lobby, ilanlar). *Etki:* Veri kaybı, tutarsızlık. *Zorluk:* Orta-Yüksek.
6. **Gerçek zamanlı gemi konumu backend'e bağlı ve backend web ile entegre değil**; token yoksa harita demo. *Kanıt:* `useTrackingStore.ts:34`, `LiveMap.tsx:27`. *Zorluk:* Yüksek.

### ORTA
7. **Ölü bağımlılıklar** `axios`, `cheerio`. *Zorluk:* Kolay.
8. **Dedupe yok** (operatörler arası sefer birleştirme yalnızca Turyol içinde). *Etki:* Muhtemel mükerrer kartlar. *Zorluk:* Orta.
9. **Boş `packages/`**, `supplementary-schedules.ts` `return []`, untracked `operator-tariffs.ts` (kullanılıp kullanılmadığı belirsiz). *Zorluk:* Kolay.
10. **`/profile` ve `/pro` işlevsiz/aldatıcı** (sahte kullanıcı, ödeme yok). *Etki:* UX/güven. *Zorluk:* Orta.
11. **robots.txt / sitemap yok**, SEO altyapısı zayıf. *Zorluk:* Kolay.
12. **favicon.ico** public'te eksik görünüyor ama manifest ve sw precache'te referanslı. *Etki:* PWA ikon sorunu. *Zorluk:* Kolay.

### DÜŞÜK
13. `NEXT_PUBLIC_API_URL` kasıtlı kullanılmıyor (yalnızca yorum). *Etki:* Karışıklık.
14. `mapbox-gl` token opsiyonel; token yoksa sınırlı deneyim.
15. Test edilmemiş modüller: `prens-tur-schedules`, çok sayıda bileşen için birim testi yok.

---

## M. Mevcut Özellik Kataloğu (Özet Tablo)

| ID | Özellik | Ekran | Dosya/Fonksiyon | Veri kaynağı | Durum | Kanıt / Sınırlama |
|---|---|---|---|---|---|---|
| F-01 | Sefer listesi | `/` | `ScheduleListClient.tsx`, `timetable-engine.ts` | Statik JSON+modüller | **Doğrulandı (e2e)** | 6 operatör; gerçeklik doğrulanmadı |
| F-02 | Canlı statü/geri sayım | Kart | `dynamic-trip.ts:101` | İstemci saati | **Doğrulandı (26 test)** | Tahmini ratio |
| F-03 | Doğal arama | `/` | `search-normalizer.ts` | Statik | **Doğrulandı (e2e)** | — |
| F-04 | İskele panosu (FIDS) | Pano | `PierDepartureBoard.tsx` | Statik | **Doğrulandı (e2e)** | — |
| F-05 | İskele rehberi | İskeleler | `PiersDirectoryView.tsx` | `piers.ts` + rehber modülleri | Kısmi | Statik |
| F-06 | Deniz havası/güvenlik | Hava | `MarineWeatherSafetyCenter.tsx` | Open-Meteo | **Doğrulanmamış** | Canlı çağrı test edilmedi |
| F-07 | Rota planlama (aktarmalı) | `/live-map` | `route-planner.ts` | Statik | **Doğrulandı (14 test)** | Süreler tahmini |
| F-08 | Ücret/bilet gösterimi | Detay | `official-fares.ts` | Resmî tablo | **Doğrulandı (tarih damgalı)** | Ödeme yok |
| F-09 | İptal duyuruları | Banner | `announcements-agent.ts` | Canlı kazıma | Kısmi | Ağ/gerçeklik doğrulanmadı |
| F-10 | Favoriler/alarmlar | Favoriler | `useFavoritesStore`, `AlarmManager` | Cihaz | Kısmi | Yerel |
| F-11 | Konuma göre iskele | `/` | `calculateDistanceKm` | Geolocation | Kısmi | İzin gerektirir |
| F-12 | Harita/AIS radar | Harita | `InteractiveMarineMap.tsx` | Tile/iframe | Kısmi | Kendi AIS yok |
| F-13 | Canlı gemi takibi | Harita | `useTrackingStore.ts` | WS (`apps/api`) | **Çalışmıyor (backend'siz)** | Demo grid |
| F-14 | Deniz taksi lobisi | Modal | `/api/taxishare/lobby` | Bellek | **Demo** | Sahte katılımcılar |
| F-15 | Telemetri/analitik | Admin | `analytics-tracker.ts` | Bellek | Kısmi | Kalıcı değil |
| F-16 | Sponsorlu ilanlar | Liste | `sponsored-ads.ts`, `AdSlot.tsx` | Bellek/AdSense | Kısmi | Demo tohum |
| F-17 | Admin panel | `/admin` | `app/admin/page.tsx` | API | Çalışır | Audit canlı değil |
| F-18 | PWA/offline | Global | `sw.js`, `ServiceWorkerRegister.tsx` | Cache | **Doğrulandı (kod)** | Fiziksel cihaz testi yok |
| F-19 | Tema/dil/tercihler | Ayarlar | `useThemeStore`, `useLanguageStore` | localStorage | **Doğrulandı (e2e tema)** | — |
| F-20 | TV modu panosu | Pano | `BoardTvMode.tsx` | Statik | Mevcut | B2B |

Durum sözlüğü: **Doğrulandı** = çalıştırılan test/kanıtla; **Kısmi** = kısmen çalışır/doğrulanmış; **Demo** = gerçek değil; **Çalışmıyor** = bağımlılık eksik; **Doğrulanmamış** = kod var ama test edilmedi.

---

## N. Geliştirme İçin Başlangıç Noktası (Öneriler)

> Bu bölüm **yalnızca öneri**dir; hiçbir değişiklik yapılmadı.

**A) Mevcut hataların giderilmesi**
- `/api/cron/scan-announcements`'a `CRON_SECRET` yetkisi ekle (K: düşük).
- Gömülü yönetici anahtarını kaldır, env zorunlu kıl (K: düşük, öncelik: yüksek).
- Eksik `favicon.ico` ve boş `supplementary-schedules.ts` durumunu düzelt (K: düşük).

**B) Veri doğruluğu ve güncellik**
- Operatörler arası **global dedupe** (K: orta). Snapshot tazeliği uyarılarını otomatik eşiğe bağla.
- Bozuk 4 scrape kaydını ayıkla (`official-fares.ts:119-121`).

**C) Kullanılabilirlik ve mobil**
- `/profile` ve `/pro`'yu gerçek işlevle bağla veya kaldır (K: orta).
- `scripts/mobile-audit.mjs`'i CI'ya ekle; <40px hedef/horizontal taşma denetimini zorunlu kıl.

**D) Yeni kullanıcı özellikleri**
- Bildirimler (web push) altyapısı (K: yüksek). Kayıtlı arama/geçmiş kalıcılığı (K: düşük).

**E) Harita ve rota**
- Kendi/ücretsiz AIS/GPS akışı entegrasyonu (K: yüksek).
- Süre tahminlerini gerçek veriyle besleme.

**F) Gerçek zamanlı bilgi ve bildirimler**
- İptal/gecikme için push + arka plan senkronu.

**G) Performans ve güvenilirlik**
- Kalıcı depo (KV/DB) ile bellek içi depoları değiştir (K: orta-yüksek).
- Kazıma için retry/circuit-breaker + gözlemlenebilirlik.

**H) Güvenlik ve gizlilik**
- Rate limiting + girdi şema doğrulaması (zod) tüm public POST'lara.
- Admin'i çok kullanıcılı JWT'ye taşı (`apps/api` mevcut).

**I) Test otomasyonu ve mimari**
- Bileşen testleri (React Testing Library) ve görsel regresyon; `qa` tam zincirini CI'da zorunlu kıl.
- Ölü bağımlılıkları (`axios`, `cheerio`) kaldır.

---

## O. Sonuç ve Bağımsız Değerlendirme Paketi

### O.1 Tek bakışta
Ürün, **İstanbul deniz ulaşımını tek PWA'da sunan, olgun bir frontend + statik/yarı-canlı veri katmanına sahip** bir uygulamadır. Sefer listesi/arama/rota/ücret/duyuru ve özelleştirme gerçekten çalışır. Buna karşın **gerçek zamanlı, kalıcı ve çok kullanıcılı katmanlar ya demo ya da eksik**; `apps/api` backend'i web ürünüyle **entegre değil**.

### O.2 Teknoloji ve mimari haritası (özet)
- **Web:** Next.js 16 + React 19 + Tailwind 4 + zustand + Leaflet/Mapbox → Vercel (`fra1`, standalone).
- **API:** NestJS 11 + Prisma/SQLite + JWT + Socket.IO (soğuk, web tarafından kullanılmıyor).
- **Veri:** Statik TS/JSON modülleri (ana kaynak) + canlı kazıma (duyuru/tarife) + Open-Meteo.
- **Kalıcılık:** localStorage (istemci) + bellekte API (uçucu).
- **CI:** GitHub Actions (web+api+gitleaks+nightly sync); **Deploy:** Vercel CLI.

### O.3 Veri kaynakları ve entegrasyonlar (özet)
Şehir Hatları (855 kayıt), Mavi Marmara (~109), Dentur (569 satır), Prens Tur, Turyol; canlı: sehirhatlari.istanbul, denturavrasya.com, durum.mavimarmara.net, turyol.com, api.open-meteo.com; ortam: MarineTraffic/VesselFinder (link), AdSense (koşullu).

### O.4 Doğrulanmış test sonuçları
188 birim testi + 5 e2e testi **geçti**; typecheck **temiz** (bu makinede). API testleri ve mobil/cihaz testleri **çalıştırılmadı**.

### O.5 Eksik/risk (özet, öncelikli)
1. Demo verili "canlı" özellikler (KRİTİK) · 2. Canlı olmayan `/api/audit` (KRİTİK) · 3. Yetkisiz cron (YÜKSEK) · 4. Gömülü admin anahtarı (YÜKSEK) · 5. Kalıcılık yokluğu (YÜKSEK) · 6. Web↔backend entegrasyonu yok (YÜKSEK).

### O.6 En önemli geliştirme fırsatları
Gerçek kalıcılık ve gerçek zamanlı veri; global dedupe; web push bildirimler; kendi AIS/GPS; admin güvenliği; CI'da tam QA + görsel regresyon.

### O.7 Belirsizlikler, doğrulanmamış iddialar ve açık sorular (bağımsız değerlendirme için)
1. **Harici servis güncelliği doğrulanmadı:** Tüm "REAL" veri durumları (`operator-registry.ts`) koddaki beyandır; canlı doğrulama yapılmadı. **Soru:** Kazıma hâlâ çalışıyor mu?
2. **Görsel/işitsel deneyim:** Fiziksel cihazda doğrulanmadı (özellikle mobil şerit yanıp sönme, tema).
3. **`apps/api` durumu:** Kod var, testler var; **gerçekten deploy edilmiş ve çalışıyor mu?** Web onu kullanmıyor gibi.
4. **`operator-tariffs.ts`:** untracked; build/e2e'ye dahil mi, üretimde kullanılıyor mu — **belirsiz**.
5. **`packages/` boş** — gelecekte planlanan paylaşımlı paket mi?
6. **Performans metrikleri** (LCP/TTI/bellek) **ölçülmedi** — rakam verilmedi.
7. **`FERRYFLOW — MASTER PROJECT SPECIFICATION.md`** hedeflerinin hangi kısmı koda yansıdı — bu raporda madde madde eşleme yapılmadı (dosya aspirasyonel içerik barındırıyor).
8. **i18n kapsamı:** `useLanguageStore` sözlüğünün hangi dilleri/anahtarları tam kapsadığı doğrulanmadı.

---

### Ek: Doğrulama Kaydı (bu rapor sırasında girilen komutlar ve sonuç)
```
npm run test    -w apps/web   → 19 dosya / 188 test geçti (3.59 sn)
npm run typecheck -w apps/web → tsc --noEmit: temiz
npm run test:e2e -w apps/web  → 5/5 geçti (20.1 sn), chromium
```
> Yukarıdaki komutlar dışında hiçbir ağ (ağır kazıma/deploy/ücretli işlem) çağrısı **çalıştırılmadı**; hiçbir kaynak dosya değiştirilmedi. Oluşturulan tek dosya bu raporun kendisidir.
