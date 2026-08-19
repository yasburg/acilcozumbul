function envTemizle(deger: string | undefined): string {
  if (!deger) return "";
  return deger.trim().replace(/^["']|["']$/g, "");
}

/** Prod gateway — stage-apigateway.trendyolefaturam.com çoğu ortamda Cloudflare 403 döner */
const PROD_GATEWAY = "https://apigateway.trendyolecozum.com";

export type TrendyolEfaturamConfig = {
  apiBaseUrl: string;
  email: string;
  password: string;
  companyId: string;
  userId: string;
  prefix: string;
  autoEnabled: boolean;
  muhasebeEmail: string;
};

export function trendyolEfaturamYapilandirildi(): boolean {
  const cfg = trendyolEfaturamConfigOku();
  return !!(cfg.email && cfg.password);
}

export function trendyolEfaturamKurumsalAktif(): boolean {
  const cfg = trendyolEfaturamConfigOku();
  return trendyolEfaturamYapilandirildi() && cfg.autoEnabled;
}

export function trendyolEfaturamConfigOku(): TrendyolEfaturamConfig {
  const ozel = envTemizle(process.env.TRENDYOL_EFATURAM_API_BASE_URL);
  const apiBaseUrl = ozel || PROD_GATEWAY;

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
    email: envTemizle(process.env.TRENDYOL_EFATURAM_EMAIL),
    password: envTemizle(process.env.TRENDYOL_EFATURAM_PASSWORD),
    companyId: envTemizle(process.env.TRENDYOL_EFATURAM_COMPANY_ID),
    userId: envTemizle(process.env.TRENDYOL_EFATURAM_USER_ID),
    prefix: envTemizle(process.env.TRENDYOL_EFATURAM_PREFIX),
    autoEnabled: process.env.TRENDYOL_EFATURAM_AUTO_ENABLED !== "false",
    muhasebeEmail:
      envTemizle(process.env.MUHASEBE_EMAIL) || "fatih@iror.com.tr",
  };
}
