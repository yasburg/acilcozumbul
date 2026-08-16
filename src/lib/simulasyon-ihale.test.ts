import { describe, expect, it } from "vitest";
import {
  pgDateAnahtari,
  rastgeleGunIciAcilis,
  rastgeleIkiFarkliIlce,
  rastgeleKapanisAt,
  sehirAktifCekiciSayisi,
  SIMULASYON_GHOST_CEKICI_ID,
  SIMULASYON_SORUN_TIPLERI,
  simulasyonGunlukAdet,
  simulasyonSlotUret,
  simulasyonTalepOlustur,
} from "./simulasyon-ihale";
import type { Cekici } from "./types";

function seqRand(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i % values.length]!;
    i += 1;
    return v;
  };
}

function cekici(opts: Partial<Cekici> & { id: string; sehir: string }): Cekici {
  const { id, sehir, ...rest } = opts;
  return {
    id,
    ad: "Test",
    telefon: "05320000000",
    token: `tok-${id}`,
    sifre: "",
    kredi: 5,
    sehir,
    hizmetBolgeleri: {
      [sehir]: ["Kadıköy", "Üsküdar"],
    },
    hizmetModu: "il_ilce",
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    ...rest,
  };
}

describe("simulasyonGunlukAdet", () => {
  it("0 çekici → 0", () => {
    expect(simulasyonGunlukAdet(0)).toBe(0);
  });

  it("1–5 → 0 veya 1 (varsayılan)", () => {
    expect(simulasyonGunlukAdet(3, () => 0.1)).toBe(0);
    expect(simulasyonGunlukAdet(3, () => 0.9)).toBe(1);
    expect(simulasyonGunlukAdet(1, () => 0.9)).toBe(1);
    expect(simulasyonGunlukAdet(5, () => 0.1)).toBe(0);
  });

  it("6–20 → 1 veya 2 (varsayılan)", () => {
    expect(simulasyonGunlukAdet(6, () => 0.1)).toBe(1);
    expect(simulasyonGunlukAdet(20, () => 0.9)).toBe(2);
  });

  it("20+ → 2, 3 veya 4 (varsayılan)", () => {
    expect(simulasyonGunlukAdet(21, () => 0.1)).toBe(2);
    expect(simulasyonGunlukAdet(100, () => 0.5)).toBe(3);
    expect(simulasyonGunlukAdet(100, () => 0.9)).toBe(4);
  });

  it("özel aralık ayarını kullanır", () => {
    const ayar = {
      dusuk: { min: 2, max: 2 },
      orta: { min: 0, max: 0 },
      yuksek: { min: 5, max: 5 },
    };
    expect(simulasyonGunlukAdet(3, () => 0.5, ayar)).toBe(2);
    expect(simulasyonGunlukAdet(10, () => 0.5, ayar)).toBe(0);
    expect(simulasyonGunlukAdet(25, () => 0.5, ayar)).toBe(5);
  });
});

describe("sehirAktifCekiciSayisi", () => {
  it("yalnızca aktif + bölgeli sayar; hayaleti hariç tutar", () => {
    const liste: Cekici[] = [
      cekici({
        id: "a",
        sehir: "İstanbul",
        hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
      }),
      cekici({
        id: "b",
        sehir: "İstanbul",
        aktif: false,
        hizmetBolgeleri: { İstanbul: ["Üsküdar"] },
      }),
      cekici({
        id: "c",
        sehir: "Ankara",
        hizmetBolgeleri: { Ankara: ["Çankaya"] },
      }),
      cekici({
        id: SIMULASYON_GHOST_CEKICI_ID,
        sehir: "İstanbul",
        aktif: true,
        hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
      }),
    ];
    expect(sehirAktifCekiciSayisi(liste, "İstanbul")).toBe(1);
    expect(sehirAktifCekiciSayisi(liste, "Ankara")).toBe(1);
  });
});

describe("simulasyonSlotUret", () => {
  it("acil 60 dk, sorun tipi setinden, cekici için farklı ilçe", () => {
    const rand = seqRand([0.1, 0.2, 0.0, 0.5, 0.7]);
    const slot = simulasyonSlotUret({
      il: "İstanbul",
      cekiciSayisi: 10,
      adetSnapshot: 2,
      hedefGun: "2026-08-07",
      rand,
    });
    expect(slot).not.toBeNull();
    expect(SIMULASYON_SORUN_TIPLERI).toContain(slot!.sorunTipi);
    const acilis = new Date(slot!.planlananAcilisAt).getTime();
    const bitis = new Date(slot!.ihaleBitisAt).getTime();
    expect(bitis - acilis).toBe(60 * 60 * 1000);
    if (slot!.sorunTipi === "cekici") {
      expect(slot!.hedefIlce).toBeTruthy();
      expect(slot!.hedefIlce).not.toBe(slot!.kaynakIlce);
    }
  });
});

describe("rastgeleGunIciAcilis / kapanis", () => {
  it("açılış hedef gün içinde", () => {
    const d = rastgeleGunIciAcilis("2026-08-07", () => 0);
    expect(d.toISOString()).toBe(
      new Date("2026-08-07T00:00:00+03:00").toISOString()
    );
    const d2 = rastgeleGunIciAcilis("2026-08-07", () => 0.999999);
    const gunBas = Date.parse("2026-08-07T00:00:00+03:00");
    const gunSon = gunBas + 24 * 60 * 60 * 1000;
    expect(d2.getTime()).toBeGreaterThanOrEqual(gunBas);
    expect(d2.getTime()).toBeLessThan(gunSon);
  });

  it("kapanış 10–45 dk ve ihale bitişini aşmaz", () => {
    const acilis = new Date("2026-08-07T10:00:00+03:00");
    const bitis = new Date(acilis.getTime() + 60 * 60 * 1000);
    const k1 = rastgeleKapanisAt(acilis, bitis, () => 0);
    expect(k1.getTime() - acilis.getTime()).toBe(10 * 60 * 1000);
    const k2 = rastgeleKapanisAt(acilis, bitis, () => 0.999);
    expect(k2.getTime() - acilis.getTime()).toBe(45 * 60 * 1000);
    expect(k2.getTime()).toBeLessThanOrEqual(bitis.getTime());
  });
});

describe("rastgeleIkiFarkliIlce", () => {
  it("İstanbul için iki ilçe döner", () => {
    const r = rastgeleIkiFarkliIlce("İstanbul", () => 0.1);
    expect(r).not.toBeNull();
    expect(r!.kaynak).toBeTruthy();
  });
});

describe("simulasyonTalepOlustur", () => {
  it("foto yok, memnuniyet bayrağı true, cekici hedefi var", () => {
    const talep = simulasyonTalepOlustur({
      plan: {
        il: "İstanbul",
        kaynakIlce: "Kadıköy",
        hedefIlce: "Üsküdar",
        sorunTipi: "cekici",
        ihaleBitisAt: new Date().toISOString(),
      },
      talepId: "t1",
      olusturulma: new Date("2026-08-07T10:00:00+03:00"),
      rand: () => 0.2,
    });
    expect(talep.fotografUrls).toBeUndefined();
    expect(talep.memnuniyetSmsGonderildi).toBe(true);
    expect(talep.hedefKonum?.adres).toContain("Üsküdar");
    expect(talep.sorunTipi).toBe("cekici");
    expect(JSON.stringify(talep)).not.toMatch(/simulasyon/i);
  });

  it("ariza için hedefBilinmiyor", () => {
    const talep = simulasyonTalepOlustur({
      plan: {
        il: "İstanbul",
        kaynakIlce: "Beşiktaş",
        hedefIlce: null,
        sorunTipi: "ariza",
        ihaleBitisAt: new Date().toISOString(),
      },
      talepId: "t2",
      olusturulma: new Date(),
      rand: () => 0.3,
    });
    expect(talep.hedefBilinmiyor).toBe(true);
    expect(talep.hedefKonum).toBeUndefined();
  });
});

describe("pgDateAnahtari", () => {
  it("ISO tarihi YYYY-MM-DD olarak korur", () => {
    expect(pgDateAnahtari("2026-08-16")).toBe("2026-08-16");
    expect(pgDateAnahtari("2026-08-16T21:15:40.291Z")).toBe("2026-08-16");
  });

  it("JS Date'i hafta günü stringine çevirmez", () => {
    const d = new Date(2026, 7, 16);
    expect(pgDateAnahtari(d)).toBe("2026-08-16");
    expect(String(d).slice(0, 10)).not.toBe("2026-08-16");
  });

  it("hafta günü tarihini Postgres'e göndermez", () => {
    expect(() => pgDateAnahtari("Sun Aug 16")).toThrow(/Geçersiz gün/);
  });
});
