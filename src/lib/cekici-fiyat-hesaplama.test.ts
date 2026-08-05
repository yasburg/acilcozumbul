import { describe, expect, it } from "vitest";
import {
  cekiciFiyatTahmini,
  mesafeKapsamBul,
  rotaMesafeKm,
  tlYazi,
  yolMesafesiKm,
} from "./cekici-fiyat-hesaplama";

describe("cekiciFiyatTahmini", () => {
  it("şehir içi kısa mesafe için makul band üretir", () => {
    const s = cekiciFiyatTahmini({
      sehirAd: "İstanbul",
      kapsam: "sehir_ici",
      mesafeKm: 12,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
    });
    expect(s.dusuk).toBeLessThan(s.orta);
    expect(s.orta).toBeLessThan(s.yuksek);
    expect(s.orta).toBeGreaterThan(1000);
    expect(s.kmBasiOrtalama).toBeGreaterThan(0);
  });

  it("şehirler arası uzun mesafe km başını düşürür", () => {
    const kisa = cekiciFiyatTahmini({
      sehirAd: "Ankara",
      kapsam: "sehirler_arasi",
      mesafeKm: 40,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
    });
    const uzun = cekiciFiyatTahmini({
      sehirAd: "Ankara",
      kapsam: "sehirler_arasi",
      mesafeKm: 200,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
    });
    expect(uzun.orta).toBeGreaterThan(kisa.orta);
    expect(uzun.kmBasiOrtalama).toBeLessThan(kisa.kmBasiOrtalama);
  });

  it("gece ve kurtarma çarpanı fiyatı artırır", () => {
    const baz = cekiciFiyatTahmini({
      sehirAd: "Bursa",
      kapsam: "sehir_ici",
      mesafeKm: 20,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
    });
    const zor = cekiciFiyatTahmini({
      sehirAd: "Bursa",
      kapsam: "sehir_ici",
      mesafeKm: 20,
      aracTipi: "otomobil",
      saat: "gece",
      durum: "kurtarma",
    });
    expect(zor.orta).toBeGreaterThan(baz.orta);
  });

  it("gidiş-dönüş için bandı ikiye katlar ve özetler", () => {
    const s = cekiciFiyatTahmini({
      sehirAd: "İstanbul",
      kapsam: "sehirler_arasi",
      mesafeKm: 100,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
    });
    expect(s.ozet.some((o) => o.includes("gidiş-dönüş"))).toBe(true);
    expect(s.kmBasiOrtalama).toBe(Math.round(s.orta / 200));
  });

  it("tlYazi Türkçe formatlar", () => {
    expect(tlYazi(1500)).toMatch(/1\.500/);
  });
});

describe("rotaMesafeKm", () => {
  it("aynı şehir farklı ilçelerde şehir içi mesafe üretir", () => {
    expect(mesafeKapsamBul("İstanbul", "İstanbul")).toBe("sehir_ici");
    const km = rotaMesafeKm({
      cikisIl: "İstanbul",
      cikisIlce: "Kadıköy",
      varisIl: "İstanbul",
      varisIlce: "Beşiktaş",
    });
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(80);
  });

  it("farklı şehirlerde daha uzun mesafe üretir", () => {
    expect(mesafeKapsamBul("İstanbul", "Ankara")).toBe("sehirler_arasi");
    const km = rotaMesafeKm({
      cikisIl: "İstanbul",
      cikisIlce: "Kadıköy",
      varisIl: "Ankara",
      varisIlce: "Çankaya",
    });
    expect(km).toBeGreaterThan(200);
  });

  it("yolMesafesiKm kuş uçuşunu büyütür", () => {
    expect(yolMesafesiKm(10)).toBeGreaterThan(10);
  });
});
