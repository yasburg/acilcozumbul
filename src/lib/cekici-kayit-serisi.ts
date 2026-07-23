import { istanbulGunAnahtari } from "./musteri-otp";

export type CekiciKayitGunNokta = {
  /** YYYY-MM-DD Europe/Istanbul */
  gun: string;
  gunluk: number;
  kumulatif: number;
};

function gunEkle(yyyyMmDd: string, gun: number): string {
  const d = new Date(`${yyyyMmDd}T12:00:00+03:00`);
  d.setUTCDate(d.getUTCDate() + gun);
  return istanbulGunAnahtari(d);
}

/**
 * Kayıt tarihlerinden (ISO) günlük adet + kümülatif serisi.
 * Tester hesapları çağıran taraf filtrelemeli.
 */
export function cekiciKayitGunSerisi(
  kayitTarihleri: string[],
  opts?: { bitis?: Date }
): CekiciKayitGunNokta[] {
  const bitis = istanbulGunAnahtari(opts?.bitis ?? new Date());
  const sayac = new Map<string, number>();

  for (const iso of kayitTarihleri) {
    if (!iso) continue;
    const t = new Date(iso);
    if (!Number.isFinite(t.getTime())) continue;
    const gun = istanbulGunAnahtari(t);
    sayac.set(gun, (sayac.get(gun) ?? 0) + 1);
  }

  const gunler = [...sayac.keys()].sort();
  if (gunler.length === 0) {
    return [{ gun: bitis, gunluk: 0, kumulatif: 0 }];
  }

  let baslangic = gunler[0]!;
  if (baslangic > bitis) baslangic = bitis;

  const out: CekiciKayitGunNokta[] = [];
  let kumulatif = 0;
  for (let g = baslangic; ; g = gunEkle(g, 1)) {
    const gunluk = sayac.get(g) ?? 0;
    kumulatif += gunluk;
    out.push({ gun: g, gunluk, kumulatif });
    if (g >= bitis) break;
    /* güvenlik: patolojik döngü */
    if (out.length > 4000) break;
  }
  return out;
}

/** Son N gün (bitiş dahil); daha kısa seri varsa tamamı */
export function cekiciKayitSerisiPencere(
  seri: CekiciKayitGunNokta[],
  gunSayisi: number | "hepsi"
): CekiciKayitGunNokta[] {
  if (gunSayisi === "hepsi" || gunSayisi <= 0) return seri;
  if (seri.length <= gunSayisi) return seri;
  return seri.slice(seri.length - gunSayisi);
}
