"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KISISEL_VERI_GIZLE_EVENT,
  gizlilikSeviyesi,
  kisiselVeriGizliMi,
  setKisiselVeriGizli,
  type GizlilikSeviye,
} from "@/lib/kisisel-veri-gizle";

/**
 * @param demo Demo oturumu aktifse otomatik yarı maske (sosyal medya videosu).
 * Ayarlardan tam gizleme açıksa o önceliklidir.
 */
export function useKisiselVeriGizle(demo = false) {
  const [tamGizli, setTamGizli] = useState(false);

  useEffect(() => {
    setTamGizli(kisiselVeriGizliMi());
    const sync = () => setTamGizli(kisiselVeriGizliMi());
    window.addEventListener(KISISEL_VERI_GIZLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(KISISEL_VERI_GIZLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const ayarla = useCallback((sonraki: boolean) => {
    setKisiselVeriGizli(sonraki);
    setTamGizli(sonraki);
  }, []);

  const seviye: GizlilikSeviye = useMemo(
    () => gizlilikSeviyesi({ tamGizli, demo }),
    [tamGizli, demo]
  );

  return {
    seviye,
    /** Ayarlar anahtarının durumu (tam gizleme) */
    gizli: tamGizli,
    ayarla,
  };
}
