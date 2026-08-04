"use client";

import { HizmetVerenSayimGostergesi } from "@/components/HizmetVerenSayimGostergesi";
import { useHizmetVerenSayim } from "@/hooks/useHizmetVerenSayim";

/** Sayaç + veri hook’u — ana sayfa ilk chunk’undan ayrılır */
export function HizmetVerenSayimAlani({
  sorunTipi,
  sehirAd,
  compact,
}: {
  sorunTipi?: string | null;
  sehirAd?: string | null;
  compact?: boolean;
}) {
  const { ozet, yukleniyor } = useHizmetVerenSayim();
  return (
    <HizmetVerenSayimGostergesi
      sorunTipi={sorunTipi}
      sehirAd={sehirAd}
      ozet={ozet}
      yukleniyor={yukleniyor}
      compact={compact}
    />
  );
}
