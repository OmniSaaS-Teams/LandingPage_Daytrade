import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { publishedPostUrls } from "../lib/blog";
import { publicPages, siteUrl } from "../lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const pages = Object.keys(publicPages).map(path => ({ url: siteUrl(path) }));
  const posts = await publishedPostUrls().catch((error: unknown) => {
    console.error("Não foi possível consultar os artigos do sitemap.", error);
    return [];
  });

  return [...pages, ...posts.map(post => ({
    url: siteUrl(`/blog/${encodeURIComponent(post.slug)}`),
    lastModified: post.updated_at,
  }))];
}
