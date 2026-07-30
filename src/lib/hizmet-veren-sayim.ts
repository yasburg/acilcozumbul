import { cekiciMusaitMi } from "./cekici-musaitlik";
import {
  gecerliSorunTipi,
  TUM_SORUN_TIP_IDLERI,
  type SorunTipiId,
} from "./sorun-tipleri";
import type { Cekici } from "./types";

export type HizmetVerenSayimSatir = {
  sorunTipi: SorunTipiId;
  aktif: number;
  cevrimici: number;
};

export type HizmetVerenSayimOzet = {
  guncelleme: string;
  satirlar: HizmetVerenSayimSatir[];
  /** En az bir hizmet tipi tanımlı aktif çekici (benzersiz) */
  benzersizAktif: number;
  /** Müsaitlik saatinde olan benzersiz aktif çekici */
  benzersizCevrimici: number;
};

/** @deprecated Gerçek sayılar gösterilir; şişirme yok */
export const HIZMET_VEREN_MUSTERI_AKTIF_EK = 0;

/** Müşteriye gösterilen kısa meslek adı */
const HIZMET_ETIKET: Record<SorunTipiId, string> = {
  ariza: "çekici",
  lastik: "lastikçi",
  aku: "yol yardım",
  yakit: "yol yardım",
  kaza: "çekici",
  kilit: "anahtarcı",
  cekici: "çekici",
  diger: "operatör",
};

export function hizmetVerenEtiket(sorunTipi: SorunTipiId): string {
  return HIZMET_ETIKET[sorunTipi];
}

export function hizmetVerenSayimHesapla(
  cekiciler: Cekici[],
  now = new Date()
): HizmetVerenSayimOzet {
  const sayac: Record<SorunTipiId, { aktif: number; cevrimici: number }> =
    Object.fromEntries(
      TUM_SORUN_TIP_IDLERI.map((id) => [id, { aktif: 0, cevrimici: 0 }])
    ) as Record<SorunTipiId, { aktif: number; cevrimici: number }>;

  let benzersizAktif = 0;
  let benzersizCevrimici = 0;

  for (const c of cekiciler) {
    if (!c.aktif) continue;
    const tipler = (c.hizmetSorunTipleri ?? []).filter(gecerliSorunTipi);
    if (!tipler.length) continue;

    benzersizAktif++;
    const online = cekiciMusaitMi(c, now);
    if (online) benzersizCevrimici++;

    for (const tip of tipler) {
      sayac[tip].aktif++;
      if (online) sayac[tip].cevrimici++;
    }
  }

  return {
    guncelleme: now.toISOString(),
    satirlar: TUM_SORUN_TIP_IDLERI.map((sorunTipi) => ({
      sorunTipi,
      aktif: sayac[sorunTipi].aktif,
      cevrimici: sayac[sorunTipi].cevrimici,
    })),
    benzersizAktif,
    benzersizCevrimici,
  };
}

/** Panel dışı müşteri ekranları için gösterim sayıları */
export function hizmetVerenSayimMusteriGoster(
  ozet: HizmetVerenSayimOzet
): HizmetVerenSayimOzet {
  const goster: HizmetVerenSayimOzet = {
    ...ozet,
    benzersizAktif: ozet.benzersizAktif + HIZMET_VEREN_MUSTERI_AKTIF_EK,
    benzersizCevrimici: ozet.benzersizCevrimici,
    satirlar: ozet.satirlar.map((s) => ({
      ...s,
      aktif: s.aktif + HIZMET_VEREN_MUSTERI_AKTIF_EK,
      cevrimici: s.cevrimici,
    })),
  };
  // online ≤ hizmet veren
  return {
    ...goster,
    benzersizCevrimici: Math.min(
      goster.benzersizCevrimici,
      goster.benzersizAktif
    ),
    satirlar: goster.satirlar.map((s) => ({
      ...s,
      cevrimici: Math.min(s.cevrimici, s.aktif),
    })),
  };
}

export function hizmetVerenSatirBul(
  ozet: HizmetVerenSayimOzet,
  sorunTipi: string
): HizmetVerenSayimSatir | undefined {
  if (!gecerliSorunTipi(sorunTipi)) return undefined;
  return ozet.satirlar.find((s) => s.sorunTipi === sorunTipi);
}

/** Kısa müşteri metni: «3 çevrimiçi lastikçi · 12 kayıtlı» */
export function hizmetVerenKisaMetin(
  sorunTipi: SorunTipiId,
  cevrimici: number,
  aktif: number
): string {
  const etiket = hizmetVerenEtiket(sorunTipi);
  if (aktif === 0) {
    return `Şu an kayıtlı ${etiket} yok`;
  }
  return `${cevrimici} çevrimiçi ${etiket} · ${aktif} kayıtlı`;
}
