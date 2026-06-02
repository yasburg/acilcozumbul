import turkiyeIlIlce from "@/data/turkiye-il-ilce.json";

/** Kayıt ve hizmet bölgesi için desteklenen iller (81 il) */
export const IL_ILCELER: Record<string, readonly string[]> = turkiyeIlIlce;

export const DESTEKLENEN_ILLER = Object.keys(IL_ILCELER).sort((a, b) =>
  a.localeCompare(b, "tr")
) as readonly string[];

export type DesteklenenIl = (typeof DESTEKLENEN_ILLER)[number];

export function ilGecerliMi(il: string): il is DesteklenenIl {
  return Object.prototype.hasOwnProperty.call(IL_ILCELER, il);
}

export function ilceListesi(il: string): string[] {
  if (!ilGecerliMi(il)) return [];
  return [...IL_ILCELER[il]];
}
