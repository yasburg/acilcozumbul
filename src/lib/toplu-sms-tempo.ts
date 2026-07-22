/** Toplu SMS parçalı gönderim temposu (sunucu kuyruğu) */

export type TopluSmsTempo = {
  /** Bir Netgsm isteğindeki alıcı sayısı */
  partiBoyutu: number;
  /** Partiler arası bekleme (saniye) */
  beklemeSn: number;
  /** Beklemeye ±oran rastgele sapma (0–0.5) */
  jitterOran: number;
};

export const TOPLU_SMS_TEMPO_VARSAYILAN: TopluSmsTempo = {
  partiBoyutu: 10,
  beklemeSn: 60,
  jitterOran: 0.2,
};

export const TOPLU_SMS_TEMPO_PRESETLER = [
  {
    id: "hizli",
    etiket: "Hızlı — 25 kişi / 15 sn",
    tempo: { partiBoyutu: 25, beklemeSn: 15, jitterOran: 0.15 },
  },
  {
    id: "dengeli",
    etiket: "Dengeli — 10 kişi / 60 sn (önerilen)",
    tempo: { ...TOPLU_SMS_TEMPO_VARSAYILAN },
  },
  {
    id: "yavas",
    etiket: "Yavaş — 5 kişi / 2 dk",
    tempo: { partiBoyutu: 5, beklemeSn: 120, jitterOran: 0.25 },
  },
] as const;

export type TopluSmsTempoPresetId =
  (typeof TOPLU_SMS_TEMPO_PRESETLER)[number]["id"];

export function topluSmsTempoNormalize(ham: Partial<TopluSmsTempo>): TopluSmsTempo {
  const partiRaw = Number(ham.partiBoyutu);
  const beklemeRaw = Number(ham.beklemeSn);
  const jitterRaw = Number(ham.jitterOran);
  const partiBoyutu = Math.min(
    50,
    Math.max(1, Number.isFinite(partiRaw) ? Math.floor(partiRaw) : 10)
  );
  const beklemeSn = Math.min(
    600,
    Math.max(0, Number.isFinite(beklemeRaw) ? Math.floor(beklemeRaw) : 0)
  );
  const jitterOran = Math.min(
    0.5,
    Math.max(0, Number.isFinite(jitterRaw) ? jitterRaw : 0)
  );
  return { partiBoyutu, beklemeSn, jitterOran };
}

export function topluSmsPartilereBol<T>(
  liste: T[],
  partiBoyutu: number
): T[][] {
  const boy = Math.max(1, Math.floor(partiBoyutu));
  const partiler: T[][] = [];
  for (let i = 0; i < liste.length; i += boy) {
    partiler.push(liste.slice(i, i + boy));
  }
  return partiler;
}

/** Sonraki parti öncesi bekleme (ms); jitter dahil */
export function topluSmsPartiBeklemeMs(tempo: TopluSmsTempo): number {
  const base = Math.max(0, tempo.beklemeSn) * 1000;
  if (base <= 0 || tempo.jitterOran <= 0) return base;
  const delta = base * tempo.jitterOran;
  return Math.max(0, Math.round(base + (Math.random() * 2 - 1) * delta));
}

/** Tahmini toplam süre (sn) — ortalama bekleme ile */
export function topluSmsTahminiSureSn(
  aliciSayisi: number,
  tempo: TopluSmsTempo
): number {
  const partiSayisi = Math.ceil(
    Math.max(0, aliciSayisi) / Math.max(1, tempo.partiBoyutu)
  );
  if (partiSayisi <= 1) return 0;
  return (partiSayisi - 1) * tempo.beklemeSn;
}

export function topluSmsSureMetni(sn: number): string {
  if (sn <= 0) return "anında";
  if (sn < 60) return `~${sn} sn`;
  const dk = Math.floor(sn / 60);
  const kalan = sn % 60;
  if (kalan === 0) return `~${dk} dk`;
  return `~${dk} dk ${kalan} sn`;
}
