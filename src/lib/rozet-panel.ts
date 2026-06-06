import type { BelgeDurum, Cekici } from "./types";

export type RozetPanelSatir = {
  id: string;
  ad: string;
  telefon: string;
  sehir: string;
  belgeDurum: BelgeDurum;
  belgeGonderim?: string;
  belgeRuhsatUrl?: string;
  belgeCekiciUrl?: string;
  belgeRedNedeni?: string;
  rozetAktif: boolean;
  rozetOdemeTarihi?: string;
};

export type RozetPanelOzet = {
  bekleyen: number;
  belgeOnayli: number;
  rozetAktif: number;
};

export type RozetPanelVerisi = {
  ozet: RozetPanelOzet;
  bekleyen: RozetPanelSatir[];
  onaylanmis: RozetPanelSatir[];
};

function satirFromCekici(c: Cekici): RozetPanelSatir {
  return {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    sehir: c.sehir,
    belgeDurum: c.belgeDurum ?? "yok",
    belgeGonderim: c.belgeGonderim,
    belgeRuhsatUrl: c.belgeRuhsatUrl,
    belgeCekiciUrl: c.belgeCekiciUrl,
    belgeRedNedeni: c.belgeRedNedeni,
    rozetAktif: !!c.rozetAktif,
    rozetOdemeTarihi: c.rozetOdemeTarihi,
  };
}

function gonderimZamani(s: RozetPanelSatir): number {
  if (!s.belgeGonderim) return 0;
  const t = new Date(s.belgeGonderim).getTime();
  return Number.isFinite(t) ? t : 0;
}

function onaylanmisSira(a: RozetPanelSatir, b: RozetPanelSatir): number {
  if (a.rozetAktif !== b.rozetAktif) return a.rozetAktif ? -1 : 1;
  const ta = a.rozetOdemeTarihi
    ? new Date(a.rozetOdemeTarihi).getTime()
    : gonderimZamani(a);
  const tb = b.rozetOdemeTarihi
    ? new Date(b.rozetOdemeTarihi).getTime()
    : gonderimZamani(b);
  return tb - ta;
}

export function rozetPanelVerisi(cekiciler: Cekici[]): RozetPanelVerisi {
  const bekleyen = cekiciler
    .filter((c) => c.belgeDurum === "beklemede")
    .map(satirFromCekici)
    .sort((a, b) => gonderimZamani(b) - gonderimZamani(a));

  const onaylanmis = cekiciler
    .filter((c) => c.belgeDurum === "onaylandi" || c.rozetAktif)
    .map(satirFromCekici)
    .sort(onaylanmisSira);

  const belgeOnayli = cekiciler.filter(
    (c) => c.belgeDurum === "onaylandi" || c.rozetAktif
  ).length;
  const rozetAktif = cekiciler.filter((c) => c.rozetAktif).length;

  return {
    ozet: {
      bekleyen: bekleyen.length,
      belgeOnayli,
      rozetAktif,
    },
    bekleyen,
    onaylanmis,
  };
}
