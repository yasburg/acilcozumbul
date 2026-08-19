const ISTANBUL_TZ = "Europe/Istanbul";

/** YYYY-MM-DD (Europe/Istanbul) */
export function istanbulGunAnahtari(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function ayniIstanbulGunuMu(iso: string): boolean {
  return istanbulGunAnahtari(new Date(iso)) === istanbulGunAnahtari();
}

/** Şu andan İstanbul gün sonuna kalan saniye (çerez maxAge) */
export function istanbulGunSonunaKalanSn(simdi: Date = new Date()): number {
  const gun = istanbulGunAnahtari(simdi);
  const gunBaslangicMs = Date.parse(`${gun}T00:00:00+03:00`);
  const gunSonuMs = gunBaslangicMs + 24 * 60 * 60 * 1000;
  return Math.max(60, Math.floor((gunSonuMs - simdi.getTime()) / 1000));
}
