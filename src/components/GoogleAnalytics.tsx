"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  gtagCerezSenkronize,
  gtagYapilandirildi,
} from "@/lib/gtag";

/**
 * gtag.js + GA4 / Google Ads config (consent default root layout’ta beforeInteractive).
 * @see https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced
 */
export function GoogleAnalytics() {
  useEffect(() => {
    gtagCerezSenkronize();
  }, []);

  if (!gtagYapilandirildi()) return null;

  const scriptId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${scriptId}`}
        strategy="afterInteractive"
        onLoad={() => gtagCerezSenkronize()}
      />
      <Script id="google-gtag-config" strategy="afterInteractive">
        {`
gtag('js', new Date());
${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
`}
      </Script>
    </>
  );
}
