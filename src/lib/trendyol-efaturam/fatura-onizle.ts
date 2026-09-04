import type { KrediOdeme } from "../types";
import { adSoyadAyir } from "../panel-satin-almalar";
import { faturaKdvAyir } from "../fatura-link";
import {
  bireyselEarsivTckn,
  faturaGunTr,
  faturaKesimTarihi,
  kurumsalOdemeAciklama,
} from "./belge-payload";
import {
  efaturaMukellefiSorgula,
  faturaBelgeTipiBelirle,
  type FaturaBelgeTipi,
} from "./mukellef";
import { trendyolEfaturamYapilandirildi } from "./config";

export type TrendyolFaturaOnizleme = {
  belgeTipi: FaturaBelgeTipi;
  kalemAciklama: string;
  tutarTl: number;
  matrahTl: number;
  kdvTl: number;
  kdvOran: number;
  faturaTarihi: string;
  aliciUnvan: string;
  aliciVergiNo: string;
  aliciAdres?: string;
  aliciEposta?: string;
  kurumsal: boolean;
  odemeTipi?: string;
};

/**
 * Trendyol’a göndermeden fatura özetini üretir (panel onay adımı).
 */
export async function trendyolOdemeFaturaOnizle(
  odeme: KrediOdeme
): Promise<
  | { ok: true; onizleme: TrendyolFaturaOnizleme }
  | { ok: false; hata: string }
> {
  if (!trendyolEfaturamYapilandirildi()) {
    return { ok: false, hata: "Trendyol E-Faturam yapılandırılmamış." };
  }

  if (odeme.kurumsal) {
    if (!odeme.vergiNo?.trim() || !odeme.sirketUnvan?.trim()) {
      return {
        ok: false,
        hata: "Kurumsal fatura için vergi no ve şirket ünvanı gerekli.",
      };
    }
  }

  let belgeTipi: FaturaBelgeTipi = "e-arsiv";
  if (odeme.kurumsal) {
    const mukellefSonuc = await efaturaMukellefiSorgula(odeme.vergiNo!);
    if (!mukellefSonuc.ok) {
      return { ok: false, hata: mukellefSonuc.hata };
    }
    belgeTipi = faturaBelgeTipiBelirle({
      kurumsal: true,
      mukellef: mukellefSonuc.mukellef,
    });
  }

  const kdv = faturaKdvAyir(odeme.tutar);
  const kesim = faturaKesimTarihi(odeme);
  const aliciUnvan = odeme.kurumsal
    ? (odeme.sirketUnvan ?? odeme.cekiciAd).trim()
    : odeme.cekiciAd.trim();
  const aliciVergiNo = odeme.kurumsal
    ? (odeme.vergiNo ?? "").replace(/\D/g, "")
    : bireyselEarsivTckn(odeme);

  return {
    ok: true,
    onizleme: {
      belgeTipi,
      kalemAciklama: kurumsalOdemeAciklama(odeme),
      tutarTl: kdv.toplam,
      matrahTl: kdv.matrah,
      kdvTl: kdv.kdv,
      kdvOran: kdv.oran,
      faturaTarihi: faturaGunTr(kesim),
      aliciUnvan,
      aliciVergiNo,
      aliciAdres: odeme.faturaAdres,
      aliciEposta: odeme.faturaEposta,
      kurumsal: Boolean(odeme.kurumsal),
      odemeTipi: odeme.odemeTipi,
    },
  };
}

/** UI’da kişi satırı için */
export function faturaOnizlemeAliciOzeti(odeme: KrediOdeme): string {
  if (odeme.kurumsal) {
    return `${odeme.sirketUnvan ?? odeme.cekiciAd} · VKN ${odeme.vergiNo ?? "—"}`;
  }
  const { ad, soyad } = adSoyadAyir(odeme.cekiciAd);
  return [ad, soyad].filter(Boolean).join(" ") || odeme.cekiciAd;
}
