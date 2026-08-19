import { trendyolEfaturamAccessTokenAl } from "./auth";
import { trendyolEfaturamConfigOku } from "./config";

export type EfaturamOturum = {
  companyId: number;
  userId: number;
};

function jwtClaimOku(token: string): Record<string, unknown> | null {
  const parca = token.split(".")[1];
  if (!parca) return null;
  try {
    return JSON.parse(
      Buffer.from(parca.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf8"
      )
    ) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sayiClaim(deger: unknown): number | null {
  if (typeof deger === "number" && Number.isFinite(deger)) return deger;
  if (typeof deger === "string" && /^\d+$/.test(deger)) return Number(deger);
  return null;
}

function companyIdFromPrivs(claims: Record<string, unknown>): number | null {
  const privs = claims.privs;
  if (!privs || typeof privs !== "object" || Array.isArray(privs)) return null;
  for (const key of Object.keys(privs as Record<string, unknown>)) {
    const id = sayiClaim(key);
    if (id) return id;
  }
  return null;
}

function oturumJwtDen(claims: Record<string, unknown>): EfaturamOturum | null {
  const companyId =
    sayiClaim(claims.companyId) ??
    sayiClaim(claims.company_id) ??
    sayiClaim(claims.cid) ??
    companyIdFromPrivs(claims);
  const userId =
    sayiClaim(claims.userId) ??
    sayiClaim(claims.user_id) ??
    sayiClaim(claims.uid) ??
    sayiClaim(claims.sub);

  if (!companyId || !userId) return null;
  return { companyId, userId };
}

/** Giriş token'ındaki companyId/userId önceliklidir — stage/prod env karışmasını önler. */
export async function efaturamOturumAl(): Promise<EfaturamOturum> {
  const cfg = trendyolEfaturamConfigOku();
  const token = await trendyolEfaturamAccessTokenAl();
  const claims = jwtClaimOku(token);
  const jwtOturum = claims ? oturumJwtDen(claims) : null;
  if (jwtOturum) return jwtOturum;

  const envCompany = Number(cfg.companyId);
  const envUser = Number(cfg.userId);
  if (Number.isFinite(envCompany) && envCompany > 0 && Number.isFinite(envUser) && envUser > 0) {
    return { companyId: envCompany, userId: envUser };
  }

  throw new Error(
    "Trendyol E-Faturam companyId/userId bulunamadı. TRENDYOL_EFATURAM_COMPANY_ID ve TRENDYOL_EFATURAM_USER_ID env değerlerini girin."
  );
}
