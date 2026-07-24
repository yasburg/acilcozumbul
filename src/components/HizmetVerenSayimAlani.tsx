"use client";

import { HizmetVerenSayimGostergesi } from "@/components/HizmetVerenSayimGostergesi";
import { useHizmetVerenSayim } from "@/hooks/useHizmetVerenSayim";

/** Sayaç + veri hook’u — ana sayfa ilk chunk’undan ayrılır */
export function HizmetVerenSayimAlani({
  sorunTipi,
}: {
  sorunTipi?: string | null;
}) {
  const { ozet, yukleniyor } = useHizmetVerenSayim();
  return (
    <HizmetVerenSayimGostergesi
      sorunTipi={sorunTipi}
      ozet={ozet}
      yukleniyor={yukleniyor}
    />
  );
}
