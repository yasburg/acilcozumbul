import { ARAC_DURUMLARI, aracDurumuEtiket, aracDurumuGecerliMi } from "./arac-durumu";
import { ARAC_TIPLERI, aracTipiEtiket, aracTipiGecerliMi } from "./arac-tipi";
import { talepKilitDurumuEtiket } from "./kilit-durumu";
import { talepLastikDurumuEtiket } from "./lastik-durumu";
import { sorunTipiBul } from "./sorun-tipleri";
import { talepYakitTipiEtiket } from "./yakit-tipi";
import type { Talep } from "./types";

export function isBugun(iso: string): boolean {
  const d = new Date(iso);
  const bugun = new Date();
  return d.toDateString() === bugun.toDateString();
}

export function talepBolge(talep: Talep): string {
  const parts = talep.konum.adres.split(",");
  return parts.slice(-2).join(",").trim() || talep.konum.adres;
}

export function talepSorunOzet(sorun: string): string {
  return sorun.trim();
}

export type CekiciTalepOnizleme = {
  bolge: string;
  /** Panel listesi için kısa/dolu sorun metni */
  sorunOzet: string;
  /** Sorun tipi başlığı (ör. Lastik söndü/patladı) */
  sorunBaslik?: string;
  /** Teklif notu / ek detay */
  sorunDetay?: string;
  hedefBolge?: string;
  aracTipi?: string;
  aracDurumu?: string;
  /** Geriye uyumluluk — tip + durum birleşik */
  aracModeli?: string;
  lastikDurumu?: string;
  yakitTipi?: string;
  kilitDurumu?: string;
};

function aracTipiEtiketiBul(talep: Talep): string | undefined {
  const id = talep.aracTipi?.trim() ?? "";
  if (aracTipiGecerliMi(id)) return aracTipiEtiket(id) ?? undefined;
  const model = talep.aracModeli?.trim() ?? "";
  if (!model) return undefined;
  const sol = model.split(" — ")[0]?.trim() ?? "";
  if (sol && ARAC_TIP_ETIKETLERI.has(sol)) return sol;
  return undefined;
}

function aracDurumuEtiketiBul(talep: Talep): string | undefined {
  const id = talep.aracDurumu?.trim() ?? "";
  if (aracDurumuGecerliMi(id)) return aracDurumuEtiket(id) ?? undefined;
  const model = talep.aracModeli?.trim() ?? "";
  if (!model.includes(" — ")) return undefined;
  const sag = model.split(" — ").slice(1).join(" — ").trim();
  if (sag && ARAC_DURUM_ETIKETLERI.has(sag)) return sag;
  return undefined;
}

const ARAC_TIP_ETIKETLERI = new Set<string>(ARAC_TIPLERI.map((t) => t.etiket));
const ARAC_DURUM_ETIKETLERI = new Set<string>(
  ARAC_DURUMLARI.map((d) => d.etiket)
);

/** Çekici ihale kartı / detay özeti — yapılandırılmış alanlar */
export function cekiciTalepOnizleme(talep: Talep): CekiciTalepOnizleme {
  const tip = sorunTipiBul(talep.sorunTipi ?? "");
  const lastik =
    talepLastikDurumuEtiket({
      lastikDurumu: talep.lastikDurumu,
      sorun: talep.sorun,
    }) ?? undefined;
  const yakit =
    talepYakitTipiEtiket({
      yakitTipi: talep.yakitTipi,
      sorun: talep.sorun,
    }) ?? undefined;
  const kilit =
    talepKilitDurumuEtiket({
      kilitDurumu: talep.kilitDurumu,
      sorun: talep.sorun,
    }) ?? undefined;
  const aracTipi = aracTipiEtiketiBul(talep);
  const aracDurumu = aracDurumuEtiketiBul(talep);
  const detay = talep.sorunDetay?.trim() || undefined;

  return {
    bolge: talepBolge(talep),
    sorunOzet: talepSorunOzet(talep.sorun),
    sorunBaslik: tip?.label,
    ...(detay ? { sorunDetay: detay } : {}),
    hedefBolge: talep.hedefKonum?.adres
      .split(",")
      .slice(-2)
      .join(",")
      .trim(),
    ...(aracTipi ? { aracTipi } : {}),
    ...(aracDurumu ? { aracDurumu } : {}),
    aracModeli: talep.aracModeli,
    ...(lastik ? { lastikDurumu: lastik } : {}),
    ...(yakit ? { yakitTipi: yakit } : {}),
    ...(kilit ? { kilitDurumu: kilit } : {}),
  };
}

export function formatKredi(kredi: number): string {
  return Number.isInteger(kredi) ? String(kredi) : kredi.toFixed(1);
}
