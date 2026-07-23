import { describe, expect, it } from "vitest";
import {
  cekiciKayitGunSerisi,
  cekiciKayitSerisiPencere,
} from "./cekici-kayit-serisi";

describe("cekiciKayitGunSerisi", () => {
  it("günlük ve kümülatif üretir, boş günleri doldurur", () => {
    const seri = cekiciKayitGunSerisi(
      [
        "2026-07-01T10:00:00.000Z", // 13:00 TR
        "2026-07-01T20:00:00.000Z", // 23:00 TR aynı gün
        "2026-07-03T08:00:00.000Z", // 11:00 TR
      ],
      { bitis: new Date("2026-07-03T12:00:00.000Z") }
    );

    expect(seri.map((s) => s.gun)).toEqual([
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
    ]);
    expect(seri.map((s) => s.gunluk)).toEqual([2, 0, 1]);
    expect(seri.map((s) => s.kumulatif)).toEqual([2, 2, 3]);
  });

  it("pencere son N günü keser", () => {
    const seri = cekiciKayitGunSerisi(
      ["2026-07-01T10:00:00.000Z", "2026-07-05T10:00:00.000Z"],
      { bitis: new Date("2026-07-05T12:00:00.000Z") }
    );
    const son = cekiciKayitSerisiPencere(seri, 2);
    expect(son).toHaveLength(2);
    expect(son[0]!.gun).toBe("2026-07-04");
    expect(son[1]!.kumulatif).toBe(2);
  });
});
