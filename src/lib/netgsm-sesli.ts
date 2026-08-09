import { fetchHataMesaji } from "./sms-provider";
import { telefonNormalize } from "./telefon";

const NETGSM_VOICE_SEND_URL = "https://api.netgsm.com.tr/voicesms/send";

export type VoiceGonderimSonuc = {
  basarili: boolean;
  bulkid?: string;
  kod?: string;
  hata?: string;
  raw?: string;
};

/** Tuş basılınca dinletilecek onay (TTS metin veya AudioID) */
export type VoiceKeyInfo = {
  /** 0–9 */
  tus: number;
  text?: string;
  /** Netgsm AudioID — text yerine */
  audioId?: string;
};

/** Netgsm voicesms: 5XXXXXXXXX (başında 0 / 90 yok) */
export function telefonVoiceFormat(tel: string): string | null {
  const n = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(n)) return null;
  return n.slice(1);
}

function netgsmVoiceKimlik(): { usercode: string; password: string } | null {
  const usercode =
    process.env.NETGSM_USERCODE ?? process.env.NETGSM_USERNAME;
  const password = process.env.NETGSM_PASSWORD;
  if (!usercode?.trim() || !password?.trim()) return null;
  return { usercode: usercode.trim(), password: password.trim() };
}

/** İstanbul saati ile ddMMyyyy / HHmm; pencere ≥1 saat (Netgsm kuralı) */
export function sesliGonderimPenceresi(
  now = new Date(),
  pencereSaat = 2
): {
  startdate: string;
  starttime: string;
  stopdate: string;
  stoptime: string;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = (d: Date) => {
    const map = Object.fromEntries(
      fmt.formatToParts(d).map((p) => [p.type, p.value])
    );
    const hour = map.hour === "24" ? "00" : map.hour;
    return {
      date: `${map.day}${map.month}${map.year}`,
      time: `${hour}${map.minute}`,
    };
  };

  const start = parts(now);
  const end = parts(new Date(now.getTime() + pencereSaat * 60 * 60 * 1000));
  return {
    startdate: start.date,
    starttime: start.time,
    stopdate: end.date,
    stoptime: end.time,
  };
}

function xmlEscapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function keysXml(keyinfo: VoiceKeyInfo[]): string {
  let out = "";
  for (const k of keyinfo) {
    if (!Number.isInteger(k.tus) || k.tus < 0 || k.tus > 9) continue;
    const ses =
      k.audioId?.trim() && /^\d+$/.test(k.audioId.trim())
        ? `<audioid>${k.audioId.trim()}</audioid>`
        : k.text?.trim()
          ? `<text>${xmlEscapeText(k.text.trim())}</text>`
          : null;
    if (!ses) continue;
    out += `<keys>
<keydetail>
<keyinfo>${k.tus}</keyinfo>
${ses}
</keydetail>
</keys>`;
  }
  return out;
}

export function basitSesliXml(params: {
  usercode: string;
  password: string;
  audioId: string;
  telefonVoice: string;
  startdate: string;
  starttime: string;
  stopdate: string;
  stoptime: string;
  ringtime?: number;
  /** 0 = bilgilendirme (İYS yok); 11/12 ticari */
  filter?: string;
  /** Rapor eşleştirme — talep/çekici kimliği */
  relationid?: string;
  /**
   * 0 = tuş yok; 1 = kayıt sonunda tuş beklenir (keyinfo + url gerekir).
   * Varsayılan: keyinfo varsa 1, yoksa 0.
   */
  key?: 0 | 1;
  /** Durum / DTMF raporu POST edilecek URL */
  url?: string;
  /** Basılan tuşa göre dinletilecek onay metni veya ses */
  keyinfo?: VoiceKeyInfo[];
}): string {
  const ring = Math.min(30, Math.max(10, params.ringtime ?? 20));
  const filterXml =
    params.filter != null && params.filter !== ""
      ? `<filter>${params.filter}</filter>`
      : "";
  const relationRaw = params.relationid?.trim() ?? "";
  const relationSafe = relationRaw.replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 64);
  const relationXml = relationSafe
    ? `<relationid>${relationSafe}</relationid>`
    : "";

  const keyinfo = params.keyinfo ?? [];
  const key: 0 | 1 =
    params.key ?? (keyinfo.length > 0 ? 1 : 0);
  const keys = key === 1 ? keysXml(keyinfo) : "";

  const urlRaw = params.url?.trim() ?? "";
  const urlSafe = urlRaw.replace(/[<>"']/g, "").slice(0, 500);
  const urlXml =
    key === 1 && urlSafe ? `<url>${xmlEscapeText(urlSafe)}</url>` : "";

  return `<?xml version="1.0"?>
<mainbody>
<header>
<usercode>${params.usercode}</usercode>
<password>${params.password}</password>
<startdate>${params.startdate}</startdate>
<starttime>${params.starttime}</starttime>
<stopdate>${params.stopdate}</stopdate>
<stoptime>${params.stoptime}</stoptime>
<key>${key}</key>
<ringtime>${ring}</ringtime>
${urlXml}
${filterXml}
${relationXml}
</header>
<body>
<audioid>${params.audioId}</audioid>
<no>${params.telefonVoice}</no>
${keys}
</body>
</mainbody>`;
}

const VOICE_HATA: Record<string, string> = {
  "30": "Geçersiz kullanıcı adı/şifre veya API erişim izni yok",
  "40": "Ses dosyası bulunamadı (AudioID)",
  "45": "Gönderilecek telefon numarası yok",
  "70": "Hatalı veya eksik parametre",
};

/**
 * Yüklü ses dosyası (AudioID) ile basit sesli mesaj başlatır.
 * keyinfo + url verilirse DTMF (key=1) açılır.
 */
export async function sendVoiceByAudioId(opts: {
  telefon: string;
  audioId: string;
  ringtime?: number;
  filter?: string;
  relationid?: string;
  key?: 0 | 1;
  url?: string;
  keyinfo?: VoiceKeyInfo[];
}): Promise<VoiceGonderimSonuc> {
  const kimlik = netgsmVoiceKimlik();
  if (!kimlik) {
    return {
      basarili: false,
      hata: "Netgsm yapılandırılmamış (NETGSM_USERCODE / NETGSM_PASSWORD)",
    };
  }

  const audioId = opts.audioId.trim();
  if (!/^\d+$/.test(audioId)) {
    return { basarili: false, hata: `Geçersiz AudioID: ${opts.audioId}` };
  }

  const no = telefonVoiceFormat(opts.telefon);
  if (!no) {
    return {
      basarili: false,
      hata: `Geçersiz telefon: ${opts.telefon}`,
    };
  }

  const pencere = sesliGonderimPenceresi();
  const xml = basitSesliXml({
    usercode: kimlik.usercode,
    password: kimlik.password,
    audioId,
    telefonVoice: no,
    ...pencere,
    ringtime: opts.ringtime,
    filter: opts.filter ?? "0",
    relationid: opts.relationid,
    key: opts.key,
    url: opts.url,
    keyinfo: opts.keyinfo,
  });

  try {
    const res = await fetch(NETGSM_VOICE_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8" },
      body: xml,
    });
    const raw = (await res.text()).trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    const kod = parts[0] ?? "";
    const bulkid = parts[1];

    if (kod === "00" || kod === "01" || kod === "02") {
      return { basarili: true, kod, bulkid, raw };
    }

    const aciklama = VOICE_HATA[kod] ?? (raw || `HTTP ${res.status}`);
    console.error("[Netgsm Voice]", kod, aciklama);
    return {
      basarili: false,
      kod,
      hata: `${kod}: ${aciklama}`,
      raw,
    };
  } catch (err) {
    const hata = fetchHataMesaji(err);
    console.error("[Netgsm Voice hata]", hata);
    return { basarili: false, hata };
  }
}
