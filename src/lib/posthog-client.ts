import posthog from "posthog-js";
import { cerezAnalitikAktif, cerezOnayOku } from "./cerez-onay";

export function posthogYapilandirildi(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
      "phc_tpA4yHjeJbkPL24VrMUX77teFfUm8W9NgKsqQXFuKMbP"
  );
}

/** Çerez tercihine göre PostHog yakalamayı aç/kapat */
export function posthogCerezSenkronize(): void {
  if (typeof window === "undefined" || !posthogYapilandirildi()) return;

  if (cerezAnalitikAktif()) {
    posthog.opt_in_capturing();
    return;
  }

  if (cerezOnayOku() === "zorunlu") {
    posthog.opt_out_capturing();
  }
}

export function posthogOlayYakala(
  olay: string,
  properties?: Record<string, unknown>
): void {
  if (!cerezAnalitikAktif() || !posthogYapilandirildi()) return;
  posthog.capture(olay, properties);
}
