import { describe, expect, it } from "vitest";
import { rozetPanelVerisi } from "./rozet-panel";
import type { Cekici } from "./types";

function cekici(partial: Partial<Cekici> & Pick<Cekici, "id">): Cekici {
  return {
    ad: partial.ad ?? "Test",
    telefon: partial.telefon ?? "05551111111",
    token: "t",
    sifre: "s",
    kredi: 1,
    sehir: "İstanbul",
    aktif: true,
    kayitTarihi: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("rozetPanelVerisi", () => {
  it("bekleyen ve onaylanmış listeleri ayırır", () => {
    const veri = rozetPanelVerisi([
      cekici({
        id: "a",
        belgeDurum: "beklemede",
        belgeGonderim: "2026-06-01T10:00:00.000Z",
      }),
      cekici({ id: "b", belgeDurum: "onaylandi" }),
      cekici({ id: "c", rozetAktif: true, belgeDurum: "onaylandi" }),
      cekici({ id: "d", belgeDurum: "yok" }),
    ]);

    expect(veri.ozet.bekleyen).toBe(1);
    expect(veri.ozet.belgeOnayli).toBe(2);
    expect(veri.ozet.rozetAktif).toBe(1);
    expect(veri.bekleyen.map((x) => x.id)).toEqual(["a"]);
    expect(veri.onaylanmis.map((x) => x.id)).toEqual(["c", "b"]);
  });
});
