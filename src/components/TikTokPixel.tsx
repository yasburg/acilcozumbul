"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  TIKTOK_PIXEL_ID,
  tiktokPixelBootstrapInline,
  tiktokPixelCerezSenkronize,
  tiktokPixelPageView,
  tiktokPixelYapilandirildi,
} from "@/lib/tiktok-pixel";
import { idleSonra } from "@/lib/idle-sonra";

/**
 * TikTok Pixel — LCP sonrası lazyOnload; holdConsent varsayılan.
 */
export function TikTokPixel() {
  const pathname = usePathname();
  const [yukle, setYukle] = useState(false);

  useEffect(() => {
    tiktokPixelCerezSenkronize();
    return idleSonra(() => setYukle(true));
  }, []);

  useEffect(() => {
    if (!yukle) return;
    tiktokPixelPageView();
  }, [pathname, yukle]);

  if (!tiktokPixelYapilandirildi() || !TIKTOK_PIXEL_ID || !yukle) return null;

  return (
    <Script
      id="tiktok-pixel"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: tiktokPixelBootstrapInline(TIKTOK_PIXEL_ID),
      }}
      onLoad={() => tiktokPixelCerezSenkronize()}
    />
  );
}
