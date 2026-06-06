import { getCekiciler, saveCekiciler } from "./db";
import type { Cekici } from "./types";
import { tumSorunTipIdleri } from "./sorun-tipleri";
import { hizmetBolgeSutunlariVar } from "./supabase/bolge-schema";

const SEED_CEKICILER: Cekici[] = [
  {
    id: "cekici-1",
    ad: "Ahmet Yılmaz",
    telefon: "05321112233",
    token: "ahmet-token-demo",
    sifre: "123456",
    kredi: 3,
    sehir: "İstanbul",
    hizmetIlceleri: ["Kadıköy", "Üsküdar", "Ataşehir", "Maltepe"],
    hizmetBolgeleri: {
      İstanbul: ["Kadıköy", "Üsküdar", "Ataşehir", "Maltepe"],
    },
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
  },
  {
    id: "cekici-2",
    ad: "Mehmet Demir",
    telefon: "05334445566",
    token: "mehmet-token-demo",
    sifre: "123456",
    kredi: 5,
    sehir: "İstanbul",
    hizmetIlceleri: ["Beşiktaş", "Şişli", "Kağıthane", "Beyoğlu"],
    hizmetBolgeleri: {
      İstanbul: ["Beşiktaş", "Şişli", "Kağıthane", "Beyoğlu"],
    },
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
  },
  {
    id: "cekici-3",
    ad: "Ali Kaya",
    telefon: "05357778899",
    token: "ali-token-demo",
    sifre: "123456",
    kredi: 2,
    sehir: "Ankara",
    hizmetIlceleri: ["Çankaya", "Yenimahalle", "Keçiören"],
    hizmetBolgeleri: {
      Ankara: ["Çankaya", "Yenimahalle", "Keçiören"],
    },
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
  },
];

/** Mevcut kayıtları şema güncellemesi; boş DB'ye otomatik demo çekici eklemez. */
export async function ensureSeedData(): Promise<void> {
  const existing = await getCekiciler();

  if (existing.length === 0 && process.env.DEMO_SEED === "true") {
    await saveCekiciler(SEED_CEKICILER);
    return;
  }

  if (existing.length === 0) return;

  const bolgeSutunlari = await hizmetBolgeSutunlariVar();
  let guncellendi = false;
  const migrated = existing.map((c) => {
    let row = c as Cekici;
    if (!("sifre" in c) || !row.sifre) {
      guncellendi = true;
      row = { ...row, sifre: "123456" };
    }
    if (!row.kayitTarihi) {
      guncellendi = true;
      row = { ...row, kayitTarihi: new Date().toISOString() };
    }
    if (!row.hizmetIlceleri) {
      guncellendi = true;
      row = { ...row, hizmetIlceleri: [] };
    }
    if (!row.hizmetSorunTipleri?.length) {
      guncellendi = true;
      row = { ...row, hizmetSorunTipleri: tumSorunTipIdleri() };
    }
    if (
      bolgeSutunlari &&
      !row.hizmetBolgeleri &&
      row.hizmetIlceleri?.length &&
      row.sehir
    ) {
      guncellendi = true;
      row = {
        ...row,
        hizmetBolgeleri: { [row.sehir]: row.hizmetIlceleri },
        hizmetModu: row.hizmetModu ?? "il_ilce",
        menzilKm: row.menzilKm ?? 30,
      };
    }
    return row;
  });

  if (guncellendi) {
    try {
      await saveCekiciler(migrated, { migrationsOnly: true });
    } catch (e) {
      console.warn("[ensureSeedData] çekici güncelleme atlandı:", e);
    }
  }
}
