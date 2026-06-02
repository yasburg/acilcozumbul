import type { Cekici, HizmetBolgeModu, HizmetBolgeleri } from "./types";
import { ilGecerliMi, ilceListesi } from "./il-ilce";
import { mesafeKmHaversine } from "./geo";

export function normalizeHizmetBolgeleri(
  raw: HizmetBolgeleri | undefined,
  fallbackIl?: string,
  fallbackIlceler?: string[]
): HizmetBolgeleri {
  if (raw && Object.keys(raw).length > 0) {
    const out: HizmetBolgeleri = {};
    for (const [il, ilceler] of Object.entries(raw)) {
      if (!ilGecerliMi(il) || !Array.isArray(ilceler)) continue;
      const gecerli = new Set(ilceListesi(il));
      const secili = [...new Set(ilceler.map((i) => i.trim()).filter((i) => gecerli.has(i)))].sort(
        (a, b) => a.localeCompare(b, "tr")
      );
      if (secili.length > 0) out[il] = secili;
    }
    return out;
  }
  if (fallbackIl && fallbackIlceler?.length && ilGecerliMi(fallbackIl)) {
    const gecerli = new Set(ilceListesi(fallbackIl));
    const secili = fallbackIlceler.filter((i) => gecerli.has(i));
    if (secili.length > 0) return { [fallbackIl]: secili };
  }
  return {};
}

export function cekiciHizmetBolgeleri(cekici: Cekici): HizmetBolgeleri {
  return normalizeHizmetBolgeleri(
    cekici.hizmetBolgeleri,
    cekici.sehir,
    cekici.hizmetIlceleri
  );
}

export function hizmetBolgeleriIlceSayisi(bolgeler: HizmetBolgeleri): number {
  return Object.values(bolgeler).reduce((n, ilceler) => n + ilceler.length, 0);
}

export function hizmetBolgeleriFlatten(bolgeler: HizmetBolgeleri): string[] {
  return Object.values(bolgeler).flat();
}

export function cekiciHizmetModu(cekici: Cekici): HizmetBolgeModu {
  return cekici.hizmetModu === "konum" ? "konum" : "il_ilce";
}

export function menzilKmSinirla(km: unknown): number {
  const n = typeof km === "number" ? km : Number(km);
  if (!Number.isFinite(n)) return 30;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function cekiciKonumGuncelMi(cekici: Cekici, maxDakika = 5): boolean {
  if (cekici.konumLat == null || cekici.konumLng == null || !cekici.konumGuncelleme) {
    return false;
  }
  const age = Date.now() - new Date(cekici.konumGuncelleme).getTime();
  return age <= maxDakika * 60 * 1000;
}
