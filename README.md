# FerryFlow ⛴️
Gerçek Zamanlı Feribot Takip, Sefer ve Biletleme Platformu

Bu proje, yolculara pürüzsüz ve premium bir deneyim sunmak için geliştirilen tam kapsamlı bir deniz taşımacılığı uygulamasıdır. Next.js, NestJS, Prisma ve Mapbox GL JS ile geliştirilmiştir.

## Özellikler
- 🗺️ **Gerçek Zamanlı Harita:** Mapbox ile gemilerin canlı konumları ve hareketleri (WebSockets).
- 🕒 **Sefer ve Gecikme Takibi:** Tüm rotalar için gerçek zamanlı "ON TIME" ve "DELAYED" durum göstergeleri.
- 📱 **Premium UI/UX:** Zustand ve Framer Motion ile desteklenen zengin mobil deneyim.
- 🔐 **Güvenlik:** Kapsamlı Helmet ve Rate Limiting koruması.
- 🛠️ **Demo Mode:** DB veya harici API ihtiyacı olmadan tamamen çalışabilen Mock Provider yapısı.

## Başlangıç (Geliştirici Modu)
Bu proje "Demo Mode" özelliğine sahiptir. Veritabanı kurmadan projeyi hemen ayağa kaldırabilirsiniz.
```bash
# Bağımlılıkları Yükle
npm install

# İki ayrı terminalde çalıştırın
npm run dev --workspace=api   # API: localhost:3001
npm run dev --workspace=web   # WEB: localhost:3000
```
> [!NOTE]  
> Haritanın düzgün çalışması için `apps/web/.env.local` içerisine `NEXT_PUBLIC_MAPBOX_TOKEN=your_token` değerini eklemelisiniz.

## Docker ile Production (Canlı) Dağıtımı
Projeyi tüm modülleriyle (PostgreSQL, Redis, API, Web) ayağa kaldırmak için:
```bash
docker-compose up --build -d
```
> [!TIP]  
> `docker-compose` komutu, arka planda Next.js'in Standalone çıktısını ve NestJS'in derlenmiş halini kullanarak projeyi en optimize şekilde çalıştırır.

---
*Developed as part of the Advanced Agentic Coding Demo.*
