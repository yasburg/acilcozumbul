import { timingSafeEqual } from "node:crypto";
import { epostaNormalize } from "./eposta";
import { panelRol } from "./panel-yetki";
import { sifreHashDogrula, sifreHashMi } from "./sifre-hash";

function panelHashDogrula(sifre: string, kayit: string): boolean {
  if (!sifreHashMi(kayit)) return false;
  return sifreHashDogrula(sifre, kayit);
}

function duzSifreEsit(girilen: string, beklenen: string): boolean {
  const a = Buffer.from(girilen);
  const b = Buffer.from(beklenen);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Panel şifre kontrolü (fail-closed). Yalnızca Node (giriş API) — Edge middleware’e alma.
 * - Muhasebe rolü: `PANEL_MUHASEBE_PASSWORD` (düz metin)
 * - `PANEL_ADMIN_PASSWORDS` JSON: `{"mail@x.com":"scrypt$..."}` o e-posta için zorunlu
 * - yoksa `PANEL_ADMIN_PASSWORD_HASH` ortak hash
 */
export function panelSifreDogru(
  eposta: string | undefined,
  sifre: string
): boolean {
  if (!eposta || !sifre) return false;
  const e = epostaNormalize(eposta);

  if (panelRol(e) === "muhasebe") {
    const beklenen = process.env.PANEL_MUHASEBE_PASSWORD?.trim();
    if (!beklenen) return false;
    return duzSifreEsit(sifre, beklenen);
  }

  const mapRaw = process.env.PANEL_ADMIN_PASSWORDS?.trim();
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw) as Record<string, unknown>;
      for (const [k, v] of Object.entries(map)) {
        if (epostaNormalize(k) === e && typeof v === "string") {
          return panelHashDogrula(sifre, v);
        }
      }
    } catch {
      return false;
    }
  }

  const ortakHash = process.env.PANEL_ADMIN_PASSWORD_HASH?.trim();
  if (ortakHash) return panelHashDogrula(sifre, ortakHash);

  return false;
}
