import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
  async headers() {
    return [
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "X-Frame-Options", value: "DENY" }, { key: "Referrer-Policy", value: "same-origin" }] },
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }] },
    ];
  },
};

export default nextConfig;
