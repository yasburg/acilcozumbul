"use client";

import { useCallback, useEffect, useState } from "react";
import type { HizmetVerenSayimOzet } from "@/lib/hizmet-veren-sayim";

const YENILE_MS = 45_000;

export function useHizmetVerenSayim() {
  const [ozet, setOzet] = useState<HizmetVerenSayimOzet | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = useCallback(async () => {
    try {
      const res = await fetch("/api/hizmet-veren/sayim");
      if (res.ok) setOzet(await res.json());
    } catch {
      /* sessiz */
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
    const t = setInterval(() => void yukle(), YENILE_MS);
    return () => clearInterval(t);
  }, [yukle]);

  return { ozet, yukleniyor, yenile: yukle };
}
