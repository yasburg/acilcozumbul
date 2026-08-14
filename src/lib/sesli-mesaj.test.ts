import { describe, expect, it, beforeEach } from "vitest";
import {
  sesliCekiciTalepRateLimitGecerMi,
  sesliCekiciTalepRateLimitSifirla,
  SESLI_CEKICI_TALEP_RATE_MS,
  sesliMesajSablonBul,
  sesliMesajSablonlari,
} from "./sesli-mesaj";

describe("sesliMesajSablonlari", () => {
  it("dört şablon ve AudioID dolu", () => {
    const list = sesliMesajSablonlari();
    expect(list.map((s) => s.id)).toEqual([
      "musteri_talep_alindi",
      "cekici_yeni_talep",
      "cekici_yetersiz_kredi",
      "cekici_ihale_kazandi",
    ]);
    expect(sesliMesajSablonBul("musteri_talep_alindi")?.audioId).toBeTruthy();
    expect(sesliMesajSablonBul("cekici_yeni_talep")?.audioId).toBeTruthy();
    expect(sesliMesajSablonBul("cekici_yetersiz_kredi")?.audioId).toBeTruthy();
    expect(sesliMesajSablonBul("cekici_ihale_kazandi")?.audioId).toBe(
      "170416055"
    );
  });
});

describe("sesliCekiciTalepRateLimitGecerMi", () => {
  beforeEach(() => {
    sesliCekiciTalepRateLimitSifirla();
  });

  it("ilk çağrı geçer, hemen sonrası engellenir", () => {
    const t0 = 1_000_000;
    expect(sesliCekiciTalepRateLimitGecerMi("05321111111", t0)).toBe(true);
    expect(sesliCekiciTalepRateLimitGecerMi("05321111111", t0 + 1000)).toBe(
      false
    );
  });

  it("süre dolunca tekrar geçer", () => {
    const t0 = 2_000_000;
    expect(sesliCekiciTalepRateLimitGecerMi("05322222222", t0)).toBe(true);
    expect(
      sesliCekiciTalepRateLimitGecerMi(
        "05322222222",
        t0 + SESLI_CEKICI_TALEP_RATE_MS
      )
    ).toBe(true);
  });
});
