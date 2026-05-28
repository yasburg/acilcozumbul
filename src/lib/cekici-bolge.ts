import type { Cekici, Talep } from "./types";
import { parseIlIlce } from "./konum-parse";

function normalize(s: string): string {
  return s.trim().toLocaleLowerCase("tr-TR");
}

export function talepKonumBolge(talep: Talep): { il: string | null; ilce: string | null } {
  if (talep.konumIl) {
    return { il: talep.konumIl, ilce: talep.konumIlce ?? null };
  }
  return parseIlIlce(talep.konum.adres);
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
