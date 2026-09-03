import { orderIdTemizle } from "./garanti/payment";

export type SatinAlmaTip =
  | "abonelik"
  | "abonelik_yenileme"
  | "kredi"
  | "rozet";

export type SatinAlmaFiltre = "hepsi" | "abonelik" | "kredi" | "rozet";

export function adSoyadAyir(tamAd: string): { ad: string; soyad: string } {
  const parcalar = String(tamAd ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parcalar.length === 0) return { ad: "", soyad: "" };
  if (parcalar.length === 1) return { ad: parcalar[0], soyad: "" };
  return { ad: parcalar[0], soyad: parcalar.slice(1).join(" ") };
}

export function satinAlmaTipEtiket(tip: SatinAlmaTip): string {
  if (tip === "abonelik") return "Abonelik ödemesi";
  if (tip === "abonelik_yenileme") return "Abonelik yenileme";
  if (tip === "rozet") return "Doğrulanmış hesap rozeti";
  return "Kredi alımı";
}

export function satinAlmaFiltreParse(raw: string | null): SatinAlmaFiltre {
  if (raw === "abonelik" || raw === "kredi" || raw === "rozet") return raw;
  return "hepsi";
}

export function satinAlmaTipFiltreyeUyar(
  tip: SatinAlmaTip,
  filtre: SatinAlmaFiltre
): boolean {
  if (filtre === "hepsi") return true;
  if (filtre === "abonelik") {
    return tip === "abonelik" || tip === "abonelik_yenileme";
  }
  if (filtre === "rozet") return tip === "rozet";
  return tip === "kredi";
}

/** Abonelik ilk ödemesi kredi_odemeler satırı mı? */
export function krediOdemeAbonelikMi(
  odeme: { id: string; odemeTipi?: string },
  abonelikCreatedOrderIds: Set<string>
): boolean {
  if (odeme.odemeTipi === "abonelik") return true;
  const temiz = orderIdTemizle(odeme.id);
  if (
    abonelikCreatedOrderIds.has(odeme.id) ||
    abonelikCreatedOrderIds.has(temiz)
  ) {
    return true;
  }
  return false;
}

export const ABONELIK_ISLEM_DETAY_PREFIX = "ai-";

export function abonelikIslemDetayId(islemId: string): string {
  return `${ABONELIK_ISLEM_DETAY_PREFIX}${islemId}`;
}

export function abonelikIslemIdFromDetay(
  detayId: string
): string | null {
  if (!detayId.startsWith(ABONELIK_ISLEM_DETAY_PREFIX)) return null;
  const id = detayId.slice(ABONELIK_ISLEM_DETAY_PREFIX.length).trim();
  return id || null;
}

/** Fatura yüklenmeyenler üstte; grup içinde yeni → eski */
export function satinAlmaFaturaDurumunaGoreSirala<
  T extends { faturaYuklu: boolean; olusturulma: string; id: string },
>(liste: T[]): T[] {
  return [...liste].sort((a, b) => {
    if (a.faturaYuklu !== b.faturaYuklu) {
      return a.faturaYuklu ? 1 : -1;
    }
    return (
      Date.parse(b.olusturulma) - Date.parse(a.olusturulma) ||
      a.id.localeCompare(b.id)
    );
  });
}

export function satinAlmaFaturaGruplari<
  T extends { faturaYuklu: boolean },
>(liste: T[]): { bekleyen: T[]; yuklu: T[] } {
  const bekleyen: T[] = [];
  const yuklu: T[] = [];
  for (const k of liste) {
    if (k.faturaYuklu) yuklu.push(k);
    else bekleyen.push(k);
  }
  return { bekleyen, yuklu };
}
