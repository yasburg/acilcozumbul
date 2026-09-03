import { describe, expect, it } from "vitest";
import {
  ayarFromRow,
  teklifCashbackAraliktaMi,
  teklifCashbackDurum,
} from "./teklif-cashback-kampanya";
import { cekiciKrediIade, cekiciToplamKredi } from "./kredi-bakiye";

describe("teklif-cashback-kampanya", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");

  it("kapalı kampanya aralıkta değil", () => {
    expect(
      teklifCashbackAraliktaMi(
        {
          aktif: false,
          baslangic: "2026-09-01T00:00:00.000Z",
          bitis: "2026-09-30T00:00:00.000Z",
        },
        now
      )
    ).toBe(false);
    expect(
      teklifCashbackDurum(
        {
          aktif: false,
          baslangic: "2026-09-01T00:00:00.000Z",
          bitis: "2026-09-30T00:00:00.000Z",
        },
        now
      )
    ).toBe("kapali");
  });

  it("aktif ve süre içinde", () => {
    const ayar = {
      aktif: true,
      baslangic: "2026-09-01T00:00:00.000Z",
      bitis: "2026-09-30T00:00:00.000Z",
    };
    expect(teklifCashbackAraliktaMi(ayar, now)).toBe(true);
    expect(teklifCashbackDurum(ayar, now)).toBe("aktif");
  });

  it("aktif ama süre dışı", () => {
    const ayar = {
      aktif: true,
      baslangic: "2026-08-01T00:00:00.000Z",
      bitis: "2026-08-31T00:00:00.000Z",
    };
    expect(teklifCashbackAraliktaMi(ayar, now)).toBe(false);
    expect(teklifCashbackDurum(ayar, now)).toBe("sure_disi");
  });

  it("bitiş anı dahil değil (now < bitis)", () => {
    expect(
      teklifCashbackAraliktaMi(
        {
          aktif: true,
          baslangic: "2026-09-01T00:00:00.000Z",
          bitis: "2026-09-04T12:00:00.000Z",
        },
        now
      )
    ).toBe(false);
  });

  it("aktifken tarihsiz false", () => {
    expect(teklifCashbackAraliktaMi({ aktif: true }, now)).toBe(false);
  });

  it("ayarFromRow boolean/iso normalize", () => {
    const a = ayarFromRow({
      aktif: true,
      baslangic: "2026-09-01T10:00:00.000Z",
      bitis: "2026-09-10T10:00:00.000Z",
    });
    expect(a.aktif).toBe(true);
    expect(a.baslangic).toBe("2026-09-01T10:00:00.000Z");
  });
});

describe("cekiciKrediIade", () => {
  it("satın alınan kovaya ekler", () => {
    const c = { kredi: 10, abonelikKredi: 5 };
    cekiciKrediIade(c, 3);
    expect(c.kredi).toBe(13);
    expect(c.abonelikKredi).toBe(5);
    expect(cekiciToplamKredi(c)).toBe(18);
  });

  it("sıfır/negatif no-op", () => {
    const c = { kredi: 10, abonelikKredi: 0 };
    cekiciKrediIade(c, 0);
    cekiciKrediIade(c, -2);
    expect(c.kredi).toBe(10);
  });
});
