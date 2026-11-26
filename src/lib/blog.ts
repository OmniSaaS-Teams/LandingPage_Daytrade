import { db } from "./db.ts";
export type Post = { id: string; slug: string; title: string; excerpt: string; category: string; content: string; cover: string; published: boolean; published_at: Date | null; updated_at: Date; };
const published = "published=true AND published_at<=strftime('%Y-%m-%dT%H:%M:%fZ','now')";

export async function publishedPosts(category = "", page = 1, limit = 12) {
  const result = await db.query<Post>(`SELECT * FROM blog_posts WHERE ${published} AND ($1='' OR category=$1) ORDER BY published_at DESC,id LIMIT $2 OFFSET $3`, [category, limit, (page - 1) * limit]);
  return result.rows;
}
export async function publishedPost(slug: string) {
  const result = await db.query<Post>(`SELECT * FROM blog_posts WHERE slug=$1 AND ${published}`, [slug]);
  return result.rows[0] || null;
}

export async function publishedPostUrls() {
  const result = await db.query<Pick<Post, "slug" | "updated_at">>(
    `SELECT slug, updated_at FROM blog_posts WHERE ${published} ORDER BY published_at DESC,id`,
  );
  return result.rows;
}
