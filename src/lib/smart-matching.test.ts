import { describe, expect, it } from "vitest";
import { dispatchBatchBoyutu, siralaUygunCekiciler } from "./smart-matching";
import type { Cekici, Talep } from "./types";

const now = new Date().toISOString();
const talep: Talep = {
  id: "t1", ad: "", soyad: "", telefon: "", konum: { lat: 41.01, lng: 28.98, adres: "Kadıköy, İstanbul" },
  konumIl: "İstanbul", konumIlce: "Kadıköy", sorun: "Araç çalışmıyor", sorunTipi: "ariza",
  durum: "ihalede", olusturulma: now, ihaleBitis: new Date(Date.now() + 60 * 60_000).toISOString(),
  bildirilenCekiciIds: [], teklifler: [],
};

function cekici(id: string, extra: Partial<Cekici> = {}): Cekici {
  return {
    id, ad: id, telefon: "905551112233", token: id, sifre: "", kredi: 10, sehir: "İstanbul",
    hizmetBolgeleri: { İstanbul: ["Kadıköy"] }, hizmetModu: "il_ilce", hizmetSorunTipleri: ["ariza"], aktif: true,
    kayitTarihi: now, bildirimSeviye: 1, availabilityStatus: "auto", ...extra,
  };
}

describe("smart matching", () => {
  it("online ve yakın çekiciyi açıklanabilir skorda öne alır", () => {
    const ranked = siralaUygunCekiciler(talep, [
      cekici("far", { availabilityStatus: "auto", konumLat: 41.2, konumLng: 29.2, konumGuncelleme: now }),
      cekici("near-online", { availabilityStatus: "online", konumLat: 41.011, konumLng: 28.981, konumGuncelleme: now }),
    ]);
    expect(ranked.map((x) => x.cekici.id)).toEqual(["near-online", "far"]);
    expect(ranked[0].distanceKm).toBeLessThan(1);
  });

  it("busy/offline veya uyumsuz çekiciyi otomatik dispatch'ten dışarıda bırakır", () => {
    const ranked = siralaUygunCekiciler(talep, [
      cekici("busy", { availabilityStatus: "busy" }),
      cekici("offline", { availabilityStatus: "offline" }),
      cekici("wrong-service", { hizmetSorunTipleri: ["lastik"] }),
      cekici("ok"),
    ]);
    expect(ranked.map((x) => x.cekici.id)).toEqual(["ok"]);
  });

  it("progressive dispatch dalgalarını sınırlı ve öngörülebilir tutar", () => {
    expect([1, 2, 3, 4].map(dispatchBatchBoyutu)).toEqual([5, 10, 20, 20]);
  });
});
