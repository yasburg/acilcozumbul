import { describe, expect, it } from "vitest";
import { faturaKdvAyir } from "./fatura-link";
import { kurumsalOdemeAciklama } from "./trendyol-efaturam/belge-payload";
import type { KrediOdeme } from "./types";

describe("rozet fatura kalemi", () => {
  it("önizleme tutarları KDV ile uyumlu", () => {
    const kdv = faturaKdvAyir(999.9);
    expect(kdv.toplam).toBe(999.9);
    expect(kdv.matrah + kdv.kdv).toBeCloseTo(999.9, 2);
  });

  it("rozet kalem metni", () => {
    const odeme = {
      id: "x",
      cekiciId: "c",
      cekiciAd: "Mustafa Kaçar",
      cekiciTelefon: "05059011422",
      miktar: 0,
      tutar: 999.9,
      paketTl: 999.9,
      odemeTipi: "rozet",
      kurumsal: false,
      demoOdeme: false,
      olusturulma: "2026-08-30T17:58:17.795Z",
    } as KrediOdeme;
    expect(kurumsalOdemeAciklama(odeme)).toBe(
      "Acil Çözüm Bul doğrulanmış hesap rozeti paketi"
    );
  });
});
