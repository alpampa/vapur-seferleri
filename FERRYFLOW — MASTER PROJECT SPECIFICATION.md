# FERRYFLOW — MASTER PROJECT SPECIFICATION
## Gerçek Zamanlı Feribot Takip, Sefer, Canlı Harita, Biletleme ve Bildirim Platformu

> **⚠️ DURUM NOTU (güncel değil / aspirasyonel):** Bu dosya projenin ilk vizyonunu (ABD demo
> rotaları, tam biletleme/ödeme altyapısı) tanımlar. Gerçek ürün **Vapur**'a (İstanbul deniz
> ulaşımı) evrilmiştir ve teknik kararlar farklıdır (örn. seferlerin tek doğruluk kaynağı
> `apps/web`; veritabanı SQLite; biletleme/ödeme henüz yok). Güncel mimari için `README.md`
> ve `PRODUCT.md` / `DESIGN.md` dosyalarına bakın. Bu belge yalnızca tarihsel referans olarak
> korunmaktadır.

---

# 0. ANTIGRAVITY İÇİN ANA TALİMAT

Bu proje, ekte/verilen referans görseldeki **FerryFlow** isimli mobil uygulamanın profesyonel, production-ready ve gerçek zamanlı çalışan karşılığını geliştirmek içindir.

**REFERANS GÖRSEL PROJENİN ANA TASARIM KAYNAĞIDIR.**

Amaç yalnızca benzer bir uygulama yapmak değildir.

Amaç:

1. Referans görseldeki arayüz hiyerarşisini,
2. renk atmosferini,
3. kart yapısını,
4. boşluk oranlarını,
5. tipografik ağırlıkları,
6. navigasyon yapısını,
7. ikon yerleşimini,
8. cam/blur/glassmorphism efektlerini,
9. mavi tonlu deniz atmosferini,
10. gerçek zamanlı durum göstergelerini,
11. canlı harita deneyimini,
12. biletleme deneyimini

mümkün olduğunca **piksel seviyesinde yakın** bir ürüne dönüştürmektir.

Bu proje bir demo ekranından ibaret olmayacaktır.

Uygulama gerçek veri geldiğinde çalışabilecek şekilde tasarlanacak, ancak gerçek denizcilik veri sağlayıcısı henüz mevcut değilse sistem **Mock Provider** üzerinden eksiksiz şekilde çalışabilecektir.

---

# 1. EN ÖNEMLİ ÇALIŞMA KURALI

Kod yazmaya başlamadan önce:

1. Proje gereksinimlerini analiz et.
2. Referans görseli ayrıntılı olarak incele.
3. Proje klasör yapısını planla.
4. UI Design System oluştur.
5. Veri modelini tasarla.
6. API sözleşmelerini oluştur.
7. Mock veri sağlayıcıyı oluştur.
8. Uygulamayı parçalara ayır.
9. Her ana modülü ayrı görev olarak planla.
10. Her tamamlanan modülden sonra browser üzerinde test gerçekleştir.
11. UI testlerinde screenshot al.
12. Referans görselle karşılaştır.
13. Görsel farkları düzelt.
14. Build ve test çalışmadan bir fazı tamamlanmış kabul etme.

**KESİNLİKLE bütün projeyi tek dosyada veya tek büyük component içerisinde oluşturma.**

---

# 2. PROJE HEDEFİ

FerryFlow;

- feribot seferlerini görüntüleyen,
- gerçek zamanlı kalkış geri sayımı gösteren,
- gecikme ve sefer durumlarını gösteren,
- canlı gemi konumlarını haritada gösteren,
- rota ve iskele araması yapan,
- bilet satın alabilen,
- QR bilet üreten,
- bildirim gönderen,
- kullanıcı hesabını yöneten

modern bir ulaşım uygulamasıdır.

Uygulama:

- mobil öncelikli,
- responsive,
- erişilebilir,
- hızlı,
- gerçek zamanlı,
- offline toleranslı,
- güvenli,
- ölçeklenebilir

olmalıdır.

---

# 3. REFERANS GÖRSELİN ANALİZİ

Referans görsel yaklaşık 1024x1024 oranında bir ürün sunum görselidir.

Ana görsel karakter:

- arka planda deniz,
- bulanıklaştırılmış gerçek feribot,
- mavi tonlarda atmosfer,
- sağ/orta bölümde telefon,
- telefon içinde koyu lacivert uygulama arayüzü,
- açık renk kartlar,
- parlak mavi aksanlar,
- hafif cam efekti,
- yuvarlatılmış büyük kartlar,
- alt navigasyon,
- büyük başlık,
- canlı durum göstergeleri.

Uygulama hissi:

**premium + modern + maritime + trustworthy + realtime**

olmalıdır.

Tasarım:

- karanlık,
- kasvetli,
- siyah ağırlıklı,
- neon cyberpunk,
- gereksiz gradient,
- gereksiz animasyon,
- fazla renk,
- klasik admin paneli

gibi görünmemelidir.

---

# 4. ANA RENK PALETİ

Renkler Design Token olarak tanımlanacaktır.

Başlangıç değerleri:

```text
Primary Navy:
#071A33

Deep Navy:
#041225

Surface Navy:
#0C2342

Secondary Navy:
#102D4F

Primary Blue:
#2696FF

Bright Blue:
#3EAAFF

Soft Blue:
#73C4FF

Success:
#27C56B

Warning:
#F6B73C

Danger:
#FF4D5D

White:
#FFFFFF

Text Primary:
#F7FAFF

Text Secondary:
#A7B6C8

Text Muted:
#72849B

Card:
#E9EEF5

Card Secondary:
#DCE5EF

Divider:
rgba(255,255,255,0.12)

Overlay:
rgba(5,18,38,0.68)
```

Ancak:

**Referans görsel üzerinde daha doğru değerler tespit edilebilir ve görsel karşılaştırmada fark bulunursa Design Token değerlerini optimize et.**

Hard-coded renk kullanma.

Örneğin:

```css
color: #2696FF;
```

yerine:

```css
color: var(--color-primary);
```

veya tasarım sisteminin eşdeğeri kullanılmalıdır.

---

# 5. TIPOGRAFİ

Ana font:

**Inter**

Alternatif:

**SF Pro Display / system-ui**

Başlıklar:

- güçlü,
- semibold/bold,
- sıkı satır yüksekliği.

Örnek:

```text
Ferry Schedules
```

Ana başlık:

32–36 px

Section başlığı:

20–22 px

Kart başlığı:

16–18 px

Body:

14–16 px

Secondary:

12–14 px

Countdown:

18–26 px

Departure Time:

22–28 px

Sayısal değerlerde mümkün olduğunca:

```text
font-variant-numeric: tabular-nums;
```

kullan.

Sayaçların genişliği değişirken arayüz titrememelidir.

---

# 6. BORDER RADIUS

Design token:

```text
Radius XS: 6px
Radius SM: 10px
Radius MD: 14px
Radius LG: 18px
Radius XL: 24px
Radius Card: 18px
Radius Pill: 999px
```

Referans görseldeki kartlar yuvarlatılmış ve modern görünmelidir.

---

# 7. GÖLGE SİSTEMİ

Kartlar düz beyaz kutular gibi görünmemelidir.

Örnek:

```css
box-shadow:
  0 10px 30px rgba(0,0,0,.12),
  0 2px 8px rgba(0,0,0,.08);
```

Ancak gölgeleri referans görüntüdeki kadar hafif tut.

---

# 8. GLASSMORPHISM

Referans görüntüdeki bazı yüzeylerde cam hissi bulunmalıdır.

Örnek:

```css
background: rgba(255,255,255,0.12);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border: 1px solid rgba(255,255,255,0.18);
```

Fakat bütün ekranı glassmorphism yapma.

Glass efektini yalnızca:

- overlay,
- modal,
- bazı üst katmanlar,
- navigation,
- floating controls

için kullan.

---

# 9. TEKNOLOJİ KARARI

İlk sürüm için:

## Frontend

```text
Next.js
TypeScript
React
Tailwind CSS
Lucide Icons
TanStack Query
Zod
```

Mobil öncelikli responsive yapı oluştur.

Uygulama PWA olarak çalışmalıdır.

İleride gerekiyorsa aynı backend'e:

- Capacitor
- React Native
- native mobile clients

bağlanabilecek şekilde API-first yaklaşım uygula.

---

# 10. BACKEND

Önerilen:

```text
NestJS
TypeScript
PostgreSQL
PostGIS
Redis
WebSocket
```

Başlangıçta:

**Modüler Monolith**

kullan.

Aşağıdaki modüller birbirinden bağımsız domain olarak tasarlanmalıdır:

```text
Auth
Users
Operators
Ports
Routes
Trips
Schedules
Tracking
Tickets
Payments
Notifications
Favorites
Search
Settings
Admin
```

İleride bağımsız mikroservise dönüştürülebilecek şekilde temiz sınırlar koy.

---

# 11. MESSAGE / EVENT SİSTEMİ

İlk sürümde Kafka'yı zorunlu kılma.

Başlangıç:

```text
Redis
Redis Streams / BullMQ
```

kullanılabilir.

Event isimleri:

```text
trip.updated
trip.delayed
trip.cancelled
trip.departing_soon
vessel.position_updated
platform.changed
ticket.created
ticket.refunded
notification.created
payment.completed
```

İleride Kafka'ya geçiş için event publisher abstraction oluştur.

---

# 12. VERİTABANI

PostgreSQL + PostGIS.

Ana tablolar:

```text
users
operators
vessels
ports
terminals
routes
route_stops
schedules
trips
trip_status
vessel_positions
tickets
ticket_events
payments
notifications
favorites
saved_routes
refresh_tokens
audit_logs
```

---

# 13. VESSEL MODEL

Gemi:

```text
id
name
imo_number
mmsi
operator_id
capacity
status
latitude
longitude
heading
speed
last_seen_at
created_at
updated_at
```

Status:

```text
DOCKED
BOARDING
DEPARTING
IN_TRANSIT
ARRIVING
DELAYED
CANCELLED
OFFLINE
```

---

# 14. ROUTE MODEL

Rota:

```text
id
operator_id
origin_port_id
destination_port_id
duration_minutes
distance_km
active
```

Route Stop:

```text
route_id
port_id
sequence
scheduled_arrival
scheduled_departure
```

---

# 15. TRIP MODEL

Trip:

```text
id
route_id
vessel_id
scheduled_departure
estimated_departure
actual_departure
scheduled_arrival
estimated_arrival
actual_arrival
platform
status
```

Status enum:

```text
SCHEDULED
BOARDING
ON_TIME
DEPARTING_SOON
DELAYED
DEPARTED
ARRIVING
COMPLETED
CANCELLED
```

---

# 16. CANLI GERİ SAYIM MOTORU

Countdown client'ta yalnızca cihaz saatine güvenerek çalışmayacak.

Server:

```text
serverTime
```

göndermeli.

Client:

```text
clockOffset = serverTime - clientTime
```

hesaplamalı.

Böylece kullanıcı cihaz saati yanlış olsa bile sayaç doğru çalışmalıdır.

Sayaç:

```text
00:04:32
```

gibi gösterilebilir.

Durum:

```text
DEPARTING SOON
```

olarak görüntülenmelidir.

---

# 17. DURUM RENKLERİ

```text
ON TIME
→ Green

DEPARTING SOON
→ Blue

DELAYED
→ Red

BOARDING
→ Blue

CANCELLED
→ Dark Red / Red

ARRIVING
→ Blue
```

Fakat renkler yalnızca renk ile anlatılmamalıdır.

Örneğin:

```text
DELAYED
+ icon
+ text
```

birlikte kullanılmalıdır.

Bu erişilebilirlik için zorunludur.

---

# 18. AIS ENTEGRASYONU

Doğrudan AIS sağlayıcısına bağlanmak için frontend kullanılmayacak.

Akış:

```text
AIS Provider
        ↓
AIS Adapter
        ↓
Tracking Service
        ↓
Normalizer
        ↓
Redis
        ↓
WebSocket Gateway
        ↓
Mobile/Web Client
```

Provider bağımsız interface oluştur:

```ts
interface VesselTrackingProvider {
   getPositions(): Promise<VesselPosition[]>;
}
```

İleride:

```text
MarineTraffic
AISHub
Kpler
Spire
Operator API
Custom AIS feed
```

gibi sağlayıcılar eklenebilsin.

Gerçek provider yoksa:

```text
MockTrackingProvider
```

kullan.

---

# 19. GTFS-REALTIME

Eğer ilgili operatör GTFS-RT sağlıyorsa adapter oluştur.

Normalize edilmiş model:

```text
TripUpdate
VehiclePosition
ServiceAlert
```

Frontend sağlayıcının ham formatını asla bilmemelidir.

---

# 20. HARİTA

Öneri:

**Mapbox**

Harita:

- koyu/deniz temalı,
- sade,
- gereksiz POI göstermeyen,
- feribot odaklı

olmalıdır.

Gemi ikonu:

```text
ship marker
heading rotation
```

ile ilerleme yönünü göstermelidir.

Her gemi:

```text
name
route
status
speed
destination
ETA
```

bilgisini gösterebilmeli.

---

# 21. ANİMASYON

Gemi marker:

Ani teleport etmeyecek.

Konum değişimleri arasında:

```text
interpolation
```

yapılmalıdır.

Örneğin:

```text
A noktasından B noktasına
500 ms – 1500 ms
```

arasında yumuşak hareket.

Ama aşırı animasyon kullanma.

Öncelik:

**realism > visual gimmick**

---

# 22. REFERANS ANA EKRAN

Ana ekran şu hiyerarşiyi korumalıdır:

```text
Top Bar
↓
Page Title
↓
Date
↓
Search
↓
Schedule Cards
↓
Nearby Routes
↓
Bottom Navigation
```

---

# 23. TOP BAR

Logo:

```text
ship icon + FerryFlow
```

Sol tarafta:

```text
FerryFlow
```

Sağda:

```text
Search Icon
Profile Icon
```

Arka plan:

koyu lacivert.

---

# 24. ANA BAŞLIK

```text
Ferry Schedules
```

Altında:

```text
Tuesday, Oct 26
```

veya sistem tarihine göre dinamik gün/tarih.

Demo verisi kullanılıyorsa mevcut sistem tarihi ile demo senaryosunu birbirinden ayır.

---

# 25. SEARCH BAR

Referans görseldeki gibi geniş yuvarlak search bar.

Placeholder:

```text
Search Routes & Destinations...
```

Icon:

search.

Search alanı:

- origin
- destination
- operator
- route

arama yapmalıdır.

---

# 26. SCHEDULE CARD

Her sefer kartı aşağıdaki bilgileri taşımalıdır:

```text
Operator / transport icon
Origin → Destination
Route
Departure time
Boarding status
Countdown
Vessel
Platform
Price
Status
```

Örnek:

```text
Manhattan to Brooklyn

Route: Lower Manhattan → Dumbo

17:15

DEPARTING SOON

04:32

Vessel
MV Empire State

Platform
Pier 11

$3.50
```

---

# 27. SCHEDULE CARD LAYOUT

Kart:

- açık gri/beyaz,
- 18px radius,
- hafif shadow,
- geniş yatay düzen,
- sol bölüm saat,
- merkez bölüm rota ve durum,
- sağ bölüm countdown/price.

Mobilde kart içindeki bilgi sıkışırsa:

```text
time
route
status
countdown
```

öncelikli tutulmalıdır.

---

# 28. CARD STATUS COMPONENT

Tek component:

```text
TripStatusBadge
```

props:

```ts
status
label
```

olmalıdır.

Hard-coded span kopyalama.

---

# 29. NEARBY ROUTES

Alt bölüm:

```text
Nearby Routes
```

yatay kaydırmalı kartlar.

Kartlarda:

- görsel,
- rota adı,
- kısa bilgi

olmalıdır.

Mobile horizontal scroll.

---

# 30. ALT NAVİGASYON

Referans:

```text
Map
Schedules
Live Map
Tickets
Notifications
```

5 sekme.

Nav yüksekliği:

yaklaşık 76–84px.

Arka plan:

açık gri/çok açık beyaz.

Aktif sekme:

mavi.

Inactive:

gri.

---

# 31. EKRANLAR

Minimum ekranlar:

```text
1. Splash
2. Onboarding
3. Login
4. Register
5. Home / Schedules
6. Search
7. Route Details
8. Trip Details
9. Live Map
10. Map Detail
11. Tickets
12. Ticket Detail
13. QR Ticket
14. Purchase
15. Payment
16. Notifications
17. Favorites
18. Profile
19. Settings
20. Help
21. Terms
22. Privacy
23. Error
24. Offline
```

---

# 32. ROUTE DETAILS

Göster:

```text
Route
Origin
Destination
Duration
Next departures
Price
Operator
Vessel
Stops
```

---

# 33. TRIP DETAILS

Göster:

```text
Departure
Arrival
Platform
Vessel
Status
Live location
Price
Booking
```

---

# 34. LIVE MAP

Ana amaç:

kullanıcı çevresindeki gemileri gerçek zamanlı görmek.

Ekran:

```text
Full map
Floating search
Filter
Locate me
Route selector
Vessel markers
Bottom information sheet
```

Bottom sheet:

```text
MV Empire State
Manhattan → Brooklyn
Arriving in 04:32
```

---

# 35. MAP FILTER

Filtreler:

```text
All
My Routes
Nearby
Arriving
Departing
Delayed
```

---

# 36. BİLETLEME

Bilet akışı:

```text
Route
↓
Trip
↓
Passengers
↓
Seat / Ticket type
↓
Price
↓
Payment
↓
Ticket generated
↓
QR Code
```

---

# 37. QR BİLET

QR yalnızca statik bir metin içermemelidir.

Ticket:

```text
ticketId
userId
tripId
issuedAt
expiresAt
nonce
signature
```

imzalanmış olmalıdır.

QR içine:

- hassas kişisel bilgiler,
- kart bilgileri,
- plaintext kullanıcı bilgileri

koyma.

---

# 38. QR GÜVENLİĞİ

Dinamik QR önerisi:

```text
ticketId
timestamp window
nonce
signature
```

Server tarafından doğrulanmalıdır.

Verifier sistemi:

```text
Scan
↓
Backend verification
↓
Valid / Invalid / Expired / Already Used
```

Offline doğrulama gerekecekse ayrıca:

- signed ticket payload,
- public key doğrulaması,
- kısa süreli kullanım penceresi

tasarlanmalıdır.

---

# 39. ÖDEME

Ödeme provider abstraction:

```ts
interface PaymentProvider {
   createPayment()
   confirmPayment()
   refundPayment()
}
```

Gerçek entegrasyon için Türkiye'de uygun bir ödeme sağlayıcısı seçilebilir.

Ödeme kartı bilgileri uygulama backend'inde saklanmamalıdır.

Development ortamında:

```text
MockPaymentProvider
```

kullan.

---

# 40. BİLET CÜZDANI

Tickets ekranı:

```text
Active
Used
Expired
Cancelled
```

tablarına sahip olmalı.

Aktif bilet en üstte.

Kart:

```text
Route
Departure
Date
Passenger
QR
Ticket ID
```

---

# 41. NOTIFICATION

Bildirim türleri:

```text
Trip delayed
Trip cancelled
Platform changed
Boarding started
Departure soon
Ticket confirmed
Payment successful
```

Push notification altyapısı adapter ile yapılmalıdır.

Öneri:

```text
Firebase Cloud Messaging
```

---

# 42. FAVORİLER

Kullanıcı:

- rota,
- iskele,
- operatör

favorileyebilir.

Ana sayfada:

```text
My Routes
```

gibi kişiselleştirilmiş bölüm kullanılabilir.

---

# 43. OFFLINE MODE

İnternet kesilirse uygulama boş kalmamalı.

Cache:

```text
last schedules
active tickets
favorite routes
basic port data
```

gösterilebilmeli.

Açıkça:

```text
Offline
Last updated 2 min ago
```

göster.

Canlı veri olmadığı halde "Live" gösterme.

---

# 44. NETWORK ERROR

Örneğin API başarısızsa:

```text
Unable to load schedules
Retry
```

göster.

Boş beyaz ekran oluşturma.

---

# 45. LOADING

Skeleton UI kullan.

Kartların yerinde:

- skeleton time,
- skeleton title,
- skeleton status,
- skeleton price

görünsün.

Spinner ile bütün ekranı bloklama.

---

# 46. EMPTY STATE

Örneğin arama sonucunda:

```text
No routes found
Try a different destination.
```

---

# 47. ERROR STATE

Teknik hata kullanıcıya gösterilmemeli.

Gösterme:

```text
TypeError
HTTP 500
Stack trace
```

yerine:

```text
Something went wrong.
Please try again.
```

log tarafında teknik bilgi tut.

---

# 48. AUTH

Destek:

```text
Email/password
Google
Apple
```

OAuth/OIDC.

JWT:

```text
short-lived access token
refresh token
```

Refresh token güvenli şekilde saklanmalı.

Mobilde:

```text
Secure Storage / Keychain / Keystore
```

kullan.

---

# 49. USER PROFILE

Profil:

```text
Name
Email
Phone
Saved Routes
Tickets
Notification Settings
Language
Theme
Privacy
Logout
```

---

# 50. DİL DESTEĞİ

İlk dil:

```text
English
```

Ancak localization yapısı baştan hazır olacak.

Desteklenebilir:

```text
English
Turkish
German
```

Hard-coded kullanıcı arayüzü metni kullanma.

Örneğin:

```ts
t("trip.delayed")
```

kullan.

---

# 51. TARİH VE SAAT

Tarih ve saat işlemleri:

```text
ISO 8601
UTC storage
Timezone aware display
```

olmalıdır.

Backend UTC saklamalı.

Frontend kullanıcının timezone'una göre göstermeli.

---

# 52. API

REST API kullan.

Örnek:

```text
GET /api/v1/routes
GET /api/v1/routes/:id
GET /api/v1/trips
GET /api/v1/trips/:id
GET /api/v1/schedules
GET /api/v1/vessels
GET /api/v1/vessels/:id
GET /api/v1/ports
GET /api/v1/notifications
GET /api/v1/tickets
POST /api/v1/tickets
POST /api/v1/payments
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

Swagger/OpenAPI oluştur.

---

# 53. WEBSOCKET

Örneğin:

```text
/ws/tracking
/ws/trips
/ws/notifications
```

veya tek gateway.

Events:

```text
vessel.position
trip.updated
trip.status_changed
platform.updated
```

---

# 54. FRONTEND STATE MANAGEMENT

Server state:

```text
TanStack Query
```

Local UI state:

```text
React state
Zustand
```

kullanılabilir.

Server state ile UI state'i birbirine karıştırma.

---

# 55. COMPONENT MİMARİSİ

Önerilen:

```text
components/
  ui/
  navigation/
  schedule/
  tracking/
  map/
  ticket/
  payment/
  notification/
  profile/
```

Sayfa:

```text
app/
```

Domain mantığı:

```text
features/
```

API:

```text
lib/api/
```

types:

```text
types/
```

---

# 56. MONOREPO

Önerilen yapı:

```text
ferryflow/
│
├── apps/
│   ├── web/
│   ├── api/
│   └── admin/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── api-client/
│
├── infrastructure/
│
├── docs/
│
├── tests/
│
├── scripts/
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# 57. ADMIN PANEL

Admin panel kesinlikle tasarlanmalı.

Admin:

```text
Dashboard
Operators
Ports
Routes
Schedules
Trips
Vessels
Live Tracking
Tickets
Payments
Notifications
Users
Audit Logs
Settings
```

---

# 58. ADMIN DASHBOARD

Göster:

```text
Active vessels
Trips today
Delayed trips
Tickets sold
Revenue
Active users
System health
```

---

# 59. OPERATOR YÖNETİMİ

CRUD:

```text
Create
Read
Update
Delete
Activate
Deactivate
```

---

# 60. SCHEDULE MANAGEMENT

Admin:

```text
Create trip
Set departure
Set arrival
Assign vessel
Assign platform
Set price
Set route
```

---

# 61. MANUEL DELAY

Admin trip durumunu manuel değiştirebilmeli:

```text
ON TIME
DELAYED
CANCELLED
BOARDING
```

ve kullanıcıya bildirim gönderilebilmeli.

---

# 62. AUDIT LOG

Her kritik işlem:

```text
who
what
when
ip
target
metadata
```

ile loglanmalı.

---

# 63. GÜVENLİK

Minimum:

```text
HTTPS
TLS
JWT
Refresh Token Rotation
Rate Limiting
CORS
CSRF protection where applicable
Input validation
Zod/class-validator
SQL parameterization
Helmet
Security headers
```

---

# 64. RATE LIMITING

Özellikle:

```text
login
register
refresh
payment
ticket validation
search
```

endpointleri korunmalı.

---

# 65. INPUT VALIDATION

Frontend doğrulaması yeterli değildir.

Backend mutlaka tekrar doğrulamalıdır.

---

# 66. SECRET MANAGEMENT

Şunları asla repository'ye koyma:

```text
API keys
Mapbox token
database passwords
JWT secret
payment secret
Firebase credentials
AIS credentials
```

`.env`

ve secret manager kullan.

---

# 67. ENV

Oluştur:

```text
.env.example
.env.local.example
.env.production.example
```

Gerekirse açıklama ekle.

---

# 68. MOCK MODE

Projeyi üçüncü parti servis olmadan çalıştırmak zorunlu.

Örneğin:

```text
DEMO_MODE=true
```

olduğunda:

- sahte seferler,
- sahte gemiler,
- sahte gecikmeler,
- sahte biletler,
- sahte ödeme

çalışmalıdır.

Böylece UI bağımsız test edilebilir.

---

# 69. DEMO SENARYOSU

Uygulama ilk açıldığında gerçekçi demo verisi gelsin.

Örnek:

```text
Manhattan → Brooklyn
17:15
DEPARTING SOON
04:32

San Francisco → Sausalito
17:30
ON TIME

Seattle → Bainbridge Island
17:45
DELAYED
```

Bu veriler referans görseldeki görsel hiyerarşiyi test etmek içindir.

---

# 70. CANLI TEST SENARYOSU

Mock Tracking Engine:

geminin konumunu zaman içinde değiştirsin.

Örnek:

```text
Vessel A:
Lat/Lng → position 1
↓
position 2
↓
position 3
```

Haritada hareket etsin.

---

# 71. MOCK DELAY ENGINE

Demo sırasında:

```text
ON TIME
↓
DELAYED
↓
BOARDING
↓
DEPARTING
↓
IN TRANSIT
↓
ARRIVING
↓
COMPLETED
```

durum geçişlerini simüle edebil.

---

# 72. UI STATE MACHINE

Trip status geçişlerini merkezi bir şekilde tanımla.

Random status değişimi yapma.

Örneğin:

```text
SCHEDULED
→ BOARDING
→ DEPARTING
→ IN_TRANSIT
→ ARRIVING
→ COMPLETED
```

Hata:

```text
CANCELLED
```

herhangi bir kritik aşamada oluşabilir.

---

# 73. RESPONSIVE DESIGN

Temel hedef:

```text
390 x 844
393 x 852
430 x 932
768 x 1024
1024 x 1366
1440 x 900
```

ekranlarında düzgün görünmesidir.

Öncelik:

**mobile first**

---

# 74. REFERANS GÖRSEL İÇİN PİKSEL UYUM

Antigravity:

1. Referans görüntüyü project içine koy.
2. Browser screenshot al.
3. Görseli referansla yan yana karşılaştır.
4. Aşağıdakileri kontrol et:

```text
Header position
Title position
Search width
Card width
Card height
Card spacing
Font size
Font weight
Icon size
Border radius
Countdown position
Bottom nav height
Page padding
```

Fark varsa düzelt.

---

# 75. TASARIM KABUL KRİTERİ

Ana ekran:

referansın sadece “havasını” taşıması yeterli değildir.

Şunlar mümkün olduğunca eşleşmeli:

```text
Visual hierarchy
Relative dimensions
Spacing
Colors
Typography
Card structure
Navigation position
Icon placement
Status placement
```

---

# 76. İKONOGRAFİ

Lucide Icons veya uygun modern icon set kullan.

Gemiler için:

```text
Ship / Ferry icon
```

kullan.

Her yerde emoji kullanma.

Örneğin:

YANLIŞ:

```text
🚢
```

DOĞRU:

SVG icon.

---

# 77. GÖRSEL VARLIKLAR

Asset yapısı:

```text
public/
  images/
  icons/
  vessels/
  ports/
  backgrounds/
```

Placeholder görseller kullanılabilir.

Ancak production için remote image dependency oluşturma.

---

# 78. ANA ARKA PLAN

Referanstaki fotoğraf uygulamanın kendisinin zorunlu bir ekran arka planı değildir.

UI:

koyu denizci laciverti üzerine kurulacaktır.

Splash/hero/onboarding için:

- deniz,
- feribot,
- iskele,
- liman

görselleri kullanılabilir.

---

# 79. MİKRO ANİMASYONLAR

Kullan:

```text
button press
card hover
navigation transition
modal transition
sheet transition
map marker movement
countdown transition
notification appearance
```

Ancak:

**animasyon tasarımı ele geçirmemelidir.**

---

# 80. PERFORMANCE

Hedef:

```text
Fast first render
Low bundle size
Lazy loaded routes
Optimized images
Virtualized long lists
Debounced search
WebSocket cleanup
No memory leaks
```

---

# 81. CACHE

Redis:

```text
active vessel positions
popular routes
schedule cache
session information
rate limit counters
```

Frontend:

```text
TanStack Query cache
```

---

# 82. REALTIME KAYNAK YOKSA

Uygulama çökmeyecek.

Şu yapı kullanılacak:

```text
Provider
   ↓
Normalizer
   ↓
Domain
   ↓
Cache
   ↓
Realtime
```

Provider yok:

```text
MockProvider
```

aktif olur.

---

# 83. OBSERVABILITY

Backend:

```text
structured logging
request id
correlation id
error tracking
health checks
metrics
```

endpoint:

```text
/health
/ready
```

---

# 84. LOG SİSTEMİ

Log:

```json
{
  "requestId": "...",
  "service": "tracking",
  "event": "vessel.position_updated",
  "timestamp": "...",
  "vesselId": "..."
}
```

---

# 85. TESTLER

Minimum:

## Unit

```text
Countdown engine
Trip status machine
Price calculation
Ticket signing
Ticket validation
Date conversion
Provider normalization
```

## Integration

```text
Auth
Schedule
Trip
Ticket
Payment
Notification
```

## E2E

```text
Login
Search
Select trip
Purchase
Generate ticket
Open QR
Receive notification
View live map
```

---

# 86. VISUAL REGRESSION

Ana ekran için screenshot test oluştur.

Özellikle:

```text
Home
Live Map
Trip Details
Ticket
Notifications
```

kontrol edilsin.

---

# 87. ACCESSIBILITY

Minimum:

```text
Keyboard navigation
ARIA labels
Readable contrast
Focus states
Screen reader friendly
44px minimum touch target
```

---

# 88. PWA

Destek:

```text
Installable
Manifest
Service Worker
Offline shell
Cached assets
Offline ticket view
```

---

# 89. DATABASE SEED

Development için seed script:

```text
operators
ports
routes
vessels
schedules
trips
users
tickets
notifications
```

oluştursun.

---

# 90. DOCKER

Development:

```text
PostgreSQL
Redis
```

docker-compose ile ayağa kalkabilsin.

Örnek:

```bash
docker compose up -d
```

---

# 91. TEK KOMUT

Proje mümkün olduğu kadar:

```bash
npm install
npm run dev
```

ile ayağa kaldırılabilmeli.

Root workspace scriptleri:

```text
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
npm run db:migrate
npm run db:seed
```

---

# 92. CI/CD

GitHub Actions:

```text
lint
typecheck
test
build
```

çalıştırmalı.

---

# 93. GIT

Commit yapısı:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

kullan.

Büyük özellikleri tek dev commit yapma.

---

# 94. DOKÜMANTASYON

`README.md`

şunları içermeli:

```text
Project overview
Architecture
Tech stack
Folder structure
Environment variables
Local setup
Database setup
Mock mode
Realtime mode
Testing
Deployment
Troubleshooting
```

---

# 95. API DOKÜMANTASYONU

Swagger oluştur.

Her endpoint:

```text
request
response
errors
authentication
example
```

ile belgelenmeli.

---

# 96. ERROR CONTRACT

Backend hata biçimi standart olmalı:

```json
{
  "success": false,
  "error": {
    "code": "TRIP_NOT_FOUND",
    "message": "Trip not found"
  }
}
```

---

# 97. RESPONSE CONTRACT

Başarılı:

```json
{
  "success": true,
  "data": {}
}
```

---

# 98. DOMAIN ERROR CODE'LARI

Örnek:

```text
AUTH_INVALID_CREDENTIALS
TRIP_NOT_FOUND
ROUTE_NOT_FOUND
PAYMENT_FAILED
TICKET_EXPIRED
TICKET_ALREADY_USED
VESSEL_OFFLINE
BOOKING_UNAVAILABLE
```

---

# 99. SEARCH

Arama:

```text
Manhattan
Brooklyn
Sausalito
Seattle
Bainbridge
```

gibi destinasyonları bulabilmeli.

Arama sonuçlarını:

```text
Routes
Ports
Operators
```

olarak kategorize et.

---

# 100. MAP ARAMA

Kullanıcı:

```text
Where are you going?
```

gibi bir arama yapabilsin.

Origin / Destination seçilebilir.

---

# 101. FAVORİ ROTA KISAYOLU

Ana ekranda kullanıcı favori bir rotayı sabitleyebilsin.

---

# 102. NOTIFICATION UX

Bildirim kartı:

```text
icon
title
message
timestamp
read/unread
```

olmalı.

Unread:

küçük mavi indicator.

---

# 103. TICKET UX

Bilet ekranı:

```text
ACTIVE TICKET
```

üstte güçlü şekilde gösterilsin.

QR merkezi konumda.

---

# 104. BARKOD / QR OKUMA

Gelecekte scanner eklenebilmesi için:

```text
TicketVerificationService
```

ayrıştırılmalıdır.

---

# 105. ADMIN / USER YETKİLERİ

Roller:

```text
USER
OPERATOR
ADMIN
SUPER_ADMIN
```

olabilir.

RBAC uygulanmalı.

---

# 106. RATE LIMITING

Örnek başlangıç:

```text
Login:
5 req/min/IP

Search:
60 req/min/user

API:
120 req/min/user

Ticket validation:
30 req/min/device
```

Bunlar başlangıç değerleridir; load test sonucuna göre değiştir.

---

# 107. SECURITY HEADERS

Eklenmesi gerekenler:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

production'da uygun şekilde aktif et.

---

# 108. MOBILE SECURITY

Tokenlar mümkünse:

```text
Secure Storage
```

üzerinde tutulmalı.

Screenshot/QR güvenliği ayrıca değerlendirilmeli.

---

# 109. PAYMENT SAFETY

Kart numarası:

backend DB'ye kaydedilmemelidir.

Payment provider tokenization kullan.

---

# 110. KVKK / GDPR

Privacy architecture:

```text
minimal data collection
purpose limitation
data deletion
account deletion
export capability
consent records
```

tasarlanmalı.

Hukuki metinler geliştirici tarafından uydurulmamalıdır.

---

# 111. ANALYTICS

Analytics adapter:

```ts
AnalyticsProvider
```

kullan.

Örnek event:

```text
app_opened
route_searched
trip_viewed
ticket_started
payment_completed
ticket_opened
notification_opened
```

PII göndermemeye dikkat et.

---

# 112. FEATURE FLAGS

Örnek:

```text
ENABLE_LIVE_TRACKING
ENABLE_PAYMENTS
ENABLE_DYNAMIC_QR
ENABLE_PUSH
ENABLE_DEMO_MODE
```

---

# 113. PROVIDER ABSTRACTION

External service dependency doğrudan domain içine yazılmayacak.

Örnek:

```text
MapProvider
PaymentProvider
TrackingProvider
NotificationProvider
AuthProvider
AnalyticsProvider
```

---

# 114. DEVELOPER MODE

Development ortamında:

```text
Demo Mode
```

açılıp kapatılabilsin.

Örneğin debug panel:

```text
[ ] Simulate Delay
[ ] Simulate Cancellation
[ ] Simulate Boarding
[ ] Simulate Vessel Movement
```

sadece development ortamında görünmeli.

---

# 115. NO FAKE FUNCTIONALITY

Aşağıdakileri gerçekmiş gibi gösterme:

```text
fake payment success
fake AIS connected
fake notification sent
```

Demo modunda olduklarını açıkça ayır.

Production mode gerçek provider beklemeli.

---

# 116. UI COMPONENT STANDARDI

Tekrar eden bütün parçaları component yap.

Örneğin:

```text
AppHeader
SearchBar
ScheduleCard
TripStatusBadge
Countdown
RouteCard
BottomNavigation
VesselMarker
MapControls
NotificationCard
TicketCard
QrTicket
PriceDisplay
EmptyState
ErrorState
SkeletonCard
```

---

# 117. COMPONENT PROPS

Loose object passing yapma.

TypeScript strict mode kullan.

---

# 118. TYPESCRIPT

```text
strict: true
```

olmalı.

`any` kullanımını minimuma indir.

---

# 119. LINT

ESLint aktif.

Format:

Prettier.

---

# 120. ACCESSIBILITY LABEL ÖRNEKLERİ

Search icon:

```text
Search routes and destinations
```

Profile:

```text
Open profile
```

Live map:

```text
Open live ferry map
```

---

# 121. USER FEEDBACK

Loading/error durumları kullanıcıya anlaşılır şekilde gösterilmeli.

---

# 122. PRIMARY DESIGN RULE

Tasarımda:

**“Daha fazla özellik eklemek” = “daha iyi tasarım” değildir.**

Referans görseldeki sadelik korunmalıdır.

---

# 123. TASARIM ATMOSFERİ

Ana sıfatlar:

```text
Premium
Calm
Maritime
Trustworthy
Modern
Clean
Real-time
Professional
```

Kaçınılacaklar:

```text
Cyberpunk
Gaming
Over-neon
Excessive glass
Oversaturated gradients
Generic dashboard
```

---

# 124. HOMEPAGE ÖNCELİK SIRASI

Kullanıcı ilk baktığında:

1. Şu an hangi seferler var?
2. Ne zaman kalkıyor?
3. Gecikme var mı?
4. Nereden kalkıyor?
5. Hangi gemi?
6. Platform?
7. Fiyat?

sorularının cevaplarını hızlıca görebilmeli.

---

# 125. USER JOURNEY

Ana kullanıcı senaryosu:

```text
Open App
↓
View nearby routes
↓
Search destination
↓
Select route
↓
See next trips
↓
Select trip
↓
Buy ticket
↓
Payment
↓
Ticket generated
↓
Open QR
↓
Receive delay/platform notification
↓
Watch vessel live
```

Bu akış baştan sona test edilmelidir.

---

# 126. PERFORMANCE TARGET

Hedef:

```text
Initial UI render < 2.5 sec on reasonable connection
Interactive state < 3 sec
WebSocket connection < 2 sec where possible
Schedule update < 1 sec after server event
```

Demo/production ortamı farklı ölçümlenmelidir.

---

# 127. REALTIME UPDATE RULE

WebSocket bağlantısı koparsa:

```text
reconnect with exponential backoff
```

uygula.

Örneğin:

```text
1s
2s
4s
8s
16s
```

maksimum sınır koy.

---

# 128. REALTIME HEARTBEAT

Socket health:

```text
ping
pong
last_seen
```

üzerinden takip edilsin.

---

# 129. VESSEL OFFLINE

Bir gemiden belirli süre veri alınmıyorsa:

```text
OFFLINE
```

olarak göster.

Süre domain configuration olsun.

---

# 130. DATA FRESHNESS

Live position yanında:

```text
Updated 8 sec ago
```

gibi veri tazeliği gerektiğinde göster.

---

# 131. ADMIN MAP

Admin canlı haritada:

```text
All vessels
Status
Route
Operator
Last seen
```

görebilmeli.

---

# 132. DATABASE INDEX

Özellikle:

```text
trip.departure
trip.route_id
vessel_positions.vessel_id
vessel_positions.timestamp
tickets.user_id
notifications.user_id
```

alanlarında uygun indexler oluştur.

PostGIS spatial index kullan.

---

# 133. DATA RETENTION

Vessel position verisinin tamamı sonsuza kadar tutulmamalı.

Retention policy oluştur.

Örneğin:

```text
raw realtime positions → kısa süreli
aggregated historical positions → daha uzun
audit logs → politika ile
```

---

# 134. PRIVACY

Kullanıcı live location kullanmıyorsa konum isteme.

Location permission:

gerektiğinde istenir.

---

# 135. NOTIFICATION PERMISSION

İlk açılışta kullanıcıyı spam etme.

Bildirim izni için doğru onboarding noktası seç.

---

# 136. DARK / LIGHT MODE

Referans tasarım dark ağırlıklı.

Varsayılan:

```text
Dark
```

olmalı.

İleride:

```text
System
Light
Dark
```

desteklenebilir.

Ancak Light Mode üretilecekse aynı tasarım dilini koru.

---

# 137. MAIN SCREEN VISUAL RULES

Ana ekran kesinlikle:

- admin dashboard,
- tablo,
- Excel görünümü,
- aşırı bilgi yoğunluğu

olmamalıdır.

Mobil transport consumer app görünümü olmalıdır.

---

# 138. EXACT TEXT HIERARCHY

Başlık:

```text
Ferry Schedules
```

Arama:

```text
Search Routes & Destinations...
```

Section:

```text
Nearby Routes
```

Status örnekleri:

```text
ON TIME
DEPARTING SOON
DELAYED
BOARDING
```

---

# 139. REFERENCE IMAGE FIDELITY

Referans görüntüdeki bilgi hiyerarşisi:

```text
TOP BAR
↓
TITLE
↓
DATE
↓
SEARCH
↓
TRIP CARD
↓
TRIP CARD
↓
TRIP CARD
↓
NEARBY ROUTES
↓
BOTTOM NAV
```

bozulmamalıdır.

---

# 140. DESIGN TOKENS DOSYASI

Tek merkezden yönet:

```text
design-tokens.ts
```

veya eşdeğer yapı.

İçinde:

```text
colors
spacing
radius
shadows
typography
breakpoints
animations
```

bulunsun.

---

# 141. SPACING

Başlangıç tokenları:

```text
4
8
12
16
20
24
32
40
48
64
```

Ana mobil yatay padding:

```text
20px
```

civarında.

Referans karşılaştırmasına göre ayarla.

---

# 142. CARD SPACING

Kartlar birbirine yapışmamalı.

Yaklaşık:

```text
12–16px
```

vertical spacing.

---

# 143. BOTTOM NAV

Safe area destekle.

iPhone home indicator alanıyla çakışma olmamalı.

---

# 144. MOBILE SAFE AREA

```css
padding-bottom: env(safe-area-inset-bottom);
```

ve platform eşdeğerlerini destekle.

---

# 145. BROWSER TEST

Antigravity browser agent ile:

```text
Open app
Login
Navigate
Click
Search
Buy ticket
Open QR
Open map
```

testleri gerçekleştir.

---

# 146. SCREENSHOT TEST

En az:

```text
Home screenshot
Live Map screenshot
Ticket screenshot
Notification screenshot
```

oluştur.

---

# 147. VISUAL COMPARISON

Screenshot ile referans arasında:

```text
color
geometry
spacing
font
density
```

karşılaştırması yap.

---

# 148. ANTIGRAVITY ÇALIŞMA METODU

Bu proje tek seferde rastgele kodlanmayacak.

Aşağıdaki sırayı izle:

### PHASE 0
Analysis

### PHASE 1
Architecture

### PHASE 2
Design System

### PHASE 3
Database

### PHASE 4
Backend Core

### PHASE 5
Mock Realtime

### PHASE 6
Frontend Core

### PHASE 7
Reference UI replication

### PHASE 8
Live Map

### PHASE 9
Ticketing

### PHASE 10
Payment abstraction

### PHASE 11
Notifications

### PHASE 12
Admin

### PHASE 13
Security

### PHASE 14
Testing

### PHASE 15
Performance

### PHASE 16
Deployment

---

# 149. HER FAZ İÇİN MECBURİ KONTROL

Bir faz bitmeden:

```text
Build passes
Tests pass
Typecheck passes
Lint passes
Browser verification passes
```

olmalıdır.

---

# 150. ANTIGRAVITY'DEN İSTENEN ARTIFACT

Her büyük fazın sonunda:

```text
What changed
Files changed
Tests executed
Browser verification
Known limitations
Next steps
```

raporu oluştur.

---

# 151. KOD YAZARKEN

Kodun içine açıklamasız karmaşık hackler koyma.

Temporary fix gerekiyorsa:

```text
TODO
reason
follow-up
```

ekle.

---

# 152. MOCK VERİLER

Mock veriler gerçek veri gibi görünmeli.

Şunlar olmalı:

```text
minimum 5 operators
minimum 10 ports
minimum 10 routes
minimum 20 trips
minimum 10 vessels
multiple statuses
multiple prices
multiple delays
```

---

# 153. TEST VERİ SENARYOLARI

En az:

```text
On time trip
Departing soon
Delayed trip
Cancelled trip
Boarding trip
Offline vessel
No result search
Sold out trip
Payment failure
Expired ticket
Used ticket
Network failure
```

senaryoları hazırla.

---

# 154. TICKET PRICE

Price domain seviyesinde tutulmalı.

Örnek:

```text
currency
amount
tax
fees
total
```

decimal kullan.

Floating point para hesabı yapma.

---

# 155. CURRENCY

Money değerlerini decimal/minor unit yaklaşımıyla yönet.

Örneğin:

```text
350 cents
```

yerine doğrudan float:

```text
3.5
```

ile kritik hesap yapma.

---

# 156. TIME

Countdown hesaplamasında:

```text
server timestamp
```

kullan.

---

# 157. MAP

Harita provider abstraction kullan.

Böylece Mapbox değişirse domain kodu bozulmamalı.

---

# 158. EXTERNAL PROVIDER FAILURE

Provider başarısızsa:

```text
retry
fallback
last known data
provider status
```

mekanizması kullan.

---

# 159. LAST KNOWN POSITION

Live provider yoksa kullanıcıya:

```text
Last known position
```

göster.

Bunu güncel pozisyon gibi gösterme.

---

# 160. NOTIFICATION DEDUPLICATION

Aynı gecikme bildirimi kullanıcıya 50 kere gönderilmemeli.

Event idempotency kullan.

---

# 161. PAYMENT IDEMPOTENCY

Payment endpoint:

```text
Idempotency-Key
```

desteklemeli.

---

# 162. TICKET IDEMPOTENCY

Aynı payment sonucu iki ayrı ticket üretilmemeli.

---

# 163. CACHE INVALIDATION

Schedule değiştiğinde ilgili cache invalidate edilmeli.

---

# 164. REALTIME FANOUT

Bir geminin konumu değiştiğinde gereksiz tüm kullanıcıya tüm dataset gönderilmemeli.

Client subscription mantığı mümkün olduğunca route/geofence bazlı tasarlanmalı.

---

# 165. PRODUCTION READINESS

Production'a çıkmadan:

```text
Secrets
Logging
Monitoring
Error tracking
Database backups
Rate limiting
Security headers
HTTPS
Payment configuration
Push configuration
Map configuration
AIS configuration
```

kontrol edilmelidir.

---

# 166. DEPLOYMENT

Örnek hedef:

Frontend:

```text
Vercel / Cloudflare / similar
```

Backend:

```text
AWS / GCP / Azure
```

Database:

```text
Managed PostgreSQL
```

Redis:

```text
Managed Redis
```

Ancak sağlayıcı seçimini proje aşamasında netleştir.

---

# 167. BACKUP

Production DB:

- otomatik backup,
- restore test,
- retention policy

ile hazırlanmalı.

---

# 168. HEALTH CHECK

Backend:

```text
GET /health
GET /ready
```

vermelidir.

---

# 169. ADMIN SYSTEM HEALTH

Admin panel:

```text
API
Database
Redis
Tracking Provider
Payment Provider
Notification Provider
WebSocket
```

durumlarını gösterebilmeli.

---

# 170. ACCESS CONTROL

Admin endpointleri normal kullanıcı tokenı ile erişilebilir olmamalı.

---

# 171. AUDIT

Bilet durumu değiştiren admin işlemleri loglanmalı.

---

# 172. USER DELETION

Kullanıcı hesabını silebilmeli.

İlgili veriler retention ve yasal gerekliliklere göre işlenmeli.

---

# 173. TERMS / PRIVACY

Placeholder değil, uygulama içinde düzgün sayfalar oluştur.

Hukuk danışmanlığı niteliğinde iddia üretme.

---

# 174. TRANSLATION

Localization key'leri:

```text
home.title
home.search
trip.onTime
trip.delayed
ticket.active
ticket.expired
```

gibi düzenli olsun.

---

# 175. DESIGN REVIEW

Ana ekran tamamlandığında:

Referans:

```text
reference/ferryflow-reference.png
```

Uygulama screenshot:

```text
artifacts/screenshots/home.png
```

Karşılaştır.

---

# 176. VISUAL SCORE

Antigravity kendi değerlendirmesini oluştursun:

```text
Color similarity
Spacing similarity
Typography similarity
Card similarity
Navigation similarity
Overall similarity
```

10 üzerinden puanla.

8'in altındaysa yeniden düzelt.

---

# 177. ACCEPTANCE CRITERIA

Proje tamamlanmış sayılmaz:

- yalnızca build alınıyorsa,
- sadece ekran görünüyorsa,
- API mock değilse,
- navigation eksikse,
- ticket çalışmıyorsa,
- realtime yoksa,
- test yoksa,
- responsive değilse.

---

# 178. MINIMUM ACCEPTANCE

Aşağıdaki akış tamamen çalışmalı:

```text
Open App
→ Home
→ Search route
→ Select route
→ Select trip
→ See realtime countdown
→ Open map
→ See vessel movement
→ Buy demo ticket
→ Generate QR ticket
→ Open ticket
→ Receive demo notification
→ Navigate profile
```

---

# 179. FINAL QA

Final QA listesi:

```text
[ ] Build successful
[ ] TypeScript successful
[ ] Lint successful
[ ] Unit tests successful
[ ] Integration tests successful
[ ] E2E successful
[ ] Mobile responsive
[ ] Reference UI matched
[ ] Realtime mock working
[ ] Map working
[ ] Ticket working
[ ] QR working
[ ] Notifications working
[ ] Admin working
[ ] Error states working
[ ] Offline state working
[ ] Security baseline implemented
[ ] README complete
[ ] .env.example complete
[ ] Docker setup working
[ ] Seed working
```

---

# 180. EN ÖNEMLİ SON TALİMAT

Bu projeyi “birkaç ekran oluşturan demo uygulaması” olarak değerlendirme.

Bunu:

**gerçek bir ulaşım ürünü için hazırlanmış production-grade temel sistem**

olarak değerlendir.

Ancak gerçek üçüncü parti servisler henüz bağlanmamışsa bunu gizleme.

Şu mimariyi uygula:

```text
REAL PROVIDER
     ↓
PROVIDER ADAPTER
     ↓
DOMAIN
     ↓
CACHE
     ↓
WEBSOCKET
     ↓
CLIENT
```

Gerçek provider yoksa:

```text
MOCK PROVIDER
```

aynı interface'i kullanmalıdır.

Böylece demo ile production arasında mimari kırılma yaşanmasın.

---

# 181. ANTIGRAVITY İÇİN UYGULAMA SIRASI

Şimdi şu sırayla ilerle:

## STEP 1
Projeyi analiz et.

## STEP 2
Ayrıntılı architecture document oluştur.

## STEP 3
Folder structure oluştur.

## STEP 4
Design tokens oluştur.

## STEP 5
Reference UI için Home ekranını oluştur.

## STEP 6
Browser screenshot al.

## STEP 7
Reference image ile karşılaştır.

## STEP 8
Home ekranını görsel olarak düzelt.

## STEP 9
Backend skeleton oluştur.

## STEP 10
PostgreSQL schema + seed oluştur.

## STEP 11
Mock Schedule Provider oluştur.

## STEP 12
Mock Tracking Provider oluştur.

## STEP 13
WebSocket realtime katmanını oluştur.

## STEP 14
Frontend'i gerçek backend'e bağla.

## STEP 15
Live Map'i oluştur.

## STEP 16
Trip Details oluştur.

## STEP 17
Ticketing oluştur.

## STEP 18
Demo Payment Provider oluştur.

## STEP 19
QR Ticket oluştur.

## STEP 20
Notification sistemi oluştur.

## STEP 21
Profile + Settings oluştur.

## STEP 22
Admin Panel oluştur.

## STEP 23
Security hardening yap.

## STEP 24
Unit / Integration / E2E testlerini yaz.

## STEP 25
Visual regression kontrolü yap.

## STEP 26
Performance kontrolü yap.

## STEP 27
Docker ve production configuration hazırla.

## STEP 28
README yaz.

## STEP 29
Final QA gerçekleştir.

## STEP 30
Eksik hiçbir kritik özellik kalmayana kadar devam et.

---

# 182. ÇOK ÖNEMLİ GELİŞTİRME DAVRANIŞI

Kullanıcıdan sürekli “şimdi ne yapayım?” diye onay isteme.

Belirsizliği mümkün olduğunca kendin çöz.

Ancak:

- ödeme sağlayıcısı,
- gerçek AIS sağlayıcısı,
- gerçek harita API anahtarı,
- production hosting,
- gerçek push credential

gibi dış bağımlılıklar mevcut değilse bunları **Mock/Adapter** ile tamamla ve yalnızca gereken yerde kullanıcıdan bilgi iste.

Kod yazmaya başlamadan önce uzun bir açıklama yerine önce kısa bir implementation planı üret, sonra uygulamaya geç.

Her büyük görevden sonra test çalıştır.

Çalışmayan kodu “tamamlandı” olarak işaretleme.

---

# 183. SON HEDEF

Son ürün kullanıcının açtığında şu hissi vermelidir:

> “Bu sıradan bir yapay zekâ tarafından üretilmiş demo değil; gerçek bir ulaşım şirketinin yayınlayabileceği profesyonel feribot uygulaması.”

Görsel hedef:

**Referans görsele çok yüksek düzeyde görsel sadakat + gerçek zamanlı işlevsellik + profesyonel mimari + temiz kod + test edilebilirlik.**

Bu proje tamamlanmadan önce hiçbir kritik modülü placeholder olarak bırakma.

Başla.