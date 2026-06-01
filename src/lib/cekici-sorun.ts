import type { Cekici, Talep } from "./types";
import {
  gecerliSorunTipi,
  talepSorunTipi,
  type SorunTipiId,
} from "./sorun-tipleri";

/** Seçilen sorun tiplerini doğrula ve sırala */
export function normalizeHizmetSorunTipleri(ids: string[]): SorunTipiId[] {
  const benzersiz = new Set<SorunTipiId>();
  for (const id of ids) {
    const t = id.trim();
    if (gecerliSorunTipi(t)) benzersiz.add(t);
  }
  return [...benzersiz];
}

/** Çekici bu talebin sorun tipine müdahale edebilir mi? */
export function cekiciTalepSorununaUygunMu(
  cekici: Cekici,
  talep: Talep
): boolean {
  const tipler = cekici.hizmetSorunTipleri ?? [];
  if (tipler.length === 0) return false;
  return tipler.includes(talepSorunTipi(talep));
}

export function filtreleCekicilerSorun(
  cekiciler: Cekici[],
  talep: Talep
): Cekici[] {
  return cekiciler.filter((c) => cekiciTalepSorununaUygunMu(c, talep));
}
