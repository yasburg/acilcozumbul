import { getCekicilerBildirimAdaylari, getCekiciById, updateCekici } from "./db";
import { talepSehriAcikMi } from "./cekici-sehir-acilis-db";
import {
  cekiciAcikTalepUygunMu,
  cekiciBildirimHizliSmsMi,
  cekiciBildirimKrediTutari,
  cekiciBildirimSesliMi,
  cekiciTalepSmsAdayiMi,
  cekiciYeterliBildirimKredisi,
  PANEL_BILDIRIM_KREDI,
} from "./ihale";
import { cekiciKrediDus, cekiciToplamKredi } from "./kredi-bakiye";
import {
  sesliCekiciTalepRateLimitGecerMi,
  sesliMesajFireAndForget,
  sesliMesajGonder,
} from "./sesli-mesaj";
import { sendSms, smsInfraHatasiMi, type SmsKanal } from "./sms-provider";
import {
  olusturSmsTalepKisaLink,
  smsTalepKisaUrl,
  smsTalepUzunUrl,
} from "./sms-talep-kisa-link";
import type { Cekici, Talep } from "./types";
import { telefonGecerliMi } from "./telefon";
import { bildirimCopyVaryanti, talepYasiDakika } from "./marketplace-p2";
import { WhatsAppTemplates } from "./whatsapp-provider";

/**
 * Yerel `next dev` / açıkça açılan modda gerçek çekicilere SMS gitmez;
 * yalnızca `testerHesap` hesaplara bildirim gider.
 * Üretimde kapalı. Zorla: SMS_TESTER_ONLY=1 | 0
 */
export function smsYalnizTesterCekicilerMi(): boolean {
  const zorla = process.env.SMS_TESTER_ONLY?.trim().toLowerCase();
  if (zorla === "1" || zorla === "true" || zorla === "evet") return true;
  if (zorla === "0" || zorla === "false" || zorla === "hayir") return false;
  return process.env.NODE_ENV === "development";
}

/** SMS konum parçası (ilçe veya il) — isim yok */
function smsTalepYer(talep: Talep): string {
  return (talep.konumIlce || talep.konumIl || "").trim();
}

/**
 * Çekici talep SMS metni (isim yok).
 * OTP max 155 — kısa link tercih edilir; link sonda korunur.
 */
export function cekiciTalepSmsMetni(
  talep: Talep,
  cekici: Cekici,
  baseUrl: string,
  yenidenArama = false,
  opts?: { link?: string; varyant?: "control" | "urgency_context" }
): { mesaj: string; link: string } {
  const link =
    opts?.link?.trim() ||
    smsTalepUzunUrl(talep.id, baseUrl);
  const yer = smsTalepYer(talep);
  const baslik = yenidenArama
    ? "Yeni yol yardim talebi (tekrar)"
    : "Yeni yol yardim talebi";
  const onek = yer ? `${baslik}: ${yer}` : baslik;
  const mesaj = opts?.varyant === "urgency_context"
    ? `${onek} · ${talepYasiDakika(talep)} dk önce\nTalebi görüntüle: ${link}`
    : `${onek}\n${link}`;
  return { mesaj, link };
}

/** Kısa link üretir; başarısızsa uzun URL’ye düşer */
export async function cekiciTalepSmsHazirla(
  talep: Talep,
  cekici: Cekici,
  baseUrl: string,
  yenidenArama = false
): Promise<{ mesaj: string; link: string }> {
  let link = smsTalepUzunUrl(talep.id, baseUrl);
  try {
    const kisa = await olusturSmsTalepKisaLink({
      talepId: talep.id,
      cekiciId: cekici.id,
      cekiciToken: cekici.token,
    });
    link = smsTalepKisaUrl(kisa.token, baseUrl);
  } catch (e) {
    console.error("[sms] kısa link üretilemedi, uzun URL kullanılıyor", e);
  }
  return cekiciTalepSmsMetni(talep, cekici, baseUrl, yenidenArama, {
    link,
    varyant: bildirimCopyVaryanti(talep, cekici),
  });
}

/**
 * Uygun çekicilere talep bildirimi.
 * - seviye 1: toplu XML SMS, 1 kredi
 * - seviye 2: OTP SMS (3 sn), 2 kredi
 * - seviye 3 (varsayılan): sesli arama + OTP SMS, 3 kredi
 * - development / SMS_TESTER_ONLY: yalnızca tester hesaplar
 */
export async function notifyCekiciler(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = [],
  options?: { yenidenArama?: boolean; yalnizCekiciIds?: string[] }
): Promise<string[]> {
  const yalnizIds = options?.yalnizCekiciIds?.length
    ? new Set(options.yalnizCekiciIds)
    : talep.yalnizCekiciId
      ? new Set([talep.yalnizCekiciId])
      : null;

  // Açık hedef (demo takip): şehir kapalı olsa da bildir
  if (!yalnizIds && !(await talepSehriAcikMi(talep))) {
    return [];
  }

  const tumCekiciler = await getCekicilerBildirimAdaylari(PANEL_BILDIRIM_KREDI);
  const haric = new Set(haricTutulan);
  const yeniden = options?.yenidenArama ?? false;
  const yalnizTester = smsYalnizTesterCekicilerMi();

  // Demo takip vb.: hedef id kredi listesinde yoksa doğrudan yükle
  if (yalnizIds) {
    for (const id of yalnizIds) {
      if (tumCekiciler.some((c) => c.id === id)) continue;
      const c = await getCekiciById(id);
      if (c) tumCekiciler.push(c);
    }
  }

  const adaylar = tumCekiciler.filter((c) => {
    if (haric.has(c.id)) return false;
    if (yalnizIds && !yalnizIds.has(c.id)) return false;
    if (yalnizIds) {
      // Açık hedef: tester filtresi yok; kredi yetersiz olsa da SMS/sesli gitsin
      return c.aktif && cekiciAcikTalepUygunMu(talep, c);
    }
    return (
      cekiciTalepSmsAdayiMi(talep, c) &&
      (!yalnizTester || Boolean(c.testerHesap))
    );
  });

  if (!yalnizIds && yalnizTester && adaylar.length === 0) {
    console.info(
      "[sms] development: tester çekici adayı yok — gerçek çekicilere SMS gönderilmedi"
    );
  } else if (!yalnizIds && yalnizTester) {
    console.info(
      `[sms] development: yalnızca ${adaylar.length} tester çekiciye SMS`
    );
  }

  const bildirilenIds: string[] = [];

  await Promise.all(
    adaylar.map(async (cekici: Cekici) => {
      const tutar = cekiciBildirimKrediTutari(cekici);
      const kanal: SmsKanal = cekiciBildirimHizliSmsMi(cekici) ? "otp" : "xml";
      const sesliIsteniyor = !yeniden && cekiciBildirimSesliMi(cekici);
      const { mesaj, link } = await cekiciTalepSmsHazirla(
        talep,
        cekici,
        baseUrl,
        yeniden
      );
      /*
       * Seviye 3: SMS’te kredi düşme; sesli sonucuna göre 3 veya 2 düşülür.
       * (Sesli fail / rate-limit → hızlı SMS fiyatı: 2 kredi)
       */
      const sonuc = await sendSms(cekici.telefon, mesaj, {
        aliciTipi: "cekici",
        cekiciId: cekici.id,
        talepId: talep.id,
        link,
        krediMiktar: tutar,
        krediDus: !sesliIsteniyor,
        kanal,
        whatsappTemplate: WhatsAppTemplates.yeniTalep(smsTalepYer(talep), link),
      });

      if (sonuc.basarili && sesliIsteniyor) {
        let sesliOk = false;
        if (sesliCekiciTalepRateLimitGecerMi(cekici.telefon)) {
          const voice = await sesliMesajGonder(
            "cekici_yeni_talep",
            cekici.telefon,
            { relationid: `t:${talep.id}:c:${cekici.id}` }
          );
          sesliOk = voice.basarili;
          if (!sesliOk) {
            console.error(
              `[sesli] cekici-talep ${cekici.id}`,
              voice.hata ?? "başarısız"
            );
          }
        } else {
          console.info(`[sesli] rate-limit cekici-talep ${cekici.id}`);
        }
        const dusulecek = sesliOk ? 3 : 2;
        const guncel = await getCekiciById(cekici.id);
        if (
          guncel &&
          cekiciYeterliBildirimKredisi(cekiciToplamKredi(guncel), dusulecek)
        ) {
          cekiciKrediDus(guncel, dusulecek);
          await updateCekici(guncel);
        } else if (guncel) {
          const toplam = Math.floor(cekiciToplamKredi(guncel));
          if (toplam > 0) {
            cekiciKrediDus(guncel, Math.min(dusulecek, toplam));
            await updateCekici(guncel);
          }
        }
      }

      if (sonuc.basarili || smsInfraHatasiMi(sonuc)) {
        bildirilenIds.push(cekici.id);
      }
    })
  );

  return bildirilenIds;
}

export type MusteriSmsTipi =
  | "talep_alindi"
  | "cekici_bulundu"
  | "yeniden_arama"
  | "anlasildi"
  | "yeni_teklif";

/** OTP kanalı kullanan müşteri SMS tipleri */
const MUSTERI_OTP_TIPLERI = new Set<MusteriSmsTipi>([
  "talep_alindi",
  "yeniden_arama",
  "yeni_teklif",
]);

/** Artık SMS gönderilmeyen tipler (çağrı no-op) */
const MUSTERI_SMS_IPTAL = new Set<MusteriSmsTipi>([
  "cekici_bulundu",
  "anlasildi",
  /** Anlaşılamazsa kimseye yeniden SMS/sesli gitmez */
  "yeniden_arama",
]);

export async function notifyMusteri(
  talep: Talep,
  tip: MusteriSmsTipi,
  baseUrl: string,
  _ek?: { fiyat?: number; cekiciAd?: string }
): Promise<void> {
  if (MUSTERI_SMS_IPTAL.has(tip)) return;
  if (!telefonGecerliMi(talep.telefon)) return;

  const bekleLink = `${baseUrl.replace(/\/$/, "")}/bekle/${talep.id}`;

  // OTP 155'e sığacak ASCII metinler (link sonda)
  const mesajlar: Record<"talep_alindi" | "yeni_teklif", string> = {
    talep_alindi: `acilcozumbul.com: Talebiniz alindi. Teklifleri buradan gorebilirsiniz: ${bekleLink}`,
    yeni_teklif: `acilcozumbul.com: Teklif geldi. Buradan gorebilirsiniz: ${bekleLink}`,
  };

  const kanal: SmsKanal = MUSTERI_OTP_TIPLERI.has(tip) ? "otp" : "xml";
  const metin = mesajlar[tip as keyof typeof mesajlar];
  if (!metin) return;

  const whatsappTemplate =
    tip === "talep_alindi"
      ? WhatsAppTemplates.talepAlindi(bekleLink)
      : tip === "yeni_teklif"
        ? WhatsAppTemplates.yeniTeklif(bekleLink)
        : undefined;

  const sonuc = await sendSms(talep.telefon, metin, {
    aliciTipi: "musteri",
    talepId: talep.id,
    link: bekleLink,
    kanal,
    whatsappTemplate,
  });

  if (tip === "talep_alindi" && sonuc.basarili) {
    sesliMesajFireAndForget(
      "musteri_talep_alindi",
      talep.telefon,
      `musteri-talep ${talep.id}`,
      { relationid: `musteri-talep:${talep.id}` }
    );
  }
}

/** Memnuniyet formu — klasik toplu SMS / WhatsApp */
export async function notifyMusteriMemnuniyet(
  talep: Talep,
  baseUrl: string
): Promise<void> {
  const link = `${baseUrl.replace(/\/$/, "")}/bekle/${talep.id}`;
  const mesaj = `acilcozumbul.com: Hizmeti degerlendirin. Form: ${link}`;

  await sendSms(talep.telefon, mesaj, {
    aliciTipi: "musteri",
    talepId: talep.id,
    link,
    kanal: "xml",
    whatsappTemplate: WhatsAppTemplates.memnuniyet(link),
  });
}

/** İptal / anlaşamama — çekiciye toplu SMS (kredi düşmez) */
export async function notifyCekiciIptal(
  cekiciTelefon: string,
  cekiciId: string,
  talep: Talep
): Promise<void> {
  await sendSms(
    cekiciTelefon,
    `acilcozumbul.com: ${talep.ad} ${talep.soyad.charAt(0)}. musteri sizi tercih etmedi. Talep baska cekicilere acildi.`,
    {
      aliciTipi: "cekici",
      cekiciId,
      talepId: talep.id,
      krediDus: false,
      kanal: "xml",
    }
  );
}

/** Müşteri teklifi seçti — kazanan çekiciye bildirim (kredi düşmez) */
export async function notifyCekiciSecildi(
  cekici: Cekici,
  talep: Talep,
  baseUrl: string
): Promise<void> {
  let link = smsTalepUzunUrl(talep.id, baseUrl);
  try {
    const kisa = await olusturSmsTalepKisaLink({
      talepId: talep.id,
      cekiciId: cekici.id,
      cekiciToken: cekici.token,
    });
    link = smsTalepKisaUrl(kisa.token, baseUrl);
  } catch (e) {
    console.error("[sms] seçildi kısa link", e);
  }
  const yer = smsTalepYer(talep);
  const onek = yer
    ? `Musteri sizi secti (${yer})`
    : "Musteri sizi secti";
  const mesaj = `${onek}. Musteriyi arayin: ${talep.telefon}\n${link}`;
  const sonuc = await sendSms(cekici.telefon, mesaj, {
    aliciTipi: "cekici",
    cekiciId: cekici.id,
    talepId: talep.id,
    link,
    krediDus: false,
    kanal: "otp",
    whatsappTemplate: WhatsAppTemplates.musteriSecildi(yer, talep.telefon, link),
  });

  if (sonuc.basarili) {
    const voice = await sesliMesajGonder(
      "cekici_ihale_kazandi",
      cekici.telefon,
      { relationid: `kazandi:t:${talep.id}:c:${cekici.id}` }
    );
    if (!voice.basarili) {
      console.error(
        `[sesli] cekici-kazandi ${cekici.id}`,
        voice.hata ?? "başarısız"
      );
    }
  }
}
