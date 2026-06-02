import type { Cekici, Talep } from "./types";
import { DESTEKLENEN_ILLER, ilceListesi, type DesteklenenIl } from "./il-ilce";
import { parseIlIlce } from "./konum-parse";
import { mesafeKmHaversine } from "./geo";
import {
  cekiciHizmetBolgeleri,
  cekiciHizmetModu,
  cekiciKonumGuncelMi,
  hizmetBolgeleriIlceSayisi,
} from "./cekici-hizmet-bolge";

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

function cekiciTalepIlIlceyeUygunMu(cekici: Cekici, talep: Talep): boolean {
  const bolgeler = cekiciHizmetBolgeleri(cekici);
  if (hizmetBolgeleriIlceSayisi(bolgeler) === 0) return false;

  const { il, ilce } = talepKonumBolge(talep);
  if (!il || !ilce) return false;

  const ilceler = bolgeler[il];
  if (!ilceler?.length) return false;

  return ilceler.some((i) => normalize(i) === normalize(ilce));
}

function cekiciTalepMenzileUygunMu(cekici: Cekici, talep: Talep): boolean {
  const menzil = cekici.menzilKm ?? 0;
  if (menzil <= 0) return false;
  if (cekici.konumLat == null || cekici.konumLng == null) return false;
  if (!cekiciKonumGuncelMi(cekici, 10)) return false;

  const km = mesafeKmHaversine(
    cekici.konumLat,
    cekici.konumLng,
    talep.konum.lat,
    talep.konum.lng
  );
  return km <= menzil;
}

/** Çekici bu talebe hizmet bölgesi / menzil ayarına uyuyor mu? */
export function cekiciTalepBolgesineUygunMu(cekici: Cekici, talep: Talep): boolean {
  if (cekiciHizmetModu(cekici) === "konum") {
    return cekiciTalepMenzileUygunMu(cekici, talep);
  }
  return cekiciTalepIlIlceyeUygunMu(cekici, talep);
}

export function filtreleCekicilerBolge(cekiciler: Cekici[], talep: Talep): Cekici[] {
  return cekiciler.filter((c) => cekiciTalepBolgesineUygunMu(c, talep));
}
