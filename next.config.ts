import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-pool", "pg-types"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
  /** Telefondan yerel IP ile test (npm run dev:lan) */
  allowedDevOrigins: [
    "10.55.33.167",
    "10.55.33.167:3000",
    "localhost",
    "127.0.0.1",
  ],
  skipTrailingSlashRedirect: true,
  async headers() {
    const noindex = {
      key: "X-Robots-Tag",
      value: "noindex, nofollow",
    };
    const stagingNoindex =
      process.env.NEXT_PUBLIC_APP_ENV === "staging"
        ? [{ source: "/:path*", headers: [noindex] }]
        : [];
    return [
      ...stagingNoindex,
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
      { source: "/a", headers: [noindex] },
      { source: "/b", headers: [noindex] },
      { source: "/kayit/:path*", headers: [noindex] },
      { source: "/talep-olustur", headers: [noindex] },
      { source: "/bekle/:path*", headers: [noindex] },
      { source: "/demo/:path*", headers: [noindex] },
      { source: "/sms50/:path*", headers: [noindex] },
      { source: "/t/:path*", headers: [noindex] },
      { source: "/panel/:path*", headers: [noindex] },
      { source: "/cekici/panel/:path*", headers: [noindex] },
      { source: "/cekici/giris", headers: [noindex] },
      { source: "/cekici/kayit/:path*", headers: [noindex] },
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
      /** Canonical: slash’sız URL */
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        /* /c…/z → /kayit/:funnel — /a,/b müşteri anasayfa funnels (app/a, app/b) */
        source: "/:funnel([c-z])",
        destination: "/kayit/:funnel",
      },
      {
        /* /kr/TOKEN — kredi hatırlatma kısa link */
        source: "/kr/:token([0-9A-Za-z]{8})",
        destination: "/kredi-hatirlatma/:token",
      },
      {
        /* /ku/TOKEN — kurulum hatırlatma kısa link */
        source: "/ku/:token([0-9A-Za-z]{8})",
        destination: "/kurulum-hatirlatma/:token",
      },
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
