"use client";

import { useCallback, useEffect, useState } from "react";
import { KONUM_TAZE_MS } from "@/hooks/useCekiciKonumSync";

const ALT_YAZI_MS = 3_000;
const YESIL = { r: 5, g: 150, b: 105 };
const TURUNCU = { r: 245, g: 158, b: 11 };

function renkKaristir(t: number) {
  const k = Math.min(Math.max(t, 0), 1);
  const r = Math.round(YESIL.r + (TURUNCU.r - YESIL.r) * k);
  const g = Math.round(YESIL.g + (TURUNCU.g - YESIL.g) * k);
  const b = Math.round(YESIL.b + (TURUNCU.b - YESIL.b) * k);
  return { r, g, b, css: `rgb(${r} ${g} ${b})` };
}

function KonumIkonu({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function hedefAltYazi(
  tikMesaj: string | null,
  gonderiliyor: boolean,
  hata: boolean,
  sonGuncelleme: Date | null
): string | null {
  if (tikMesaj) return tikMesaj;
  if (gonderiliyor) return sonGuncelleme ? "Güncelleniyor…" : "Konum alınıyor…";
  if (hata) return "Konum alınamadı";
  if (sonGuncelleme) return "Konum yenilendi";
  return null;
}

export function KonumGuncellemeGostergesi({
  aktif,
  gonderiliyor,
  hata,
  sonGuncelleme,
  onYenile,
}: {
  aktif?: boolean;
  gonderiliyor: boolean;
  hata: boolean;
  sonGuncelleme: Date | null;
  onYenile: () => void;
}) {
  const [simdi, setSimdi] = useState(() => Date.now());
  const [tikMesaj, setTikMesaj] = useState<string | null>(null);
  const [gorunurAltYazi, setGorunurAltYazi] = useState<string | null>(null);

  const mesaj = hedefAltYazi(tikMesaj, gonderiliyor, hata, sonGuncelleme);

  useEffect(() => {
    if (sonGuncelleme) setSimdi(Date.now());
  }, [sonGuncelleme]);

  useEffect(() => {
    if (!sonGuncelleme) return;
    const id = setInterval(() => setSimdi(Date.now()), 400);
    return () => clearInterval(id);
  }, [sonGuncelleme]);

  useEffect(() => {
    if (!mesaj) {
      setGorunurAltYazi(null);
      return;
    }
    setGorunurAltYazi(mesaj);
    const id = setTimeout(() => setGorunurAltYazi(null), ALT_YAZI_MS);
    return () => clearTimeout(id);
  }, [mesaj]);

  const tikla = useCallback(() => {
    if (gonderiliyor) return;

    const taze =
      sonGuncelleme != null &&
      simdi - sonGuncelleme.getTime() < KONUM_TAZE_MS;

    if (taze) {
      setTikMesaj("Konum güncel");
      return;
    }
    onYenile();
  }, [gonderiliyor, onYenile, simdi, sonGuncelleme]);

  useEffect(() => {
    if (!tikMesaj) return;
    const id = setTimeout(() => setTikMesaj(null), ALT_YAZI_MS);
    return () => clearTimeout(id);
  }, [tikMesaj]);

  if (!aktif) return null;
  if (!sonGuncelleme && !gonderiliyor && !hata) return null;

  const gecenMs = sonGuncelleme ? simdi - sonGuncelleme.getTime() : KONUM_TAZE_MS;
  const solmaOrani =
    sonGuncelleme && !gonderiliyor && !hata
      ? Math.min(gecenMs / KONUM_TAZE_MS, 1)
      : 0;
  const { css: renk } = renkKaristir(solmaOrani);

  const ikonStili = gonderiliyor
    ? {
        borderColor: "rgb(191 219 254)",
        backgroundColor: "rgb(255 255 255 / 0.95)",
        color: "rgb(37 99 235)",
      }
    : hata
      ? {
          borderColor: "rgb(254 202 202)",
          backgroundColor: "rgb(254 242 242 / 0.95)",
          color: "rgb(239 68 68)",
        }
      : {
          borderColor: renk,
          backgroundColor: `color-mix(in srgb, ${renk} 12%, white)`,
          color: renk,
          transition:
            "border-color 0.4s ease, background-color 0.4s ease, color 0.4s ease",
        };

  return (
    <div className="fixed top-3 right-3 z-30 flex flex-col items-end gap-0.5 safe-top">
      <button
        type="button"
        onClick={tikla}
        disabled={gonderiliyor}
        className={[
          "relative flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm",
          gonderiliyor ? "animate-konum-pulse" : "",
          gonderiliyor ? "cursor-wait" : "cursor-pointer active:scale-95",
        ].join(" ")}
        style={ikonStili}
        aria-label={
          gonderiliyor
            ? "Konum güncelleniyor"
            : sonGuncelleme && gecenMs < KONUM_TAZE_MS
              ? "Konum güncel"
              : "Konumu yenile"
        }
      >
        {gonderiliyor && (
          <span
            className="absolute inset-0 rounded-full animate-konum-ring-blue"
            aria-hidden
          />
        )}
        <KonumIkonu className="relative h-4 w-4" />
      </button>
      {gorunurAltYazi && (
        <p
          className="max-w-[7.5rem] text-right text-[10px] leading-tight font-medium text-slate-600 pointer-events-none select-none animate-fade-in"
          role="status"
          aria-live="polite"
        >
          {gorunurAltYazi}
        </p>
      )}
    </div>
  );
}
