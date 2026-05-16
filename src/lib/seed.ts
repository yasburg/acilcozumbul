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
  // Eski kayıtlara sifre alanı ekle
  let guncellendi = false;
  const migrated = existing.map((c) => {
    if (!("sifre" in c) || !(c as Cekici).sifre) {
      guncellendi = true;
      return {
        ...c,
        sifre: "123456",
        kayitTarihi: c.kayitTarihi ?? new Date().toISOString(),
      } as Cekici;
    }
    return c as Cekici;
  });
  if (guncellendi) await saveCekiciler(migrated);
}
