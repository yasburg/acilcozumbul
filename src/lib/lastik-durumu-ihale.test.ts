import { describe, expect, it } from "vitest";
import {
  LASTIK_DURUMU_BILGI,
  talepLastikDurumuEtiket,
} from "./lastik-durumu";
import { cekiciTalepOnizleme } from "./talep-utils";
import type { Talep } from "./types";

function talep(partial: Partial<Talep> & Pick<Talep, "sorun">): Talep {
  return {
    id: "t1",
    ad: "A",
    soyad: "B",
    telefon: "05001112233",
    konum: { lat: 0, lng: 0, adres: "Kadıköy, İstanbul" },
    durum: "ihalede",
    olusturulma: new Date().toISOString(),
    ihaleBitis: new Date().toISOString(),
    bildirilenCekiciIds: [],
    teklifler: [],
    ...partial,
  };
}

describe("talepLastikDurumuEtiket", () => {
  it("id alanından okur", () => {
    expect(
      talepLastikDurumuEtiket({ lastikDurumu: "yama" })
    ).toBe("Lastik yama lazım / söndü");
  });

  it("sorun metninden çıkarır", () => {
    expect(
      talepLastikDurumuEtiket({
        sorun: "Lastik patladı · Lastik yarıldı (değişim istiyorum)",
      })
    ).toBe("Lastik yarıldı (değişim istiyorum)");
  });
});

describe("cekiciTalepOnizleme", () => {
  it("lastik durumunu ihale özetine koyar", () => {
    const o = cekiciTalepOnizleme(
      talep({
        sorun: "Lastik patladı · Lastik yama lazım / söndü",
        lastikDurumu: "yama",
        aracModeli: undefined,
      })
    );
    expect(o.lastikDurumu).toBe("Lastik yama lazım / söndü");
    expect(o.sorunOzet).toContain("Lastik yama lazım / söndü");
    expect(LASTIK_DURUMU_BILGI).toMatch(/ek ücret/i);
  });
});
