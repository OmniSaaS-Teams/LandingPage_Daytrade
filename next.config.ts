import type { NextConfig } from "next";

const legacyRedirects = [
  ["/como-funciona", "/#process"],
  ["/contato", "/sobre-nos#nossa-forma-de-atuar"],
  ["/seja-parceiro", "/parceiro-indicador"],
  ["/informativo", "/blog"],
  ["/banco-digital-da-daytrade", "/#bank-cta-title"],
  ["/ancora-multi-cedente", "/portfolio#produtos"],
  ["/credito-para-construtoras", "/setores#construtora"],
  ["/cambio", "/portfolio#cambio"],
  ["/antecipacao-de-recebiveis", "/portfolio#credito"],
  ["/antecipacao-de-contratos-de-aluguel", "/portfolio#antecipacao-de-contratos"],
  ["/adiantamento-para-materia-prima", "/portfolio#fomento"],
  ["/conta-escrow", "/portfolio#escrow"],
  ["/operacao-vendor", "/portfolio#vendor"],
  ["/operacao-comissaria", "/portfolio#comissaria"],
  ["/intercompany", "/portfolio#intercompany"],
] as const;

const nextConfig: NextConfig = {
  output: "standalone",
  ...(process.platform === "win32" && {
    // Sharp loads these DLLs beside its native addon in Windows standalone builds.
    outputFileTracingIncludes: { "/*": ["node_modules/@img/sharp-win32-*/lib/*.dll"] },
  }),
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
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
