import { describe, expect, it } from "vitest";
import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "./istanbul-ilceler";
import { IL_ILCELER } from "./il-ilce";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

describe("A10–A11 İstanbul kısayolları", () => {
  it("A10: Avrupa ilçeleri — Beşiktaş uygun, Kadıköy değil", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: {
        [ISTANBUL_IL]: [...ISTANBUL_AVRUPA_ILCELER],
      },
    });
    expect(cekiciTalepBolgesineUygunMu(c, talepFixture({ konumIlce: "Beşiktaş", konumIl: "İstanbul" }))).toBe(true);
    expect(cekiciTalepBolgesineUygunMu(c, talepFixture({ konumIlce: "Kadıköy", konumIl: "İstanbul" }))).toBe(false);
  });

  it("A11: Asya ilçeleri — Kadıköy uygun, Beşiktaş değil", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: {
        [ISTANBUL_IL]: [...ISTANBUL_ASYA_ILCELER],
      },
    });
    expect(cekiciTalepBolgesineUygunMu(c, talepFixture({ konumIlce: "Kadıköy", konumIl: "İstanbul" }))).toBe(true);
    expect(cekiciTalepBolgesineUygunMu(c, talepFixture({ konumIlce: "Beşiktaş", konumIl: "İstanbul" }))).toBe(false);
  });

  it("Avrupa + Asya = tüm İstanbul ilçeleri", () => {
    const birlesik = new Set([
      ...ISTANBUL_AVRUPA_ILCELER,
      ...ISTANBUL_ASYA_ILCELER,
    ]);
    expect(birlesik.size).toBe(IL_ILCELER["İstanbul"].length);
  });
});
