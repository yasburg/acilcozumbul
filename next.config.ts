import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Telefondan yerel IP ile test (npm run dev:lan) */
  allowedDevOrigins: [
    "10.55.33.167",
    "10.55.33.167:3000",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
