export type CerezOnayTercihi = "tumu" | "zorunlu" | null;

/** localStorage anahtarı — gtag early bootstrap ile aynı olmalı */
export const CEREZ_ONAY_STORAGE_KEY = "acil_cerez_onay";
const BANNER_KAPALI_KEY = "acil_cerez_banner_kapali";

/**
 * Analitik açıkken yazılan işaret çerezi.
 * Manuel çerez silinince kaybolur; localStorage işareti kalırsa opt-out’a geçilir.
 */
export const CEREZ_ANALITIK_ISARET_COOKIE = "acil_analitik_ok";
export const CEREZ_ANALITIK_ISARET_LS = "acil_analitik_isaret";

/** Silinecek analitik / reklam çerez önekleri (birinci taraf) */
export const ANALITIK_CEREZ_ONEKLERI = [
  "_ga",
  "_gid",
  "_gat",
  "_gcl_",
  "_gac_",
  "_fbp",
  "_fbc",
  "_ttp",
  "ttcsid",
  "ph_",
  CEREZ_ANALITIK_ISARET_COOKIE,
] as const;

export function cerezOnayOku(): CerezOnayTercihi {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CEREZ_ONAY_STORAGE_KEY);
  if (v === "tumu" || v === "zorunlu") return v;
  return null;
}

/**
 * Analitik / reklam varsayılan açık (opt-out).
 * Yalnızca açıkça «zorunlu» seçildiyse kapalı.
 */
export function cerezAnalitikAktif(): boolean {
  return cerezOnayOku() !== "zorunlu";
}

function cookieOku(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`
    )
  );
  return m ? decodeURIComponent(m[1]!) : null;
}

function cookieHostVaryantlari(): string[] {
  if (typeof location === "undefined") return [""];
  const host = location.hostname;
  const out = new Set<string>(["", host, `.${host}`]);
  if (host.startsWith("www.")) {
    const bare = host.slice(4);
    out.add(bare);
    out.add(`.${bare}`);
  }
  return [...out];
}

/** Belirli bir çerezi path=/ ve olası domain’lerde sil */
export function cerezAdiniSil(name: string): void {
  if (typeof document === "undefined") return;
  for (const domain of cookieHostVaryantlari()) {
    const domainPart = domain ? `; domain=${domain}` : "";
    document.cookie = `${name}=; Max-Age=0; path=/${domainPart}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
  }
}

function cerezOnekIleEslesirMi(name: string, onek: string): boolean {
  if (onek.endsWith("_")) return name.startsWith(onek) || name === onek.slice(0, -1);
  return name === onek || name.startsWith(`${onek}_`) || name.startsWith(onek);
}

/** Bilinen analitik / reklam çerezlerini temizle */
export function analitikCerezleriSil(): void {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean) as string[];

  for (const name of names) {
    for (const onek of ANALITIK_CEREZ_ONEKLERI) {
      if (cerezOnekIleEslesirMi(name, onek)) {
        cerezAdiniSil(name);
        break;
      }
    }
  }
  /* document.cookie listesinde olmasa bile işaret çerezini sil */
  cerezAdiniSil(CEREZ_ANALITIK_ISARET_COOKIE);
}

/** Analitik açıkken manuel silme tespiti için işaret yaz */
export function cerezAnalitikIsaretYaz(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CEREZ_ANALITIK_ISARET_LS, "1");
  } catch {
    /* private mode */
  }
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${CEREZ_ANALITIK_ISARET_COOKIE}=1; Max-Age=${maxAge}; path=/; SameSite=Lax`;
}

function cerezAnalitikIsaretTemizle(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CEREZ_ANALITIK_ISARET_LS);
  } catch {
    /* ignore */
  }
  cerezAdiniSil(CEREZ_ANALITIK_ISARET_COOKIE);
}

export function cerezOnayKaydet(tercih: "tumu" | "zorunlu"): void {
  localStorage.setItem(CEREZ_ONAY_STORAGE_KEY, tercih);
  sessionStorage.removeItem(BANNER_KAPALI_KEY);

  if (tercih === "zorunlu") {
    analitikCerezleriSil();
    cerezAnalitikIsaretTemizle();
  } else {
    cerezAnalitikIsaretYaz();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("acil-cerez-banner"));
  }
}

/**
 * Manuel çerez silme: localStorage işareti var, çerez yok → zorunlu’ya geç.
 * @returns tercih değiştiyse true
 */
export function cerezManuelSilmeSenkronize(): boolean {
  if (typeof window === "undefined") return false;
  if (!cerezAnalitikAktif()) return false;

  let lsIsaret = false;
  try {
    lsIsaret = localStorage.getItem(CEREZ_ANALITIK_ISARET_LS) === "1";
  } catch {
    return false;
  }

  if (!lsIsaret) {
    cerezAnalitikIsaretYaz();
    return false;
  }

  if (cookieOku(CEREZ_ANALITIK_ISARET_COOKIE) != null) {
    return false;
  }

  /* Çerezler silinmiş — ayarı yalnızca gerekliye çek */
  cerezOnayKaydet("zorunlu");
  return true;
}

export function cerezBannerKapaliMi(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BANNER_KAPALI_KEY) === "1";
}

/** Banner’ı kapatır; tercih kaydedilmez, sonraki oturumda tekrar gösterilebilir */
export function cerezBannerKapat(): void {
  sessionStorage.setItem(BANNER_KAPALI_KEY, "1");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("acil-cerez-banner"));
  }
}

export function cerezBannerGosterilmeli(): boolean {
  if (cerezOnayOku() != null) return false;
  return !cerezBannerKapaliMi();
}

/** Tercih paneli / ayarlar — her zaman açılabilir */
export function cerezBannerAc(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BANNER_KAPALI_KEY);
  window.dispatchEvent(new Event("acil-cerez-banner-ac"));
  window.dispatchEvent(new Event("acil-cerez-banner"));
}

/**
 * Localhost / dev: onay tercihi + bilinen analitik çerezleri + tüm document.cookie.
 * Banner yeniden gösterilir.
 */
export function cerezleriSifirla(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CEREZ_ONAY_STORAGE_KEY);
    localStorage.removeItem(CEREZ_ANALITIK_ISARET_LS);
  } catch {
    /* private mode */
  }
  try {
    sessionStorage.removeItem(BANNER_KAPALI_KEY);
  } catch {
    /* ignore */
  }

  analitikCerezleriSil();

  const names = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean) as string[];
  for (const name of names) {
    cerezAdiniSil(name);
  }

  window.dispatchEvent(new Event("acil-cerez-banner-ac"));
  window.dispatchEvent(new Event("acil-cerez-banner"));
}
