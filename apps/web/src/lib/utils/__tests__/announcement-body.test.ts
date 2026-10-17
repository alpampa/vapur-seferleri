import { describe, it, expect } from "vitest";
import { extractIstanbulDisiRoutes } from "@/lib/utils/announcement-body";

describe("extractIstanbulDisiRoutes (İstanbul dışı hat ayıklayıcı)", () => {
  it("Turyol popup metnindeki İstanbul dışı hatları bulur", () => {
    const body =
      "HAVA MUHALEFETİ SEBEBİYLE\nÇINARCIK - KOCADERE - ESENKÖY SEFERLERİMİZ\n18.10.2026 PAZAR GÜNÜ AKŞAM 18.00 SEFERİNE KADAR\nİPTAL EDİLMİŞTİR.\nADA SEFERLERİMİZ HAVA MUHALEFETİ NEDENİYLE İPTAL EDİLMİŞTİR\nAdalar seferleri iptal edilmiştir.";
    expect(extractIstanbulDisiRoutes(body)).toEqual(["Çınarcık", "Kocadere", "Esenköy"]);
  });

  it("Adalar/Boğaz duyurularında yanlış pozitif üretmez", () => {
    expect(
      extractIstanbulDisiRoutes(
        "İptal Seferler:\nBeşiktaş-Kabataş\nKabataş-Büyükada\nSirkeci-Büyükada"
      )
    ).toEqual([]);
    expect(
      extractIstanbulDisiRoutes(
        "Maltepe-Büyükada-Heybeliada-Burgazada-Kınalıada\nTuzla-Pendik-Büyükada"
      )
    ).toEqual([]);
    expect(extractIstanbulDisiRoutes(undefined)).toEqual([]);
    expect(extractIstanbulDisiRoutes("")).toEqual([]);
  });

  it("Yalova/Bursa gibi diğer İstanbul dışı noktaları da tanır", () => {
    expect(extractIstanbulDisiRoutes("Yalova ve Bursa seferlerimiz iptal edilmiştir.")).toEqual([
      "Yalova",
      "Bursa",
    ]);
  });
});
