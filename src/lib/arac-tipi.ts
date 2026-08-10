/** Müşteri talep formu — araç tipi seçenekleri */

export const ARAC_TIPLERI = [
  { id: "sedan", etiket: "Sedan" },
  { id: "hatchback", etiket: "Hatchback" },
  { id: "suv", etiket: "SUV / Jeep" },
  { id: "station", etiket: "Station wagon" },
  { id: "coupe", etiket: "Coupe / Cabrio" },
  { id: "minivan", etiket: "Minivan / Panelvan" },
  { id: "pickup", etiket: "Pickup" },
  { id: "motosiklet", etiket: "Motosiklet" },
  { id: "diger", etiket: "Diğer" },
] as const;

export type AracTipiId = (typeof ARAC_TIPLERI)[number]["id"];

export function aracTipiEtiket(id: string): string | null {
  return ARAC_TIPLERI.find((t) => t.id === id)?.etiket ?? null;
}

export function aracTipiGecerliMi(id: string): boolean {
  return ARAC_TIPLERI.some((t) => t.id === id);
}

/** API `aracModeli` alanı için tip + model birleşimi */
export function aracModeliMetniOlustur(
  aracTipi: string,
  aracModeli: string
): string | undefined {
  const tip = aracTipiEtiket(aracTipi.trim());
  const model = aracModeli.trim();
  if (tip && model) return `${tip} — ${model}`;
  if (tip) return tip;
  if (model) return model;
  return undefined;
}

/** Tip + araç durumu (çekiciye giden metin) */
export function aracDurumuMetniOlustur(
  aracTipi: string,
  aracDurumuEtiket: string
): string | undefined {
  return aracModeliMetniOlustur(aracTipi, aracDurumuEtiket);
}
