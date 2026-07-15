import { describe, expect, it } from "vitest";
import {
  adGoster,
  adresGoster,
  adSoyadSatirGoster,
  gizlilikSeviyesi,
  soyadGoster,
  soyadKisaltGoster,
  telefonGoster,
} from "./kisisel-veri-gizle";

describe("gizlilikSeviyesi", () => {
  it("tam öncelikli, sonra demo yarı", () => {
    expect(gizlilikSeviyesi({ tamGizli: true, demo: true })).toBe("tam");
    expect(gizlilikSeviyesi({ tamGizli: false, demo: true })).toBe("yari");
    expect(gizlilikSeviyesi({})).toBe("yok");
  });
});

describe("kisisel veri goster", () => {
  it("yok: orijinal", () => {
    expect(adGoster("Ayşe", "yok")).toBe("Ayşe");
    expect(soyadGoster("Yılmaz", "yok")).toBe("Yılmaz");
    expect(telefonGoster("05321234567", "yok")).toBe("05321234567");
    expect(adresGoster("Kadıköy, İstanbul", "yok")).toBe("Kadıköy, İstanbul");
  });

  it("yari: kısmi maske (demo / sosyal)", () => {
    expect(adGoster("Ayşe", "yari")).toBe("Ay••");
    expect(soyadGoster("Yılmaz", "yari")).toBe("Y••••");
    expect(soyadKisaltGoster("Yılmaz", "yari")).toBe("Y••••");
    expect(telefonGoster("05321234567", "yari")).toContain("***");
    expect(adresGoster("Eski Edirne Asfaltı, Bayrampaşa, İstanbul", "yari")).toBe(
      "Eski Edirne Asfaltı, •••"
    );
    expect(adSoyadSatirGoster("Ahmet Yılmaz", "yari")).toMatch(/^Ah/);
  });

  it("tam: tamamen gizli", () => {
    expect(adGoster("Ayşe", "tam")).toBe("••••");
    expect(soyadGoster("Yılmaz", "tam")).toBe("•");
    expect(telefonGoster("05321234567", "tam")).toBe("•••• ••• •• ••");
    expect(adresGoster("Kadıköy", "tam")).toBe("••••••••");
  });
});
