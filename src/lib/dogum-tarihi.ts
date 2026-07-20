/** YYYY-MM-DD doğum tarihi doğrulama (çekici kayıt) */

export const DOGUM_MIN_YAS = 18;
export const DOGUM_MAX_YAS = 100;

const ISO_GUN = /^\d{4}-\d{2}-\d{2}$/;

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
