"use client";

import { useEffect, useState } from "react";

export type PanelNavSayac = {
  cekiciSayisi: number;
  talepSayisi: number;
  rozetTalepSayisi: number;
  profilFotoTalepSayisi: number;
};

export function usePanelNavSayac(aktif: boolean): PanelNavSayac | null {
  const [sayac, setSayac] = useState<PanelNavSayac | null>(null);

  useEffect(() => {
    if (!aktif) return;
    let iptal = false;
    void fetch("/api/panel/nav-sayac", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (iptal || !d) return;
        setSayac({
          cekiciSayisi: Number(d.cekiciSayisi) || 0,
          talepSayisi: Number(d.talepSayisi) || 0,
          rozetTalepSayisi: Number(d.rozetTalepSayisi) || 0,
          profilFotoTalepSayisi: Number(d.profilFotoTalepSayisi) || 0,
        });
      })
      .catch(() => {
        /* sessiz */
      });
    return () => {
      iptal = true;
    };
  }, [aktif]);

  return sayac;
}

export function NavSayacRozet({
  adet,
  aktif,
}: {
  adet: number | undefined;
  aktif: boolean;
}) {
  if (adet == null) return null;
  return (
    <span
      className={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        aktif
          ? "bg-white/25 text-white"
          : "bg-slate-200 text-slate-700"
      }`}
    >
      {adet}
    </span>
  );
}
