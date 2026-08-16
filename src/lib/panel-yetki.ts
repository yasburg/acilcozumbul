import { epostaNormalize } from "./eposta";

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
