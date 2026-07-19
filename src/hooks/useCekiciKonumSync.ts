"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { konumAlEsnek, konumGuvenliMi } from "@/lib/konum-client";

/** Son güncelleme bu süre içindeyse konum taze sayılır (tıklamada) */
export const KONUM_TAZE_MS = 60_000;

const KONUM_PERIYOT_MS = 60_000;

/**
 * Çekici panelinde GPS'i dakikada bir sunucuya yazar.
 * İl/ilçe veya konum menzil modundan bağımsız — her iki modda da aynı aralık.
 */
export function useCekiciKonumSync(hizmetModu: string | undefined) {
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(false);
  const [sonGuncelleme, setSonGuncelleme] = useState<Date | null>(null);
  const gonderiliyorRef = useRef(false);
  const aktif = Boolean(hizmetModu);

  const gonder = useCallback(() => {
    if (!hizmetModu) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setHata(true);
      return;
    }
    if (!konumGuvenliMi()) {
      setHata(true);
      return;
    }
    if (gonderiliyorRef.current) return;

    gonderiliyorRef.current = true;
    setGonderiliyor(true);
    setHata(false);

    void konumAlEsnek()
      .then((pos) =>
        cekiciFetch("/api/cekici/konum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        })
      )
      .then((res) => {
        if (res.ok) {
          setSonGuncelleme(new Date());
          setHata(false);
        } else {
          setHata(true);
        }
      })
      .catch(() => setHata(true))
      .finally(() => {
        gonderiliyorRef.current = false;
        setGonderiliyor(false);
      });
  }, [hizmetModu]);

  useEffect(() => {
    if (!hizmetModu) {
      setGonderiliyor(false);
      setHata(false);
      setSonGuncelleme(null);
      gonderiliyorRef.current = false;
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setHata(true);
      return;
    }

    gonder();
    const id = setInterval(gonder, KONUM_PERIYOT_MS);
    return () => clearInterval(id);
  }, [hizmetModu, gonder]);

  return {
    aktif,
    gonderiliyor,
    hata,
    sonGuncelleme,
    yenile: gonder,
  };
}
