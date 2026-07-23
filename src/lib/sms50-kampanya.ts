import { smsBaseUrl } from "./sms-base-url";

export const SMS50_KAMPANYA_KODU = "SMS50";

export const SMS50_VARYANTLAR = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
] as const;

export type Sms50Varyant = (typeof SMS50_VARYANTLAR)[number];

/** Elle test / smoke linki — gün×saat grafiğine dahil edilmez */
export const SMS50_TEST_VARYANT: Sms50Varyant = "z";

export const SMS50_TOKEN_LEN = 8;
export const SMS50_TOKEN_ALFABE =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Panel birim hesabı için sabit uzunlukta örnek token (gerçek gönderimde kullanılmaz) */
export const SMS50_ORNEK_TOKEN = "Aa0Bb1Cc";

/** Kişiye özel link yer tutucu */
export const SMS50_KISISEL_LINK_PH = "{{KisiselLink}}";

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
  return `${origin}/kayit/a?${q.toString()}`;
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
 * Gövdedeki {{KisiselLink}} / {{LINK}} veya herhangi bir /sms50{v}
 * URL’sini kişiye özel token’lı linkle değiştirir.
 */
export function sms50MesajKisisellestir(opts: {
  govde: string;
  varyant: Sms50Varyant;
  token: string;
  baseUrl?: string;
}): string {
  if (!sms50TokenGecerliMi(opts.token)) {
    throw new Error("Geçersiz SMS50 token.");
  }
  const link = sms50KisaUrl(opts.varyant, opts.baseUrl, opts.token);
  const pathToken = sms50KisaPath(opts.varyant, opts.token);
  let metin = opts.govde;

  metin = metin.replaceAll(SMS50_KISISEL_LINK_PH, link);
  metin = metin.replaceAll("{{KISISELLINK}}", link);
  metin = metin.replaceAll("{{kisisellink}}", link);
  metin = metin.replaceAll("{{LINK}}", link);

  /* Token’suz …/sms50c — zaten /sms50c/{8} olanlara dokunma */
  const barePath =
    `\\/sms50${opts.varyant}(?!\\/[0-9A-Za-z]{${SMS50_TOKEN_LEN}})(?![0-9A-Za-z])`;
  const absRe = new RegExp(
    `https?:\\/\\/[^\\s<>"'\\]\\)]+${barePath}`,
    "gi"
  );
  metin = metin.replace(absRe, link);

  const relRe = new RegExp(barePath, "gi");
  metin = metin.replace(relRe, pathToken);

  if (!metin.includes(opts.token)) {
    throw new Error(
      `Mesajda /sms50${opts.varyant} linki veya ${SMS50_KISISEL_LINK_PH} yok; kişiye özel kod eklenemedi.`
    );
  }
  return metin.trim();
}

/**
 * Şablondaki {{LINK}} / {{KisiselLink}} veya gövdede geçen ortak /sms50{v}
 * linkini (token varsa) kişiye özel URL ile değiştirir.
 */
export function sms50MesajOlustur(opts: {
  govde: string;
  varyant: Sms50Varyant;
  footerEkle?: boolean;
  baseUrl?: string;
  token?: string | null;
}): string {
  let metin = opts.govde;
  if (opts.token) {
    metin = sms50MesajKisisellestir({
      govde: metin,
      varyant: opts.varyant,
      token: opts.token,
      baseUrl: opts.baseUrl,
    });
  } else {
    const link = sms50KisaUrl(opts.varyant, opts.baseUrl);
    metin = metin.replaceAll(SMS50_KISISEL_LINK_PH, link);
    metin = metin.replaceAll("{{KISISELLINK}}", link);
    metin = metin.replaceAll("{{kisisellink}}", link);
    metin = metin.replaceAll("{{LINK}}", link);
  }
  if (opts.footerEkle !== false) {
    const footer = sms50FooterSatirlari();
    if (footer.length > 0) {
      metin = `${metin.trim()}\n${footer.join(" — ")}`;
    }
  }
  return metin.trim();
}

/** Takip açıkken birim hesabı için örnek token’lı mesaj */
export function sms50MesajBirimOnizleme(opts: {
  govde: string;
  varyant: Sms50Varyant;
  baseUrl?: string;
}): string {
  try {
    return sms50MesajKisisellestir({
      govde: opts.govde,
      varyant: opts.varyant,
      token: SMS50_ORNEK_TOKEN,
      baseUrl: opts.baseUrl ?? "https://www.acilcozumbul.com",
    });
  } catch {
    /* Placeholder yoksa örnek link eklenmiş gibi +9 birim hesabı için ekle */
    const ornek = sms50KisaUrl(
      opts.varyant,
      opts.baseUrl ?? "https://www.acilcozumbul.com",
      SMS50_ORNEK_TOKEN
    );
    return `${opts.govde.trim()} ${ornek}`.trim();
  }
}
