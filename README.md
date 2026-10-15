# Vapur ⛴️

İstanbul Boğazı, Marmara ve Prens Adaları için gerçek zamanlı **sefer panosu + bilet/rota asistanı**.
İsviçre kentsel ulaşım netliği (Swiss Transit Clarity) hedefiyle tasarlanmış, sıfır-uydurma veri (zero-hallucination) ilkesiyle çalışır.

> Bu repo başlangıçta `FerryFlow` adıyla (ABD demo rotaları) hayal edilmiştir. Gerçek ürün
> **Vapur**'a evrilmiştir. Mimari kararlar için bkz. aşağıdaki "Mimari" bölümü; tarihsel
> `FERRYFLOW — MASTER PROJECT SPECIFICATION.md` artık **referans/aspirasyonel**dir.

## Mimari

Monorepo (npm workspaces):

```
apps/
  web/   → Next.js 16 (RSC + PWA) — ÜRÜNÜN KENDİSİ
  api/   → NestJS 11 — canlı takip + kimlik doğrulama + admin (opsiyonel/ikincil)
packages/  → paylaşımlı paketler (henüz boş)
```

**Tek doğruluk kaynağı (seferler):** `apps/web`. Sefer/tarife verisi, resmi kurum
sitelerinden derlenmiş doğrulanmış gömülü veriden (`lib/data/*`, `lib/agents/*`) ve
gecelik senkron işinden (`nightly-tariff-sync.yml`) gelir. `apps/api`'nin scraper'ı ayrı,
ikincil bir veri hattıdır ve web tarafından **kullanılmaz**.

**Canlı gemi takibi:** `apps/web` WebSocket ile `apps/api`'nin `/ws/tracking` namespace'ine
bağlanır (`store/useTrackingStore.ts`). Üretimde JWT ile doğrulanır; demo modunda serbesttir.

## Başlangıç (Geliştirici Modu)

Demo modu sayesinde harici servis olmadan çalışır.

```bash
npm install

# İki ayrı terminalde:
npm run dev --workspace=api   # API:  http://localhost:3001
npm run dev --workspace=web   # WEB:  http://localhost:3000
```

`apps/web/.env.local` içine harita için `NEXT_PUBLIC_MAPBOX_TOKEN` girin (yoksa fallback
grid/leaflet kullanılır).

### API (opsiyonel)
API tek bir **SQLite** dosyası kullanır (`apps/api/prisma/dev.db`), Postgres/Redis yoktur.

```bash
cd apps/api
cp .env.example .env          # sırları düzenleyin
npm run prisma:generate
npm run prisma:push           # tabloları oluştur (ilk sefer)
npm run prisma:seed           # admin + gerçek tarife verisi
npm run start:dev
```

Kimlik doğrulama uçları: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout`, `GET /auth/me`. Sağlık kontrolü: `GET /health`.

## Production (Docker)

`docker-compose.yml` yalnızca API + WEB çalıştırır (SQLite kalıcı volume ile).

```bash
docker-compose up --build -d
```

`JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değerlerini ortam değişkeni olarak verin
(`openssl rand -hex 32`). Aksi halde varsayılan geliştirme değerleri kullanılır ve
**güvenli değildir**.

## Test & Kalite

```bash
npm test --workspace=web      # vitest
npm test --workspace=api      # jest
npm run lint --workspace=api
```

CI: `.github/workflows/ci.yml` (web + api), `.github/workflows/gitleaks.yml` (secret taraması).

## Sırlar

Asla commit edilmez: `.env`, `.env.local`, `dev.db`, API anahtarları, JWT sırları.
Şablonlar: `.env.example`, `apps/api/.env.example`. Sızıntı taraması gitleaks ile yapılır.

---
*İstanbul deniz ulaşımı asistanı.*
