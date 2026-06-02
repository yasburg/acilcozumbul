import type { Cekici, Talep } from "@/lib/types";
import { tumSorunTipIdleri } from "@/lib/sorun-tipleri";

const IHALE_BITIS = new Date(Date.now() + 60 * 60 * 1000).toISOString();

export function talepFixture(
  overrides: Partial<Talep> & { konum?: Partial<Talep["konum"]> } = {}
): Talep {
  const { konum: konumOverride, ...rest } = overrides;
  return {
    id: "talep-1",
    ad: "Ali",
    soyad: "Veli",
    telefon: "05321111111",
    konum: {
      lat: 41.0082,
      lng: 28.9784,
      adres: "Kadıköy, İstanbul, Türkiye",
      ...konumOverride,
    },
    sorun: "Lastik patladı",
    sorunTipi: "lastik",
    durum: "ihalede",
    olusturulma: new Date().toISOString(),
    ihaleBitis: IHALE_BITIS,
    bildirilenCekiciIds: [],
    teklifler: [],
    ...rest,
  };
}

export function cekiciFixture(overrides: Partial<Cekici> = {}): Cekici {
  return {
    id: "cekici-1",
    ad: "Test Çekici",
    telefon: "05322222222",
    token: "token-1",
    sifre: "123456",
    kredi: 5,
    sehir: "İstanbul",
    hizmetModu: "il_ilce",
    hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    hizmetIlceleri: ["Kadıköy"],
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    menzilKm: 30,
    ...overrides,
  };
}

/** ~10 km kuzey (yaklaşık) */
export const KONUM_MERKEZ = { lat: 41.0082, lng: 28.9784 };
export const KONUM_10KM = { lat: 41.0982, lng: 28.9784 };
export const KONUM_35KM = { lat: 41.3582, lng: 28.9784 };
