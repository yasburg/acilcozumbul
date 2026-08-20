import { randomUUID } from "crypto";
import { getCekiciById } from "./db";
import { epostaGonder } from "./email-gonder";
import { epostaGecerliMi, epostaNormalize } from "./eposta";
import { supabaseDbAktif } from "./supabase/admin";
import {
  faturaBelgeNoUret,
  faturaSmsMetni,
  faturaUrl,
} from "./fatura-link";
import {
  olusturFaturaLink,
  type FaturaLink,
} from "./fatura-link-db";
import {
  faturaPdfBufferGecerliMi,
  faturaPdfYukle,
  faturaStoragePath,
} from "./fatura-storage";
import { sendSms } from "./sms-provider";

export type FaturaBildirimKanal = "email" | "sms" | null;

export type FaturaYukleSonuc =
  | {
      ok: true;
      fatura: FaturaLink;
      smsGonderildi: boolean;
      emailGonderildi: boolean;
      bildirimKanal: FaturaBildirimKanal;
    }
  | { ok: false; hata: string };

export function faturaEpostaMetni(url: string): string {
  return `Faturanız düzenlenmiştir. Görüntülemek için: ${url}`;
}

export function faturaEpostaKonu(): string {
  return "Faturanız hazır";
}

/**
 * Panel: PDF yükle → private Storage + fatura_link →
 * e-posta varsa e-posta, yoksa SMS.
 */
export async function panelFaturaYukleVeSms(opts: {
  cekiciId: string;
  pdf: Buffer;
  krediOdemeId?: string | null;
  /** Varsa öncelikli bildirim e-postası (ödeme fatura e-postası) */
  bildirimEposta?: string | null;
  trendyolInvoiceUuid?: string | null;
}): Promise<FaturaYukleSonuc> {
  if (!supabaseDbAktif()) {
    return { ok: false, hata: "Veritabanı yok" };
  }
  if (!faturaPdfBufferGecerliMi(opts.pdf)) {
    return {
      ok: false,
      hata: "Geçerli bir PDF yükleyin (en fazla 5 MB).",
    };
  }

  const cekici = await getCekiciById(opts.cekiciId);
  if (!cekici) {
    return { ok: false, hata: "Çekici bulunamadı." };
  }

  const faturaId = randomUUID();
  const belgeNo = faturaBelgeNoUret();
  const storagePath = faturaStoragePath(cekici.id, faturaId);

  try {
    await faturaPdfYukle(storagePath, opts.pdf);
    const fatura = await olusturFaturaLink({
      id: faturaId,
      cekiciId: cekici.id,
      krediOdemeId: opts.krediOdemeId ?? null,
      storagePath,
      belgeNo,
      trendyolInvoiceUuid: opts.trendyolInvoiceUuid ?? null,
    });

    const bildirim = await faturaBildirimGonder({
      telefon: cekici.telefon,
      cekiciId: cekici.id,
      token: fatura.token,
      eposta:
        opts.bildirimEposta?.trim() ||
        cekici.faturaEposta?.trim() ||
        undefined,
    });

    return {
      ok: true,
      fatura,
      smsGonderildi: bildirim.smsGonderildi,
      emailGonderildi: bildirim.emailGonderildi,
      bildirimKanal: bildirim.kanal,
    };
  } catch (e) {
    const hata = e instanceof Error ? e.message : "Fatura yüklenemedi";
    console.error("[fatura-servis]", hata);
    return { ok: false, hata };
  }
}

async function faturaBildirimGonder(opts: {
  telefon: string;
  cekiciId: string;
  token: string;
  eposta?: string;
}): Promise<{
  emailGonderildi: boolean;
  smsGonderildi: boolean;
  kanal: FaturaBildirimKanal;
}> {
  const url = faturaUrl(opts.token);
  const epostaHam = (opts.eposta ?? "").trim();
  const eposta =
    epostaHam && epostaGecerliMi(epostaHam)
      ? epostaNormalize(epostaHam)
      : "";

  if (eposta) {
    try {
      const sonuc = await epostaGonder(
        eposta,
        faturaEpostaKonu(),
        faturaEpostaMetni(url)
      );
      if (sonuc.basarili) {
        return {
          emailGonderildi: true,
          smsGonderildi: false,
          kanal: "email",
        };
      }
      console.error("[fatura-servis] email", sonuc.hata);
    } catch (e) {
      console.error("[fatura-servis] email", e);
    }
    // E-posta başarısızsa SMS'e düş
  }

  const smsGonderildi = await faturaSmsGonder({
    telefon: opts.telefon,
    cekiciId: opts.cekiciId,
    token: opts.token,
  });
  return {
    emailGonderildi: false,
    smsGonderildi,
    kanal: smsGonderildi ? "sms" : null,
  };
}

async function faturaSmsGonder(opts: {
  telefon: string;
  cekiciId: string;
  token: string;
}): Promise<boolean> {
  const url = faturaUrl(opts.token);
  const mesaj = faturaSmsMetni(url);
  try {
    const sonuc = await sendSms(opts.telefon, mesaj, {
      aliciTipi: "cekici",
      cekiciId: opts.cekiciId,
      link: url,
      krediDus: false,
      kanal: "xml",
    });
    if (!sonuc.basarili) {
      console.error("[fatura-servis] sms", sonuc.hata);
    }
    return sonuc.basarili;
  } catch (e) {
    console.error("[fatura-servis] sms", e);
    return false;
  }
}
