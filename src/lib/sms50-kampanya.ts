import { smsBaseUrl } from "./sms-base-url";

export const SMS50_KAMPANYA_KODU = "SMS50";

export const SMS50_VARYANTLAR = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
] as const;

export type Sms50Varyant = (typeof SMS50_VARYANTLAR)[number];

export const SMS50_TOKEN_LEN = 8;
export const SMS50_TOKEN_ALFABE =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function sms50VaryantMi(v: string): v is Sms50Varyant {
  return /^[a-z]$/.test(v) && (SMS50_VARYANTLAR as readonly string[]).includes(v);
}

export function sms50TokenGecerliMi(token: string): boolean {
  return new RegExp(`^[0-9A-Za-z]{${SMS50_TOKEN_LEN}}$`).test(token);
}

/** Kısa path: /sms50a veya /sms50a/{token} */
export function sms50KisaPath(
  varyant: Sms50Varyant,
  token?: string | null
): string {
  const base = `/sms50${varyant}`;
  if (token && sms50TokenGecerliMi(token)) return `${base}/${token}`;
  return base;
}

/** Tam kısa URL (www) */
export function sms50KisaUrl(
  varyant: Sms50Varyant,
  base?: string,
  token?: string | null
): string {
  return `${base ?? smsBaseUrl()}${sms50KisaPath(varyant, token)}`;
}

/** Yönlendirme hedefi: kayıt + UTM (+ isteğe bağlı sms_token) */
export function sms50KayitUrl(
  varyant: Sms50Varyant,
  base?: string,
  opts?: { smsToken?: string | null }
): string {
  const origin = base ?? smsBaseUrl();
  const q = new URLSearchParams({
    kampanya: SMS50_KAMPANYA_KODU,
    utm_source: "sms",
    utm_medium: "outbound",
    utm_campaign: "istanbul_cekici",
    utm_content: varyant,
  });
  if (opts?.smsToken && sms50TokenGecerliMi(opts.smsToken)) {
    q.set("sms_token", opts.smsToken);
  }
  return `${origin}/cekici/kayit?${q.toString()}`;
}

export function sms50FooterSatirlari(): string[] {
  const satirlar: string[] = [];
  const mersis = process.env.SMS_MERSIS_NO?.trim();
  const iptal = process.env.SMS_IPTAL_METNI?.trim();
  if (mersis) {
    satirlar.push(`YSN LABS LTD MERSİS: ${mersis}`);
  }
  if (iptal) {
    satirlar.push(iptal);
  } else if (mersis) {
    /* MERSİS varken varsayılan ret satırı yok — IPTAL env ile eklenir */
  }
  return satirlar;
}

/**
 * Şablondaki {{LINK}} veya gövdede geçen ortak /sms50{v} linkini
 * (token varsa) kişiye özel URL ile değiştirir.
 */
export function sms50MesajOlustur(opts: {
  govde: string;
  varyant: Sms50Varyant;
  footerEkle?: boolean;
  baseUrl?: string;
  token?: string | null;
}): string {
  const link = sms50KisaUrl(opts.varyant, opts.baseUrl, opts.token);
  const ortakLink = sms50KisaUrl(opts.varyant, opts.baseUrl);
  let metin = opts.govde;
  /* Önce gövdedeki ortak /sms50{v} linklerini değiştir (token’lıya çift eklememek için) */
  if (opts.token && ortakLink !== link) {
    metin = metin.replaceAll(ortakLink, link);
  }
  metin = metin.replaceAll("{{LINK}}", link);
  if (!metin.includes(link) && !/\{\{LINK\}\}/.test(opts.govde)) {
    /* Serbest metinde {{LINK}} yoksa link ekleme — operatör elle yazmış olabilir */
  }
  if (opts.footerEkle !== false) {
    const footer = sms50FooterSatirlari();
    if (footer.length > 0) {
      metin = `${metin.trim()}\n${footer.join(" — ")}`;
    }
  }
  return metin.trim();
}
