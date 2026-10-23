# STRATEJİK ÜRÜN DENETİMİ VE KARAR RAPORU: İSTANBUL DENİZ ULAŞIMI PLATFORMU

**İncelenen Uygulama:** [Adalar Sefer Asistanı / Vapur Canlı](https://www.google.com/search?q=https%3A%2F%2Fadalar-sefer-asistani.vercel.app%2F)  
**Denetim Tarihi:** 20–21 Ekim 2026  
**Kapsam:** Ürün Yönetimi, UX/UI Tasarımı, Çoklu Ekran Uyumluluğu, Deniz Ulaşımı Veri Güvenilirliği, Teknik Mimari ve Ticari Sürdürülebilirlik

## Genel Ürün Değerlendirmesi (Başlangıç Karar Özeti)

İncelenen web uygulaması ([Adalar Sefer Asistanı / Vapur Canlı](https://www.google.com/search?q=https%3A%2F%2Fadalar-sefer-asistani.vercel.app%2F)), alan adının yarattığı ilk izlenimin aksine yalnızca Prens Adaları hatlarını değil; toplam 18 aktif iskeleyi, 5 farklı deniz ulaşımı işletmesini ([Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2F), [Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F) ve [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F)) ve yerel önbellekte saklanan 692 tarifeli seferi tek bir çatı altında birleştirmeyi hedefleyen, çevrimdışı öncelikli (Offline-First PWA) bir ulaşım uygulaması prototipidir. Uygulama; kalkış kapısı kapanış tahmini (*Son giriş ~23:37*), güverte manzara ve oturma yönü tavsiyesi, Web Speech API tabanlı sesli iskele anonsu, iskele bekleme salonları için `TV Modu` ve [Open-Meteo Marine API](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2Fen%2Fdocs%2Fmarine-weather-api) destekli deniz meteorolojisi gibi yüksek özen gösteren mikro özellikler barındırmaktadır.

Buna karşın; Apple ürünlerinin yalınlığı ve görsel dürüstlüğü ile Microsoft ürünlerinin kurumsal sağlamlığı ve işlevsel derinliği referans alındığında, ürün mevcut haliyle **güvenilir bir gerçek zamanlı yolculuk asistanı** olgunluğunda değildir. Ürünün en temel sorunu, **gerçek zamanlı operasyonel gerçeklik ile istemci tarafı kural tabanlı simülasyon arasındaki sınırın tehlikeli biçimde belirsiz olmasıdır**. Kullanıcının aktif internet bağlantısı varken dahi ekranın en üstünde sürekli görünen iki ayrı *"ÇEVRİMDİŞİ MOD AKTİF"* uyarısı, sistem tarihinden otomatik olarak 3 gün çıkararak üretilen ve tıklanamayan *"🛡️ Duyuru doğrulama: 17 Ekim 2026 (3 gün önce) · 4 kaynak"* rozeti, gerçek AIS gemi konumu yerine tarife saatlerine dayalı enterpolasyon yapan harita özelliğine *"Canlı AIS Radarı"* adının verilmesi ve acil sefer listesinin tam ortasında yer tutucu/demo otel reklamlarının (*Büyükada Ada Palas · #VAPUR15*) gösterilmesi, profesyonel bir kullanıcının ürüne duyacağı güveni temelinden sarsmaktadır.

Ayrıca temel ulaşım senaryolarından olan **gelecek tarih veya farklı gün tipi seçiminin (hafta içi bir günde Cumartesi veya Pazar tarifesine bakabilme) bulunmaması**, doğrudan seferi olmayan iki iskele seçildiğinde (örneğin `Sarıyer ➔ Büyükada`) sistemin aktarmalı rota önermek yerine *"0 Alternatif Bulundu"* diyerek çıkmaza girmesi, rota seçildiğinde URL'nin değişmemesi (paylaşılabilir derin bağlantı eksikliği) ve geniş masaüstü ekranlarda uygulamanın dar bir mobil sütun olarak kalması, ticari lansman öncesinde mutlaka giderilmesi gereken yapısal eksikliklerdir.

## 1. Yönetici Özeti

İstanbul deniz ulaşımı; büyükşehir belediyesi iştiraki olan [Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fseferler), hızlı feribot ve deniz otobüsü işletmecisi [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fsefer-saatleri) ve dört ana özel deniz motoru kooperatifinin ([Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2FHome%2FTarifeler), [Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2Ftr-TR%2Fhatlarimiz%2Fadalar), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F), [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2Findex3e95.html)) aynı veya komşu iskelelerden farklı saatlerde, farklı ücret tarifeleriyle ve tamamen bağımsız duyuru kanallarıyla çalıştığı parçalı bir yapıdadır. Bir yolcu Kadıköy, Bostancı, Kabataş veya Beşiktaş'tan Adalar'a ya da karşı kıyıya geçmek istediğinde, önündeki 20 dakika içinde hangi işletmenin kalkacağını öğrenmek için 4–5 farklı web sitesini ve sosyal medya hesabını taramak zorunda kalmaktadır.

Bu denetim kapsamında [adalar-sefer-asistani.vercel.app](https://www.google.com/search?q=https%3A%2F%2Fadalar-sefer-asistani.vercel.app%2F) adresindeki canlı uygulama; masaüstü ve mobil görünüm alanlarında, tüm alt sekmeleri (`Seferler`, `Pano`, `İskeleler`, `Hava & Uyarı`, `Favorilerim`), tüm açılır pencereleri (`Ayarlar`, `Tema`, `Rehber`, `Filtreler & Araçlar`, `Sefer Detay`, `AIS Radar`) ve ticari alt sayfaları (`/pro` ve `/isletmeler`) ile birlikte uçtan uca incelenmiştir. İnceleme sırasında kaynak koduna, arka uç sunucu yapılandırmasına ve veritabanına doğrudan erişim bulunmadığından, istemci tarafında doğrulanabilen davranışlar ile sunucu tarafında doğrulanması gereken teknik varsayımlar titizlikle ayrıştırılmıştır.

| Denetim Boyutu | Mevcut Durum Notu | Doğrulanan Güçlü Yönler | Kritik Zafiyet ve Risk Alanları |
| :--- | :--- | :--- | :--- |
| **Ürün Deneyimi ve Akışlar** | Orta (3.0 / 5.0) | Hızlı kalkış-varış seçimi, kalan dakika sayacı, son biniş saati uyarısı ve zengin sefer detay kartı. | Tarih/gün tipi seçici yok; aktarmalı rota hesaplama yok; paylaşılabilir URL yok. |
| **Arayüz Tasarımı (UI) ve Hiyerarşi** | Orta (3.0 / 5.0) | Yüksek tipografik kontrast, 6 tema paleti, 5 dil (Arapça RTL dahil) ve temiz kart içi düzen. | İlk sefer kartından önce ekranın %30–35'ini kaplayan 6 katmanlı üst bar yığılması ve sahte reklam kartları. |
| **Çoklu Ekran (Responsive) Kalitesi** | Orta - Düşük (2.5 / 5.0) | Mobilde yatay taşma yapmayan filtre kapsülleri ve bekleme salonları için düşünülmüş `TV Modu`. | Masaüstü ve tablette çok sütunlu yerleşim yok; geniş ekranda ortalanmış dar mobil sütun olarak kalıyor. |
| **Deniz Ulaşımı ve Veri Güvenilirliği** | Düşük (2.0 / 5.0) | 5 işletmenin 692 planlı seferini çevrimdışı önbellekte birleştirmesi ve Open-Meteo entegrasyonu. | İptal duyuruları canlı çekilmiyor; *"3 gün önce doğrulandı"* rozeti ve *"Canlı AIS"* başlığı simüle/yanıltıcı. |
| **Ticari Hazırlık ve Sürdürülebilirlik** | Düşük (1.5 / 5.0) | B2B Dijital Pano lisansı ve turist odaklı sesli rehber gibi uygulanabilir gelir fikirleri. | Ödeme/başvuru butonları `mailto:` açıyor; özel işletme verileri için lisans/telif ve KVKK metinleri eksik. |

## 2. Ürünün Mevcut Özellik Envanteri

Uygulamanın canlı tarayıcı denetiminde tespit edilen tüm deniz ulaşımı işlevleri; **Mevcut**, **Kısmen Mevcut**, **Doğrulanmamış** ve **Mevcut Değil** kategorileri altında kanıtlarıyla birlikte aşağıda sınıflandırılmıştır.

| Deniz Ulaşımı Özelliği | Sınıflandırma | Mevcut Durumun Kanıtı ve Gözlemlenen Davranış |
| :--- | :--- | :--- |
| **1. İskele ve durak arama** | Kısmen Mevcut | 18 ana iskele açılır menüde ve `🔍 Ara` / `İskeleler` sekmesinde listelenmektedir; ancak 50+ iskelelik tam kapsam ve klavyeden yazarak otomatik tamamlama (autocomplete) henüz yoktur. |
| **2. Kalkış ve varış seçimi** | Mevcut | `Nereden` ve `Nereye` menüleri, yön değiştirme (`⇆`) ve sıfırlama (`X`) düğmeleriyle anlık çalışmaktadır. Kalkış seçildiğinde varış listesi akıllı biçimde filtrelenmektedir. |
| **3. Vapur, motor ve işletme kapsamı** | Kısmen Mevcut | [Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2F), [Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F) ve [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F) (5 işletme, 18 iskele) mevcuttur; ancak [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F), [İBB Deniz Taksi](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fibb-deniz-taksi-sikca-sorulan-sorular) ve Haliç/Orta Boğaz ara iskeleleri kapsam dışıdır. |
| **4. Güncel tarifeler ve sefer saatleri** | Mevcut (Yerel Veritabanı) | Yerel önbellekte 692 sefer kayıtlıdır. Kalkış/varış saati, ara duraklar ve kalan süre saniye hassasiyetinde hesaplanmaktadır. |
| **5. Hafta içi, hafta sonu ve resmî tatil tarifeleri** | Kısmen Mevcut (Otomatik / Kilitli) | Sistem cihaz tarihine göre gün tipini (`Hafta içi`) otomatik seçmektedir; ancak kullanıcının manuel olarak `Cumartesi` veya `Pazar / Resmi Tatil` tarifesine geçiş yapabileceği bir seçici yoktur. |
| **6. Gidiş-dönüş ve gece seferleri** | Kısmen Mevcut | `Filtreler & Araçlar` altında `Gece` filtresi mevcuttur; ancak çift yönlü **Gidiş-Dönüş** karşılaştırma görünümü ve adadan son dönüş vapuru sabitlemesi mevcut değildir. |
| **7. Aktarmalı yolculuklar** | Mevcut Değil | Doğrudan seferi olmayan iki iskele (ör. `Sarıyer ➔ Büyükada` veya `Beykoz ➔ Kartal`) seçildiğinde sistem aktarma hesaplamamakta ve *"Önerilen Güzergahlar: 0 Alternatif Bulundu"* mesajı vermektedir. |
| **8. Alternatif rotalar ve yolculuk süreleri** | Kısmen Mevcut | Aynı hatta çalışan farklı işletmeler (ör. Bostancı-Büyükada hattında Şehir Hatları, Dentur, Mavi Marmara) ve yolculuk süreleri (`15 dk`, `35 dk`) alt alta karşılaştırılabilmektedir; komşu iskele önerisi yoktur. |
| **9. Harita üzerinde iskeleler ve rotalar** | Kısmen Mevcut | `Filtreler & Araçlar` içinden açılan harita modunda 18 iskele pini ve tarife enterpolasyonuna dayalı tahmini rota çizimi mevcuttur; ancak harita ana ekranda doğrudan erişilebilir değildir. |
| **10. Kullanıcının konumuna göre yakın iskeleler** | Mevcut | Hızlı filtre çubuğundaki `🧭 En Yakın` butonu tarayıcı Geolocation API izniyle en yakın iskeleyi tespit etmek üzere tasarlanmıştır. |
| **11. Gecikme, iptal ve sefer değişiklikleri** | Doğrulanmamış / Simüle | Alt bardaki *"🛡️ Duyuru doğrulama: 17 Ekim 2026 (3 gün önce) · 4 kaynak"* rozeti statik göreceli tarih üretmektedir; resmi iptal sayfalarından canlı veri çekildiği doğrulanamamıştır. |
| **12. Hava koşulları ve sefer duyuruları** | Kısmen Mevcut | `Hava & Uyarı` sekmesinde sıcaklık ve rüzgar [Open-Meteo](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2F) API'sinden canlı çekilmekte; akıntı hızı (`3.8 Knot Kandilli`) ve hat emniyet durumu kural tabanlı tahminle üretilmektedir. |
| **13. Ücret bilgileri ve ilgili resmî bağlantılar** | Mevcut | Sefer detay modalında tam/öğrenci ücretleri (ör. `65,21 ₺ / 130,42 ₺`) ve `Ayarlar` ile detay kartlarında resmi işletme bağlantıları yer almaktadır. |
| **14. Favoriler, son aramalar ve paylaşılabilir rotalar** | Kısmen Mevcut | `Favorilerim` sekmesi (`localStorage`) mevcuttur; ancak son aramalar geçmişi, sefer paylaş butonu ve paylaşılabilir URL parametreleri (deep-linking) **Mevcut Değildir**. |
| **15. Bildirimler ve kişiselleştirme** | Kısmen Mevcut | 6 tema, 5 dil, yazı boyutu, `Turist Modu` ve tarayıcı açıkken çalışan kalkış alarmı (`🔔`) mevcuttur; arka plan Web Push bildirimleri doğrulanamamıştır. |

## 3. Kullanıcı Deneyimi ve Arayüz Denetimi

### 3.1. Ürün Deneyimi: 8 Temel Soruya Somut Yanıtlar

* **1. Kullanıcı uygulamayı ilk açtığında ne yapacağını hemen anlayabiliyor mu?**  
  **Yanıt: Kısmen evet, ancak yüksek görsel gürültü nedeniyle odaklanma süresi uzuyor.** Uygulama açıldığında `Nereden (Tümü)` ve `Nereye (Tümü)` seçim kutuları ile varsayılan olarak seçili gelen `🏝️ Adalar` filtresi sayesinde alt kısımda hemen aktif seferler listelenmektedir. Ancak kullanıcının gözü ilk olarak ekranın en üstündeki parlak turuncu *"MARMARA AÇIKLARI / ÇEVRİMDİŞİ MOD AKTİF"* bandına ve hemen altındaki ikinci gri *"● Çevrimdışı Mod — Kayıtlı Resmi Tarife Gösteriliyor"* şeridine takılmaktadır. Kullanıcı çevrimiçi olduğu halde iki kez çevrimdışı uyarısı görmek bilişsel duraksama yaratmaktadır.
* **2. Bir noktadan başka bir noktaya deniz yoluyla gitmek isteyen kişi en kısa sürede doğru sonuca ulaşabiliyor mu?**  
  **Yanıt: Doğrudan (direkt) sefer olan hatlarda ve o anki saat için evet; ileri tarihli veya aktarmalı yolculuklarda hayır.** Örneğin kullanıcı `Bostancı ➔ Büyükada` veya `Üsküdar ➔ Kabataş` seçtiğinde 2 dokunuşla (yaklaşık 3 saniye içinde) tüm işletmelerin yaklaşan seferlerini kalan dakikasıyla görebilmektedir. Ancak kullanıcı Cuma akşamı Pazar günkü vapur saatine bakmak isterse veya doğrudan bağlantısı olmayan `Sarıyer ➔ Büyükada` rotasını seçerse sonuca ulaşamamaktadır.
* **3. Vapur, deniz motoru, iskele ve işletme bilgileri anlaşılır biçimde sunuluyor mu?**  
  **Yanıt: Evet, kart içi bilgi mimarisi başarılıdır.** Her sefer kartında işletme adı ([Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2F), [Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F), [Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F)), kalkış ve varış saati, toplam süre ve seferin direkt mi yoksa ara duraklı mı olduğu (`4 durak: Kınalıada, Burgazada, Heybeliada, Büyükada`) net biçimde ayrıştırılmıştır. Detay modalında vapur içi imkanlar (Büfe, Bisiklet, Evcil Hayvan, Engelsiz Erişim, Wi-Fi) ve bilet ücreti açıkça gösterilmektedir. Eksik olan nokta, aynı bölgede farklı noktalarda bulunan iskelelerin (örneğin Kadıköy'de Şehir Hatları Adalar iskelesi ile Turyol/Mavi Marmara motor iskelelerinin fiziksel konum farkının) kart üzerinde belirtilmemesidir.
* **4. Sefer arama, tarih seçme, saatleri görüntüleme ve rota karşılaştırma işlemleri kolay mı?**  
  **Yanıt: Sefer arama ve aynı hattaki işletmeleri karşılaştırma kolaydır; ancak tarih seçme işlevi mevcut değildir.** Aynı güzergahta farklı işletmelerin ardışık saatlerini tek listede görmek büyük kolaylık sağlamaktadır. Buna karşın uygulamada bir takvim veya gün tipi seçicisi (`Hafta İçi / Cumartesi / Pazar`) bulunmadığından tarih seçme işlemi yapılamamaktadır.
* **5. Kullanıcı yanlış seçim yaptığında veya sonuç bulamadığında sistem yardımcı oluyor mu?**  
  **Yanıt: Kalkış-varış çakışmasını önlemede yardımcı oluyor, ancak boş sonuç ekranında kullanıcıyı tamamen yalnız bırakıyor.** Kullanıcı `Nereden` menüsünde bir iskele seçtiğinde `Nereye` menüsü aynı iskeleyi otomatik olarak listeden çıkarmakta (veya Adalar Ring seçeneği sunmakta), böylece hatalı seçim yapılmasını engellemektedir. Ancak doğrudan seferi olmayan iki iskele (`Beykoz ➔ Kartal`) seçildiğinde ekranda yalnızca *"Önerilen Güzergahlar: 0 Alternatif Bulundu — Lütfen farklı bir kalkış veya varış iskelesi seçiniz"* yazmakta; en yakın aktarma iskelesi önerilmemektedir.
* **6. Gerçek zamanlı bilgi ile planlanmış tarife birbirinden açıkça ayrılıyor mu?**  
  **Yanıt: Hayır, uygulamanın en zayıf olduğu alan budur.** Logo yanında `VAPUR CANLI⚡` yazması, harita butonunun `Canlı AIS Radarı` adını taşıması ve sefer kartlarında `ZAMANINDA` ile `Son giriş ~23:37` gibi saniye bazlı geri sayımların yer alması, kullanıcıya gerçek zamanlı gemi takibi yapıldığı izlenimini vermektedir. Oysa bu verilerin tamamı yerel önbellekteki 692 statik tarife saatinden matematiksel olarak hesaplanmaktadır.
* **7. İptal, gecikme ve değişiklik bilgileri kullanıcıyı yanıltmayacak şekilde gösteriliyor mu?**  
  **Yanıt: Hayır, mevcut gösterim kullanıcıyı yanıltma riski taşımaktadır.** Ana listedeki *"🛡️ Duyuru doğrulama: 17 Ekim 2026 (3 gün önce) · 4 kaynak"* ibaresi, sistem tarihinden 3 gün geriye giderek oluşturulan statik bir metindir ve tıklanabilir değildir. Ayrıca `Hava & Uyarı` sekmesindeki hat durumları (*"Bostancı ⇿ Adalar: ✓ Açık & Emniyetli"*) resmi işletme duyurularından değil, rüzgar hızı eşiğine dayalı bir kuraldan üretilmektedir.
* **8. Uygulama bir ulaşım aracından çok, güvenilir bir yolculuk asistanı gibi davranabiliyor mu?**  
  **Yanıt: Henüz değil; mikro detaylarda asistan ruhu taşısa da temel güven mekanizmaları eksiktir.** Güverte manzara tavsiyesi (*"Topkapı Sarayı ve Tarihi Yarımada'ya karşı seyretmek için sol tarafı tercih edin"*), sesli Boğaz yalıları rehberi ve kapı kapanış tahmini gibi özellikler asistan vizyonunu yansıtmaktadır. Ancak aktarma öneremeyen, hafta sonu tarifesini göstermeyen ve resmi sefer iptallerini canlı doğrulayamayan bir sistem henüz tam anlamıyla güvenilir bir yolculuk asistanı sayılamaz.

### 3.2. Profesyonel Tasarım ve Arayüz (UI) Denetimi (11 Başlık)

* **Görsel Hiyerarşi ve İçerik Düzeni:** Sefer kartlarının iç hiyerarşisi (sol üstte kalkış-varış saati, sağ üstte kalan dakika rozeti, ortada işletme ve duraklar) temizdir. Ancak sayfa genelinde üst bölümde yer alan 6 ayrı yatay bar (2 çevrimdışı bandı, 1 üst navigasyon, 1 arama çubuğu, 1 filtre kapsül satırı, 1 durum satırı) görsel hiyerarşiyi boğmakta ve asıl içerik olan sefer listesini ekranın alt yarısına itmektedir.
* **Tipografi, Yazı Boyutları ve Okunabilirlik:** Saat gösterimlerinde ve geri sayım sayaçlarında kullanılan yüksek ağırlıklı sans-serif ve monospace rakamlar hızlı taranabilirliği desteklemektedir. `Ayarlar` menüsünde sunulan yazı boyutu ölçekleme seçeneği ve `Turist Modu` (büyütülmüş saat görünümü) yaşlı yolcular ve güneş altında ekran okuyanlar için olumlu bir özelliktir.
* **Renk Sistemi ve Kontrast:** Uygulamada sunulan 6 renk paleti (*Derin Boğaz & Lacivert*, *Modern İskandinav Minimal*, *Tarihi Vapur & Pirinç*, *Siber Radar & OLED Siyah*, *Boğaz Altın Saat*, *Güneş Modu*) yüksek kontrast oranlarına sahiptir. Özellikle *Güneş Modu*, açık güvertede doğrudan güneş ışığı altında ekran parlamasını telafi etmek için doğru bir tasarım kararıdır. Ancak üstteki turuncu çevrimdışı bandı, "uyarı/tehlike" rengi olduğu için gereksiz alarm algısı yaratmaktadır.
* **Boşluklar, Hizalama ve Bileşen Tutarlılığı:** Sefer kartları arasındaki dikey boşluklar ve iç dolgular (padding) tutarlıdır. Buna karşın üst bardaki 5 aksiyon butonu (`TR`, `Ayarlar`, `Tema`, `Rehber`, `Yenile`) dar ekranlarda birbirine fazla yaklaşmakta ve görsel sıkışıklık oluşturmaktadır.
* **Navigasyon ve Menü Yapısı:** Alt sabit gezinme çubuğu (`Seferler`, `Pano`, `İskeleler`, `Hava & Uyarı`, `Favorilerim`) mobil kullanım için ergonomiktir. Ancak harita görünümünün alt barda bağımsız bir sekme veya ana ekranda belirgin bir anahtar olmak yerine `🎛️ Filtreler & Araçlar` modalının içine gizlenmiş olması keşfedilebilirliği düşürmektedir.
* **Harita ve Sefer Listelerinin Kullanımı:** Liste görünümü hızlıdır; ancak harita ile sefer listesi birbirinden kopuktur. Kullanıcı harita üzerinde bir iskeleye tıklayarak doğrudan o iskelenin seferlerini yan panelde görememektedir.
* **Butonlar, Filtreler, Kartlar, Açılır Pencereler ve Formlar:** `Nereden` ve `Nereye` açılır menüleri 18 iskele için yeterli olsa da kapsam 50+ iskeleye çıktığında klasik açılır menü yetersiz kalacaktır; metin aramalı bir seçici (searchable combobox) gereklidir. Sefer kartlarının içine gerçek sefer gibi yerleştirilmiş *"Büyükada Ada Palas · #VAPUR15"* sponsorlu kartı ise bileşen güvenilirliğini zedelemektedir.
* **Yükleniyor, Hata, Boş Sonuç ve Çevrimdışı Durumları:** Çevrimdışı çalışma yeteneği (Service Worker / yerel veri) teknik olarak çalışmaktadır; ancak çevrimiçi durumda bile *"Çevrimdışı Mod Aktif"* yazması durum yönetimi (state display) hatasıdır. Boş sonuç ekranı (`0 Alternatif Bulundu`) kullanıcıya alternatif sunmayan soğuk bir hata mesajından ibarettir.
* **Mikro Etkileşimler ve Geri Bildirimler:** Canlı saniye sayacı, *"Son giriş ~23:37"* kapı kapanış uyarısı, yön değiştirme (`⇆`) animasyonu ve Web Speech API ile çalışan *"Resmi İskele Anonsunu Dinle"* özelliği ürüne sempatik ve özgün bir karakter kazandırmaktadır.
* **Erişilebilirlik ve Klavye Kullanımı:** Butonlarda `aria-label` tanımları bulunmakla birlikte, klavye ile `Tab` gezinmesi yapıldığında görünür odak halkası (`:focus-visible`) belirmemektedir. Ayrıca `Sefer Detay` modalı `ESC` tuşuyla kapanırken, `Filtreler & Araçlar`, `AIS Radar` ve `Sponsorluk` modalları `ESC` tuşuna yanıt vermemektedir.
* **Görsel Karmaşa, Gereksiz Tekrarlar ve Kullanıcıyı Yoran Adımlar:** Çevrimdışı mod bilgisinin üst üste iki ayrı bantta (hem turuncu üst bantta hem koyu gri alt bantta) tekrarlanması en belirgin gereksiz tekrardır.

## 4. Mobil ve Farklı Ekran Boyutları Değerlendirmesi

*Doğrulama Notu: Aşağıdaki bulgular, canlı uygulamanın Chromium tarayıcı motoru üzerindeki DOM/CSS kuralları ve farklı görünüm alanı (viewport) simülasyonlarıyla test edilerek doğrulanmıştır; fiziksel telefon, tablet veya Smart TV donanımı üzerinde test yapılmamıştır.*

| Cihaz ve Ekran Ortamı | Mevcut Yerleşim ve Gözlemlenen Sorunlar | Akıllı Alan Kullanımı İçin Somut Öneriler |
| :--- | :--- | :--- |
| **Küçük ve Büyük Telefonlar** (`320px – 430px`) | Hızlı filtre kapsülleri (`flex overflow-x-auto`) yatay taşma yapmadan kaydırılabilmektedir. Ancak 6 katmanlı üst bar ekranın %35–40'ını kaplamakta, sağ üstteki 5 küçük butonun dokunma alanı daralmaktadır. | Üstteki iki çevrimdışı bandı kaldırılmalı; `Tema`, `Dil` ve `Ayarlar` tek bir ikon altında toplanmalı; aşağı kaydırmada (scroll) yalnızca `Nereden ⇆ Nereye` çubuğu sabit (sticky) kalmalıdır. |
| **Tabletler** (`768px – 1024px`) | Uygulama telefon görünümünü genişleterek tek sütun halinde sunmaktadır. Yatay (landscape) kullanımda ekranın sağ ve sol kenarları verimsiz kalmaktadır. | `768px` kırılma noktasından itibaren **Split-View (Bölünmüş Görünüm)** uygulanmalı: Sol sütunda (%55) sefer listesi, sağ sütunda (%45) sabit harita veya seçili seferin detay zaman çizelgesi yer almalıdır. |
| **Dizüstü ve Büyük Masaüstü Ekranları** (`1280px – 2560px`) | Uygulama geniş ekranı kullanmamakta, ortalanmış dar bir mobil sütun olarak durmaktadır. Alt kısımda mobil sekme çubuğu (Bottom Nav) masaüstünde de aynı şekilde kalmaktadır. | `1024px+` ekranlarda alt mobil bar sol dikey kenar çubuğuna (Sidebar) dönüştürülmeli; ekran **3 sütunlu bir Deniz Ulaşım Komuta Merkezi** olarak (1: Arama ve Seferler, 2: İnteraktif Harita ve Aktarma, 3: Seçili İskele Panosu ve Deniz Meteorolojisi) kurgulanmalıdır. |
| **Televizyon ve Bilgilendirme Ekranları** (`1080p / 4K TV Modu`) | `Pano` sekmesindeki `TV Modu` iskele bekleme salonları ve otel lobileri için harika bir yaklaşımdır; ancak tam ekran olduğunda üst/alt uygulama barları tamamen gizlenmemekte ve satırlar sabit piksel boyutuyla kalmaktadır. | `TV Modu` aktif edildiğinde `Fullscreen API` ve `WakeLock API` tetiklenmeli; tüm navigasyon çubukları gizlenmeli, tipografi `vh`/`vw` birimleriyle 5 metreden okunacak şekilde büyütülmeli ve sağ alt köşeye *"Telefonda Takip Et"* QR kodu eklenmelidir. |

## 5. Deniz Ulaşımı ve Veri Güvenilirliği Analizi

Bir seferin resmi tarifede bulunması, o seferin o an gerçekleştiğini kanıtlamaz. İstanbul'da lodos, fırtına, yoğun sis veya gemi arızası nedeniyle özellikle Adalar ve Boğaz hatlarında sıkça anlık sefer iptalleri yaşanmaktadır. İptal bilgisinin yalnızca genel bir metin olarak gösterilmesiyle, **doğru sefer kartıyla deterministik olarak eşleştirilmesi** arasındaki fark, ürünün güvenilirliğini belirleyen ana unsurdur.

### İşletme Bazlı Veri Kaynakları ve İptal Eşleştirme Değerlendirmesi

* **[Şehir Hatları A.Ş.](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2F):** Planlı tarifeler [Şehir Hatları Sefer Tarifeleri](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fseferler) sayfasında ve [Ulusal Akıllı Şehir Açık Veri Platformu (İBB GTFS)](https://www.google.com/search?q=https%3A%2F%2Fulasav.csb.gov.tr%2Fdataset%2F%3Forganization%3Distanbul-buyuksehir-belediyesi%26groups%3Dulasim%26license_id%3Dibb-license) üzerinde yayınlanmaktadır. Anlık iptaller ise [Şehir Hatları İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) sayfasında hat adı ve saat bazında sunulmaktadır. Sunucu tarafında her 3 dakikada bir çalışacak bir ayrıştırıcı (parser), iptal edilen hattı ve saati okuyup uygulamadaki ilgili sefer kartını **"İPTAL EDİLDİ (Resmi Duyuru)"** durumuna geçirmelidir.
* **[İDO (İstanbul Deniz Otobüsleri)](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F):** Uygulamada şu an mevcut değildir. Oysa Bostancı-Adalar ve Kabataş-Kadıköy-Adalar hatlarında kritik rol oynamaktadır. [İDO Sefer Saatleri](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fsefer-saatleri) ve [İDO İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F) sayfaları yapılandırılmış veri sunduğundan, hem tarife hem de anlık iptal entegrasyonu yüksek doğrulukla yapılabilir.
* **[Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F) ve [Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F):** [Dentur Avrasya Adalar](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2Ftr-TR%2Fhatlarimiz%2Fadalar) sayfası modern bir web arayüzüne sahipken, [Turyol Tarifeler](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2FHome%2FTarifeler) sayfası klasik HTML tablolardan oluşmaktadır. Her iki işletme de hava muhalefeti iptallerini çoğunlukla ana sayfa açılır pencereleri (popup) veya sosyal medya üzerinden duyurmaktadır. Bu nedenle metin eşleştirmede serbest metin (free-text) içinden hat ve saat çıkaran kurallı ayrıştırıcı kullanılmalı; eşleşme güven skoru %100 değilse sefer kartının üzerine sarı **"⚠️ Hava Muhalefeti Duyurusu Var — Resmi Kaynağı Teyit Edin"** uyarısı eklenmelidir.
* **[Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F) ve [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F):** [Prenstur Kartal-Adalar](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2Findex3e95.html) tarifesi doğrudan JPEG görsel dosyası (`2026-2027-kis-tarifesi.jpeg`) olarak yayınlanmaktadır. Görsel tabanlı tarifelerde otomatik kazıma hataya açık olduğundan, tarife geçiş dönemlerinde (Eylül/Ekim kış tarifesi ve Mayıs/Haziran yaz tarifesi) versiyonlu manuel doğrulama yapılmalı ve kart üzerinde *"Resmi Tarife Kaynağı: Prenstur (Son Kontrol: 20.10.2026)"* şeffaflık bilgisi gösterilmelidir.

## 6. Teknik Mimari ve Güvenlik Değerlendirmesi

Mevcut uygulama Vercel üzerinde dağıtılan, hızlı açılan ve çevrimdışı önbellekleme yeteneğine sahip bir istemci uygulamasıdır. Mevcut mimari hızlı tepki süresi açısından yeterlidir; **büyük bir yeniden yazım (rewrite) yerine mevcut mimari üzerinde kontrollü ve aşamalı iyileştirmeler yapılmalıdır**.

Kaynak koduna doğrudan erişim bulunmadığından, tarayıcı davranışlarından doğrulanan mimari özellikler ve kaynak kodu açıldığında denetlenmesi gereken 12 teknik alan aşağıda listelenmiştir:

| Teknik Denetim Alanı | Gözlemlenen Durum (Dış Denetim) | Kontrollü İyileştirme ve Mimari Öneri |
| :--- | :--- | :--- |
| **1. Frontend ve Backend Mimarisi** | İstemci ağırlıklı (Thick-Client PWA) mimari; 692 sefer tarayıcı hafızasında işleniyor. | İstemci hızı korunmalı; ancak canlı iptal duyuruları ve hava durumu için hafif bir Vercel Serverless / Edge API katmanı eklenmelidir. |
| **2. Kod Organizasyonu ve Bileşenler** | Sefer kartları, filtre kapsülleri ve modallar modüler görünüyor; ancak modal kapanış davranışları tutarsız (`ESC` tuşu farkı). | Tüm açılır pencereler tek bir ortak erişilebilir `<ModalDialog>` temel bileşeninden türetilmelidir. |
| **3. API Entegrasyonları ve Hata Yönetimi** | [Open-Meteo](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2F) API entegrasyonu mevcut; ancak çevrimdışı durum göstergesi hatalı şekilde sürekli aktif. | Dış API çağrıları istemciden doğrudan yapılmak yerine sunucu tarafında (Edge Cache) sarmalanmalı ve zaman aşımı (timeout) geri dönüşleri tanımlanmalıdır. |
| **4. Veri Modelleri ve Kaynak Birleştirme** | 18 iskele ve 5 işletme tek listede birleştirilmiş. | Farklı işletmelerin aynı bölgedeki farklı iskeleleri için üst bölge (`hub_id: kadikoy`) ve alt fiziksel iskele (`pier_id: kadikoy_sehir_hatlari`, `pier_id: kadikoy_turyol`) koordinatlarıyla ayrıştırılmalıdır. |
| **5. Önbellekleme ve Veri Güncelleme** | PWA yerel önbelleği 692 seferi tutuyor; ancak `Yenile` butonu yalnızca saati güncelliyor. | Tarife verisi için `dataset_version` (ör. `2026-winter-v2`) kontrolü yapılmalı; yeni tarife yayınlandığında arka planda sessizce güncellenmelidir. |
| **6. Eş Zamanlı İstekler ve Ağ Hataları** | Fırtınalı günlerde binlerce kullanıcı aynı anda uygulamayı açtığında istemci tabanlı API istekleri hız sınırına takılabilir. | Vercel CDN `s-maxage=180, stale-while-revalidate=600` başlıkları ile tüm kullanıcılara önbellekten yanıt verilmelidir. |
| **7. Tarih, Saat Dilimi ve Takvim Hesaplamaları** | Canlı saat ve kalan dakika hesabı çalışıyor; ancak resmi tatil ve gün tipi seçimi kilitli. | Tüm saat hesaplamaları `Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul' })` ile İstanbul saatine sabitlenmeli ve resmi tatil dizisi eklenmelidir. |
| **8. Performans ve Bellek Kullanımı** | Sayfa açılışı ve filtreleme çok hızlı; ancak saniye başı çalışan sayaç (`23:34:39`) tüm listeyi yeniden render ediyorsa pil tüketimini artırır. | Saniye sayacı yalnızca kendi küçük bileşenini güncellemeli; sefer listesi geri sayımı dakikada bir güncellenmelidir. |
| **9. Güvenlik, Gizli Anahtarlar ve Kullanıcı Verisi** | Favoriler `localStorage`'da tutuluyor; sunucuya kişisel veri gönderilmiyor. | Kaynak kodunda gömülü hiçbir üçüncü parti API anahtarı bulunmadığı doğrulanmalı ve `Content-Security-Policy` (CSP) başlıkları tanımlanmalıdır. |
| **10. Test Kapsamı ve Hata İzleme** | Dışarıdan doğrulanamaz (Kaynak kodu gerekli). | Saat/tarife hesaplama motoru için Vitest birim testleri ve kritik akışlar için Playwright E2E testleri ile Sentry hata izleme kurulmalıdır. |
| **11. Dağıtım, Bakım ve Sürüm Yönetimi** | Vercel üzerinde otomatik dağıtım kullanılıyor. | Alt bilgiye (Footer) uygulama sürüm numarası ve aktif tarife veritabanı tarihi (ör. `v1.4.0 · Tarife: Kış 2026`) eklenmelidir. |
| **12. Yeni İşletme ve Ulaşım Türü Eklemeye Uygunluk** | Mevcut 5 işletmeli yapı genişlemeye uygun görünüyor. | Veri şeması GTFS standardına yaklaştırılarak [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F), [Deniz Taksi](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fibb-deniz-taksi-sikca-sorulan-sorular) ve Marmaray/Metro aktarma süreleri kolayca eklenebilmelidir. |

## 7. Rakip ve Ürün Farklılaştırma Analizi

İstanbul deniz ulaşımında kullanılan resmi uygulamalar ve küresel ulaşım platformları 8 temel kalite ölçütüne göre karşılaştırılmıştır:

| Karşılaştırma Ölçütü | [Adalar Sefer Asistanı](https://www.google.com/search?q=https%3A%2F%2Fadalar-sefer-asistani.vercel.app%2F) (Mevcut) | [Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fseferler) & [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F) Resmi Kanalları | Özel Motor Siteleri ([Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Dentur](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F), [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F)) | Küresel Platformlar ([Moovit](https://www.google.com/search?q=https%3A%2F%2Fmoovitapp.com%2Findex%2Ftr%2Ftoplu_ta%25C5%259F%25C4%25B1ma-B%25C3%25BCy%25C3%25BCkada_%25C4%25B0skelesi_Mavi_Marmara_Dentur-Istanbul-stop_1148687976-1563), [Citymapper](https://www.google.com/search?q=https%3A%2F%2Fcitymapper.com%2Fistanbul%3Flang%3Den), Google Haritalar) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Veri Güvenilirliği** | Planlı tarifede iyi; canlı iptal ve AIS tarafında simüle/eksik. | Kendi seferleri ve resmi iptal duyuruları için %100 birincil kaynak. | Kendi seferleri için birincil kaynak; ancak JPEG afiş veya geç güncellenen sayfalar. | Şehir Hatları GTFS verisinde iyi; özel motor kooperatiflerinde ve anlık lodos iptallerinde zayıf. |
| **2. Sefer Arama Kolaylığı** | Çok yüksek: Tek ekranda 5 işletmeyi aynı anda listeler. | Orta: Hat bazlı seçim veya biletleme formu doldurmayı gerektirir. | Düşük: Statik tablo veya resim büyüterek saat okuma gerektirir. | Orta: Noktadan noktaya rota çizer ancak tüm alternatif motor saatlerini alt alta kıyaslamaz. |
| **3. Rota Planlama** | Zayıf: Yalnızca doğrudan seferleri bulur, aktarma yapamaz ve ileri tarih seçemez. | Yalnızca kendi hatları içinde sınırlı arama. | Yok (Sadece sabit tarife tablosu). | Çok güçlü: Kara, raylı sistem ve deniz ulaşımını birleştirerek çok modlu rota çizer. |
| **4. Gerçek Zamanlı Bilgilendirme** | Open-Meteo hava durumu canlı; sefer iptalleri ve gemi konumları simüle. | Resmi iptal sayfaları ve Şehir Hatları canlı gemi konumları mevcut. | Düzensiz web popup'ları veya sosyal medya paylaşımları. | Genel toplu taşımada güçlü; özel deniz motoru iptallerinde veri akışı yok. |
| **5. Mobil Deneyim** | Kurulum gerektirmeyen hızlı PWA; ancak üst ekran çok kalabalık. | Uygulama mağazası indirmesi gerektirir; kurumsal ama ağır arayüzler. | Mobil uyumluluğu zayıf, eski nesil web sayfaları (Dentur hariç). | Yüksek kaliteli mobil uygulama; ancak ücretsiz sürümde yoğun tam ekran reklamlar (Moovit). |
| **6. Erişilebilirlik** | 6 yüksek kontrastlı tema, 5 dil ve sesli anons var; klavye odak/ESC desteği eksik. | Standart kurumsal erişilebilirlik. | Düşük (Görsel JPEG tarifeler ekran okuyucuyla okunamaz). | Yüksek (Küresel erişilebilirlik standartlarına uyumlu). |
| **7. Hız ve Güvenilirlik** | Yerel 692 sefer önbelleği sayesinde milisaniyelik filtreleme ve çevrimdışı çalışma. | Sunucu yanıtına bağımlı; fırtınalı günlerde yoğunluktan yavaşlayabilir. | Orta; çevrimdışı çalışmaz. | İnternet bağlantısı gerektirir; veri paketi tüketimi yüksektir. |
| **8. Farklılaştırıcı Özellikler** | TV Pano Modu, Son Giriş Saati, Güverte Manzara Tavsiyesi, Boğaz Sesli Rehberi. | Deniz Taksi çağırma, resmi biletleme ve İstanbulkart entegrasyonu. | Kooperatif bazlı özel tur ve grup organizasyonları. | İneceğiniz durağa yaklaşırken bildirim ve kapıdan kapıya navigasyon. |

## 8. Ticari Sürdürülebilirlik Değerlendirmesi

* **Hangi kullanıcı sorununu rakiplerinden daha iyi çözebilir?** İstanbul'da iskeleye yürürken *"Şu an hangi vapur veya motor daha erken kalkıyor ve hangisi daha hızlı varır?"* sorusunu, 6 farklı deniz işletmesini tek bir ekranda birleştirerek 3 saniye içinde çözebilir.
* **Hedef kullanıcı grupları:** (1) Adalar sakinleri ve her gün iki yaka arasında deniz yoluyla işe gidip gelen yolcular, (2) Hafta sonu Adalar ve Boğaz hattını kullanan İstanbullular, (3) Çok dilli arayüz ve sesli rehberden faydalanacak yabancı turistler, (4) Lobisinde veya ekranında canlı vapur panosu göstermek isteyen kıyı/Ada otelleri ve kafeleri (B2B).
* **En güçlü farklılaştırıcı özellik ne olmalı?** **"Çoklu İşletme Anlık Karşılaştırma + Doğrulanmış Lodos/İptal Radarı + Son Dönüş Vapuru Güvencesi"** üçlüsü, ürünü hem resmi tekil uygulamalardan hem de genel harita uygulamalarından ayıracak en güçlü değer önerisidir.
* **Tekrar tekrar kullanımı (Retention) sağlayacak özellikler:** Sabah/akşam işe gidiş saatlerinde tek dokunuşla açılan `Favorilerim`, Adalar'da son vapuru kaçırmayı önleyen *"Son Vapur Kalkış Alarmı"* ve fırtınalı sabahlarda gönderilen *"Favori hattınızda sefer iptali var"* anlık bildirimleri.
* **Güven için doğruluk ve şeffaflık standartları:** Tahmini/simüle edilen hiçbir veriye "Canlı" denmemeli; her seferin yanında verinin kaynağı ve son resmi kontrol dakikası açıkça yazmalıdır.
* **İşletme ve veri kaynağı bağımlılıkları:** Uygulama, kamu ve özel deniz işletmelerinin web sitelerinde yayınladığı tarifelere bağımlıdır. Özel kooperatiflerin ([Turyol](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Dentur Avrasya](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Mavi Marmara](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F), [Prenstur](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F)) standart bir açık veri API'si olmadığından, yarı otomatik tarife izleme hattı kurulması şarttır.
* **Maliyet kalemleri (Tahmini fiyat üretmeden yapısal kalemler):** (1) Vercel Pro / Edge barındırma ve bant genişliği, (2) Periyodik iptal/duyuru tarama sunucusu veya Cron işçileri, (3) Ticari kullanımda [Open-Meteo ticari API aboneliği](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2Fen%2Fpricing) (ücretsiz sürüm yalnızca ticari olmayan kullanım içindir), (4) Harita karo (Map Tiles) gösterim maliyetleri, (5) Web Push bildirim servisi ve alan adı/SSL giderleri.
* **Ücretsiz kullanım ve gelir modelleri:** Temel sefer saatleri, aktarma planlama ve iptal duyuruları tüm yolcular için **her zaman %100 ücretsiz ve reklamsız (veya sefer listesini kirletmeyen yapıda)** kalmalıdır. Gelir modeli; (1) Otel, restoran ve iskele işletmeleri için özelleştirilebilir **B2B Dijital Pano (TV Kiosk) SaaS aboneliği**, (2) Turistler için çok dilli **Boğaz & Adalar Sesli Kültür Rehberi Pro** paketi ve (3) Yalnızca `İskeleler` rehber sekmesinde yer alan yerel işletme önerileri üzerine kurulmalıdır.
* **KVKK, lisanslar ve ticari kullanım koşulları:** [İBB Açık Veri Lisansı](https://www.google.com/search?q=https%3A%2F%2Fulasav.csb.gov.tr%2Fdataset%2F%3Forganization%3Distanbul-buyuksehir-belediyesi%26groups%3Dulasim%26license_id%3Dibb-license) kapsamında kullanılan Şehir Hatları verileri için kaynak gösterimi zorunludur. Özel işletmelerin tarifeleri için ticari kullanımda telif/veri çekme (scraping) ihtilafı doğmaması adına yazılı veri paylaşım izni alınmalı veya resmi kaynak bağlantılarıyla yönlendirme yapılmalıdır. Konum (GPS) kullanımı için KVKK aydınlatma metni eklenmelidir.
* **Ürün büyüdüğünde ortaya çıkabilecek operasyonel/teknik sorunlar:** Fırtınalı veya resmi tatil günlerinde anlık trafik patlamaları (traffic spikes), işletmelerin web sitesi yapısını değiştirmesiyle iptal botlarının kırılması ve sezon geçişlerinde (Yaz/Kış tarifesi) özel motor saatlerinin senkronizasyon gecikmeleri.

## 9. Önceliklendirilmiş Sorun ve Fırsat Listesi (P0, P1, P2)

Tespit edilen tüm sorunlar ve fırsatlar; **P0 (Kritik / Güven ve Temel İşlev Engelleyiciler)**, **P1 (Temel Deneyim, Mobil/Masaüstü Kalitesi ve Kapsam)** ve **P2 (İleri Özellikler ve Ticari Farklılaştırma)** olarak 9 zorunlu denetim kriteriyle aşağıda yapılandırılmıştır.

### P0 — Kritik Hatalar, Yanıltıcı Bilgiler ve Temel İşlev Eksiklikleri

#### P0-1: Gerçek Zamanlı Resmi İptal/Duyuru Doğrulama Servisinin Kurulması ve Yanıltıcı Rozetin Kaldırılması
1. **Sorun veya fırsat:** Ana ekranda yer alan *"🛡️ Duyuru doğrulama: 17 Ekim 2026 (3 gün önce) · 4 kaynak"* rozetinin gerçek bir veri taramasına dayanmaması, sistem tarihinden 3 gün çıkararak otomatik üretilmesi ve anlık sefer iptallerinin karta yansımaması.
2. **Mevcut durumun kanıtı:** 20 Ekim 2026 tarihinde yapılan testte rozet tıklanamaz durumdadır, sabit olarak 3 gün öncesini göstermektedir ve `Yenile` butonuna basıldığında güncellenmemektedir.
3. **Önerilen çözüm:** Sunucu tarafında (Vercel Cron + Serverless Function) [Şehir Hatları İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) ve [İDO İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F) sayfalarını 3 dakikada bir tarayan gerçek bir duyuru ayrıştırıcı kurulmalı; otomatik çekilemeyen özel işletmeler için ise sahte doğrulama damgası kaldırılarak kart içinde doğrudan resmi duyuru sayfası bağlantısı sunulmalıdır.
4. **Kullanıcıya sağlayacağı fayda:** Yolcuların lodos veya sis nedeniyle iptal edilmiş bir seferi "Zamanında" sanarak iskeleye gitmesi ve mağdur olması önlenir.
5. **Teknik bağımlılıklar:** Sunucu tarafı HTML/JSON ayrıştırıcı, Vercel KV/Edge önbellek katmanı ve kanonik `line_id + departure_time` eşleştirme şeması.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** Resmi web sitelerinin HTML yapısı değiştiğinde ayrıştırıcı hata verebilir; bu durumda sistem sessizce başarısız olmamalı, arayüzde *"Canlı duyuru kaynağına şu an ulaşılamıyor"* uyarısı göstermelidir.
8. **Başarıyı ölçmek için kullanılacak kriter:** Resmi sitede yayınlanan bir sefer iptalinin en geç 5 dakika içinde uygulama arayüzünde ilgili sefer kartına doğru eşleşmeyle yansıma oranı (%99+).
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** İstemci tarafındaki göreceli *"3 gün önce"* tarih kodu tamamen silinmiş olmalı; doğrulama rozetine tıklandığında her işletmenin son başarılı kontrol saati (ör. `23:32 itibarıyla doğrulandı`) ve resmi kaynak linki açılır pencerede listelenmelidir.

#### P0-2: Çevrimiçi Durumda Sürekli Gösterilen "Çevrimdışı Mod Aktif" Bantlarının Düzeltilmesi
1. **Sorun veya fırsat:** Kullanıcı internete bağlı olduğu halde ekranın en üstünde iki ayrı bantta *"MARMARA AÇIKLARI / ÇEVRİMDİŞİ MOD AKTİF"* ve *"● Çevrimdışı Mod — Kayıtlı Resmi Tarife Gösteriliyor"* uyarılarının sürekli görünmesi.
2. **Mevcut durumun kanıtı:** Aktif internet bağlantısıyla yapılan tüm tarayıcı testlerinde ve `Yenile` butonuna basıldıktan sonra dahi her iki çevrimdışı bandı ekranda kalmaktadır.
3. **Önerilen çözüm:** Tarayıcının `navigator.onLine` durumu ve arka uç sağlık kontrolü dinlenerek kullanıcı çevrimiçiyken bu iki uyarı bandı tamamen gizlenmeli; yalnızca gerçek bağlantı kopukluğunda (`offline` event) tek bir ince bilgi şeridi gösterilmelidir. Uygulamanın çevrimdışı çalışabilme özelliği ise üst barda küçük bir `✓ Çevrimdışı Hazır` rozetiyle ifade edilmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Kullanıcının *"Uygulama bozuk veya internetim çekmiyor"* endişesi ortadan kalkar ve üst ekranda dikey alan kazanılır.
5. **Teknik bağımlılıklar:** İstemci ağ durumu dinleyicisi (`window.addEventListener('online' / 'offline')`) ve koşullu bileşen gösterimi.
6. **Uygulama zorluğu:** Düşük.
7. **Riskler ve maliyet etkisi:** Sıfır maliyet ve sıfır teknik risk.
8. **Başarıyı ölçmek için kullanılacak kriter:** Çevrimiçi oturumlarda hatalı çevrimdışı uyarısı gösterim oranının %0'a inmesi.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** İnternet bağlantısı varken sayfa açıldığında hiçbir turuncu/gri çevrimdışı uyarısı görünmemeli; tarayıcı DevTools üzerinden `Offline` moda alındığında uyarı bandı anında belirmeli ve tekrar `Online` olunduğunda kaybolmalıdır.

#### P0-3: Manuel Tarih ve Gün Tipi (Hafta İçi / Cumartesi / Pazar-Tatil / Tüm Gün) Seçicisinin Eklenmesi
1. **Sorun veya fırsat:** Uygulamanın yalnızca cihazın o anki gününe ve saatine ait tarifeyi göstermesi; kullanıcının hafta sonu, resmi tatil veya ertesi sabahın ilk seferlerini sorgulayamaması.
2. **Mevcut durumun kanıtı:** Salı günü yapılan incelemede sistem yalnızca `Hafta içi` tarifesini yüklemekte; ana ekranda veya `Filtreler & Araçlar` içinde gün tipi değiştirici bulunmamaktadır.
3. **Önerilen çözüm:** Arama çubuğunun hemen altına `Bugün (Hafta İçi)`, `Cumartesi`, `Pazar / Tatil` hızlı geçiş sekmeleri ve `Şu Andan İtibaren / Tüm Gün (06:00–00:30)` görünüm anahtarı eklenmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Yolcular hafta içi bir günde hafta sonu Adalar gezisini veya sabah erken saatteki ilk vapuru önceden planlayabilir.
5. **Teknik bağımlılıklar:** Yerel veritabanındaki gün tipi filtresinin (`dayType`) arayüz durumuna (UI State) bağlanması.
6. **Uygulama zorluğu:** Düşük.
7. **Riskler ve maliyet etkisi:** Kullanıcı bugün dışında bir gün seçtiğinde, o seferi anlık kalkıyor sanmaması için kartlarda canlı geri sayım (`6 dk`) gizlenmeli ve *"Cumartesi Tarifesi İnceleniyor"* etiketi gösterilmelidir.
8. **Başarıyı ölçmek için kullanılacak kriter:** Farklı gün tipi ve "Tüm Gün" saatlerini görüntüleme filtrelerinin kullanım oranı.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** Kullanıcı herhangi bir günde `Hafta İçi`, `Cumartesi` ve `Pazar/Tatil` tarifeleri arasında tek dokunuşla geçiş yapabilmeli ve seçilen günün 24 saatlik tüm seferlerini listeleyebilmelidir.

#### P0-4: Sefer Listesindeki Sahte/Demo Sponsor Kartlarının Temizlenmesi ve "Canlı AIS" İsimlendirmesinin Düzeltilmesi
1. **Sorun veya fırsat:** Ana sefer listesinde gerçek vapur kartlarının arasında kurgusal *"Büyükada Ada Palas · #VAPUR15"* reklam kartının bulunması ve tahmini tarife enterpolasyonu yapan harita aracının *"Canlı AIS Radarı"* olarak adlandırılması.
2. **Mevcut durumun kanıtı:** Sefer listesinde demo otel kartı aktif olarak görünmekte, başvuru butonları `mailto:` açmakta ve harita butonunda içeride `[Tahminî]` yazmasına rağmen dış etikette `Canlı AIS Radarı` ifadesi yer almaktadır.
3. **Önerilen çözüm:** Ana sefer listesindeki tüm yer tutucu/demo reklam kartları kaldırılmalı; harita butonunun ve penceresinin adı dürüst ve şeffaf biçimde **"Tahmini Güzergah ve Sefer Haritası"** olarak güncellenmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Ürünün kurumsal ciddiyeti ve şeffaflığı korunur; yolcular simüle gemi hareketini gerçek uydu AIS verisi sanarak yanıltılmaz.
5. **Teknik bağımlılıklar:** Arayüz bileşen ve metin temizliği.
6. **Uygulama zorluğu:** Düşük.
7. **Riskler ve maliyet etkisi:** Sıfır maliyet; kullanıcı güvenini anında yükseltir.
8. **Başarıyı ölçmek için kullanılacak kriter:** Kullanıcı testlerinde reklam/veri karmaşası ve yanlış AIS beklentisi şikayetlerinin sıfırlanması.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** Sefer listesinde hiçbir demo sponsor satırı bulunmamalı ve harita bileşeninin hiçbir yerinde gerçek AIS verisi bağlanana kadar *"Canlı AIS"* ifadesi geçmemelidir.

### P1 — Temel Kullanıcı Deneyimi, Mobil/Masaüstü Kalitesi ve Veri Kapsamı

#### P1-1: Üst Ekran (Above-the-Fold) Yığılmasının 6 Katmandan 2 Kompakt Satıra İndirilmesi
1. **Sorun veya fırsat:** İlk sefer kartına ulaşana kadar üst üste dizilen 6 ayrı bar ve satırın dikey ekran yüksekliğinin %30–35'ini tüketmesi.
2. **Mevcut durumun kanıtı:** 2 çevrimdışı bandı + 1 üst bar + 1 kalkış/varış satırı + 1 hızlı kapsül satırı + 1 durum satırı olmak üzere 6 katman mevcuttur.
3. **Önerilen çözüm:** Çevrimdışı bantları kaldırılarak üst alan 2 kompakt satıra indirilmeli; sayfa aşağı kaydırıldığında yalnızca ince `Nereden ⇆ Nereye` çubuğu üstte sabit (sticky) kalmalıdır.
4. **Kullanıcıya sağlayacağı fayda:** Mobil ekranda kaydırma yapmadan görünen sefer kartı sayısı 2 katına çıkar ve dar telefonlarda buton sıkışıklığı biter.
5. **Teknik bağımlılıklar:** Header CSS yeniden yapılandırması ve `position: sticky` optimizasyonu.
6. **Uygulama zorluğu:** Düşük - Orta.
7. **Riskler ve maliyet etkisi:** Düşük risk.
8. **Başarıyı ölçmek için kullanılacak kriter:** `375x667` mobil görünüm alanında ilk açılışta kaydırma yapmadan en az 3 tam sefer kartının görünmesi.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** Üst sabit alan yüksekliği mobilde `140px` sınırını aşmamalı ve tüm buton dokunma alanları en az `44x44px` olmalıdır.

#### P1-2: Tek Aktarmalı Deniz Ulaşımı Rota Motoru ve Alternatif İskele Önerisi
1. **Sorun veya fırsat:** Doğrudan seferi olmayan iki iskele seçildiğinde sistemin *"0 Alternatif Bulundu"* diyerek kullanıcıyı çözümsüz bırakması.
2. **Mevcut durumun kanıtı:** `Sarıyer ➔ Büyükada` ve `Beykoz ➔ Kartal` seçimlerinde sistem aktarma önermemekte ve boş sonuç göstermektedir.
3. **Önerilen çözüm:** İstemci tarafındaki sefer veritabanı üzerinde ana aktarma düğümlerini (Kadıköy, Eminönü, Kabataş, Beşiktaş, Üsküdar, Bostancı) kullanarak en az 12 dakikalık aktarma tamponuyla tek aktarmalı deniz rotalarını hesaplayan bir graf arama algoritması kurulmalıdır.
4. **Kullanıcıya sağlayacağı fayda:** Doğrudan seferi olmayan Boğaz ve kıyı iskelelerinden seyahat eden yolcular hangi iskelede hangi vapur veya motora aktarma yapacağını saniyeler içinde öğrenir.
5. **Teknik bağımlılıklar:** İstemci tarafı graf rota algoritması ve iskele içi yürüme/aktarma tampon süreleri tablosu.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** Sunucu maliyeti yaratmaz; aktarma kaçırma riskine karşı minimum 12 dakika bekleme süresi kuralı zorunlu tutulmalıdır.
8. **Başarıyı ölçmek için kullanılacak kriter:** Doğrudan seferi olmayan iskele kombinasyonlarında geçerli aktarmalı rota sunma oranının %90+ olması.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** `Sarıyer ➔ Büyükada` seçildiğinde sistem aktarma iskelesini, birinci ve ikinci vapurun kalkış/varış saatlerini, aktarma bekleme süresini ve toplam yolculuk süresini net bir kartta göstermelidir.

#### P1-3: Paylaşılabilir Rota URL Yapısı (Deep-Linking) ve Sefer Kartı Paylaş Butonu
1. **Sorun veya fırsat:** Kalkış/varış iskelesi veya sekme seçildiğinde URL'nin değişmemesi ve sefer kartlarında paylaşım özelliğinin bulunmaması.
2. **Mevcut durumun kanıtı:** Rota veya sekme değiştirildiğinde URL sabit (`https://adalar-sefer-asistani.vercel.app/`) kalmaktadır; kartlarda yalnızca favori (`☆`) ve alarm (`🔔`) ikonları vardır.
3. **Önerilen çözüm:** Seçilen kalkış, varış, gün tipi ve sekme URL arama parametrelerine (`?from=kadikoy&to=buyukada&day=saturday`) bağlanmalı; sefer kartlarına `navigator.share` destekli paylaş butonu eklenmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Yolcular buluşacakları vapur seferini tek dokunuşla WhatsApp/mesaj üzerinden arkadaşlarına gönderebilir; arama motorları her rotayı ayrı indeksleyebilir.
5. **Teknik bağımlılıklar:** URLSearchParams senkronizasyonu ve Web Share API entegrasyonu.
6. **Uygulama zorluğu:** Düşük.
7. **Riskler ve maliyet etkisi:** Sıfır maliyet; organik büyümeyi ve SEO görünürlüğünü doğrudan artırır.
8. **Başarıyı ölçmek için kullanılacak kriter:** Paylaş butonunun kullanım oranı ve doğrudan parametreli URL ile başlayan ziyaretçi trafiği.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** `?from=bostanci&to=heybeliada` bağlantısı yeni bir sekmede açıldığında ilgili rota otomatik yüklenmeli ve karttaki paylaş butonu sefer özetini paylaşım menüsüne aktarmalıdır.

#### P1-4: İDO Seferlerinin ve Eksik Boğaz/Haliç İskelelerinin Veri Modeline Dahil Edilmesi
1. **Sorun veya fırsat:** Adalar ve Marmara ulaşımının önemli parçası olan [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F) deniz otobüslerinin ve Haliç / Orta Boğaz ara iskelelerinin sistemde bulunmaması.
2. **Mevcut durumun kanıtı:** Uygulamada yalnızca 5 işletme ve 18 iskele yer almaktadır; İDO ve 30'dan fazla Şehir Hatları Boğaz/Haliç iskelesi eksiktir.
3. **Önerilen çözüm:** [İDO Sefer Saatleri](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fsefer-saatleri) ile [İBB Açık Veri GTFS](https://www.google.com/search?q=https%3A%2F%2Fulasav.csb.gov.tr%2Fdataset%2F%3Forganization%3Distanbul-buyuksehir-belediyesi%26groups%3Dulasim%26license_id%3Dibb-license) veri kümesindeki tüm Şehir Hatları iskeleleri sisteme eklenmeli; `Nereden/Nereye` seçicileri metin aramalı (autocomplete) hale getirilmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Kullanıcı İstanbul'daki tüm deniz ulaşımı alternatiflerine tek noktadan eksiksiz erişir.
5. **Teknik bağımlılıklar:** GTFS veri dönüştürücü betik ve klavyeden aranabilir iskele seçici bileşeni.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** İskele sayısı arttığında mobil seçim menüsünün uzamaması için bölge gruplama ve metin filtreleme şarttır.
8. **Başarıyı ölçmek için kullanılacak kriter:** İstanbul tarifeli deniz hatlarının kapsanma oranının %100'e ulaşması.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** İDO Adalar seferleri ile Haliç ve Boğaz ara iskeleleri arama kutusundan yazarak seçilebilmeli ve seferleri listelenmelidir.

#### P1-5: Masaüstü/Tablet Çok Sütunlu Responsive Yerleşim ve Klavye/Modal Erişilebilirliği
1. **Sorun veya fırsat:** Geniş masaüstü ekranlarda uygulamanın ortalanmış dar bir mobil sütun olarak kalması ve bazı modalların `ESC` tuşu ile kapanmaması, odak halkalarının görünmemesi.
2. **Mevcut durumun kanıtı:** Masaüstü görünümde ekranın büyük bölümü boş kalmakta, alt mobil bar korunmakta ve `Filtreler & Araçlar` ile `AIS Radar` modalları `ESC` tuşunu dinlememektedir.
3. **Önerilen çözüm:** `768px` üzerinde 2 sütunlu (Liste + Harita/Detay), `1280px` üzerinde 3 sütunlu (Seferler + Harita + Pano/Hava) düzene geçilmeli; tüm modallara `Escape` dinleyicisi, `FocusTrap` ve `:focus-visible` stil kuralları eklenmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Masaüstü ve tablet kullanıcıları sekme değiştirmeden harita ve seferleri yan yana inceler; klavye kullanıcıları engelsiz gezinir.
5. **Teknik bağımlılıklar:** CSS Grid kırılma noktaları ve ARIA uyumlu modal yönetimi.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** Düşük risk.
8. **Başarıyı ölçmek için kullanılacak kriter:** Lighthouse Accessibility skorunun 95+ olması ve masaüstü kullanılabilir alan oranının %80'e çıkması.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** `1280px+` ekranda liste ve harita yan yana açık olmalı; tüm modallar `ESC` ile kapanmalı ve `Tab` odak halkası her elemanda görünmelidir.

### P2 — İleri Özellikler, Otomasyon ve Ticari Farklılaştırma

#### P2-1: Gidiş-Dönüş Planlayıcı ve "Adadan Son Vapur Kaçıyor" Akıllı Uyarısı
1. **Sorun veya fırsat:** Adalar'a giden yolcuların gece son dönüş vapurunu kaçırma riskine karşı özel bir çift yönlü takip mekanizmasının olmaması.
2. **Mevcut durumun kanıtı: ** Uygulamada gidiş-dönüş görünümü veya son dönüş seferini sabitleyen bir uyarı bulunmamaktadır.
3. **Önerilen çözüm:** Bir ada rotası seçildiğinde ekranın üst kısmında o akşamki son dönüş seferlerini işletme bazında sabitleyen bir bilgi kartı ve tek dokunuşla *"Son Vapura 45 dk Kala Bildirim Gönder"* (Service Worker Web Push) özelliği eklenmelidir.
4. **Kullanıcıya sağlayacağı fayda:** Yolcunun adada mahsur kalma endişesini ortadan kaldırır ve yüksek kullanıcı bağlılığı yaratır.
5. **Teknik bağımlılıklar:** Ters yön son sefer sorgusu ve Web Push API (VAPID) altyapısı.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** Düşük bildirim altyapı maliyeti.
8. **Başarıyı ölçmek için kullanılacak kriter:** Adalar rotalarında "Son Vapur Alarmı" kurulum oranı ve haftalık aktif kullanıcı (WAU) tekrarı.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** Ada rotası seçildiğinde son dönüş saatleri otomatik görünmeli ve arka plan bildirimi zamanında tetiklenmelidir.

#### P2-2: B2B Özelleştirilebilir "İskele & Otel Dijital Pano (TV Modu)" SaaS Ürünü
1. **Sorun veya fırsat:** `Pano` sekmesindeki `TV Modu` özelliğinin kıyı ve Ada işletmeleri (oteller, kafeler, restoranlar) için gelir üreten ve QR kodla organik kullanıcı kazandıran bir B2B ürüne dönüştürülmesi.
2. **Mevcut durumun kanıtı:** `TV Modu` mevcuttur ancak tam ekranda uygulama barları kalmakta, ekran uyanık tutma (WakeLock), işletme logosu özelleştirme ve QR kod yönlendirmesi bulunmamaktadır.
3. **Önerilen çözüm:** İşletmelere özel `/tv?pier=buyukada&partner=oteladi` Kiosk modu geliştirilmeli; `WakeLock API` ile ekran kapanması önlenmeli ve sağ alt köşeye *"Canlı Seferleri Telefonunuza Alın"* dinamik QR kodu yerleştirilmelidir.
4. **Kullanıcıya sağlayacağı fayda:** İşletmeler misafirlerine modern bir canlı iskele panosu sunar; yolcular QR kodu okutarak uygulamayı kendi telefonlarında kullanmaya başlar.
5. **Teknik bağımlılıklar:** Kiosk görünüm şablonu, `navigator.wakeLock` ve dinamik QR kod bileşeni.
6. **Uygulama zorluğu:** Orta.
7. **Riskler ve maliyet etkisi:** Sıfır pazarlama maliyetiyle B2B abonelik geliri ve B2C kullanıcı kazanımı sağlar.
8. **Başarıyı ölçmek için kullanılacak kriter:** Aktif B2B TV ekranı sayısı ve QR kod üzerinden gelen aylık yeni kullanıcı sayısı.
9. **Çalışmanın tamamlandığını gösterecek kabul koşulları:** Kiosk URL'si tam ekranda menüsüz çalışmalı, ekran kararmamalı ve QR kod ilgili iskelenin mobil sayfasını açmalıdır.

## 10. Önerilen Geliştirme Yol Haritası

Mevcut çalışan PWA yapısını bozmadan, ürünü 12 hafta içinde ticari olarak sunulabilir olgunluğa taşıyacak 3 fazlı mühendislik ve ürün yol haritası aşağıda planlanmıştır:

| Faz ve Süre | Odak Alanı | Teslim Edilecek Somut Çıktılar | Faz Çıkış / Başarı Kriteri |
| :--- | :--- | :--- | :--- |
| **Faz 1: Güven ve Temel UX Onarımı** (Hafta 1 – 2) | P0 Kritik Hatalar ve Arayüz Sadeleştirmesi | Çevrimiçi durumda görünen çevrimdışı bantlarının kaldırılması; sahte sponsor kartlarının ve "Canlı AIS" başlığının temizlenmesi; manuel `Hafta İçi / Cumartesi / Pazar` ve `Tüm Gün` seçicisinin eklenmesi; üst ekranın 6 katmandan 2 katmana indirilmesi; paylaşılabilir rota URL'leri (`?from=...&to=...`). | Sıfır yanıltıcı rozet/reklam; ilk ekranda en az 3 tam sefer kartı; tüm rotaların link ile paylaşılabilir olması. |
| **Faz 2: Canlı Veri ve Kapsam Genişletme** (Hafta 3 – 6) | Resmi İptal Otomasyonu, Aktarma ve Masaüstü | [Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) ve [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F) iptal duyurularını 3–5 dakikada bir çeken sunucu servisi; İDO ve tüm Şehir Hatları Boğaz/Haliç iskelelerinin eklenmesi; tek aktarmalı deniz rota motoru; tablet/masaüstü 2 ve 3 sütunlu yerleşim ve tam klavye (`ESC` / `Tab`) erişilebilirliği. | İptallerin 5 dk içinde karta yansıması; 50+ iskele kapsamı; doğrudan seferi olmayan hatlarda %90+ aktarma önerisi. |
| **Faz 3: Farklılaştırma ve Ticari Ölçekleme** (Hafta 7 – 12) | Yolcu Bağlılığı ve B2B SaaS Gelir Modeli | Adalar rotaları için çift yönlü *"Son Dönüş Vapuru"* sabitlemesi ve Web Push bildirimleri; otel ve kafeler için QR kodlu ve özel logolu `B2B TV Kiosk Modu`; Marmaray, Metro ve Tramvay iskele aktarma sürelerinin entegrasyonu. | Aktif B2B Kiosk kurulumları; Web Push bildirim teslim başarısı (%98+) ve yüksek haftalık kullanıcı tekrarı. |

## 11. Test ve Kabul Kriterleri

Ürünün ticari sürüm (v2.0 Production) kalitesine ulaştığını doğrulamak için aşağıdaki test katmanları zorunlu kabul kriteri olarak işletilmelidir:

* **Zaman Dilimi ve Gece Yarısı Birim Testleri:** Cihaz saat dilimi `UTC-5` veya `UTC+1` yapıldığında dahi tüm kalkış geri sayımlarının `Europe/Istanbul (UTC+3)` saatine göre çalıştığı ve gece `23:50 ➔ 00:20` geçişlerinde negatif dakika hatası oluşmadığı otomatik birim testleriyle doğrulanmalıdır.
* **Çoklu Ekran ve Görsel Regresyon Testleri (Playwright):** `320px` (küçük telefon), `390px` (standart telefon), `768px` (tablet), `1440px` (dizüstü) ve `1920x1080` (TV Modu) çözünürlüklerinde yatay taşma (`scrollWidth > innerWidth`) sıfır olmalı; ilk ekranda en az 3 sefer kartı görünmelidir.
* **Klavye ve Ekran Okuyucu Erişilebilirlik Testi:** Fare kullanmadan yalnızca `Tab`, `Shift+Tab`, `Enter` ve `ESC` tuşlarıyla kalkış-varış seçimi yapılabilmeli, detay modalı ve filtre modalı açılıp kapatılabilmeli, Lighthouse Accessibility skoru en az 95 olmalıdır.
* **Kaos ve Hata Toleransı (Graceful Degradation) Testi:** Canlı duyuru servisi veya [Open-Meteo](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2F) API bağlantısı kesildiğinde arayüz çökmemeli; yerel önbellekteki planlı tarifeyi sunarken *"Canlı hava/iptal verisine şu an ulaşılamıyor, planlı resmi tarife gösteriliyor"* bilgisini dürüstçe göstermelidir.

## 12. Doğrulanamayan Noktalar ve İhtiyaç Duyulan Ek Bilgiler

Görsel/etkileşimsel inceleme ile derin teknik denetimin sınırlarını net biçimde ayırmak adına, dışarıdan erişilemeyen ve bir sonraki aşamada (kod denetimi aşamasında) paylaşılması gereken bilgiler şunlardır:

1. **Kaynak Kodu Deposu (GitHub / GitLab erişimi):** Bileşen ağacı, `package.json` bağımlılıkları, durum yönetimi, TypeScript şemaları ve derleme (bundle) boyutlarının incelenmesi için kaynak koduna erişim gereklidir.
2. **692 Seferlik Veri Kümesinin Üretim Yöntemi:** Mevcut tarife verilerinin işletme sitelerinden hangi yöntemle (manuel JSON derlemesi mi, yoksa otomatik scraper betiği mi) oluşturulduğu ve doğrulandığı bilgisi paylaşılmalıdır.
3. **Service Worker ve Web Push Altyapısı:** `Favorilerim` sekmesindeki kalkış alarmlarının yalnızca sekme açıkken mi çalıştığı, yoksa arka planda bir Web Push (VAPID) sunucusuna mı bağlı olduğu kaynak kodundan doğrulanmalıdır.
4. **Gerçek Cihaz Saha Testi:** Marmara Denizi ortasında baz istasyonu geçişlerinde (yüksek paket kaybı / zayıf 3G) PWA çevrimdışı geçiş davranışı ve GPS konum doğruluğu fiziksel iOS ve Android cihazlarla vapur seyahati sırasında test edilmelidir.

## En Yüksek Etkiye Sahip İlk 10 İyileştirme (Özet Tablo)

| Sıra | İyileştirme Adımı | Seviye | Temel Kullanıcı ve İş Etkisi | Zorluk |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Gerçek Zamanlı Resmi İptal Servisi:** Sahte *"3 gün önce"* rozetini kaldırıp [Şehir Hatları](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) ve [İDO](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F) iptallerini 3–5 dakikada bir çeken sunucu servisi kurmak. | **P0** | İptal edilen vapura gitme mağduriyetini önler; ürüne temel güven kazandırır. | Orta |
| **2** | **Çevrimdışı Mod Uyarı Karmaşasını Gidermek:** Kullanıcı çevrimiçiyken üstteki iki *"Çevrimdışı Mod Aktif"* bandını gizleyip yalnızca gerçek bağlantı kopukluğunda göstermek. | **P0** | "Uygulama çalışmıyor/eski veri" yanılgısını bitirir ve ekran alanı açar. | Düşük |
| **3** | **Manuel Gün Tipi ve Tarih Seçici Eklemek:** Arama alanına `Hafta İçi`, `Cumartesi`, `Pazar/Tatil` ve `Tüm Gün Saatleri` seçicisi eklemek. | **P0** | Hafta sonu ve ileri saat/gün planlamasını mümkün kılar. | Düşük |
| **4** | **Demo Reklamları Silmek ve "Canlı AIS" Başlığını Düzeltmek:** Sefer listesindeki sahte otel reklamını kaldırmak ve simüle haritayı *"Tahmini Sefer Haritası"* olarak adlandırmak. | **P0** | Kurumsal ciddiyeti ve veri dürüstlüğünü sağlar. | Düşük |
| **5** | **Üst Ekranı (Above-the-Fold) 6 Katmandan 2 Satıra İndirmek:** Üst barları birleştirip kaydırma sırasında yalnızca arama çubuğunu sabit tutmak. | **P1** | İlk ekranda görünen sefer kartı sayısını ikiye katlar. | Düşük-Orta |
| **6** | **Paylaşılabilir Rota URL'leri (Deep-Linking) ve Paylaş Butonu:** `?from=kadikoy&to=buyukada` URL yapısını ve kart içi WhatsApp/Paylaş butonunu eklemek. | **P1** | Kullanıcıların sefer paylaşmasını ve SEO indekslemesini sağlar. | Düşük |
| **7** | **Tek Aktarmalı Deniz Rota Motoru:** Doğrudan seferi olmayan iskeleler (`Sarıyer ➔ Büyükada`) için ana iskeleler üzerinden aktarmalı rota hesaplamak. | **P1** | "0 Alternatif Bulundu" çıkmazını çözerek gerçek yolculuk asistanı olur. | Orta |
| **8** | **İDO ve Tüm Boğaz/Haliç İskelelerini Eklemek:** Kapsamı 18 iskeleden tüm aktif İstanbul iskelelerine çıkarmak ve yazılı arama (autocomplete) eklemek. | **P1** | Eksiksiz İstanbul deniz ulaşımı kapsamı sağlar. | Orta |
| **9** | **Masaüstü Çok Sütunlu Yerleşim ve Klavye Erişilebilirliği:** Geniş ekranlarda Harita + Liste yan yana görünümü ve tüm modallarda `ESC`/odak halkası sağlamak. | **P1** | Masaüstü, tablet ve erişilebilirlik kalitesini ticari standarda taşır. | Orta |
| **10** | **"Son Vapur Kaçıyor" Kartı ve QR Kodlu B2B TV Modu:** Ada rotalarında son dönüş vapurunu sabitlemek ve otel/kafe TV ekranları için QR kodlu Kiosk modu sunmak. | **P2** | Yüksek kullanıcı bağlılığı ve sürdürülebilir B2B abonelik geliri üretir. | Orta |

## Sonuç ve Kapanış Sorusunun Net Yanıtı

> *"Bu ürünü bugün profesyonel bir kullanıcıya veya ticari müşteriye sunmak isteseydik, bunu güvenle yapabilmek için öncelikle neleri düzeltmemiz ve hangi kalite standartlarını karşılamamız gerekirdi?"*

Bu ürünü **bugün mevcut haliyle** profesyonel bir kullanıcıya veya kurumsal bir B2B müşteriye güvenle sunamayız. Ürünü güvenle pazara çıkarabilmek için kod tabanında **öncelikle düzeltilmesi gereken 5 zorunlu madde** ve **karşılanması gereken 4 temel kalite standardı** şunlardır:

1. **Simüle Verilerin "Canlı/Doğrulanmış" Gibi Sunulmasına Son Verilmelidir:** İstemci tarafında tarihten 3 gün çıkararak üretilen *"Duyuru doğrulama: 3 gün önce · 4 kaynak"* rozeti ve tarife enterpolasyonu yapan *"Canlı AIS Radarı"* başlığı derhal düzeltilmelidir. Gerçek zamanlı olmayan hiçbir veriye "Canlı" etiketi konulmamalıdır.
2. **Resmi İptal Duyuruları İçin Sunucu Tarafı Canlı Doğrulama Kurulmalıdır:** En azından [Şehir Hatları İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) ve [İDO İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F) sayfaları 3–5 dakikada bir sunucu tarafında taranarak iptal edilen sefer kartlarının üzerine kırmızı **"İPTAL EDİLDİ"** rozeti basılmalı; otomatik çekilemeyen kooperatifler için kart üzerinde doğrudan resmi duyuru bağlantısı gösterilmelidir.
3. **Çevrimiçi Durumdaki "Çevrimdışı Mod Aktif" Bantları Kaldırılmalı ve Üst Ekran Sadeleştirilmelidir:** İnternete bağlı kullanıcıyı yanıltan iki üst çevrimdışı bandı kaldırılmalı, 6 katmanlı üst ekran yığılması 2 kompakt satıra indirilmelidir.
4. **Gün Tipi (Hafta İçi / Cumartesi / Pazar) Seçici ve Paylaşılabilir URL'ler Eklenmelidir:** Kullanıcının hafta sonu veya ileri saat tarifelerine bakabilmesi ve seçtiği rotayı link olarak paylaşabilmesi sağlanmalıdır.
5. **Sefer Listesindeki Demo Reklamlar ve `mailto:` Satış Kurgusu Temizlenmelidir:** Seferlerin arasındaki sahte *"Büyükada Ada Palas"* reklam kartı kaldırılmalı; B2B Pano lisansı için kurumsal bir başvuru formu ve gerçek çalışan Kiosk ekranı sunulmalıdır.

**Karşılanması Gereken 4 Kalite Standardı:**
* **Veri Kaynağı Şeffaflığı Standardı:** Her kartta *Planlı Tarife* ile *Canlı Doğrulanmış Durum* bilgisinin ve son senkronizasyon dakikasının açıkça ayrılması.
* **Zaman ve Takvim Kesinliği Standardı:** Tüm hesaplamaların `Europe/Istanbul (UTC+3)` saat dilimine ve Türkiye resmi tatil takvimine kilitlenmesi.
* **Çoklu Ekran ve WCAG 2.1 AA Erişilebilirlik Standardı:** Mobilde sıfır taşma, masaüstünde çok sütunlu yerleşim, tam klavye (`ESC` ve `Tab` odak halkası) desteği.
* **Dürüst Hata Toleransı Standardı:** Bir dış kaynak yanıt vermediğinde uydurma/statik *"Güvenli"* mesajı yerine verinin yaşını ve durumunu açıkça bildiren hata yönetimi.

## Kaynakça ve Doğrulanan Bağlantılar

* Hedef Uygulama: [Adalar Sefer Asistanı / Vapur Canlı Web Uygulaması](https://www.google.com/search?q=https%3A%2F%2Fadalar-sefer-asistani.vercel.app%2F)
* Kamu Deniz İşletmesi: [Şehir Hatları A.Ş. Resmi Web Sitesi](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2F), [Şehir Hatları Sefer Tarifeleri](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fseferler), [Şehir Hatları İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fiptal-seferler) ve [İBB Deniz Taksi Sıkça Sorulan Sorular](https://www.google.com/search?q=https%3A%2F%2Fsehirhatlari.istanbul%2Ftr%2Fibb-deniz-taksi-sikca-sorulan-sorular)
* Açık Veri Kaynağı: [Ulusal Akıllı Şehir Açık Veri Platformu — İBB Ulaşım Veri Kümeleri](https://www.google.com/search?q=https%3A%2F%2Fulasav.csb.gov.tr%2Fdataset%2F%3Forganization%3Distanbul-buyuksehir-belediyesi%26groups%3Dulasim%26license_id%3Dibb-license)
* Deniz Otobüsü İşletmesi: [İDO İstanbul Deniz Otobüsleri Resmi Sitesi](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2F), [İDO Sefer Saatleri](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fsefer-saatleri) ve [İDO İptal Seferler](https://www.google.com/search?q=https%3A%2F%2Fwww.ido.com.tr%2Ftr%2Fiptal-seferler%2F)
* Özel Deniz Motoru İşletmeleri: [Turyol Resmi Web Sitesi](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2F), [Turyol Sefer Saatleri](https://www.google.com/search?q=https%3A%2F%2Fwww.turyol.com%2FHome%2FTarifeler), [Dentur Avrasya Resmi Web Sitesi](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2F), [Dentur Avrasya Adalar Hatları](https://www.google.com/search?q=https%3A%2F%2Fwww.denturavrasya.com%2Ftr-TR%2Fhatlarimiz%2Fadalar), [Mavi Marmara Resmi Web Sitesi](https://www.google.com/search?q=https%3A%2F%2Fmavimarmara.net%2F), [Prenstur Resmi Web Sitesi](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2F) ve [Prenstur Kartal-Adalar Sefer Saatleri](https://www.google.com/search?q=https%3A%2F%2Fwww.prenstur.net%2Findex3e95.html)
* Rakip ve Referans Ulaşım/Denizcilik Platformları: [Moovit İstanbul Büyükada İskelesi](https://www.google.com/search?q=https%3A%2F%2Fmoovitapp.com%2Findex%2Ftr%2Ftoplu_ta%25C5%259F%25C4%25B1ma-B%25C3%25BCy%25C3%25BCkada_%25C4%25B0skelesi_Mavi_Marmara_Dentur-Istanbul-stop_1148687976-1563), [Citymapper İstanbul](https://www.google.com/search?q=https%3A%2F%2Fcitymapper.com%2Fistanbul%3Flang%3Den), [MarineTraffic](https://www.google.com/search?q=https%3A%2F%2Fwww.marinetraffic.com%2F), [VesselFinder](https://www.google.com/search?q=https%3A%2F%2Fwww.vesselfinder.com%2F) ve [Open-Meteo Marine Weather API](https://www.google.com/search?q=https%3A%2F%2Fopen-meteo.com%2Fen%2Fdocs%2Fmarine-weather-api)
