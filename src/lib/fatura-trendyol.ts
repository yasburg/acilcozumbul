import type { KrediOdeme } from "./types";
import { epostaGonder } from "./email-gonder";
import { panelFaturaYukleVeSms } from "./fatura-servis";
import { faturaUrl } from "./fatura-link";
import { getFaturaLinkByKrediOdemeId } from "./fatura-link-db";
import { trendyolOdemeFaturaOlustur } from "./trendyol-efaturam/fatura-olustur";
import {
  trendyolEfaturamKurumsalAktif,
  trendyolEfaturamConfigOku,
  trendyolEfaturamYapilandirildi,
} from "./trendyol-efaturam/config";

export type KurumsalTrendyolFaturaSonuc =
  | { ok: true; atlandi?: false; belgeTipi: string; faturaId: string }
  | { ok: true; atlandi: true; neden: string }
  | { ok: false; hata: string };

/** Ödeme sonrası: Trendyol fatura kes → PDF kaydet → müşteri + muhasebe bildirimi */
export async function odemeSonrasiTrendyolFatura(
  odeme: KrediOdeme,
  opts?: { manuel?: boolean }
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
  if (mevcut) {
    return { ok: true, atlandi: true, neden: "zaten_var" };
  }

  const olustur = await trendyolOdemeFaturaOlustur(odeme);
  if (!olustur.ok) {
    console.error("[trendyol-fatura]", odeme.id, olustur.hata);
    return { ok: false, hata: olustur.hata };
  }

  const kayit = await panelFaturaYukleVeSms({
    cekiciId: odeme.cekiciId,
    pdf: olustur.pdf,
    krediOdemeId: odeme.id,
    bildirimEposta: odeme.faturaEposta,
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
