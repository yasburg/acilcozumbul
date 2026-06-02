import {
  DESTEKLENEN_ILLER,
  ilGecerliMi,
  ilceListesi,
  type DesteklenenIl,
} from "./il-ilce";

function normalize(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ı/g, "i");
}

function ilceEslesir(il: DesteklenenIl, parca: string): string | null {
  const n = normalize(parca);
  for (const ilce of ilceListesi(il)) {
    if (normalize(ilce) === n) return ilce;
  }
  return null;
}

function ilAdindanBul(parca: string): DesteklenenIl | null {
  if (ilGecerliMi(parca)) return parca;
  const n = normalize(parca);
  for (const ad of DESTEKLENEN_ILLER) {
    const na = normalize(ad);
    if (n.includes(na) || na.includes(n)) return ad;
  }
  return null;
}

/** Adres metninden il ve ilçe çıkarır (Nominatim / Türkiye formatı) */
export function parseIlIlce(adres: string): {
  il: string | null;
  ilce: string | null;
} {
  const parts = adres
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !/^(türkiye|turkey)$/i.test(p));

  let il: DesteklenenIl | null = null;
  let ilIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const bulunan = ilAdindanBul(parts[i]);
    if (bulunan) {
      il = bulunan;
      ilIndex = i;
      break;
    }
  }

  if (!il) {
    const lower = normalize(adres);
    for (const ad of DESTEKLENEN_ILLER) {
      if (lower.includes(normalize(ad))) {
        il = ad;
        break;
      }
    }
  }

  if (!il) return { il: null, ilce: null };

  if (ilIndex > 0) {
    const aday = parts[ilIndex - 1];
    const eslesen = ilceEslesir(il, aday);
    if (eslesen) return { il, ilce: eslesen };
  }

  for (const parca of parts) {
    const eslesen = ilceEslesir(il, parca);
    if (eslesen) return { il, ilce: eslesen };
  }

  return { il, ilce: null };
}
