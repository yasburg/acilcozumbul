import { describe, expect, it } from "vitest";
import { sesliSaglikOzet, type SesliMesajKaydi } from "./sesli-mesaj-log";

function kayit(
  partial: Partial<SesliMesajKaydi> &
    Pick<SesliMesajKaydi, "olayTipi" | "olusturulma">
): SesliMesajKaydi {
  return {
    id: partial.id ?? "x",
    ...partial,
  };
}

describe("sesliSaglikOzet", () => {
  it("gönderim, açılma ve tuş sayılarını toplar", () => {
    const now = new Date().toISOString();
    const o = sesliSaglikOzet(
      [
        kayit({
          olayTipi: "gonderim",
          olusturulma: now,
          basarili: true,
        }),
        kayit({
          olayTipi: "gonderim",
          olusturulma: now,
          basarili: false,
        }),
        kayit({
          olayTipi: "rapor",
          olusturulma: now,
          state: 1,
          pushButton: "9",
        }),
        kayit({
          olayTipi: "rapor",
          olusturulma: now,
          state: 2,
          pushButton: "-1",
        }),
        kayit({
          olayTipi: "rapor",
          olusturulma: now,
          state: 1,
          pushButton: "1",
        }),
      ],
      24
    );
    expect(o.gonderim).toBe(2);
    expect(o.gonderimBasarili).toBe(1);
    expect(o.acilan).toBe(2);
    expect(o.cevaplanmayan).toBe(1);
    expect(o.tusTiklama).toBe(2);
    expect(o.tusDagilim["9"]).toBe(1);
    expect(o.tusDagilim["1"]).toBe(1);
  });
});
