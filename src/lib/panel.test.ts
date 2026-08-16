import { describe, expect, it } from "vitest";
import { cekiciPanelOzet, cekiciPanelTesterAyir } from "./panel";
import type { CekiciPanelOzet } from "./panel";
import { cekiciFixture } from "@/test/fixtures";

function ozet(id: string, kayit: string, tester = false): CekiciPanelOzet {
  return {
    id,
    ad: id,
    telefon: "05000000000",
    kredi: 0,
    sehir: "İstanbul",
    aktif: true,
    kayitTarihi: kayit,
    tokenOnizleme: "abc…",
    testerHesap: tester,
  };
}

describe("cekiciPanelTesterAyir", () => {
  it("tester hesapları ayırır ve kayıt tarihine göre sıralar", () => {
    const { testerler, cekiciler } = cekiciPanelTesterAyir([
      ozet("c3", "2026-03-01T00:00:00.000Z"),
      ozet("t1", "2026-01-01T00:00:00.000Z", true),
      ozet("t2", "2026-01-02T00:00:00.000Z", true),
      ozet("c1", "2026-02-01T00:00:00.000Z"),
    ]);
    expect(testerler.map((c) => c.id)).toEqual(["t1", "t2"]);
    expect(cekiciler.map((c) => c.id)).toEqual(["c3", "c1"]);
  });
});

describe("cekiciPanelOzet", () => {
  it("şifre ve hash alanlarını çıkarır", () => {
    const ozet = cekiciPanelOzet(
      cekiciFixture({
        sifre: "gizli",
        sifreHash: "scrypt$1$1$1$x$y",
        token: "super-secret-token",
      })
    );
    expect(ozet).not.toHaveProperty("sifre");
    expect(ozet).not.toHaveProperty("sifreHash");
    expect(ozet).not.toHaveProperty("token");
    expect(ozet.tokenOnizleme).toMatch(/^super-se…$/);
  });
});
