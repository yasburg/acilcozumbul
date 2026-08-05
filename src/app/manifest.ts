import type { MetadataRoute } from "next";
import { ACB_BRAND, isAcbBrand } from "@/lib/brand";
import { SEO_ACIKLAMA, SITE_ADI } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_ADI,
    short_name: "AcilCozum",
    description: SEO_ACIKLAMA,
    start_url: "/",
    display: "standalone",
    background_color: isAcbBrand ? ACB_BRAND.backgroundColor : "#ffffff",
    theme_color: isAcbBrand ? ACB_BRAND.themeColor : "#ffffff",
    lang: "tr",
    icons: [
      {
        src: isAcbBrand ? ACB_BRAND.logoIcon : "/acilcozumbul-logo-icon-192.png",
        sizes: isAcbBrand ? "1276x1276" : "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
