import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin$", "/admin?", "/admin/", "/api$", "/api?", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: "/",
        disallow,
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
