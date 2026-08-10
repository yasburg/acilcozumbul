import { describe, expect, it } from "vitest";
import {
  hizmetVerenKisaMetin,
  hizmetVerenSayimHesapla,
  hizmetVerenSayimMusteriGoster,
} from "./hizmet-veren-sayim";
import { cekiciFixture } from "@/test/fixtures";

describe("hizmetVerenSayimHesapla", () => {
  it("hizmet tipine göre aktif ve çevrimiçi sayar", () => {
    const simdi = new Date("2026-06-03T14:00:00+03:00");
    const cekiciler = [
      cekiciFixture({
        id: "c1",
        aktif: true,
        hizmetSorunTipleri: ["lastik", "aku"],
        musaitlikAktif: false,
      }),
      cekiciFixture({
        id: "c2",
        aktif: true,
        hizmetSorunTipleri: ["lastik"],
        musaitlikAktif: true,
        musaitlikBaslangic: "09:00",
        musaitlikBitis: "18:00",
        musaitlikGunler: [2],
      }),
      cekiciFixture({
        id: "c3",
        aktif: false,
        hizmetSorunTipleri: ["kilit"],
      }),
    ];

    const ozet = hizmetVerenSayimHesapla(cekiciler, simdi);
    const lastik = ozet.satirlar.find((s) => s.sorunTipi === "lastik")!;
    const aku = ozet.satirlar.find((s) => s.sorunTipi === "aku")!;
    const kilit = ozet.satirlar.find((s) => s.sorunTipi === "kilit")!;

    expect(lastik.aktif).toBe(2);
    expect(lastik.cevrimici).toBe(1);
    expect(aku.aktif).toBe(1);
    expect(aku.cevrimici).toBe(1);
    expect(kilit.aktif).toBe(0);
    expect(ozet.benzersizAktif).toBe(2);
    expect(ozet.benzersizCevrimici).toBe(1);
  });

  it("kısa metin üretir", () => {
    expect(hizmetVerenKisaMetin("lastik", 3, 12)).toBe(
      "3 çevrimiçi lastikçi · 12 kayıtlı"
    );
    expect(hizmetVerenKisaMetin("kilit", 0, 0)).toBe(
      "Şu an kayıtlı anahtarcı yok"
    );
    expect(hizmetVerenKisaMetin("arac-tasima", 2, 5)).toBe(
      "2 çevrimiçi araç nakliye · 5 kayıtlı"
    );
  });

  it("müşteri gösteriminde aktif offset var, çevrimiçi ham kalır", () => {
    const simdi = new Date("2026-06-03T14:00:00+03:00");
    const ozet = hizmetVerenSayimHesapla(
      [
        cekiciFixture({
          id: "c1",
          aktif: true,
          hizmetSorunTipleri: ["lastik"],
          musaitlikAktif: false,
        }),
      ],
      simdi
    );
    const goster = hizmetVerenSayimMusteriGoster(ozet);

    expect(goster.benzersizAktif).toBe(ozet.benzersizAktif);
    expect(goster.benzersizCevrimici).toBe(ozet.benzersizCevrimici);
    expect(goster.benzersizCevrimici).toBeLessThanOrEqual(goster.benzersizAktif);
    expect(goster.satirlar.find((s) => s.sorunTipi === "lastik")!.aktif).toBe(
      1
    );
    expect(
      goster.satirlar.find((s) => s.sorunTipi === "lastik")!.cevrimici
    ).toBe(1);
  });
});
