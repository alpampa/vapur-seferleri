/**
 * DUYURU GÖVDESİ BÖLÜMLEYİCİ (istemci-güvenli saf yardımcılar)
 *
 * KULLANICI KURALI: İstanbul dışı hatlar (Yalova, Çınarcık, Esenköy vb.)
 * uygulamanın sefer veri setinde YOKTUR; bu yüzden sefer listesinde
 * işaretlenmezler (uydurma iptal üretilmez). Duyuru detayında ayrı
 * "İstanbul Dışı Hatlar" bölümü olarak gösterilirler.
 */

/** Türkçe küçük harf + diacritic sadeleştirme + alfanümerik sıkıştırma */
function normTr(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

/** Bilinen İstanbul dışı hat noktaları (normalize id → görünen ad) */
const ISTANBUL_DISI_HATLAR: { id: string; label: string }[] = [
  { id: "cinarcik", label: "Çınarcık" },
  { id: "kocadere", label: "Kocadere" },
  { id: "esenkoy", label: "Esenköy" },
  { id: "yalova", label: "Yalova" },
  { id: "armutlu", label: "Armutlu" },
  { id: "gemlik", label: "Gemlik" },
  { id: "mudanya", label: "Mudanya" },
  { id: "bursa", label: "Bursa" },
  { id: "bandirma", label: "Bandırma" },
  { id: "erdek", label: "Erdek" },
  { id: "avsa", label: "Avşa" },
  { id: "marmaraadasi", label: "Marmara Adası" },
];

/**
 * Duyuru metninde geçen İstanbul dışı hat adlarını döner (tekrarsız,
 * liste sırasıyla). Hiçbiri geçmiyorsa boş dizi — uydurma yok.
 */
export function extractIstanbulDisiRoutes(body?: string): string[] {
  if (!body) return [];
  const norm = normTr(body);
  return ISTANBUL_DISI_HATLAR.filter((h) => norm.includes(h.id)).map((h) => h.label);
}
