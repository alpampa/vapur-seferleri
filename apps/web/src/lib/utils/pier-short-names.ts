/**
 * Mobil iskele kısaltmaları: 320px genişlikte rota (ör. "Büyükada ➔ Bostancı")
 * ekrana sığmadığında ilk üç harflik kısa adlar kullanılır (kullanıcı kuralı).
 * Masaüstünde tam adlar değişmeden gösterilir; erişilebilir metin (aria-label)
 * her zaman tam adı taşır — kısaltma yalnız görsel katmandır.
 */
const PIER_SHORT_NAMES: Record<string, string> = {
  Büyükada: "Büy",
  Heybeliada: "Hey",
  Burgazada: "Bur",
  Kınalıada: "Kın",
  Bostancı: "Bos",
  Kabataş: "Kab",
  Kadıköy: "Kad",
  Eminönü: "Emi",
  Beşiktaş: "Beş",
  Sirkeci: "Sir",
  Karaköy: "Kar",
  Üsküdar: "Üsk",
  Yenikapı: "Yen",
  Bakırköy: "Bak",
  Maltepe: "Mal",
  Kartal: "Krt",
  Sarıyer: "Sar",
  Beykoz: "Bey",
  Çengelköy: "Çen",
  Avcılar: "Avc",
  Moda: "Mod",
};

export function pierShortName(name: string): string {
  const trimmed = name.trim();
  const mapped = PIER_SHORT_NAMES[trimmed];
  if (mapped) return mapped;
  // Ring/tur seferi: "Adalar Ring (Bostancı)" → ilk üç harf ("Ada") yanıltıcı;
  // hedef net anlaşılsın diye "Ring" yazılır.
  if (/ring/i.test(trimmed)) return "Ring";
  if (Array.from(trimmed).length <= 3) return trimmed;
  return Array.from(trimmed).slice(0, 3).join("");
}
