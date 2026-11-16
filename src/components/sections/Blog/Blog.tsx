import { Suspense } from "react";
import { connection } from "next/server";
import { publishedPosts, type Post } from "../../../lib/blog.ts";
import { BlogCarousel } from "./BlogCarousel";
import { BlogSkeleton } from "./BlogSkeleton";

async function BlogContent() {
  await connection();
  let posts: Post[] | null = null;
  try {
    posts = await publishedPosts("", 1, 12);
  } catch { /* The rest of the home remains available during a database outage. */ }
  if (!posts?.length) return <BlogSkeleton />;
  return <BlogCarousel articles={posts.map(post => ({ id: post.id, slug: post.slug, title: post.title, category: post.category, cover: post.cover, date: new Date(post.published_at!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) }))} />;
}
export function Blog() { return <Suspense fallback={<BlogSkeleton />}><BlogContent /></Suspense>; }
