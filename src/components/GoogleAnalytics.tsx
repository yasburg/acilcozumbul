"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, gtagCerezSenkronize } from "@/lib/gtag";

/**
 * gtag.js + config (consent default root layout’ta beforeInteractive).
 * @see https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced
 */
export function GoogleAnalytics() {
  useEffect(() => {
    gtagCerezSenkronize();
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => gtagCerezSenkronize()}
      />
      <Script id="google-gtag-config" strategy="afterInteractive">
        {`
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`}
      </Script>
    </>
  );
}
