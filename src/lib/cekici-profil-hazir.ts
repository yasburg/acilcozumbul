import {
  cekiciHizmetBolgeleri,
  hizmetBolgeleriIlceSayisi,
} from "./cekici-hizmet-bolge";
import type { Cekici } from "./types";

/**
 * Soft-lock kapısı.
 * - Eski üyeler (kayitFunnel yok, kurulumTamam true/undefined): açık
 * - Hızlı kayıt (kurulumTamam false): ad + bölge + sorun tipi zorunlu
 */
export function cekiciProfilHazirMi(c: Cekici): boolean {
  if (c.kurulumTamam === false) {
    return alanlarHazir(c);
  }
  /* Legacy / tam kayıt */
  if (!c.kayitFunnel) return true;
  return alanlarHazir(c);
}

function alanlarHazir(c: Cekici): boolean {
  const adOk = (c.ad?.trim().length ?? 0) >= 2;
  const bolgeOk = hizmetBolgeleriIlceSayisi(cekiciHizmetBolgeleri(c)) > 0;
  const tipOk = (c.hizmetSorunTipleri?.length ?? 0) > 0;
  return adOk && bolgeOk && tipOk;
}

export function cekiciKurulumIlerleme(c: Cekici): {
  yuzde: number;
  adimlar: { id: string; etiket: string; tamam: boolean }[];
} {
  const adimlar = [
    {
      id: "telefon",
      etiket: "Telefon doğrulandı",
      tamam: Boolean(c.telefon),
    },
    {
      id: "ad",
      etiket: "Adınızı ekleyin",
      tamam: (c.ad?.trim().length ?? 0) >= 2,
    },
    {
      id: "bolge",
      etiket: "Çalışma bölgenizi seçin",
      tamam: hizmetBolgeleriIlceSayisi(cekiciHizmetBolgeleri(c)) > 0,
    },
    {
      id: "hizmet",
      etiket: "Hizmetlerinizi seçin",
      tamam: (c.hizmetSorunTipleri?.length ?? 0) > 0,
    },
  ];
  const tamamSay = adimlar.filter((a) => a.tamam).length;
  return {
    yuzde: Math.round((tamamSay / adimlar.length) * 100),
    adimlar,
  };
}
