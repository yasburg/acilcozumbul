"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ID,
  metaPixelBootstrapInline,
  metaPixelCerezSenkronize,
  metaPixelPageView,
  metaPixelYapilandirildi,
} from "@/lib/meta-pixel";

/**
 * Meta Pixel — Consent Mode (revoke varsayılan; «Tümünü kabul et» ile grant).
 * SPA gezinmede PageView yenilenir.
 */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    metaPixelCerezSenkronize();
  }, []);

  useEffect(() => {
    metaPixelPageView();
  }, [pathname]);

  if (!metaPixelYapilandirildi() || !META_PIXEL_ID) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: metaPixelBootstrapInline(META_PIXEL_ID),
      }}
      onLoad={() => metaPixelCerezSenkronize()}
    />
  );
}
