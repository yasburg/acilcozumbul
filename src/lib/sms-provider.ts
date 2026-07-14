import { addSmsKaydi, getCekiciById, updateCekici } from "./db";
import {
  cekiciYeterliBildirimKredisi,
  PANEL_BILDIRIM_KREDI,
} from "./ihale";
import { randomUUID } from "crypto";

export type SmsAliciTipi = "cekici" | "musteri";
export type SmsSaglayici = "netgsm" | "netgsm-otp" | "demo";
/** xml = klasik SMS; otp = Netgsm OTP SMS paketi (öncelikli teslim) */
export type SmsKanal = "xml" | "otp";

export interface SmsGonderimSonuc {
  basarili: boolean;
  saglayici: SmsSaglayici;
  hata?: string;
}

const NETGSM_OTP_URL = "https://api.netgsm.com.tr/sms/rest/v2/otp";

/** OTP SMS Türkçe karakter kabul etmez — ASCII'ye çevir */
export function otpMesajAscii(mesaj: string): string {
  const map: Record<string, string> = {
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
  return mesaj
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => map[c] ?? c)
    .slice(0, 155);
}

/** OTP API: 5XXXXXXXXX (başında 0 / 90 yok) */
function telefonOtpFormat(tel: string): string | null {
  let digits = tel.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (!/^5[0-9]{9}$/.test(digits)) return null;
  return digits;
}

/** SMS gitti ama altyapı/demo hatası — panelde talep yine açılsın */
export function smsInfraHatasiMi(sonuc: SmsGonderimSonuc): boolean {
  if (sonuc.basarili) return false;
  const h = sonuc.hata ?? "";
  if (!h) return true;
  if (h.includes("Yetersiz kredi")) return false;
  if (h.includes("Çekici bulunamadı")) return false;
  if (h.includes("Geçersiz telefon")) return false;
  return true;
}

const NETGSM_XML_URL = "https://api.netgsm.com.tr/sms/send/xml";

/** XML POST: 90XXXXXXXXXX (ülke kodu ile) — Netgsm dokümantasyonu */
function telefonXmlFormat(tel: string): string {
  let digits = tel.replace(/\D/g, "");
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `90${digits}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function netgsmYapilandirildi(): boolean {
  const usercode =
    process.env.NETGSM_USERCODE ?? process.env.NETGSM_USERNAME;
  return !!(usercode && process.env.NETGSM_PASSWORD && process.env.NETGSM_MSGHEADER);
}

function netgsmKimlik(): { usercode: string; password: string; msgheader: string } {
  return {
    usercode: process.env.NETGSM_USERCODE ?? process.env.NETGSM_USERNAME!,
    password: process.env.NETGSM_PASSWORD!,
    msgheader: process.env.NETGSM_MSGHEADER!,
  };
}

/**
 * Netgsm OTP SMS — https://api.netgsm.com.tr/sms/rest/v2/otp
 * Basic Auth; Türkçe karakter yok; numara 5XXXXXXXXX.
 */
async function netgsmOtpSmsGonder(
  telefon: string,
  mesaj: string
): Promise<SmsGonderimSonuc> {
  if (!netgsmYapilandirildi()) {
    return {
      basarili: false,
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış (NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER)",
    };
  }

  const no = telefonOtpFormat(telefon);
  if (!no) {
    return {
      basarili: false,
      saglayici: "netgsm-otp",
      hata: `Geçersiz telefon: ${telefon}`,
    };
  }

  const { usercode, password, msgheader } = netgsmKimlik();
  const auth = Buffer.from(`${usercode}:${password}`).toString("base64");
  const appname = process.env.NETGSM_APPNAME?.trim();
  const msg = otpMesajAscii(mesaj);

  const body: Record<string, string> = {
    msgheader,
    msg,
    no,
  };
  if (appname) body.appname = appname;

  try {
    const res = await fetch(NETGSM_OTP_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let data: { code?: string; description?: string; jobid?: string };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      console.error("[Netgsm OTP SMS] JSON değil:", raw);
      return {
        basarili: false,
        saglayici: "netgsm-otp",
        hata: raw || `HTTP ${res.status}`,
      };
    }

    if (data.code === "00") {
      return { basarili: true, saglayici: "netgsm-otp" };
    }

    const hataMesajlari: Record<string, string> = {
      "20": "Mesaj metni veya uzunluk hatası (max 155, Turkce karakter yok)",
      "30": "Geçersiz kullanıcı adı/şifre veya API erişim izni yok",
      "40": "Geçersiz gönderici adı (msgheader)",
      "41": "Geçersiz gönderici adı (msgheader)",
      "50": "Gönderilen numarayı kontrol edin",
      "51": "Gönderilen numarayı kontrol edin",
      "52": "Gönderilen numarayı kontrol edin",
      "60": "Hesabınızda OTP SMS paketi tanımlı değil",
      "70": "Hatalı parametre",
      "100": "Netgsm sistem hatası",
    };
    const kod = data.code ?? "?";
    const aciklama = hataMesajlari[kod] ?? data.description ?? raw;
    console.error("[Netgsm OTP SMS]", kod, aciklama);
    return {
      basarili: false,
      saglayici: "netgsm-otp",
      hata: `${kod}: ${aciklama}`,
    };
  } catch (err) {
    const hata = err instanceof Error ? err.message : String(err);
    console.error("[Netgsm OTP SMS hata]", hata);
    return { basarili: false, saglayici: "netgsm-otp", hata };
  }
}

/**
 * Netgsm resmi XML POST SMS — https://www.netgsm.com.tr/dokuman/#xml-post-sms-gonderme
 * usercode + password XML gövdesinde; REST v2 Basic Auth değil.
 */
async function netgsmXmlGonder(
  telefon: string,
  mesaj: string
): Promise<SmsGonderimSonuc> {
  if (!netgsmYapilandirildi()) {
    return {
      basarili: false,
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış (NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER)",
    };
  }

  const no = telefonXmlFormat(telefon);
  if (!/^90[0-9]{10}$/.test(no)) {
    return {
      basarili: false,
      saglayici: "netgsm",
      hata: `Geçersiz telefon: ${telefon}`,
    };
  }

  const { usercode, password, msgheader } = netgsmKimlik();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company dil="TR">Netgsm</company>
    <usercode>${escapeXml(usercode)}</usercode>
    <password>${escapeXml(password)}</password>
    <type>1:n</type>
    <msgheader>${escapeXml(msgheader)}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${mesaj}]]></msg>
    <no>${no}</no>
  </body>
</mainbody>`;

  try {
    const res = await fetch(NETGSM_XML_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
      },
      body: xml,
    });

    const yanit = (await res.text()).trim();
    const kod = yanit.split(/\s+/)[0] ?? yanit;

    // 00 = başarılı (Netgsm dokümantasyonu)
    if (kod === "00") {
      return { basarili: true, saglayici: "netgsm" };
    }

    const hataMesajlari: Record<string, string> = {
      "20": "Mesaj metni veya karakter hatası",
      "30": "Geçersiz kullanıcı adı, şifre veya API erişim izni yok",
      "40": "Geçersiz veya onaysız gönderici adı (msgheader) — Netgsm panelinde onaylı başlığı .env NETGSM_MSGHEADER ile aynı yazın",
      "50": "Yetersiz bakiye",
      "51": "Gönderim limiti aşıldı",
      "70": "Hatalı parametre",
      "85": "Mükerrer gönderim",
    };

    const aciklama = hataMesajlari[kod] ?? yanit;
    console.error("[Netgsm XML SMS]", kod, yanit);
    return { basarili: false, saglayici: "netgsm", hata: `${kod}: ${aciklama}` };
  } catch (err) {
    const hata = err instanceof Error ? err.message : String(err);
    console.error("[Netgsm XML SMS hata]", hata);
    return { basarili: false, saglayici: "netgsm", hata };
  }
}

export async function sendSms(
  telefon: string,
  mesaj: string,
  meta: {
    aliciTipi: SmsAliciTipi;
    cekiciId?: string;
    talepId?: string;
    link?: string;
    /** false ise kredi düşülmez (manuel katılım sonrası SMS) */
    krediDus?: boolean;
    /** Düşülecek kredi (varsayılan panel = 1; premium SMS = 2) */
    krediMiktar?: number;
    /** varsayılan xml; dogrulama + premium talep → otp */
    kanal?: SmsKanal;
  }
): Promise<SmsGonderimSonuc> {
  const krediDus =
    meta.aliciTipi === "cekici" && meta.krediDus !== false;
  const krediMiktar = Math.max(
    1,
    Math.floor(meta.krediMiktar ?? PANEL_BILDIRIM_KREDI)
  );
  let cekiciIdForKredi: string | undefined;

  if (meta.aliciTipi === "cekici" && meta.cekiciId) {
    const cekici = await getCekiciById(meta.cekiciId);
    if (!cekici) {
      const sonuc: SmsGonderimSonuc = {
        basarili: false,
        saglayici: "demo",
        hata: "Çekici bulunamadı",
      };
      await logSmsKaydi(telefon, mesaj, meta, sonuc);
      return sonuc;
    }
    if (krediDus && !cekiciYeterliBildirimKredisi(cekici.kredi, krediMiktar)) {
      const sonuc: SmsGonderimSonuc = {
        basarili: false,
        saglayici: "demo",
        hata: `Yetersiz kredi (SMS bildirimi için ${krediMiktar} kredi gerekir)`,
      };
      await logSmsKaydi(telefon, mesaj, meta, sonuc);
      return sonuc;
    }
    cekiciIdForKredi = cekici.id;
  }

  const kanal: SmsKanal = meta.kanal === "otp" ? "otp" : "xml";
  let sonuc: SmsGonderimSonuc;

  if (netgsmYapilandirildi()) {
    sonuc =
      kanal === "otp"
        ? await netgsmOtpSmsGonder(telefon, mesaj)
        : await netgsmXmlGonder(telefon, mesaj);
  } else {
    sonuc = {
      basarili: false,
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış",
    };
  }

  if (sonuc.basarili && krediDus && cekiciIdForKredi) {
    const cekici = await getCekiciById(cekiciIdForKredi);
    if (cekici) {
      cekici.kredi -= krediMiktar;
      await updateCekici(cekici);
    }
  }

  if (!sonuc.basarili) {
    console.log(`[SMS DEMO - gönderilmedi] → ${telefon}: ${mesaj}`);
    if (sonuc.hata) console.log(`  Sebep: ${sonuc.hata}`);
  }

  await logSmsKaydi(telefon, mesaj, meta, sonuc);
  return sonuc;
}

async function logSmsKaydi(
  telefon: string,
  mesaj: string,
  meta: {
    aliciTipi: SmsAliciTipi;
    cekiciId?: string;
    talepId?: string;
    link?: string;
  },
  sonuc: SmsGonderimSonuc
): Promise<void> {
  await addSmsKaydi({
    id: randomUUID(),
    cekiciId: meta.cekiciId ?? "musteri",
    cekiciTelefon: telefon,
    mesaj,
    link: meta.link ?? "",
    talepId: meta.talepId ?? "",
    gonderim: new Date().toISOString(),
    aliciTipi: meta.aliciTipi,
    gonderildi: sonuc.basarili,
    saglayici: sonuc.saglayici,
    hata: sonuc.hata,
  });
}

export function smsDurumu(): {
  gercekGonderim: boolean;
  saglayici: string;
} {
  if (netgsmYapilandirildi()) {
    return { gercekGonderim: true, saglayici: "netgsm (xml + otp)" };
  }
  return { gercekGonderim: false, saglayici: "demo (sadece log)" };
}

export interface GondericiAdiSorguSonuc {
  basarili: boolean;
  basliklar: string[];
  hata?: string;
  kod?: string;
}

/**
 * Onaylı gönderici adlarını listeler.
 * @see https://www.netgsm.com.tr/dokuman/#gonderici-adi-sorgulama
 * REST v2: GET https://api.netgsm.com.tr/sms/rest/v2/msgheader
 */
export async function netgsmGondericiAdlariSorgula(): Promise<GondericiAdiSorguSonuc> {
  if (!netgsmYapilandirildi()) {
    return {
      basarili: false,
      basliklar: [],
      hata: "Netgsm yapılandırılmamış",
    };
  }

  const { usercode, password } = netgsmKimlik();
  const auth = Buffer.from(`${usercode}:${password}`).toString("base64");
  const appname = process.env.NETGSM_APPNAME ?? "acilcozumbul";

  try {
    const url = new URL("https://api.netgsm.com.tr/sms/rest/v2/msgheader");
    url.searchParams.set("appname", `${appname}-sdk-js`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const raw = await res.text();
    let data: {
      code?: string;
      description?: string;
      msgheaders?: string[];
      msgheader?: string[] | Record<string, string>;
      error?: string;
    };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      return { basarili: false, basliklar: [], hata: raw };
    }

    if (data.code && data.code !== "00") {
      return {
        basarili: false,
        basliklar: [],
        kod: data.code,
        hata: data.description ?? data.error ?? `Netgsm kod: ${data.code}`,
      };
    }

    const mh = data.msgheaders ?? data.msgheader;
    const basliklar = Array.isArray(mh)
      ? mh
      : mh && typeof mh === "object"
        ? Object.values(mh)
        : [];

    if (basliklar.length > 0) {
      return { basarili: true, basliklar, kod: data.code };
    }

    // Yedek: dokümandaki JSON POST /sms/header
    const res2 = await fetch("https://api.netgsm.com.tr/sms/header", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usercode, password }),
    });
    const data2 = (await res2.json()) as { msgheader?: string[]; code?: string; error?: string };
    if (data2.msgheader?.length) {
      return { basarili: true, basliklar: data2.msgheader };
    }

    return { basarili: false, basliklar: [], hata: "Gönderici adı bulunamadı." };
  } catch (err) {
    const hata = err instanceof Error ? err.message : String(err);
    return { basarili: false, basliklar: [], hata };
  }
}
