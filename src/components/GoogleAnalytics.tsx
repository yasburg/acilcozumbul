"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  gtagCerezSenkronize,
  gtagYapilandirildi,
} from "@/lib/gtag";
import { idleSonra } from "@/lib/idle-sonra";

/**
 * gtag.js — LCP sonrası (lazyOnload + idle).
 * Consent default root layout’ta beforeInteractive kalır.
 */
export function GoogleAnalytics() {
  const [yukle, setYukle] = useState(false);

  useEffect(() => {
    gtagCerezSenkronize();
    return idleSonra(() => setYukle(true));
  }, []);

  useEffect(() => {
    const hazir = () => {
      void import("@/lib/gtag").then((m) => m.gtagHazirIsaretle());
    };
    window.addEventListener("acil-gtag-config", hazir);
    return () => window.removeEventListener("acil-gtag-config", hazir);
  }, []);

  if (!gtagYapilandirildi() || !yukle) return null;

  const scriptId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${scriptId}`}
        strategy="lazyOnload"
        onLoad={() => gtagCerezSenkronize()}
      />
      <Script
        id="google-gtag-config"
        strategy="lazyOnload"
        onLoad={() => {
          gtagCerezSenkronize();
          /* Inline config bittikten sonra kuyruk — onLoad tek başına yetmeyebilir */
          window.setTimeout(() => {
            void import("@/lib/gtag").then((m) => m.gtagHazirIsaretle());
          }, 0);
        }}
      >
        {`
gtag('js', new Date());
${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}', { allow_enhanced_conversions: true });` : ""}
try { window.dispatchEvent(new Event('acil-gtag-config')); } catch (e) {}
`}
      </Script>
    </>
  );
}
