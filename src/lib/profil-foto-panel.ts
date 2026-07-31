import type { Cekici, ProfilFotoDurum } from "./types";

export type ProfilFotoPanelSatir = {
  id: string;
  ad: string;
  telefon: string;
  sehir: string;
  profilFotoDurum: ProfilFotoDurum;
  profilFotoUrl?: string;
  profilFotoRedNedeni?: string;
  profilFotoGonderim?: string;
};

export type ProfilFotoPanelOzet = {
  bekleyen: number;
  onayli: number;
  reddedilen: number;
};

export type ProfilFotoPanelVerisi = {
  ozet: ProfilFotoPanelOzet;
  bekleyen: ProfilFotoPanelSatir[];
  onayli: ProfilFotoPanelSatir[];
};

function satirFromCekici(c: Cekici): ProfilFotoPanelSatir {
  return {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    sehir: c.sehir,
    profilFotoDurum: c.profilFotoDurum ?? "yok",
    profilFotoUrl: c.profilFotoUrl,
    profilFotoRedNedeni: c.profilFotoRedNedeni,
    profilFotoGonderim: c.profilFotoGonderim,
  };
}

function gonderimZamani(s: ProfilFotoPanelSatir): number {
  if (!s.profilFotoGonderim) return 0;
  const t = new Date(s.profilFotoGonderim).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function profilFotoPanelVerisi(
  cekiciler: Cekici[]
): ProfilFotoPanelVerisi {
  const bekleyen = cekiciler
    .filter((c) => c.profilFotoDurum === "beklemede")
    .map(satirFromCekici)
    .sort((a, b) => gonderimZamani(b) - gonderimZamani(a));

  const onayli = cekiciler
    .filter((c) => c.profilFotoDurum === "onaylandi")
    .map(satirFromCekici)
    .sort((a, b) => gonderimZamani(b) - gonderimZamani(a));

  const reddedilen = cekiciler.filter(
    (c) => c.profilFotoDurum === "reddedildi"
  ).length;

  return {
    ozet: {
      bekleyen: bekleyen.length,
      onayli: onayli.length,
      reddedilen,
    },
    bekleyen,
    onayli,
  };
}
