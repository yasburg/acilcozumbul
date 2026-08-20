import type { KrediOdeme } from "./types";
import { epostaGonder } from "./email-gonder";
import { panelFaturaYukleVeSms } from "./fatura-servis";
import { faturaUrl } from "./fatura-link";
import {
  getFaturaLinkByKrediOdemeId,
  silFaturaLink,
  type FaturaLink,
} from "./fatura-link-db";
import { faturaPdfSil } from "./fatura-storage";
import { trendyolOdemeFaturaOlustur } from "./trendyol-efaturam/fatura-olustur";
import {
  efaturamBelgeDurumuGetir,
  efaturamBelgeIptalMi,
  efaturamBelgeLocalRefIleBul,
} from "./trendyol-efaturam/belge-indir";
import { faturaLocalReferenceId } from "./trendyol-efaturam/belge-payload";
import {
  trendyolEfaturamKurumsalAktif,
  trendyolEfaturamConfigOku,
  trendyolEfaturamYapilandirildi,
} from "./trendyol-efaturam/config";
import { efaturamOturumAl } from "./trendyol-efaturam/session";

export type KurumsalTrendyolFaturaSonuc =
  | { ok: true; atlandi?: false; belgeTipi: string; faturaId: string }
  | { ok: true; atlandi: true; neden: string }
  | { ok: false; hata: string };

export type TrendyolFaturaPanelDurum = {
  durum: "iptal" | "aktif" | "yok";
  invoiceUuid?: string;
  invoiceId?: string;
};

/** Panel: Trendyol’da bu ödemeye ait faturanın iptal/aktif durumu */
export async function trendyolOdemeFaturaPanelDurumu(opts: {
  odeme: KrediOdeme;
  fatura?: Pick<FaturaLink, "trendyolInvoiceUuid"> | null;
}): Promise<TrendyolFaturaPanelDurum | null> {
  if (!trendyolEfaturamYapilandirildi()) return null;

  try {
    // Bireysel: e-arsiv. Kurumsal: hangisi kesildiyse bulmak için ikisini dene.
    const tipler: Array<"e-arsiv" | "e-fatura"> = opts.odeme.kurumsal
      ? ["e-fatura", "e-arsiv"]
      : ["e-arsiv"];

    const uuid = opts.fatura?.trendyolInvoiceUuid?.trim();
    if (uuid) {
      for (const tip of tipler) {
        const durum = await efaturamBelgeDurumuGetir({
          belgeTipi: tip,
          invoiceUuid: uuid,
        });
        if (!durum) continue;
        return {
          durum: efaturamBelgeIptalMi(durum) ? "iptal" : "aktif",
          invoiceUuid: uuid,
          invoiceId: durum.invoiceId,
        };
      }
    }

    const oturum = await efaturamOturumAl();
    const localRefs = [
      faturaLocalReferenceId(opts.odeme),
      opts.odeme.id.slice(0, 127),
    ].filter((v, i, a) => a.indexOf(v) === i);

    for (const tip of tipler) {
      for (const localReferenceId of localRefs) {
        const bulunan = await efaturamBelgeLocalRefIleBul({
          belgeTipi: tip,
          companyId: oturum.companyId,
          localReferenceId,
          iptalleriAtla: false,
        });
        if (!bulunan) continue;
        return {
          durum: efaturamBelgeIptalMi(bulunan) ? "iptal" : "aktif",
          invoiceUuid: bulunan.invoiceUuid,
          invoiceId: bulunan.invoiceId,
        };
      }
    }

    return { durum: "yok" };
  } catch (e) {
    console.error("[trendyol-fatura] panel durum", e);
    return null;
  }
}

/** Ödeme sonrası: Trendyol fatura kes → PDF kaydet → müşteri + muhasebe bildirimi */
export async function odemeSonrasiTrendyolFatura(
  odeme: KrediOdeme,
  opts?: { manuel?: boolean; yeniden?: boolean }
): Promise<KurumsalTrendyolFaturaSonuc> {
  if (odeme.demoOdeme) {
    return { ok: true, atlandi: true, neden: "demo" };
  }
  if (opts?.manuel) {
    if (!trendyolEfaturamYapilandirildi()) {
      return { ok: false, hata: "Trendyol E-Faturam yapılandırılmamış." };
    }
  } else if (!trendyolEfaturamKurumsalAktif()) {
    return { ok: true, atlandi: true, neden: "yapilandirma" };
  }

  const mevcut = await getFaturaLinkByKrediOdemeId(odeme.id);
  if (mevcut && !opts?.yeniden) {
    return { ok: true, atlandi: true, neden: "zaten_var" };
  }

  if (mevcut && opts?.yeniden) {
    await faturaPdfSil(mevcut.storagePath).catch(() => undefined);
    await silFaturaLink(mevcut.id);
  }

  const olustur = await trendyolOdemeFaturaOlustur(odeme, {
    forceYeni: Boolean(opts?.yeniden),
  });
  if (!olustur.ok) {
    console.error("[trendyol-fatura]", odeme.id, olustur.hata);
    return { ok: false, hata: olustur.hata };
  }

  const kayit = await panelFaturaYukleVeSms({
    cekiciId: odeme.cekiciId,
    pdf: olustur.pdf,
    krediOdemeId: odeme.id,
    bildirimEposta: odeme.faturaEposta,
    trendyolInvoiceUuid: olustur.invoiceUuid,
  });

  if (!kayit.ok) {
    return { ok: false, hata: kayit.hata };
  }

  const cfg = trendyolEfaturamConfigOku();
  const musteriUrl = faturaUrl(kayit.fatura.token);
  const alici = odeme.kurumsal
    ? `Şirket: ${odeme.sirketUnvan ?? "—"} · VKN: ${odeme.vergiNo ?? "—"}`
    : `Alıcı: ${odeme.cekiciAd}${odeme.faturaTcKimlik ? ` · TCKN: ${odeme.faturaTcKimlik}` : ""}`;
  const muhasebeMetin = [
    `Satın alma faturası (${olustur.belgeTipi}).`,
    `Ödeme ID: ${odeme.id}`,
    olustur.invoiceId ? `GİB fatura no: ${olustur.invoiceId}` : undefined,
    `ETTN: ${olustur.invoiceUuid}`,
    alici,
    `Tutar: ${odeme.tutar} TL`,
    `PDF: ${musteriUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  void epostaGonder(
    cfg.muhasebeEmail,
    `${odeme.kurumsal ? "Kurumsal" : "Bireysel"} fatura — ${odeme.kurumsal ? odeme.sirketUnvan ?? odeme.cekiciAd : odeme.cekiciAd}`,
    muhasebeMetin
  ).catch((e) => console.error("[trendyol-fatura] muhasebe eposta", e));

  return {
    ok: true,
    belgeTipi: olustur.belgeTipi,
    faturaId: kayit.fatura.id,
  };
}

/** @deprecated odemeSonrasiTrendyolFatura kullanın */
export const kurumsalOdemeSonrasiTrendyolFatura = odemeSonrasiTrendyolFatura;
