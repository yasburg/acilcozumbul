import type { Cekici } from "./types";

export type CekiciPanelOzet = Omit<Cekici, "sifre" | "token" | "authUserId"> & {
  tokenOnizleme: string;
};

export function cekiciPanelOzet(cekici: Cekici): CekiciPanelOzet {
  const { sifre: _s, token, authUserId: _a, ...rest } = cekici;
  return {
    ...rest,
    tokenOnizleme: `${token.slice(0, 8)}…`,
  };
}
