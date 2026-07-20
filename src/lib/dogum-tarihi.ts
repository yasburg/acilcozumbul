/** YYYY-MM-DD doğum tarihi doğrulama (çekici kayıt) */

export const DOGUM_MIN_YAS = 18;
export const DOGUM_MAX_YAS = 100;

const ISO_GUN = /^\d{4}-\d{2}-\d{2}$/;

export const DOGUM_AYLARI: { deger: number; etiket: string }[] = [
  { deger: 1, etiket: "Ocak" },
  { deger: 2, etiket: "Şubat" },
  { deger: 3, etiket: "Mart" },
  { deger: 4, etiket: "Nisan" },
  { deger: 5, etiket: "Mayıs" },
  { deger: 6, etiket: "Haziran" },
  { deger: 7, etiket: "Temmuz" },
  { deger: 8, etiket: "Ağustos" },
  { deger: 9, etiket: "Eylül" },
  { deger: 10, etiket: "Ekim" },
  { deger: 11, etiket: "Kasım" },
  { deger: 12, etiket: "Aralık" },
];

function yasHesapla(dogum: Date, bugun = new Date()): number {
  let yas = bugun.getFullYear() - dogum.getFullYear();
  const ay = bugun.getMonth() - dogum.getMonth();
  if (ay < 0 || (ay === 0 && bugun.getDate() < dogum.getDate())) {
    yas -= 1;
  }
  return yas;
}

/** type=date max (18 yaş) */
export function dogumTarihiMaxIso(bugun = new Date()): string {
  const d = new Date(bugun);
  d.setFullYear(d.getFullYear() - DOGUM_MIN_YAS);
  return d.toISOString().slice(0, 10);
}

/** type=date min (100 yaş) */
export function dogumTarihiMinIso(bugun = new Date()): string {
  const d = new Date(bugun);
  d.setFullYear(d.getFullYear() - DOGUM_MAX_YAS);
  return d.toISOString().slice(0, 10);
}

/** Select için yıllar (yeniden eskiye) */
export function dogumYilSecenekleri(bugun = new Date()): number[] {
  const maxYil = bugun.getFullYear() - DOGUM_MIN_YAS;
  const minYil = bugun.getFullYear() - DOGUM_MAX_YAS;
  const yillar: number[] = [];
  for (let y = maxYil; y >= minYil; y--) yillar.push(y);
  return yillar;
}

export function dogumAyGunSayisi(yil: number, ay: number): number {
  if (!yil || !ay) return 31;
  return new Date(yil, ay, 0).getDate();
}

/** Gün / ay / yıl → YYYY-MM-DD (eksikse boş) */
export function dogumParcalarindanIso(
  gun: string | number,
  ay: string | number,
  yil: string | number
): string {
  const g = Number(gun);
  const a = Number(ay);
  const y = Number(yil);
  if (!g || !a || !y) return "";
  return `${y}-${String(a).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
}

/**
 * Geçerliyse normalize ISO gün (YYYY-MM-DD), değilse hata mesajı.
 */
export function dogumTarihiDogrula(
  ham: string | null | undefined
): { ok: true; deger: string } | { ok: false; hata: string } {
  const raw = String(ham ?? "").trim();
  if (!raw) {
    return { ok: false, hata: "Doğum tarihi girin." };
  }
  if (!ISO_GUN.test(raw)) {
    return { ok: false, hata: "Geçerli bir doğum tarihi seçin." };
  }
  const [y, m, gun] = raw.split("-").map(Number);
  const dogum = new Date(y, m - 1, gun);
  if (
    dogum.getFullYear() !== y ||
    dogum.getMonth() !== m - 1 ||
    dogum.getDate() !== gun
  ) {
    return { ok: false, hata: "Geçerli bir doğum tarihi seçin." };
  }
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  if (dogum > bugun) {
    return { ok: false, hata: "Doğum tarihi gelecekte olamaz." };
  }
  const yas = yasHesapla(dogum, bugun);
  if (yas < DOGUM_MIN_YAS) {
    return {
      ok: false,
      hata: `Kayıt için en az ${DOGUM_MIN_YAS} yaşında olmalısınız.`,
    };
  }
  if (yas > DOGUM_MAX_YAS) {
    return { ok: false, hata: "Geçerli bir doğum tarihi girin." };
  }
  return { ok: true, deger: raw };
}
