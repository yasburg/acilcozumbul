import { cekiciTalepSmsAdayiMi } from "./ihale";
import { mesafeKmHaversine } from "./geo";
import { cekiciKonumGuncelMi } from "./cekici-hizmet-bolge";
import type { Cekici, Talep } from "./types";

export type SiraliCekici = { cekici: Cekici; score: number; distanceKm: number | null };

/**
 * İlk sürüm kasıtlı olarak açıklanabilir bir skor kullanır. Geçmiş performans
 * modele ancak event verisi biriktikten sonra dahil edilmelidir.
 */
export function siralaUygunCekiciler(talep: Talep, cekiciler: Cekici[]): SiraliCekici[] {
  return cekiciler
    .filter((cekici) => cekiciTalepSmsAdayiMi(talep, cekici))
    .map((cekici) => {
      const konumGuncel = cekiciKonumGuncelMi(cekici, 10);
      const distanceKm =
        konumGuncel && cekici.konumLat != null && cekici.konumLng != null
          ? mesafeKmHaversine(cekici.konumLat, cekici.konumLng, talep.konum.lat, talep.konum.lng)
          : null;
      let score = cekici.availabilityStatus === "online" ? 100 : 50;
      if (cekici.kurulumTamam !== false) score += 10;
      if (cekici.rozetAktif) score += 5;
      if (distanceKm != null) score += Math.max(0, 45 - distanceKm * 2);
      return { cekici, score: Math.round(score * 100) / 100, distanceKm };
    })
    .sort((a, b) => b.score - a.score || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

export function dispatchBatchBoyutu(batch: number): number {
  if (batch === 1) return 5;
  if (batch === 2) return 10;
  return 20;
}
