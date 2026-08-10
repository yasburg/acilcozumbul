import { describe, expect, it } from "vitest";
import {
  LASTIK_DURUMU_BILGI,
  talepLastikDurumuEtiket,
} from "./lastik-durumu";
import { talepYakitTipiEtiket } from "./yakit-tipi";
import { talepKilitDurumuEtiket } from "./kilit-durumu";
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
    expect(talepLastikDurumuEtiket({ lastikDurumu: "yama" })).toBe(
      "Lastik yama lazım / söndü"
    );
  });

  it("sorun metninden çıkarır", () => {
    expect(
      talepLastikDurumuEtiket({
        sorun: "Lastik patladı · Lastik yarıldı (değişim istiyorum)",
      })
    ).toBe("Lastik yarıldı (değişim istiyorum)");
  });
});

describe("cekiciTalepOnizleme — sorun ekstra alanları", () => {
  it("lastik durumunu özetler", () => {
    const o = cekiciTalepOnizleme(
      talep({
        sorun: "Lastik patladı",
        sorunTipi: "lastik",
        lastikDurumu: "yama",
      })
    );
    expect(o.sorunBaslik).toBe("Lastik söndü/patladı");
    expect(o.lastikDurumu).toBe("Lastik yama lazım / söndü");
    expect(LASTIK_DURUMU_BILGI.length).toBeGreaterThan(10);
  });

  it("yakıt tipini özetler", () => {
    const o = cekiciTalepOnizleme(
      talep({
        sorun: "Yakıt bitti · Dizel / mazot",
        sorunTipi: "yakit",
        yakitTipi: "dizel",
        sorunDetay: "Otoyolda kaldım",
      })
    );
    expect(o.yakitTipi).toBe("Dizel / mazot");
    expect(o.sorunDetay).toBe("Otoyolda kaldım");
    expect(talepYakitTipiEtiket({ yakitTipi: "benzin" })).toBe("Benzin");
  });

  it("kilit durumunu özetler", () => {
    const o = cekiciTalepOnizleme(
      talep({
        sorun: "Kilit",
        sorunTipi: "kilit",
        kilitDurumu: "iceride",
      })
    );
    expect(o.kilitDurumu).toBe("Anahtar içeride kaldı, kapılar kilitli");
    expect(talepKilitDurumuEtiket({ kilitDurumu: "kayip" })).toBe(
      "Anahtar kayboldu / yok"
    );
  });

  it("araç tipi ve durumunu ayrı gösterir", () => {
    const o = cekiciTalepOnizleme(
      talep({
        sorun: "Çekici lazım",
        sorunTipi: "cekici",
        aracTipi: "suv",
        aracDurumu: "calismiyor_bosa_alinamiyor",
        aracModeli: "SUV / Jeep — Araç çalışmıyor, boşa alınamıyor",
      })
    );
    expect(o.aracTipi).toBe("SUV / Jeep");
    expect(o.aracDurumu).toBe("Araç çalışmıyor, boşa alınamıyor");
  });
});
