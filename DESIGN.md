# VAPUR DESIGN SYSTEM SPECIFICATION (DESIGN.md)
## Swiss High-Density Transit & Maritime Craft Architecture

---

### 1. Tasarım Sistemi Felsefesi
Bu sistem, Zürih (SBB/ZVV), Londra (TfL) ve Tokyo (Metro) kentsel ulaşım bilgi mimarisi ilkeleri üzerine kurulmuştur. Amacı:
1. Yoğun bilgi akışını görsel gürültü yaratmadan aktarmak.
2. Doğrudan güneş ışığı altında (yüksek kontrast) ve gece karanlığında (OLED siyahı) gözü yormayan netliği sağlamak.
3. Dokunmatik cihazlarda tek elle ve yürürken kolay kullanım sağlamak.

---

### 2. Tipografi Hiyerarşisi (Typography Hierarchy)
- **Ana Yazı Tipi:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Sayısal ve Zaman Verileri (ZORUNLU):** `font-mono tabular-nums font-black`
  - Sefer saatleri (`18:45`), kalan süreler (`12 dk`, `02:45`) ve sayaçlar asla standart orantılı fontlarla yazılmaz; her zaman genişliği sabit (`tabular-nums`) mono rakamlarla yazılır.
- **Hiyerarşi Ölçeği:**
  - `Hero Time`: 22px - 26px font-black (Geniş kart kalkış saati)
  - `Compact Time`: 15px - 17px font-black (Kompakt liste kalkış saati)
  - `Pier Title`: 13px - 14px font-bold (İskele adları)
  - `Badge / Pill`: 9px - 10.5px font-extrabold uppercase (Durum ve aktarma rozetleri)

---

### 3. Renk Paleti ve Semantik Durumlar (Color Palette & Semantics)

#### Denizcilik & Temel Zemin (Maritime Base)
- **Deniz Laciverti (Deep Nautical Dark):** `#0c1220` (Dark background)
- **Yüzey Kartı (Card Surface):** `#141d2e` (Dark card) / `#ffffff` (Light card)
- **Sınır Çizgileri (Subtle Borders):** `border-slate-200` (Light) / `border-slate-800` (Dark)
- **Vurgu Mavisi (Bosphorus Blue):** `#2563eb` / `#38bdf8`

#### Durum Renk Kodları (Transit Status Signals)
- **Zamanında (On Time):** Nötr görünüm, bağırmayan yalın tipografi.
- **Az Kaldı (Departing Soon ≤15 dk):** Amber (`bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300`).
- **Son Çağrı / Kapı Kapanıyor (≤3 dk):** Rose / Kırmızı yanıp sönen rozet + dairesel geri sayım halkası.
- **Seyirde (In Transit):** Indigo / Gökyüzü mavisi (`bg-indigo-100 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300`).
- **İptal Edildi (Cancelled):** Yüksek kontrastlı Kırmızı (`bg-rose-600 text-white animate-pulse`).
- **Gece Seferi (Night Owls):** Gece Moru / İndigo (`bg-indigo-500/20 text-indigo-200 border-indigo-500/40`).

---

### 4. Boşluk ve Düzen Kuralları (Spacing & Layout Grid)
- **Temel Grid:** 4px (p-1: 4px, p-2: 8px, p-3: 12px, p-4: 16px).
- **Üst Kontrol Alanı Kuralı:** Ekranın en üstündeki filtre ve arama çubuğu toplamda 90px yüksekliği geçmemelidir. Yolcunun ekranında en az 4-5 sefer kartı kaydırma yapmadan aynı anda görünmelidir.
- **Dokunma Hedefleri (Touch Targets):** Butonlar ve seçim elemanları görsel olarak kompakt olsa bile fiziksel dokunma alanı (hitbox) en az 40x40px olmalıdır.

---

### 5. Bileşen Standartları (Component Specs)

1. **Kompakt İskele Seçici (Capsule Selectors):**
   - Nereden ve Nereye açılır kutuları maksimum 240px genişlikte birleştirilmiş kapsül içinde yer alır.
   - Seçili iskele varken anında tek dokunuşla sıfırlayan `✕ Temizle` butonu sunulur.

2. **Firma Logoları (Logomark Only):**
   - Şehir Hatları, Turyol, Dentur, Mavi Marmara ve İDO isimleri metin olarak yazılmaz; sadece resmi vektörel logoları veya piktogramları gösterilir. Yer kazanımı esastır.

3. **Raylı Sistem Aktarma Rozetleri (Transit Connection Pills):**
   - Varış iskelesine bağlı metro/tramvay hatları (M4, Marmaray, M5, T1, F1, M8) yürüyüş süresiyle birlikte mikro rozet olarak gösterilir (`[M4 2dk]`, `[Marmaray 1dk]`).

4. **Boş Durum ve Kurtarma (Graceful Fallback):**
   - Sefer bulunamadığında "Sefer yok" yazıp bırakılmaz. Anında alternatif Marmaray / Gece İETT / Deniz Taksi kurtarma planı butonu gösterilir.
