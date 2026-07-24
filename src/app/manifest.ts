import type { MetadataRoute } from "next";
import { SEO_ACIKLAMA, SITE_ADI } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_ADI,
    short_name: "AcilCozum",
    description: SEO_ACIKLAMA,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "tr",
    icons: [
      {
        src: "/acilcozumbul-logo-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
