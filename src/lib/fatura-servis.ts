import { randomUUID } from "crypto";
import { getCekiciById } from "./db";
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

export type FaturaYukleSonuc =
  | { ok: true; fatura: FaturaLink; smsGonderildi: boolean }
  | { ok: false; hata: string };

/**
 * Panel: PDF yükle → private Storage + fatura_link → çekiciye SMS.
 */
export async function panelFaturaYukleVeSms(opts: {
  cekiciId: string;
  pdf: Buffer;
  krediOdemeId?: string | null;
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
    });

    const smsGonderildi = await faturaSmsGonder({
      telefon: cekici.telefon,
      cekiciId: cekici.id,
      token: fatura.token,
    });
    return { ok: true, fatura, smsGonderildi };
  } catch (e) {
    const hata = e instanceof Error ? e.message : "Fatura yüklenemedi";
    console.error("[fatura-servis]", hata);
    return { ok: false, hata };
  }
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
