import { noktaIlIlce } from "./cekici-fiyat-hesaplama";
import { cekiciHizmetBolgeleri } from "./cekici-hizmet-bolge";
import { ilceListesi } from "./il-ilce";
import { istanbulGunAnahtari } from "./musteri-otp";
import { sorunTipiBul, type SorunTipiId } from "./sorun-tipleri";
import type { Cekici, Konum, Talep } from "./types";

export const SIMULASYON_GHOST_CEKICI_ID = "cekici-simulasyon-ghost";
export const SIMULASYON_GHOST_AD = "Can Yıldız";

export const SIMULASYON_SORUN_TIPLERI = [
  "cekici",
  "ariza",
  "diger",
] as const satisfies readonly SorunTipiId[];

export type SimulasyonSorunTipi = (typeof SIMULASYON_SORUN_TIPLERI)[number];

export type SimulasyonPlanDurum =
  | "planli"
  | "iptal"
  | "acildi"
  | "kapandi"
  | "hata";

export type SimulasyonPlan = {
  id: string;
  hedefGun: string;
  il: string;
  kaynakIlce: string;
  hedefIlce: string | null;
  sorunTipi: SimulasyonSorunTipi;
  planlananAcilisAt: string;
  ihaleBitisAt: string;
  planlananKapanisAt: string | null;
  durum: SimulasyonPlanDurum;
  talepId: string | null;
  adetSnapshot: number | null;
  cekiciSayisiSnapshot: number;
  olusturmaKaynagi: "cron" | "manuel";
  hataMesaj: string | null;
  olusturulma: string;
  guncelleme: string;
};

const ADLAR = [
  "Ahmet",
  "Mehmet",
  "Ayşe",
  "Fatma",
  "Emre",
  "Elif",
  "Burak",
  "Zeynep",
  "Can",
  "Deniz",
  "Murat",
  "Selin",
];
const SOYADLAR = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Çelik",
  "Şahin",
  "Yıldız",
  "Öztürk",
  "Aydın",
  "Arslan",
  "Doğan",
];

export function istanbulYarinAnahtari(simdi: Date = new Date()): string {
  const bugun = istanbulGunAnahtari(simdi);
  const d = new Date(`${bugun}T12:00:00+03:00`);
  d.setDate(d.getDate() + 1);
  return istanbulGunAnahtari(d);
}

/** Şehirdeki aktif + hizmet bölgeli çekici sayısı (hayalet hariç) */
export function sehirAktifCekiciSayisi(
  cekiciler: Cekici[],
  il: string
): number {
  let n = 0;
  for (const c of cekiciler) {
    if (!c.aktif) continue;
    if (c.id === SIMULASYON_GHOST_CEKICI_ID) continue;
    const bolgeler = cekiciHizmetBolgeleri(c);
    if ((bolgeler[il]?.length ?? 0) > 0) n += 1;
  }
  return n;
}

/**
 * Günlük simülasyon adedi:
 * 0 → 0 | 1–5 → 0|1 | 6–20 → 1|2 | 20+ → 2|3|4
 */
export function simulasyonGunlukAdet(
  cekiciSayisi: number,
  rand: () => number = Math.random
): number {
  if (cekiciSayisi <= 0) return 0;
  if (cekiciSayisi <= 5) return rand() < 0.5 ? 0 : 1;
  if (cekiciSayisi <= 20) return rand() < 0.5 ? 1 : 2;
  const r = rand();
  if (r < 1 / 3) return 2;
  if (r < 2 / 3) return 3;
  return 4;
}

export function rastgeleEleman<T>(
  liste: readonly T[],
  rand: () => number = Math.random
): T {
  return liste[Math.floor(rand() * liste.length)]!;
}

export function rastgeleIkiFarkliIlce(
  il: string,
  rand: () => number = Math.random
): { kaynak: string; hedef: string } | null {
  const ilceler = ilceListesi(il);
  if (ilceler.length < 2) {
    if (ilceler.length === 1) {
      return { kaynak: ilceler[0]!, hedef: ilceler[0]! };
    }
    return null;
  }
  const kaynak = rastgeleEleman(ilceler, rand);
  let hedef = rastgeleEleman(ilceler, rand);
  let guvenlik = 0;
  while (hedef === kaynak && guvenlik < 20) {
    hedef = rastgeleEleman(ilceler, rand);
    guvenlik += 1;
  }
  return { kaynak, hedef };
}

/** Hedef gün içinde rastgele an (00:00–23:59 TR) */
export function rastgeleGunIciAcilis(
  hedefGun: string,
  rand: () => number = Math.random
): Date {
  const bas = Date.parse(`${hedefGun}T00:00:00+03:00`);
  const ms = Math.floor(rand() * 24 * 60 * 60 * 1000);
  return new Date(bas + ms);
}

/** Açılıştan 10–45 dk; en fazla ihale bitişi */
export function rastgeleKapanisAt(
  acilis: Date,
  ihaleBitis: Date,
  rand: () => number = Math.random
): Date {
  const dk = 10 + Math.floor(rand() * 36); // 10..45
  const aday = new Date(acilis.getTime() + dk * 60 * 1000);
  return aday.getTime() <= ihaleBitis.getTime() ? aday : new Date(ihaleBitis);
}

export function rastgeleMusteriKimlik(rand: () => number = Math.random): {
  ad: string;
  soyad: string;
  telefon: string;
} {
  const ad = rastgeleEleman(ADLAR, rand);
  const soyad = rastgeleEleman(SOYADLAR, rand);
  const son = String(Math.floor(rand() * 1e7)).padStart(7, "0");
  const telefon = `0555${son}`.slice(0, 11);
  return { ad, soyad, telefon };
}

export function konumIlIlce(
  il: string,
  ilce: string
): Konum {
  const nokta = noktaIlIlce(il, ilce) ?? { lat: 39.0, lng: 35.0 };
  return {
    lat: nokta.lat,
    lng: nokta.lng,
    adres: `${ilce}, ${il}`,
  };
}

export function simulasyonSorunMetni(tip: SimulasyonSorunTipi): string {
  const t = sorunTipiBul(tip);
  return t?.label ?? "Diğer";
}

export type SimulasyonSlotTaslak = {
  il: string;
  kaynakIlce: string;
  hedefIlce: string | null;
  sorunTipi: SimulasyonSorunTipi;
  planlananAcilisAt: string;
  ihaleBitisAt: string;
  cekiciSayisiSnapshot: number;
  adetSnapshot: number;
};

export function simulasyonSlotUret(opts: {
  il: string;
  cekiciSayisi: number;
  adetSnapshot: number;
  hedefGun: string;
  rand?: () => number;
}): SimulasyonSlotTaslak | null {
  const rand = opts.rand ?? Math.random;
  const ilceler = rastgeleIkiFarkliIlce(opts.il, rand);
  if (!ilceler) return null;

  const sorunTipi = rastgeleEleman(SIMULASYON_SORUN_TIPLERI, rand);
  const acilis = rastgeleGunIciAcilis(opts.hedefGun, rand);
  const bitis = new Date(acilis.getTime() + 60 * 60 * 1000);

  return {
    il: opts.il,
    kaynakIlce: ilceler.kaynak,
    hedefIlce: sorunTipi === "cekici" ? ilceler.hedef : null,
    sorunTipi,
    planlananAcilisAt: acilis.toISOString(),
    ihaleBitisAt: bitis.toISOString(),
    cekiciSayisiSnapshot: opts.cekiciSayisi,
    adetSnapshot: opts.adetSnapshot,
  };
}

/** Plan satırından gerçek talep nesnesi (henüz DB'ye yazılmamış) */
export function simulasyonTalepOlustur(opts: {
  plan: Pick<
    SimulasyonPlan,
    "il" | "kaynakIlce" | "hedefIlce" | "sorunTipi" | "ihaleBitisAt"
  >;
  talepId: string;
  olusturulma: Date;
  rand?: () => number;
}): Talep {
  const rand = opts.rand ?? Math.random;
  const { ad, soyad, telefon } = rastgeleMusteriKimlik(rand);
  const konum = konumIlIlce(opts.plan.il, opts.plan.kaynakIlce);
  const tip = opts.plan.sorunTipi;
  const sorun = simulasyonSorunMetni(tip);

  const talep: Talep = {
    id: opts.talepId,
    ad,
    soyad,
    telefon,
    konum,
    konumIl: opts.plan.il,
    konumIlce: opts.plan.kaynakIlce,
    sorun,
    sorunTipi: tip,
    durum: "ihalede",
    olusturulma: opts.olusturulma.toISOString(),
    ihaleBitis: opts.plan.ihaleBitisAt,
    bildirilenCekiciIds: [],
    teklifler: [],
    memnuniyetSmsGonderildi: true,
  };

  if (tip === "cekici" && opts.plan.hedefIlce) {
    talep.hedefKonum = konumIlIlce(opts.plan.il, opts.plan.hedefIlce);
  } else {
    talep.hedefBilinmiyor = true;
  }

  return talep;
}
