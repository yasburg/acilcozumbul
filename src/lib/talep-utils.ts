import { talepLastikDurumuEtiket } from "./lastik-durumu";
import type { Talep } from "./types";

export function isBugun(iso: string): boolean {
  const d = new Date(iso);
  const bugun = new Date();
  return d.toDateString() === bugun.toDateString();
}

export function talepBolge(talep: Talep): string {
  const parts = talep.konum.adres.split(",");
  return parts.slice(-2).join(",").trim() || talep.konum.adres;
}

export function talepSorunOzet(sorun: string): string {
  return sorun.trim();
}

/** Çekici ihale kartı / detay özeti */
export function cekiciTalepOnizleme(talep: Talep): {
  bolge: string;
  sorunOzet: string;
  hedefBolge?: string;
  aracModeli?: string;
  lastikDurumu?: string;
} {
  const lastik =
    talepLastikDurumuEtiket({
      lastikDurumu: talep.lastikDurumu,
      sorun: talep.sorun,
    }) ?? undefined;
  return {
    bolge: talepBolge(talep),
    sorunOzet: talepSorunOzet(talep.sorun),
    hedefBolge: talep.hedefKonum?.adres
      .split(",")
      .slice(-2)
      .join(",")
      .trim(),
    aracModeli: talep.aracModeli,
    ...(lastik ? { lastikDurumu: lastik } : {}),
  };
}

export function formatKredi(kredi: number): string {
  return Number.isInteger(kredi) ? String(kredi) : kredi.toFixed(1);
}
