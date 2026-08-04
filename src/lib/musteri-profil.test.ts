import { describe, expect, it, beforeEach, vi } from "vitest";
import { musteriProfilKaydet, musteriProfilOku } from "./musteri-profil";

describe("musteriProfil", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  });

  it("ad soyad kaydeder ve okur", () => {
    musteriProfilKaydet("0532 111 22 33", "Ahmet", "Yılmaz");
    const p = musteriProfilOku("05321112233");
    expect(p?.ad).toBe("Ahmet");
    expect(p?.soyad).toBe("Yılmaz");
  });

  it("güncelleme üzerine yazar", () => {
    musteriProfilKaydet("05321112233", "Ahmet", "Yılmaz");
    musteriProfilKaydet("05321112233", "Mehmet", "Demir");
    const p = musteriProfilOku("05321112233");
    expect(p?.ad).toBe("Mehmet");
    expect(p?.soyad).toBe("Demir");
  });

  it("yalnız ad ile kaydeder", () => {
    musteriProfilKaydet("05321112233", "Ahmet", "  ");
    const p = musteriProfilOku("05321112233");
    expect(p?.ad).toBe("Ahmet");
    expect(p?.soyad).toBe("-");
  });

  it("boş ad kaydetmez", () => {
    musteriProfilKaydet("05321112233", "  ", "Yılmaz");
    expect(musteriProfilOku("05321112233")).toBeNull();
  });
});
