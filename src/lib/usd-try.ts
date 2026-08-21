/** USD/TRY — önce TCMB döviz satış, olmazsa açık kur API. */

const ONBELLEK_MS = 30 * 60 * 1000;

export type UsdTryKur = {
  oran: number;
  kaynak: string;
};

let onbellek: { kur: UsdTryKur; at: number } | null = null;

function sayi(v: string | undefined | null): number | null {
  if (!v) return null;
  const n = Number(v.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function tcmbUsdTry(): Promise<UsdTryKur | null> {
  const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const xml = await res.text();
  const usdBlok = xml.match(
    /Currency[^>]*Kod="USD"[\s\S]*?<\/Currency>/
  )?.[0];
  if (!usdBlok) return null;
  const satis =
    sayi(usdBlok.match(/<ForexSelling>([^<]+)<\/ForexSelling>/)?.[1]) ??
    sayi(usdBlok.match(/<BanknoteSelling>([^<]+)<\/BanknoteSelling>/)?.[1]);
  if (!satis) return null;
  return { oran: satis, kaynak: "TCMB" };
}

async function yedekUsdTry(): Promise<UsdTryKur | null> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: string; rates?: { TRY?: number } };
  const oran = data.rates?.TRY;
  if (data.result !== "success" || typeof oran !== "number" || oran <= 0) {
    return null;
  }
  return { oran, kaynak: "er-api" };
}

export async function usdTryKuruAl(): Promise<UsdTryKur> {
  if (onbellek && Date.now() - onbellek.at < ONBELLEK_MS) {
    return onbellek.kur;
  }
  const kur = (await tcmbUsdTry()) ?? (await yedekUsdTry());
  if (!kur) {
    throw new Error("USD/TRY kuru alınamadı.");
  }
  onbellek = { kur, at: Date.now() };
  return kur;
}

export function usdTryYazi(oran: number): string {
  if (!Number.isFinite(oran) || oran <= 0) return "";
  return oran.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
