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
  return sorun.length > 60 ? sorun.slice(0, 60) + "…" : sorun;
}

export function formatKredi(kredi: number): string {
  return Number.isInteger(kredi) ? String(kredi) : kredi.toFixed(1);
}
