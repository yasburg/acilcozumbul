import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    "/panel/",
    "/cekici/panel",
    "/cekici/ayarlar",
    "/cekici/kredi",
    "/cekici/odeme/",
    "/cekici/talep/",
    "/bekle/",
    "/demo/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow,
      },
      // AI / LLM crawlers — açıkça izin (AI SEO)
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
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
