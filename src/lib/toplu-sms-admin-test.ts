import { telefonNormalize } from "./telefon";

/** Her toplu SMS’te ilk alıcı — teslimat kontrolü */
export const TOPLU_SMS_ADMIN_TEST_TELEFON = "05372500586";

export const TOPLU_SMS_ADMIN_TEST_AD = "Admin test";

/**
 * Liste başında admin test numarasını garanti eder.
 * Zaten listedeyse başa taşır; yoksa ekler.
 */
export function topluSmsAdminTestIleBaslat(telefonlar: string[]): string[] {
  const admin = telefonNormalize(TOPLU_SMS_ADMIN_TEST_TELEFON);
  const rest = telefonlar
    .map((t) => telefonNormalize(t))
    .filter((t) => t && t !== admin);
  return [admin, ...rest];
}
