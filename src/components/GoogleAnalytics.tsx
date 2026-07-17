"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, gtagCerezSenkronize } from "@/lib/gtag";

/** GA4 gtag — çerez onayı (consent mode) ile senkron */
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
      <Script id="google-gtag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('config', '${GA_MEASUREMENT_ID}');
`}
      </Script>
    </>
  );
}
