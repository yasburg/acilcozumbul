import { addSmsKaydi } from "./db";
import { randomUUID } from "crypto";

export type SmsAliciTipi = "cekici" | "musteri";
export type SmsSaglayici = "netgsm" | "demo";

export interface SmsGonderimSonuc {
  basarili: boolean;
  saglayici: SmsSaglayici;
  hata?: string;
}

/** Netgsm: 5XXXXXXXXX (10 hane, başında 0 yok) */
function telefonNetgsm(tel: string): string {
  let digits = tel.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function netgsmYapilandirildi(): boolean {
  return !!(
    process.env.NETGSM_USERNAME &&
    process.env.NETGSM_PASSWORD &&
    process.env.NETGSM_MSGHEADER
  );
}

async function netgsmGonder(
  telefon: string,
  mesaj: string
): Promise<SmsGonderimSonuc> {
  if (!netgsmYapilandirildi()) {
    return {
      basarili: false,
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış (NETGSM_USERNAME, NETGSM_PASSWORD, NETGSM_MSGHEADER)",
    };
  }

  const no = telefonNetgsm(telefon);
  if (no.length !== 10 || !no.startsWith("5")) {
    return {
      basarili: false,
      saglayici: "netgsm",
      hata: `Geçersiz telefon: ${telefon}`,
    };
  }

  try {
    const Netgsm = (await import("@netgsm/sms")).default;
    const netgsm = new Netgsm({
      username: process.env.NETGSM_USERNAME!,
      password: process.env.NETGSM_PASSWORD!,
      appname: process.env.NETGSM_APPNAME ?? "acilcozumbul",
    });

    await netgsm.sendRestSms({
      msgheader: process.env.NETGSM_MSGHEADER!,
      encoding: "TR",
      messages: [{ msg: mesaj, no }],
    });

    return { basarili: true, saglayici: "netgsm" };
  } catch (err) {
    const hata = err instanceof Error ? err.message : String(err);
    console.error("[Netgsm SMS hata]", hata);
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
  }
): Promise<SmsGonderimSonuc> {
  let sonuc: SmsGonderimSonuc;

  if (netgsmYapilandirildi()) {
    sonuc = await netgsmGonder(telefon, mesaj);
  } else {
    sonuc = {
      basarili: false,
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış",
    };
  }

  if (!sonuc.basarili) {
    console.log(`[SMS DEMO - gönderilmedi] → ${telefon}: ${mesaj}`);
    if (sonuc.hata) console.log(`  Sebep: ${sonuc.hata}`);
  }

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
  });

  return sonuc;
}

export function smsDurumu(): {
  gercekGonderim: boolean;
  saglayici: string;
} {
  if (netgsmYapilandirildi()) {
    return { gercekGonderim: true, saglayici: "netgsm" };
  }
  return { gercekGonderim: false, saglayici: "demo (sadece log)" };
}
