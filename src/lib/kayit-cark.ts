/** Kayıt çark kampanyası — dilimler ve spin mantığı (SMS, “kredi” yok) */

export const CARK_ODUL_SMS = [10, 20, 50, 100, 200] as const;
export type CarkOdulSms = (typeof CARK_ODUL_SMS)[number];

export type CarkDilimTip = "tekrar" | CarkOdulSms;

export type CarkDilim = {
  tip: CarkDilimTip;
  /** Çark üzerinde kısa etiket */
  etiket: string;
};

/**
 * Saat yönünde 12 dilim — yüksek ödüller yan yana değil.
 * Dağılım: Tekrar×2, 10×3, 20×2, 50×2, 100×2, 200×1
 */
export const CARK_DILIMLER: readonly CarkDilim[] = [
  { tip: "tekrar", etiket: "Tekrar" },
  { tip: 10, etiket: "10 SMS" },
  { tip: 50, etiket: "50 SMS" },
  { tip: 20, etiket: "20 SMS" },
  { tip: 100, etiket: "100" },
  { tip: 10, etiket: "10 SMS" },
  { tip: "tekrar", etiket: "Tekrar" },
  { tip: 50, etiket: "50 SMS" },
  { tip: 20, etiket: "20 SMS" },
  { tip: 200, etiket: "200" },
  { tip: 100, etiket: "100" },
  { tip: 10, etiket: "10 SMS" },
] as const;

export const CARK_DILIM_SAYISI = CARK_DILIMLER.length; // 12
export const CARK_DILIM_DERECE = 360 / CARK_DILIM_SAYISI; // 30

export function carkOdulSmsMi(n: unknown): n is CarkOdulSms {
  return (
    typeof n === "number" &&
    (CARK_ODUL_SMS as readonly number[]).includes(n)
  );
}

/** Ağırlıklı rastgele dilim indeksi (0..11) — görsel dilimler için */
export function carkRastgeleDilimIndex(
  rastgele: () => number = Math.random
): number {
  const r = rastgele();
  const i = Math.floor(r * CARK_DILIM_SAYISI);
  return Math.min(CARK_DILIM_SAYISI - 1, Math.max(0, i));
}

/**
 * Funnel C kampanya akışı:
 * 1. deneme → %100 Tekrar
 * 2. deneme → %100 50 SMS
 */
export function carkScriptliDilimIndex(
  deneme: number,
  rastgele: () => number = Math.random
): number {
  const hedef: CarkDilimTip = deneme <= 1 ? "tekrar" : 50;
  const adaylar: number[] = [];
  for (let i = 0; i < CARK_DILIMLER.length; i++) {
    if (CARK_DILIMLER[i]!.tip === hedef) adaylar.push(i);
  }
  if (adaylar.length === 0) return 0;
  const i = Math.floor(rastgele() * adaylar.length);
  return adaylar[Math.min(adaylar.length - 1, Math.max(0, i))]!;
}

export function carkDilimSonuc(index: number): CarkDilim {
  const i = ((index % CARK_DILIM_SAYISI) + CARK_DILIM_SAYISI) % CARK_DILIM_SAYISI;
  return CARK_DILIMLER[i]!;
}

/**
 * Pointer üstte (12 o'clock) iken dilimin merkezinin gelmesi için
 * çarkın döndürüleceği derece (CSS rotate, saat yönü pozitif).
 */
export function carkHedefDonusDerece(
  dilimIndex: number,
  turSayisi = 5
): number {
  const merkez =
    dilimIndex * CARK_DILIM_DERECE + CARK_DILIM_DERECE / 2;
  // Üst pointer için dilim merkezini 0°'ye getir → ters yönde
  return turSayisi * 360 + (360 - merkez);
}

export const CARK_SEGMENT_RENKLER = [
  "#fef3c7",
  "#fdba74",
  "#fde68a",
  "#fb923c",
  "#fcd34d",
  "#f59e0b",
  "#fef3c7",
  "#fdba74",
  "#fde68a",
  "#22c55e",
  "#f59e0b",
  "#fb923c",
] as const;

export function carkConicGradient(): string {
  const dilim = CARK_DILIM_DERECE;
  const parts = CARK_SEGMENT_RENKLER.map((renk, i) => {
    const a = i * dilim;
    const b = (i + 1) * dilim;
    return `${renk} ${a}deg ${b}deg`;
  });
  return `conic-gradient(from -${dilim / 2}deg, ${parts.join(", ")})`;
}
