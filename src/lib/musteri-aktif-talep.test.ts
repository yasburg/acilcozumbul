import { describe, expect, it } from "vitest";
import { musteriTalepDevamEdilir } from "./musteri-aktif-talep";

describe("musteriTalepDevamEdilir", () => {
  it("açık ihale, kazanan belli ve anlaşıldı için true", () => {
    expect(musteriTalepDevamEdilir("ihalede")).toBe(true);
    expect(musteriTalepDevamEdilir("yeniden_ihalede")).toBe(true);
    expect(musteriTalepDevamEdilir("kazanan_belli")).toBe(true);
    expect(musteriTalepDevamEdilir("anlaşıldı")).toBe(true);
  });

  it("iptal için false", () => {
    expect(musteriTalepDevamEdilir("iptal")).toBe(false);
    expect(musteriTalepDevamEdilir(null)).toBe(false);
  });
});
