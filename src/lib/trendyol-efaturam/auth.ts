import { trendyolEfaturamConfigOku } from "./config";

type TokenCache = {
  accessToken: string;
  /** epoch ms — JWT exp yoksa varsayılan süre */
  sonaErme: number;
};

let tokenCache: TokenCache | null = null;

function jwtSonaErmeMs(token: string): number | null {
  const parca = token.split(".")[1];
  if (!parca) return null;
  try {
    const json = JSON.parse(
      Buffer.from(parca.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf8"
      )
    ) as { exp?: number };
    if (typeof json.exp === "number" && json.exp > 0) {
      return json.exp * 1000 - 60_000;
    }
  } catch {
    /* geçersiz JWT */
  }
  return null;
}

export async function trendyolEfaturamAccessTokenAl(): Promise<string> {
  const simdi = Date.now();
  if (tokenCache && tokenCache.sonaErme > simdi) {
    return tokenCache.accessToken;
  }

  const { apiBaseUrl, email, password } = trendyolEfaturamConfigOku();
  const res = await fetch(`${apiBaseUrl}/api/auth/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const metin = await res.text().catch(() => "");
    const cloudflare403 =
      res.status === 403 && metin.trimStart().startsWith("<!DOCTYPE");
    throw new Error(
      cloudflare403
        ? `Trendyol E-Faturam gateway erişimi engellendi (403). Stage gateway (${apiBaseUrl}) canlı sunucudan veya whitelist dışı IP'den Cloudflare ile kesilir — production'da TRENDYOL_EFATURAM_API_BASE_URL=https://apigateway.trendyolecozum.com ve prod şifre kullanın.`
        : `Trendyol E-Faturam girişi başarısız (${res.status})${metin ? `: ${metin.slice(0, 200)}` : ""}`
    );
  }

  const accessToken = res.headers.get("x-access-token")?.trim();
  if (!accessToken) {
    throw new Error("Trendyol E-Faturam giriş yanıtında x-access-token yok.");
  }

  const jwtBitis = jwtSonaErmeMs(accessToken);
  tokenCache = {
    accessToken,
    sonaErme: jwtBitis ?? simdi + 50 * 60_000,
  };
  return accessToken;
}

/** Testlerde token önbelleğini sıfırlamak için */
export function trendyolEfaturamTokenOnbellekTemizle(): void {
  tokenCache = null;
}
