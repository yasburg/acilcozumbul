import { describe, expect, it } from "vitest";
import {
  fiyatAracTipiMusteriye,
  fiyatDurumMusteriye,
  fiyatHesaplamaTalepTaslagi,
} from "./fiyat-hesaplama-talep";

describe("fiyatHesaplamaTalepTaslagi", () => {
  it("otomobil/standart → sedan/çalışıyor ve telefon adımı", () => {
    const t = fiyatHesaplamaTalepTaslagi({
      cikisIl: "İstanbul",
      cikisIlce: "Kadıköy",
      varisIl: "İstanbul",
      varisIlce: "Beşiktaş",
      aracTipi: "otomobil",
      durum: "standart",
    });
    expect(t).not.toBeNull();
    expect(t?.step).toBe("telefon");
    expect(t?.form.sorunTipi).toBe("arac-tasima");
    expect(t?.form.aracTipi).toBe("sedan");
    expect(t?.form.aracDurumu).toBe("calisiyor");
    expect(t?.form.adres).toContain("Kadıköy");
    expect(t?.form.hedefAdres).toContain("Beşiktaş");
    expect(t?.form.lat).not.toBe(0);
    expect(t?.form.hedefLat).not.toBe(0);
    expect(t?.ihaleSureTipi).toBe("acil");
  });

  it("araç tipi / durum eşlemesi", () => {
    expect(fiyatAracTipiMusteriye("suv")).toBe("suv");
    expect(fiyatAracTipiMusteriye("hafif_ticari")).toBe("minivan");
    expect(fiyatAracTipiMusteriye("karavan")).toBe("diger");
    expect(fiyatDurumMusteriye("kilitli")).toBe("calismiyor_bosa_alinamiyor");
  });
});
