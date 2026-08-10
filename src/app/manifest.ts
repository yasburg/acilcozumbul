import type { MetadataRoute } from "next";
import { ACB_BRAND } from "@/lib/brand";
import { SEO_ACIKLAMA, SITE_ADI } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_ADI,
    short_name: "AcilCozum",
    description: SEO_ACIKLAMA,
    start_url: "/",
    display: "standalone",
    background_color: ACB_BRAND.backgroundColor,
    theme_color: ACB_BRAND.themeColor,
    lang: "tr",
    icons: [
      {
        src: ACB_BRAND.logoFavicon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ACB_BRAND.logoFavicon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
