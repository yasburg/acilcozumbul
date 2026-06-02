import { garantiProfilOku } from "./config";

function envTemizle(deger: string | undefined): string {
  if (!deger) return "";
  return deger.trim().replace(/^["']|["']$/g, "");
}

/** Yerel test: GARANTI_SMOKE_* veya GARANTI_TEST_CARD / GARANTI_CARD */
export function garantiSmokeKartOku(): {
  kartNo: string;
  sonKullanma: string;
  cvv: string;
} | null {
  if (process.env.NODE_ENV === "production") return null;

  const profil = garantiProfilOku();

  const kartNo =
    envTemizle(process.env.GARANTI_SMOKE_CARD) ||
    (profil === "test"
      ? envTemizle(process.env.GARANTI_TEST_CARD)
      : envTemizle(process.env.GARANTI_CARD)) ||
    envTemizle(process.env.GARANTI_CARD);

  const cvv =
    envTemizle(process.env.GARANTI_SMOKE_CVV) ||
    (profil === "test"
      ? envTemizle(process.env.GARANTI_TEST_CVV)
      : envTemizle(process.env.GARANTI_CVV)) ||
    envTemizle(process.env.GARANTI_CVV);

  const ay =
    envTemizle(process.env.GARANTI_SMOKE_EXPIRY_MONTH) ||
    (profil === "test"
      ? envTemizle(process.env.GARANTI_TEST_EXPIRY_MONTH)
      : envTemizle(process.env.GARANTI_EXPIRY_MONTH)) ||
    envTemizle(process.env.GARANTI_EXPIRY_MONTH);

  const yil =
    envTemizle(process.env.GARANTI_SMOKE_EXPIRY_YEAR) ||
    (profil === "test"
      ? envTemizle(process.env.GARANTI_TEST_EXPIRY_YEAR)
      : envTemizle(process.env.GARANTI_EXPIRY_YEAR)) ||
    envTemizle(process.env.GARANTI_EXPIRY_YEAR);

  if (!kartNo || !cvv || !ay || !yil) return null;

  return {
    kartNo,
    sonKullanma: `${ay.padStart(2, "0")}/${yil.slice(-2)}`,
    cvv,
  };
}
