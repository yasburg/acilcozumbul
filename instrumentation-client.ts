import { idleSonra } from "@/lib/idle-sonra";

const key =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
  "phc_tpA4yHjeJbkPL24VrMUX77teFfUm8W9NgKsqQXFuKMbP";
const host =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
  "https://eu.i.posthog.com";

/** LCP sonrası idle’da dinamik import + init — posthog-js kritik yolda değil */
if (typeof window !== "undefined" && key && host) {
  idleSonra(() => {
    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: "/ingest",
        ui_host: host,
        defaults: "2026-05-30",
        person_profiles: "identified_only",
        capture_pageview: true,
        /** Projede surveys kapalı; client’ta da yükleme — surveys.js indirme */
        disable_surveys: true,
        /** Çerez banner’ı “Tümünü kabul et” diyene kadar kapalı */
        opt_out_capturing_by_default: true,
        persistence: "localStorage+cookie",
      });
    });
  });
}
