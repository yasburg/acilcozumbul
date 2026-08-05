import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Test, funnel, panel ve işlem yolları — indekslenmez */
const DISALLOW = [
  "/api/",
  "/panel/",
  "/a",
  "/b",
  "/kayit/",
  "/talep-olustur",
  "/bekle/",
  "/demo/",
  "/sms50",
  "/t/",
  "/fatura",
  "/kredi-hatirlatma/",
  "/kurulum-hatirlatma/",
  "/cekici/panel",
  "/cekici/ayarlar",
  "/cekici/kredi",
  "/cekici/faturalar",
  "/cekici/odeme/",
  "/cekici/talep/",
  "/cekici/giris",
  "/cekici/kayit",
  "/cekici/sifremi-unuttum",
];

export default function robots(): MetadataRoute.Robots {
  /** stage.acilcozumbul.com — indekslenmesin */
  if (process.env.NEXT_PUBLIC_APP_ENV === "staging") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: DISALLOW,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Applebot-Extended",
          "Bytespider",
          "meta-externalagent",
        ],
        allow: ["/", "/llms.txt", "/sitemap.xml"],
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
