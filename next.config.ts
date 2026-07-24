import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Telefondan yerel IP ile test (npm run dev:lan) */
  allowedDevOrigins: [
    "10.55.33.167",
    "10.55.33.167:3000",
    "localhost",
    "127.0.0.1",
  ],
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/acilcozumbul-logo-yazili-header.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/acilcozumbul-logo-icon-192.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/acilcozumbul-logo-icon-192.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/cekici/kayit",
        destination: "/kayit/a",
        permanent: false,
      },
      {
        source: "/kayit",
        destination: "/kayit/a",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        /* /sms50a/TOKEN … kişiye özel — daha spesifik kural önce */
        source: "/sms50:varyant([a-z])/:token([0-9A-Za-z]{8})",
        destination: "/sms50/:varyant/:token",
      },
      {
        /* /sms50a … /sms50z → App Router /sms50/[varyant] */
        source: "/sms50:varyant([a-z])",
        destination: "/sms50/:varyant",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
