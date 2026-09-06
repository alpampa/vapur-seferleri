export interface DiffSnapshot {
  id: string;
  timestamp: string;
  operator: string;
  sourceUrl: string;
  category: "DUYURU_METNI" | "TARIFE_FIYATI" | "SEFER_SAATI" | "IPTAL_TEBLIGI";
  title: string;
  previousSnippet: string;
  currentSnippet: string;
  changesDetected: boolean;
  shaHash: string;
}

const DIFF_SNAPSHOT_HISTORY: DiffSnapshot[] = [
  {
    id: "diff-2026-09-06-01",
    timestamp: new Date().toISOString(),
    operator: "Şehir Hatları",
    sourceUrl: "https://sehirhatlari.istanbul/tr/duyurular",
    category: "DUYURU_METNI",
    title: "İç Hatlar Günlük Sefer & Hava Durumu Bülteni",
    previousSnippet: "Tüm hatlarımızda seferler hava şartlarına bağlı olarak icra edilmektedir.",
    currentSnippet: "Marmara Denizi ve Boğaz genelinde tüm hatlarımızda seferlerimiz planlandığı gibi sürdürülmektedir.",
    changesDetected: false,
    shaHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "diff-2026-09-06-02",
    timestamp: new Date().toISOString(),
    operator: "Turyol",
    sourceUrl: "https://www.turyol.com/Tarife.aspx",
    category: "TARIFE_FIYATI",
    title: "UKOME 2026 Bilet & Kartlı Geçiş Tebliği Karşılaştırması",
    previousSnippet: "Şehir içi hat bilet fiyatı: 27.00 ₺ (UKOME Kararı)",
    currentSnippet: "Şehir içi hat bilet fiyatı: 27.00 ₺ (UKOME Kararı)",
    changesDetected: false,
    shaHash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
  },
  {
    id: "diff-2026-09-06-03",
    timestamp: new Date().toISOString(),
    operator: "Mavi Marmara",
    sourceUrl: "https://www.mavimarmara.net/sefer-saatleri",
    category: "SEFER_SAATI",
    title: "Bostancı - Adalar Ring Seferleri",
    previousSnippet: "Bostancı - Adalar ring seferleri 08:20, 15:10, 21:45 saatlerinde icra edilmektedir.",
    currentSnippet: "Bostancı - Adalar ring seferleri 08:20, 15:10, 21:45 saatlerinde icra edilmektedir.",
    changesDetected: false,
    shaHash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce"
  }
];

export function getLatestDiffSnapshots(): DiffSnapshot[] {
  return [...DIFF_SNAPSHOT_HISTORY];
}

export function recordOfficialDiff(snapshot: Omit<DiffSnapshot, "id" | "timestamp">) {
  const newDiff: DiffSnapshot = {
    ...snapshot,
    id: `diff-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  DIFF_SNAPSHOT_HISTORY.unshift(newDiff);
  if (DIFF_SNAPSHOT_HISTORY.length > 20) {
    DIFF_SNAPSHOT_HISTORY.pop();
  }
}