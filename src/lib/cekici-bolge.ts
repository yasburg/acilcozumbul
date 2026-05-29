import type { Cekici, Talep } from "./types";
import { ilceListesi, type DesteklenenIl } from "./il-ilce";
import { parseIlIlce } from "./konum-parse";

const DESTEKLENEN_ILLER: DesteklenenIl[] = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
];

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

export function talepKonumBolge(talep: Talep): { il: string | null; ilce: string | null } {
  if (talep.konumIl) {
    return { il: talep.konumIl, ilce: talep.konumIlce ?? null };
  }

  const parsed = parseIlIlce(talep.konum.adres);
  if (parsed.ilce) return parsed;

  const tek = talep.konum.adres.trim();
  if (tek && !tek.includes(",")) {
    for (const il of DESTEKLENEN_ILLER) {
      const eslesen = ilceEslesir(il, tek);
      if (eslesen) return { il, ilce: eslesen };
    }
  }

  return parsed;
}

/** Çekici bu talebin bulunduğu ilçede hizmet veriyor mu? */
export function cekiciTalepBolgesineUygunMu(cekici: Cekici, talep: Talep): boolean {
  const { il, ilce } = talepKonumBolge(talep);

  if (!il || normalize(cekici.sehir) !== normalize(il)) return false;

  const ilceler = cekici.hizmetIlceleri ?? [];
  if (ilceler.length === 0) return false;

  if (!ilce) return false;

  return ilceler.some((i) => normalize(i) === normalize(ilce));
}

export function filtreleCekicilerBolge(cekiciler: Cekici[], talep: Talep): Cekici[] {
  return cekiciler.filter((c) => cekiciTalepBolgesineUygunMu(c, talep));
}
