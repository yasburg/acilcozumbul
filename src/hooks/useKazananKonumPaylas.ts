"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { konumAlEsnek, konumGuvenliMi } from "@/lib/konum-client";

const PERIYOT_MS = 60_000;

/** Kazanan çekici — müşteri canlı takip için konum paylaşır */
export function useKazananKonumPaylas(talepId: string, aktif: boolean) {
  const [sonGuncelleme, setSonGuncelleme] = useState<Date | null>(null);
  const [hata, setHata] = useState(false);
  const gonderiliyorRef = useRef(false);

  const gonder = useCallback(() => {
    if (!aktif) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setHata(true);
      return;
    }
    if (!konumGuvenliMi()) return;
    if (gonderiliyorRef.current) return;

    gonderiliyorRef.current = true;
    setHata(false);

    konumAlEsnek()
      .then((pos) =>
        cekiciFetch(`/api/cekici/talep/${talepId}/konum-yol`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        })
      )
      .then((res) => {
        if (res.ok) setSonGuncelleme(new Date());
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => {
        gonderiliyorRef.current = false;
      });
  }, [aktif, talepId]);

  useEffect(() => {
    if (!aktif) {
      setSonGuncelleme(null);
      setHata(false);
      return;
    }
    gonder();
    const id = setInterval(gonder, PERIYOT_MS);
    return () => clearInterval(id);
  }, [aktif, gonder]);

  return { sonGuncelleme, hata };
}
