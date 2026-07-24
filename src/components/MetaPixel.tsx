"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ID,
  metaPixelBootstrapInline,
  metaPixelCerezSenkronize,
  metaPixelPageView,
  metaPixelYapilandirildi,
} from "@/lib/meta-pixel";
import { idleSonra } from "@/lib/idle-sonra";

/**
 * Meta Pixel — LCP sonrası lazyOnload; Consent Mode revoke varsayılan.
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
    metaPixelPageView();
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
