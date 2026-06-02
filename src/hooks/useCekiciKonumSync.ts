"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cekiciFetch } from "@/lib/cekici-fetch";

/** Son güncelleme bu süre içindeyse konum taze sayılır (tıklamada) */
export const KONUM_TAZE_MS = 60_000;

const KONUM_PERIYOT_MS = 60_000;

const geoSecenekleri: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 55_000,
  timeout: 20_000,
};

/** Konum modunda çekici panelinde GPS'i dakikada bir sunucuya yazar */
export function useCekiciKonumSync(hizmetModu: string | undefined) {
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(false);
  const [sonGuncelleme, setSonGuncelleme] = useState<Date | null>(null);
  const gonderiliyorRef = useRef(false);

  const gonder = useCallback(() => {
    if (hizmetModu !== "konum") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setHata(true);
      return;
    }
    if (gonderiliyorRef.current) return;

    gonderiliyorRef.current = true;
    setGonderiliyor(true);
    setHata(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void cekiciFetch("/api/cekici/konum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        })
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
      },
      () => {
        setHata(true);
        gonderiliyorRef.current = false;
        setGonderiliyor(false);
      },
      geoSecenekleri
    );
  }, [hizmetModu]);

  useEffect(() => {
    if (hizmetModu !== "konum") {
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
    aktif: hizmetModu === "konum",
    gonderiliyor,
    hata,
    sonGuncelleme,
    yenile: gonder,
  };
}
