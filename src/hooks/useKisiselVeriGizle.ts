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
 * @param demo Eski: demo yarı maske. Artık kullanılmıyor (demo'da müşteri aranabilsin).
 * Ayarlar anahtarı yalnızca `hesapSeviye` ile Hesabım’da tam gizler; talepler/panel etkilenmez.
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

  /** İhaleler, talep detayı vb. — yalnızca demo yarı maske */
  const seviye: GizlilikSeviye = useMemo(
    () => gizlilikSeviyesi({ demo }),
    [demo]
  );

  /** Hesabım sekmesi — ayarlar açıksa tam gizle */
  const hesapSeviye: GizlilikSeviye = useMemo(
    () => gizlilikSeviyesi({ tamGizli, demo, hesapSayfasi: true }),
    [tamGizli, demo]
  );

  return {
    seviye,
    hesapSeviye,
    /** Ayarlar anahtarının durumu (yalnızca Hesabım) */
    gizli: tamGizli,
    ayarla,
  };
}
