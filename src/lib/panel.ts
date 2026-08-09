import type { Cekici } from "./types";

export type CekiciPanelOzet = Omit<Cekici, "sifre" | "token" | "authUserId"> & {
  tokenOnizleme: string;
  /** Verilen teklif adedi (panel listesi) */
  teklifSayisi?: number;
};

export function cekiciPanelOzet(cekici: Cekici): CekiciPanelOzet {
  const { sifre: _s, token, authUserId: _a, ...rest } = cekici;
  return {
    ...rest,
    tokenOnizleme: `${token.slice(0, 8)}…`,
  };
}

/** Tester hesapları istatistik dışı; kayıt tarihine göre sıralı */
export function cekiciPanelTesterAyir(liste: CekiciPanelOzet[]) {
  const testerler = liste
    .filter((c) => c.testerHesap)
    .sort(
      (a, b) =>
        new Date(a.kayitTarihi).getTime() - new Date(b.kayitTarihi).getTime()
    );
  const cekiciler = liste.filter((c) => !c.testerHesap);
  return { testerler, cekiciler };
}
