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

export function formatKredi(kredi: number): string {
  return Number.isInteger(kredi) ? String(kredi) : kredi.toFixed(1);
}
