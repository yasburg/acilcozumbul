"use client";

import { useEffect, useState } from "react";
import {
  hizmetVerenSayimCevrimiciJitter,
  type HizmetVerenSayimOzet,
} from "@/lib/hizmet-veren-sayim";

const CACHE_KEY = "acil_hizmet_veren_sayim";
const JITTER_SEED_KEY = "acil_hizmet_veren_sayim_seed";

function cacheOku(): HizmetVerenSayimOzet | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HizmetVerenSayimOzet;
  } catch {
    return null;
  }
}

/** Kullanıcıya özel 0–1 seed (localStorage; tarayıcıda sabit) */
function kullaniciJitterSeed(): number {
  try {
    const mevcut = window.localStorage.getItem(JITTER_SEED_KEY);
    if (mevcut != null) {
      const n = Number.parseFloat(mevcut);
      if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
    }
    const seed = Math.random();
    window.localStorage.setItem(JITTER_SEED_KEY, String(seed));
    return seed;
  } catch {
    return 0.5;
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
        const jitterli = hizmetVerenSayimCevrimiciJitter(
          data,
          kullaniciJitterSeed()
        );
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(jitterli));
        setOzet(jitterli);
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
