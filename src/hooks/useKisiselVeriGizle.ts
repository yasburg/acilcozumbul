"use client";

import { useCallback, useEffect, useState } from "react";
import {
  KISISEL_VERI_GIZLE_EVENT,
  kisiselVeriGizliMi,
  setKisiselVeriGizli,
} from "@/lib/kisisel-veri-gizle";

export function useKisiselVeriGizle() {
  const [gizli, setGizli] = useState(false);

  useEffect(() => {
    setGizli(kisiselVeriGizliMi());
    const sync = () => setGizli(kisiselVeriGizliMi());
    window.addEventListener(KISISEL_VERI_GIZLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(KISISEL_VERI_GIZLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const ayarla = useCallback((sonraki: boolean) => {
    setKisiselVeriGizli(sonraki);
    setGizli(sonraki);
  }, []);

  return { gizli, ayarla };
}
