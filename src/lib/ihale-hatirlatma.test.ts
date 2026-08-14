import { describe, expect, it } from "vitest";
import {
  cekiciIhaleHatirlatmaAdayiMi,
  cekiciIhaleHatirlatmaSmsMetni,
  ihaleHatirlatmaAdimiVadesiGeldiMi,
  ihaleHatirlatmaUygunMu,
  ihaleHatirlatmaZamanlari,
  musteriIhaleHatirlatmaSmsMetni,
} from "./ihale-hatirlatma";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

describe("ihale-hatirlatma", () => {
  it("acil (~60 dk) ihalede hatırlatma yok", () => {
    const bas = new Date("2026-08-06T10:00:00.000Z");
    const talep = talepFixture({
      olusturulma: bas.toISOString(),
      ihaleBitis: new Date(bas.getTime() + 60 * 60 * 1000).toISOString(),
      durum: "ihalede",
    });
    expect(ihaleHatirlatmaUygunMu(talep, new Date(bas.getTime() + 30 * 60 * 1000))).toBe(
      false
    );
  });

  it("1 günlük açık ihalede hatırlatma uygun", () => {
    const bas = new Date("2026-08-06T10:00:00.000Z");
    const talep = talepFixture({
      olusturulma: bas.toISOString(),
      ihaleBitis: new Date(bas.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      durum: "ihalede",
    });
    expect(
      ihaleHatirlatmaUygunMu(talep, new Date(bas.getTime() + 2 * 60 * 60 * 1000))
    ).toBe(true);
  });

  it("%25/%50/%75 zamanlarını hesaplar", () => {
    const bas = new Date("2026-08-06T00:00:00.000Z");
    const bit = new Date("2026-08-07T00:00:00.000Z");
    const talep = talepFixture({
      olusturulma: bas.toISOString(),
      ihaleBitis: bit.toISOString(),
    });
    const z = ihaleHatirlatmaZamanlari(talep);
    expect(z[1].toISOString()).toBe("2026-08-06T06:00:00.000Z");
    expect(z[2].toISOString()).toBe("2026-08-06T12:00:00.000Z");
    expect(z[3].toISOString()).toBe("2026-08-06T18:00:00.000Z");
  });

  it("vade adımlarını doğru işaretler", () => {
    const bas = new Date("2026-08-06T00:00:00.000Z");
    const talep = talepFixture({
      olusturulma: bas.toISOString(),
      ihaleBitis: new Date(bas.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      durum: "ihalede",
    });
    expect(
      ihaleHatirlatmaAdimiVadesiGeldiMi(
        talep,
        1,
        new Date("2026-08-06T05:00:00.000Z")
      )
    ).toBe(false);
    expect(
      ihaleHatirlatmaAdimiVadesiGeldiMi(
        talep,
        1,
        new Date("2026-08-06T06:00:00.000Z")
      )
    ).toBe(true);
    expect(
      ihaleHatirlatmaAdimiVadesiGeldiMi(
        talep,
        2,
        new Date("2026-08-06T06:00:00.000Z")
      )
    ).toBe(false);
  });

  it("müşteri SMS metninde bekle linki vardır", () => {
    const { mesaj, link } = musteriIhaleHatirlatmaSmsMetni(
      { id: "t1" },
      "https://www.acilcozumbul.com"
    );
    expect(link).toContain("/bekle/t1");
    expect(mesaj).toContain(link);
    expect(mesaj).toMatch(/Teklifleri kontrol/i);
  });

  it("çekici SMS metninde yer ve link vardır", () => {
    const mesaj = cekiciIhaleHatirlatmaSmsMetni(
      { konumIl: "İstanbul", konumIlce: "Kadıköy" },
      "https://www.acilcozumbul.com/t/abc"
    );
    expect(mesaj).toContain("Kadıköy");
    expect(mesaj).toContain("/t/abc");
    expect(mesaj).toMatch(/Teklif vermediginiz/i);
  });

  it("teklif vermiş çekiciyi adaydan çıkarır", () => {
    const talep = talepFixture({
      durum: "ihalede",
      ihaleBitis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      teklifler: [
        {
          id: "tk1",
          cekiciId: "c1",
          cekiciAd: "Ali",
          fiyat: 1000,
          tahminiSureDk: 30,
          mesaj: "",
          tarih: new Date().toISOString(),
          durum: "aktif",
        },
      ],
    });
    const c = cekiciFixture({ id: "c1", aktif: true });
    expect(cekiciIhaleHatirlatmaAdayiMi(talep, c)).toBe(false);
  });
});
