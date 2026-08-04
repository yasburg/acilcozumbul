/** Türkçe → URL slug (küçük harf, ASCII, tire) */

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  i: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function trSlugify(input: string): string {
  const mapped = [...input.trim()]
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("");
  return mapped
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sehirSlug(ilAdi: string): string {
  return trSlugify(ilAdi);
}

export function ilceSlug(ilceAdi: string): string {
  return trSlugify(ilceAdi);
}
