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
  async rewrites() {
    return [
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
