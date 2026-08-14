/**
 * Talep → teklif geliş süresi analizi (panel).
 */

export type TalepTeklifSureSatir = {
  talepId: string;
  olusturulma: string;
  durum: string;
  sehir: string;
  teklifSayisi: number;
  /** Simülasyon ihalesinden mi */
  simulasyon?: boolean;
  /** İlk teklife kadar geçen ms; teklif yoksa null */
  ilkTeklifMs: number | null;
  /** Son teklife kadar geçen ms */
  sonTeklifMs: number | null;
  /** Medyan teklif gecikmesi (ms) */
  medyanTeklifMs: number | null;
};

export type TalepTeklifSureKova = {
  id: string;
  label: string;
  adet: number;
};

export type TalepTeklifAnalizOzet = {
  talepSayisi: number;
  teklifli: number;
  teklifsiz: number;
  teklifliOran: number | null;
  /** İlk teklife medyan süre (ms) — teklifli talepler */
  medyanIlkMs: number | null;
  p90IlkMs: number | null;
  ortalamaIlkMs: number | null;
  /** İlk teklif eşikleri */
  ilk1Dk: number;
  ilk2Dk: number;
  ilk5Dk: number;
  ilk10Dk: number;
  ortalamaTeklifSayisi: number;
};

const KOVALAR: { id: string; label: string }[] = [
  { id: "lt30s", label: "< 30 sn" },
  { id: "30s1m", label: "30 sn – 1 dk" },
  { id: "1m2m", label: "1 – 2 dk" },
  { id: "2m5m", label: "2 – 5 dk" },
  { id: "5m10m", label: "5 – 10 dk" },
  { id: "10m30m", label: "10 – 30 dk" },
  { id: "gt30m", label: "> 30 dk" },
];

export function talepTeklifSureMs(
  talepOlusturulma: string,
  teklifTarih: string
): number | null {
  const a = new Date(talepOlusturulma).getTime();
  const b = new Date(teklifTarih).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.max(0, b - a);
}

function medyan(sayilar: number[]): number | null {
  if (!sayilar.length) return null;
  const s = [...sayilar].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2 === 0) return (s[mid - 1]! + s[mid]!) / 2;
  return s[mid]!;
}

function yuzdelik(sayilar: number[], p: number): number | null {
  if (!sayilar.length) return null;
  const s = [...sayilar].sort((x, y) => x - y);
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[idx]!;
}

export function talepTeklifSureSatirlariHesapla(
  talepler: {
    id: string;
    olusturulma: string;
    durum: string;
    sehir?: string | null;
    simulasyon?: boolean;
  }[],
  tekliflerByTalep: Map<string, { tarih: string }[]>
): TalepTeklifSureSatir[] {
  return talepler.map((t) => {
    const teklifler = [...(tekliflerByTalep.get(t.id) ?? [])].sort(
      (a, b) =>
        new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
    );
    const gecikmeler = teklifler
      .map((tk) => talepTeklifSureMs(t.olusturulma, tk.tarih))
      .filter((ms): ms is number => ms != null);
    return {
      talepId: t.id,
      olusturulma: t.olusturulma,
      durum: t.durum,
      sehir: (t.sehir ?? "").trim() || "—",
      teklifSayisi: teklifler.length,
      simulasyon: Boolean(t.simulasyon),
      ilkTeklifMs: gecikmeler[0] ?? null,
      sonTeklifMs: gecikmeler.length
        ? gecikmeler[gecikmeler.length - 1]!
        : null,
      medyanTeklifMs: medyan(gecikmeler),
    };
  });
}

export function talepTeklifAnalizOzetHesapla(
  satirlar: TalepTeklifSureSatir[]
): TalepTeklifAnalizOzet {
  const talepSayisi = satirlar.length;
  const teklifliSatirlar = satirlar.filter((s) => s.ilkTeklifMs != null);
  const teklifli = teklifliSatirlar.length;
  const teklifsiz = talepSayisi - teklifli;
  const ilkler = teklifliSatirlar.map((s) => s.ilkTeklifMs!);
  const toplamTeklif = satirlar.reduce((a, s) => a + s.teklifSayisi, 0);
  const ortalamaIlk =
    ilkler.length > 0
      ? ilkler.reduce((a, b) => a + b, 0) / ilkler.length
      : null;

  return {
    talepSayisi,
    teklifli,
    teklifsiz,
    teklifliOran: talepSayisi > 0 ? teklifli / talepSayisi : null,
    medyanIlkMs: medyan(ilkler),
    p90IlkMs: yuzdelik(ilkler, 90),
    ortalamaIlkMs: ortalamaIlk,
    ilk1Dk: ilkler.filter((ms) => ms <= 60_000).length,
    ilk2Dk: ilkler.filter((ms) => ms <= 120_000).length,
    ilk5Dk: ilkler.filter((ms) => ms <= 300_000).length,
    ilk10Dk: ilkler.filter((ms) => ms <= 600_000).length,
    ortalamaTeklifSayisi: talepSayisi > 0 ? toplamTeklif / talepSayisi : 0,
  };
}

/** İlk teklif gecikmesi kovaları (+ teklifsiz ayrı) */
export function talepTeklifSureKovalariHesapla(
  satirlar: TalepTeklifSureSatir[]
): { kovalar: TalepTeklifSureKova[]; teklifsiz: number } {
  const adet = new Map(KOVALAR.map((k) => [k.id, 0]));
  let teklifsiz = 0;
  for (const s of satirlar) {
    if (s.ilkTeklifMs == null) {
      teklifsiz += 1;
      continue;
    }
    const ms = s.ilkTeklifMs;
    let id = "gt30m";
    if (ms < 30_000) id = "lt30s";
    else if (ms < 60_000) id = "30s1m";
    else if (ms < 120_000) id = "1m2m";
    else if (ms < 300_000) id = "2m5m";
    else if (ms < 600_000) id = "5m10m";
    else if (ms < 1_800_000) id = "10m30m";
    adet.set(id, (adet.get(id) ?? 0) + 1);
  }

  return {
    kovalar: KOVALAR.map((k) => ({
      id: k.id,
      label: k.label,
      adet: adet.get(k.id) ?? 0,
    })),
    teklifsiz,
  };
}

export function sureMsMetin(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const sn = ms / 1000;
  if (sn < 60) return `${sn < 10 ? sn.toFixed(1) : Math.round(sn)} sn`;
  const dk = sn / 60;
  if (dk < 60) return `${dk < 10 ? dk.toFixed(1) : Math.round(dk)} dk`;
  const sa = Math.floor(dk / 60);
  const kalanDk = Math.round(dk % 60);
  return kalanDk > 0 ? `${sa} sa ${kalanDk} dk` : `${sa} sa`;
}
