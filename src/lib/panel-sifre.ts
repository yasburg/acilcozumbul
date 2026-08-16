import { epostaNormalize } from "./eposta";
import { sifreHashDogrula, sifreHashMi } from "./sifre-hash";

function panelHashDogrula(sifre: string, kayit: string): boolean {
  if (!sifreHashMi(kayit)) return false;
  return sifreHashDogrula(sifre, kayit);
}

/**
 * Panel şifre kontrolü (fail-closed). Yalnızca Node (giriş API) — Edge middleware’e alma.
 * - `PANEL_ADMIN_PASSWORDS` JSON: `{"mail@x.com":"scrypt$..."}` o e-posta için zorunlu
 * - yoksa `PANEL_ADMIN_PASSWORD_HASH` ortak hash
 */
export function panelSifreDogru(
  eposta: string | undefined,
  sifre: string
): boolean {
  if (!eposta || !sifre) return false;
  const e = epostaNormalize(eposta);

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
