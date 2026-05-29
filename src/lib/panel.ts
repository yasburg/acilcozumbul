import type { Cekici } from "./types";

export type CekiciPanelOzet = Omit<Cekici, "sifre" | "token"> & {
  tokenOnizleme: string;
};

export function cekiciPanelOzet(cekici: Cekici): CekiciPanelOzet {
  const { sifre: _s, token, ...rest } = cekici;
  return {
    ...rest,
    tokenOnizleme: `${token.slice(0, 8)}…`,
  };
}
