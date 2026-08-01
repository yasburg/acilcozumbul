"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ID,
  metaCekiciOturumZenginlestir,
  metaPixelBootstrapInline,
  metaPixelCerezSenkronize,
  metaPixelPageView,
  metaPixelYapilandirildi,
} from "@/lib/meta-pixel";
import { idleSonra } from "@/lib/idle-sonra";

function cekiciOturumYoluMu(pathname: string): boolean {
  if (!pathname.startsWith("/cekici")) return false;
  if (pathname.startsWith("/cekici/giris")) return false;
  if (pathname.startsWith("/cekici/kayit")) return false;
  if (pathname.startsWith("/cekici/sifremi-unuttum")) return false;
  return true;
}

/**
 * Meta Pixel — LCP sonrası lazyOnload.
 * PageView: saklı / çekici oturum Advanced Matching ile.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const [yukle, setYukle] = useState(false);

  useEffect(() => {
    metaPixelCerezSenkronize();
    return idleSonra(() => setYukle(true));
  }, []);

  useEffect(() => {
    if (!yukle) return;
    let iptal = false;
    void (async () => {
      if (cekiciOturumYoluMu(pathname)) {
        await metaCekiciOturumZenginlestir();
      }
      if (iptal) return;
      await metaPixelPageView();
    })();
    return () => {
      iptal = true;
    };
  }, [pathname, yukle]);

  if (!metaPixelYapilandirildi() || !META_PIXEL_ID || !yukle) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: metaPixelBootstrapInline(META_PIXEL_ID),
      }}
      onLoad={() => metaPixelCerezSenkronize()}
    />
  );
}
