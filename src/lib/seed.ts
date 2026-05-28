import { getCekiciler, saveCekiciler } from "./db";
import type { Cekici } from "./types";

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
    aktif: true,
    kayitTarihi: new Date().toISOString(),
  },
];

export async function ensureSeedData(): Promise<void> {
  const existing = await getCekiciler();
  if (existing.length === 0) {
    await saveCekiciler(SEED_CEKICILER);
    return;
  }

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
    return row;
  });

  if (guncellendi) await saveCekiciler(migrated);
}
