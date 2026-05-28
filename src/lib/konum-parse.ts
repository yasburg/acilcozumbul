import { ilGecerliMi, ilceListesi, type DesteklenenIl } from "./il-ilce";

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
    const p = parts[i];
    if (ilGecerliMi(p)) {
      il = p;
      ilIndex = i;
      break;
    }
    for (const ad of ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"] as const) {
      if (normalize(p).includes(normalize(ad)) || normalize(ad).includes(normalize(p))) {
        il = ad;
        ilIndex = i;
        break;
      }
    }
    if (il) break;
  }

  if (!il) {
    const lower = adres.toLowerCase();
    if (lower.includes("istanbul") || lower.includes("i̇stanbul"))
      il = "İstanbul";
    else if (lower.includes("ankara")) il = "Ankara";
    else if (lower.includes("izmir") || lower.includes("i̇zmir")) il = "İzmir";
    else if (lower.includes("bursa")) il = "Bursa";
    else if (lower.includes("antalya")) il = "Antalya";
    else if (lower.includes("adana")) il = "Adana";
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
