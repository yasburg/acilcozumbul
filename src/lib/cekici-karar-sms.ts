import { smsBaseUrl } from "./sms-base-url";
import { telefonGecerliMi } from "./telefon";
import {
  olusturTopluSmsIsi,
  tetikleTopluSmsKuyruk,
} from "./toplu-sms-is-db";
import { TOPLU_SMS_TEMPO_VARSAYILAN } from "./toplu-sms-tempo";

const HESAP_YOLU = "/cekici/panel?tab=hesabim";

function asciiKisa(metin: string, max = 80): string {
  const tr: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };
  return metin
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => tr[ch] ?? ch)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function hesapLink(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${HESAP_YOLU}`;
}

export function rozetBelgeOnaySmsMetni(baseUrl: string): string {
  return `acilcozumbul.com: Belgeleriniz onaylandi. Onayli cekici rozetini satin alabilirsiniz: ${hesapLink(baseUrl)}`;
}

export function rozetBelgeRedSmsMetni(
  baseUrl: string,
  redNedeni?: string | null
): string {
  const neden = asciiKisa(redNedeni ?? "", 60);
  const nedenParca = neden ? ` Neden: ${neden}.` : "";
  return `acilcozumbul.com: Belge basvurunuz reddedildi.${nedenParca} Tekrar yukleyin: ${hesapLink(baseUrl)}`;
}

export function profilFotoOnaySmsMetni(baseUrl: string): string {
  return `acilcozumbul.com: Profil fotografiniz onaylandi. Hesabiniz: ${hesapLink(baseUrl)}`;
}

export function profilFotoRedSmsMetni(
  baseUrl: string,
  redNedeni?: string | null
): string {
  const neden = asciiKisa(redNedeni ?? "", 60);
  const nedenParca = neden ? ` Neden: ${neden}.` : "";
  return `acilcozumbul.com: Profil fotografiniz reddedildi.${nedenParca} Tekrar yukleyin: ${hesapLink(baseUrl)}`;
}

async function kararSmsKuyrugaAl(opts: {
  telefon: string;
  ad?: string | null;
  mesaj: string;
  gonderenEposta: string;
  logEtiket: string;
}): Promise<{ ok: boolean; isId?: string; hata?: string }> {
  if (!telefonGecerliMi(opts.telefon)) {
    return { ok: false, hata: "Gecersiz telefon." };
  }
  try {
    const is = await olusturTopluSmsIsi({
      gonderenEposta: opts.gonderenEposta,
      mesaj: opts.mesaj,
      tempo: { ...TOPLU_SMS_TEMPO_VARSAYILAN, partiBoyutu: 1, beklemeSn: 0 },
      alicilar: [
        {
          telefon: opts.telefon,
          ad: opts.ad?.trim() || undefined,
        },
      ],
    });
    void tetikleTopluSmsKuyruk().catch((e) => {
      console.error(`[${opts.logEtiket}] kuyruk tetik`, e);
    });
    return { ok: true, isId: is.id };
  } catch (e) {
    const hata = e instanceof Error ? e.message : String(e);
    console.error(`[${opts.logEtiket}]`, hata);
    return { ok: false, hata };
  }
}

/** Belge onay/red → toplu SMS kuyruğu */
export async function rozetBelgeSonucSmsKuyrugaAl(opts: {
  telefon: string;
  ad?: string | null;
  durum: "onaylandi" | "reddedildi";
  redNedeni?: string | null;
  baseUrl?: string;
  gonderenEposta?: string | null;
}): Promise<{ ok: boolean; isId?: string; hata?: string }> {
  const baseUrl = smsBaseUrl(opts.baseUrl);
  const mesaj =
    opts.durum === "onaylandi"
      ? rozetBelgeOnaySmsMetni(baseUrl)
      : rozetBelgeRedSmsMetni(baseUrl, opts.redNedeni);
  return kararSmsKuyrugaAl({
    telefon: opts.telefon,
    ad: opts.ad,
    mesaj,
    gonderenEposta: opts.gonderenEposta ?? "panel:rozet-belge",
    logEtiket: "rozet-belge-sms",
  });
}

/** Profil foto onay/red → toplu SMS kuyruğu */
export async function profilFotoSonucSmsKuyrugaAl(opts: {
  telefon: string;
  ad?: string | null;
  durum: "onaylandi" | "reddedildi";
  redNedeni?: string | null;
  baseUrl?: string;
  gonderenEposta?: string | null;
}): Promise<{ ok: boolean; isId?: string; hata?: string }> {
  const baseUrl = smsBaseUrl(opts.baseUrl);
  const mesaj =
    opts.durum === "onaylandi"
      ? profilFotoOnaySmsMetni(baseUrl)
      : profilFotoRedSmsMetni(baseUrl, opts.redNedeni);
  return kararSmsKuyrugaAl({
    telefon: opts.telefon,
    ad: opts.ad,
    mesaj,
    gonderenEposta: opts.gonderenEposta ?? "panel:profil-foto",
    logEtiket: "profil-foto-sms",
  });
}
