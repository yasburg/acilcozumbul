"use client";

import { useEffect, useState } from "react";
import type { HizmetVerenSayimOzet } from "@/lib/hizmet-veren-sayim";

const CACHE_KEY = "acil_hizmet_veren_sayim";

function cacheOku(): HizmetVerenSayimOzet | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HizmetVerenSayimOzet;
  } catch {
    return null;
  }
}

export function useHizmetVerenSayim() {
  const [ozet, setOzet] = useState<HizmetVerenSayimOzet | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const cached = cacheOku();
    if (cached) {
      setOzet(cached);
      setYukleniyor(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/hizmet-veren/sayim");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as HizmetVerenSayimOzet;
        if (cancelled) return;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        setOzet(data);
      } catch {
        /* sessiz */
      } finally {
        if (!cancelled) setYukleniyor(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ozet, yukleniyor };
}
