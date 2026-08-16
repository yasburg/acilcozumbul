import { epostaNormalize } from "./eposta";
import { sifreHashDogrula, sifreHashMi } from "./sifre-hash";

export type PanelRol = "admin" | "muhasebe";

/** Virgülle ayrılmış izinli yönetici e-postaları (boş = Supabase’de oturum açan herkes) */
export function panelAdminEpostalari(): string[] {
  const raw = process.env.PANEL_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Virgülle ayrılmış muhasebe e-postaları — yalnız Satın almalar + Faturalar */
export function panelMuhasebeEpostalari(): string[] {
  const raw = process.env.PANEL_MUHASEBE_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function panelRol(eposta: string | undefined): PanelRol | null {
  if (!eposta) return null;
  const e = epostaNormalize(eposta);
  const adminler = panelAdminEpostalari();
  const muhasebe = panelMuhasebeEpostalari();

  if (adminler.includes(e)) return "admin";
  if (muhasebe.includes(e)) return "muhasebe";
  if (adminler.length === 0) return "admin";
  return null;
}

export function panelEpostaIzinli(eposta: string | undefined): boolean {
  return panelRol(eposta) !== null;
}

function panelHashDogrula(sifre: string, kayit: string): boolean {
  if (!sifreHashMi(kayit)) return false;
  return sifreHashDogrula(sifre, kayit);
}

/**
 * Panel şifre kontrolü (fail-closed).
 * - `PANEL_ADMIN_PASSWORDS` JSON: `{"mail@x.com":"scrypt$..."}` o e-posta için zorunlu
 * - yoksa `PANEL_ADMIN_PASSWORD_HASH` ortak hash
 * Düz metin env ve “her şifre geçer” yok.
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

export function panelMuhasebeAnaSayfa(): string {
  return "/panel/kredi-odemeler";
}

/** Muhasebe için açık panel sayfa yolları */
export function panelMuhasebeSayfaIzinli(pathname: string): boolean {
  if (pathname === "/panel/giris") return true;
  return (
    pathname === "/panel/kredi-odemeler" ||
    pathname.startsWith("/panel/kredi-odemeler/") ||
    pathname === "/panel/faturalar" ||
    pathname.startsWith("/panel/faturalar/")
  );
}

/** Muhasebe için açık panel API yolları */
export function panelMuhasebeApiIzinli(pathname: string): boolean {
  if (
    pathname === "/api/panel/oturum" ||
    pathname === "/api/panel/cikis" ||
    pathname === "/api/panel/giris"
  ) {
    return true;
  }
  if (
    pathname === "/api/panel/kredi-odemeler" ||
    pathname.startsWith("/api/panel/kredi-odemeler/")
  ) {
    return true;
  }
  if (
    pathname === "/api/panel/faturalar" ||
    pathname.startsWith("/api/panel/faturalar/")
  ) {
    return true;
  }
  // Faturalar sayfası çekici araması
  if (pathname === "/api/panel/cekiciler") {
    return true;
  }
  return false;
}
