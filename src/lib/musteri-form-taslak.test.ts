import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  musteriFormAdimDonusumNormalize,
  musteriFormTaslakBosMu,
  musteriFormTaslakKaydet,
  musteriFormTaslakOku,
  musteriFormTaslakSil,
  type MusteriFormTaslak,
} from "./musteri-form-taslak";

function bosTaslak(
  patch: Partial<MusteriFormTaslak> = {}
): MusteriFormTaslak {
  return {
    v: 1,
    step: "sorun",
    form: {
      ad: "",
      soyad: "",
      telefon: "",
      lat: 0,
      lng: 0,
      adres: "",
      hedefLat: 0,
      hedefLng: 0,
      hedefAdres: "",
      sorunTipi: "",
      sorunDetay: "",
      aracTipi: "",
      aracModeli: "",
      aracDurumu: "",
      lastikDurumu: "",
    },
    yasalOnay: false,
    fotografOnizleme: [null, null],
    fotografData: [null, null],
    ...patch,
  };
}

describe("musteriFormTaslak", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  });

  it("kaydeder ve okur", () => {
    musteriFormTaslakKaydet(
      bosTaslak({
        step: "hedef",
        form: {
          ...bosTaslak().form,
          ad: "Ayşe",
          sorunTipi: "aku",
          aracModeli: "Golf",
        },
        yasalOnay: true,
      })
    );
    const t = musteriFormTaslakOku();
    expect(t?.step).toBe("hedef");
    expect(t?.form.ad).toBe("Ayşe");
    expect(t?.form.sorunTipi).toBe("aku");
    expect(t?.yasalOnay).toBe(true);
  });

  it("eski konum adımını korur; dönüşüm normalize sorun’a map eder", () => {
    sessionStorage.setItem(
      "acilcozum_musteri_form_taslak",
      JSON.stringify(
        bosTaslak({
          step: "sorun",
          form: { ...bosTaslak().form, sorunTipi: "cekici" },
        })
      ).replace('"step":"sorun"', '"step":"konum"')
    );
    expect(musteriFormTaslakOku()?.step).toBe("konum");
    expect(musteriFormAdimDonusumNormalize("konum")).toBe("sorun");
    expect(musteriFormAdimDonusumNormalize("detay")).toBe("sorun");
    expect(musteriFormAdimDonusumNormalize("bilgi")).toBe("bilgi");
  });

  it("boş taslağı ayırt eder", () => {
    expect(musteriFormTaslakBosMu(bosTaslak())).toBe(true);
    expect(
      musteriFormTaslakBosMu(
        bosTaslak({ form: { ...bosTaslak().form, sorunTipi: "aku" } })
      )
    ).toBe(false);
  });

  it("siler", () => {
    musteriFormTaslakKaydet(bosTaslak({ step: "bilgi" }));
    musteriFormTaslakSil();
    expect(musteriFormTaslakOku()).toBeNull();
  });

  it("geçersiz JSON’u yok sayar", () => {
    sessionStorage.setItem("acilcozum_musteri_form_taslak", "{");
    expect(musteriFormTaslakOku()).toBeNull();
  });

  it("kota aşımında fotosuz kaydeder", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (v.includes('"fotografData":["x')) throw new Error("QuotaExceeded");
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    musteriFormTaslakKaydet(
      bosTaslak({
        step: "hedef",
        form: { ...bosTaslak().form, sorunTipi: "aku" },
        fotografData: ["x".repeat(200), null],
        fotografOnizleme: ["y".repeat(200), null],
      })
    );
    const t = musteriFormTaslakOku();
    expect(t?.form.sorunTipi).toBe("aku");
    expect(t?.fotografData).toEqual([null, null]);
  });
});
