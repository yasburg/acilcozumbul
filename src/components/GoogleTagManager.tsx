"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { idleSonra } from "@/lib/idle-sonra";

/** Google Tag Manager kapsayıcı */
export const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-5LN5FFB3";

export function gtmYapilandirildi(): boolean {
  return Boolean(GTM_ID);
}

/**
 * GTM — LCP sonrası (idle + lazyOnload).
 * afterInteractive Lighthouse TBT/unused JS’i şişiriyordu; gtag zaten
 * GoogleAnalytics ile yükleniyor, dönüşümler oradan gidiyor.
 */
export function GoogleTagManager() {
  const [yukle, setYukle] = useState(false);

  useEffect(() => {
    return idleSonra(() => setYukle(true));
  }, []);

  if (!gtmYapilandirildi() || !yukle) return null;

  return (
    <Script
      id="google-tag-manager"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`.trim(),
      }}
    />
  );
}

/** body açılışından hemen sonra */
export function GoogleTagManagerNoscript() {
  if (!gtmYapilandirildi()) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
