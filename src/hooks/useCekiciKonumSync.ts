"use client";

import { useEffect, useRef } from "react";
import { cekiciFetch } from "@/lib/cekici-fetch";

/** Konum modunda çekici panelinde GPS'i dakikada bir sunucuya yazar */
export function useCekiciKonumSync(hizmetModu: string | undefined) {
  const gonderiliyor = useRef(false);

  useEffect(() => {
    if (hizmetModu !== "konum") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const gonder = () => {
      if (gonderiliyor.current) return;
      gonderiliyor.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void cekiciFetch("/api/cekici/konum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          }).finally(() => {
            gonderiliyor.current = false;
          });
        },
        () => {
          gonderiliyor.current = false;
        },
        { enableHighAccuracy: true, maximumAge: 55_000, timeout: 20_000 }
      );
    };

    gonder();
    const id = setInterval(gonder, 60_000);
    return () => clearInterval(id);
  }, [hizmetModu]);
}
