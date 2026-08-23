import turkiyeIlSinir from "@/data/turkiye-il-sinir.json";

/** [x, y] — JSON'dan geldiği için sıkı tuple yerine düz sayı dizisi */
export type IlSinirNoktasi = number[];

export type IlSinirVerisi = {
  kod: string;
  halkalar: IlSinirNoktasi[][];
  anaHalkaIndex: number;
  merkez: { x: number; y: number };
  kutu: { minX: number; maxX: number; minY: number; maxY: number };
};

const [, , VIEWBOX_W, VIEWBOX_H] = turkiyeIlSinir.viewBox.split(" ").map(Number);

export const TURKIYE_IL_SINIR_VIEWBOX = turkiyeIlSinir.viewBox;
export const TURKIYE_IL_SINIR_GENISLIK = VIEWBOX_W;
export const TURKIYE_IL_SINIR_YUKSEKLIK = VIEWBOX_H;

export const TURKIYE_IL_SINIR: Record<string, IlSinirVerisi> =
  turkiyeIlSinir.iller;

export function ilSinirBul(il: string): IlSinirVerisi | null {
  const s = il.trim();
  if (!s) return null;
  if (TURKIYE_IL_SINIR[s]) return TURKIYE_IL_SINIR[s];
  const bulunan = Object.keys(TURKIYE_IL_SINIR).find(
    (x) => x.localeCompare(s, "tr", { sensitivity: "accent" }) === 0
  );
  return bulunan ? TURKIYE_IL_SINIR[bulunan] : null;
}

export function ilAnaHalkasi(il: string): IlSinirNoktasi[] | null {
  const veri = ilSinirBul(il);
  if (!veri) return null;
  return veri.halkalar[veri.anaHalkaIndex] ?? null;
}

/** İlin tüm halkalarını (anakara + varsa adalar) tek bir SVG path'e çevirir */
export function ilYoluOlustur(veri: IlSinirVerisi): string {
  return veri.halkalar
    .map((h) => `M ${h.map(([x, y]) => `${x},${y}`).join(" L ")} Z`)
    .join(" ");
}

function noktaHalkaIcindeMi(x: number, y: number, halka: IlSinirNoktasi[]): boolean {
  let icinde = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i];
    const [xj, yj] = halka[j];
    const kesisim = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (kesisim) icinde = !icinde;
  }
  return icinde;
}

export function noktaIlIcindeMi(il: string, x: number, y: number): boolean {
  const halka = ilAnaHalkasi(il);
  if (!halka) return false;
  return noktaHalkaIcindeMi(x, y, halka);
}

function halkaAlani(halka: IlSinirNoktasi[]): number {
  let a = 0;
  for (let i = 0; i < halka.length; i++) {
    const [x1, y1] = halka[i];
    const [x2, y2] = halka[(i + 1) % halka.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

/**
 * İlin sınırı içinde, reddetme örneklemesiyle rastgele bir nokta üretir
 * (talep noktalarının denizde/komşu ilde değil, gerçek sınır içinde
 * görünmesini garanti eder). İstanbul gibi birden fazla parçadan oluşan
 * illerde (Boğaz'ın iki yakası, adalar) parça alanıyla orantılı seçim
 * yapar — tek parçaya (ör. yalnızca Avrupa yakası) yığılmaz. Başarısız
 * olursa null döner — çağıran merkeze düşürebilir.
 */
export function ilIcindeRastgeleNokta(
  il: string,
  rastgele: () => number,
  denemeSiniri = 40
): { x: number; y: number } | null {
  const veri = ilSinirBul(il);
  const halkalar = veri?.halkalar.filter((h) => h.length >= 3) ?? [];
  if (halkalar.length === 0) return null;

  const alanlar = halkalar.map(halkaAlani);
  const toplamAlan = alanlar.reduce((t, a) => t + a, 0);
  let secim = rastgele() * toplamAlan;
  let halka = halkalar[0];
  for (let i = 0; i < halkalar.length; i++) {
    secim -= alanlar[i];
    if (secim <= 0) {
      halka = halkalar[i];
      break;
    }
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of halka) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  for (let i = 0; i < denemeSiniri; i++) {
    const x = minX + rastgele() * (maxX - minX);
    const y = minY + rastgele() * (maxY - minY);
    if (noktaHalkaIcindeMi(x, y, halka)) return { x, y };
  }
  return null;
}
